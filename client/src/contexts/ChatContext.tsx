import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: {
    platform?: string;
    model?: string;
    latency?: number;
    fallbackAttempts?: number;
  };
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface RoutingStatus {
  status: 'idle' | 'routing' | 'sending' | 'streaming' | 'error';
  platform?: string;
  model?: string;
  attempt?: number;
  message?: string;
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  routingStatus: RoutingStatus;
  setCurrentChatId: (id: string | null) => void;
  sendMessage: (content: string, model: string) => Promise<void>;
  createChat: (title?: string) => Promise<string>;
  deleteChat: (id: string) => Promise<void>;
  clearMessages: () => void;
  availableModels: { modelId: string; displayName: string }[];
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [routingStatus, setRoutingStatus] = useState<RoutingStatus>({ status: 'idle' });
  const [availableModels, setAvailableModels] = useState<{ modelId: string; displayName: string }[]>([]);

  const refreshChats = useCallback(async () => {
    try {
      const data = await apiFetch<Chat[]>('/api/chats');
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, []);

  useEffect(() => {
    refreshChats();
    apiFetch<{ modelId: string; displayName: string }[]>('/api/models')
      .then(setAvailableModels)
      .catch(err => console.error('Failed to fetch models:', err));
  }, [refreshChats]);

  useEffect(() => {
    if (currentChatId) {
      apiFetch<ChatMessage[]>(`/api/chats/${currentChatId}/messages`)
        .then(setMessages)
        .catch(err => console.error('Failed to fetch messages:', err));
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const createChat = async (title?: string) => {
    const chat = await apiFetch<Chat>('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    setChats(prev => [chat, ...prev]);
    setCurrentChatId(chat.id);
    return chat.id;
  };

  const deleteChat = async (id: string) => {
    await apiFetch(`/api/chats/${id}`, { method: 'DELETE' });
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  const sendMessage = async (content: string, model: string) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createChat(content.slice(0, 30) + (content.length > 30 ? '...' : ''));
    }

    const userMsg: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setRoutingStatus({ status: 'routing', message: 'Identifying optimal routing path...' });

    try {
      // Save user message to DB
      await apiFetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify(userMsg),
      });

      const keyData = await apiFetch<{ apiKey: string }>('/api/settings/api-key');
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('openllm_auth_token')}` // Use auth token
      };
      if (keyData?.apiKey) headers['X-API-Key'] = keyData.apiKey; // Pass as header if needed

      const history = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
      const body: any = { 
        messages: history,
        stream: true 
      };
      if (model !== 'auto') body.model = model;

      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      const start = Date.now();
      
      setRoutingStatus({ status: 'sending', message: 'Connecting to provider gateway...' });
      
      const res = await fetch(`${base}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } }));
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: `Error: ${err.error?.message ?? 'Unknown error'}`,
        };
        setMessages(prev => [...prev, errorMsg]);
        setLoading(false);
        setRoutingStatus({ status: 'error', message: err.error?.message });
        return;
      }

      const routedVia = res.headers.get('X-Routed-Via');
      const fallbackAttempts = res.headers.get('X-Fallback-Attempts');
      const [platform, modelId] = routedVia?.split('/') || ['unknown', 'unknown'];
      
      setRoutingStatus({ 
        status: 'streaming', 
        platform, 
        model: modelId, 
        attempt: fallbackAttempts ? parseInt(fallbackAttempts) + 1 : 1,
        message: `Streaming from ${platform}/${modelId}...`
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: '',
        meta: {
          platform,
          model: modelId,
          latency: 0,
          fallbackAttempts: fallbackAttempts ? parseInt(fallbackAttempts) : undefined,
        },
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let isFirstChunk = true;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const data = JSON.parse(dataStr);
                const delta = data.choices?.[0]?.delta?.content || '';
                if (delta) {
                  if (isFirstChunk) {
                    assistantMsg.meta!.latency = Date.now() - start;
                    isFirstChunk = false;
                  }
                  fullContent += delta;
                  setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { ...assistantMsg, content: fullContent };
                    return next;
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE chunk', e);
              }
            }
          }
        }
      }

      // Save assistant message to DB once complete
      await apiFetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ ...assistantMsg, content: fullContent }),
      });

      refreshChats(); 
      setRoutingStatus({ status: 'idle' });
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
      setRoutingStatus({ status: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      currentChatId,
      messages,
      loading,
      routingStatus,
      setCurrentChatId,
      sendMessage,
      createChat,
      deleteChat,
      clearMessages,
      refreshChats,
      availableModels
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
