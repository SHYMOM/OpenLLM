import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Globe, Cpu, Zap, AlertTriangle, Trash2, ChevronDown, ArrowRight, Radio } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChat } from '@/contexts/ChatContext'
import { Button } from '@/components/ui/button'
import { useParams, useNavigate } from 'react-router-dom'

export default function PlaygroundPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { messages, loading, routingStatus, sendMessage, clearMessages, availableModels, currentChatId, setCurrentChatId } = useChat()
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('auto')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Sync URL ID with Chat Context
  useEffect(() => {
    setCurrentChatId(id || null)
  }, [id, setCurrentChatId])

  // If a chat was created mid-stream (first message), update the URL
  useEffect(() => {
    if (currentChatId && !id) {
      navigate(`/playground/${currentChatId}`, { replace: true })
    }
  }, [currentChatId, id, navigate])

  // Real-time token estimation
  const currentTokens = Math.ceil(messages.reduce((acc, m) => acc + (m.content?.length || 0), 0) / 4) + Math.ceil(input.length / 4);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, routingStatus])

  // Cross-Model Chat Persistence: Auto-select the last used model
  useEffect(() => {
    if (messages.length > 0) {
      const lastAsstMsg = [...messages].reverse().find(m => m.role === 'assistant' && m.meta?.model);
      if (lastAsstMsg?.meta?.model && availableModels.some(m => m.modelId === lastAsstMsg.meta?.model)) {
        setSelectedModel(lastAsstMsg.meta.model);
      }
    } else {
      setSelectedModel('auto');
    }
  }, [currentChatId, messages.length, availableModels]);

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input, selectedModel)
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const routingSteps = [
    { key: 'routing', label: 'Analyzing request', detail: 'Identifying optimal routing path...' },
    { key: 'sending', label: 'Connecting to provider', detail: routingStatus.platform ? `Connecting to ${routingStatus.platform}...` : 'Establishing gateway connection...' },
    { key: 'streaming', label: 'Streaming response', detail: routingStatus.model ? `Receiving from ${routingStatus.platform}/${routingStatus.model}` : 'Data transfer in progress...' },
  ]

  const currentStepIdx = routingSteps.findIndex(s => s.key === routingStatus.status)

  return (
    <div className="flex flex-col h-full bg-transparent font-sans relative z-10">
      {/* Header */}
      <div className="bg-white/50 dark:bg-slate-950/30 backdrop-blur-2xl border-b border-white/15 dark:border-white/5 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="size-9 md:size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Cpu size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-extrabold tracking-tight">Playground</h1>
            <p className="text-[10px] text-muted-foreground font-medium">AI Model Orchestration</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-white/5 rounded-xl px-3 md:px-4 pr-8 md:pr-10 py-2 md:py-2.5 text-xs md:text-sm font-bold focus:ring-2 focus:ring-primary transition-all cursor-pointer"
            >
              <option value="auto">Auto-Route</option>
              {availableModels.map(m => (
                <option key={m.modelId} value={m.modelId}>{m.displayName}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
          <Button variant="outline" size="icon" onClick={clearMessages} className="size-9 md:size-10 rounded-xl border border-white/20 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md text-slate-500 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-6 md:py-10 px-4 md:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center animate-in fade-in duration-700">
              <div className="size-16 md:size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 md:mb-8 shadow-xl shadow-primary/5">
                <Zap size={32} className="fill-current" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 md:mb-4">What can I help with?</h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Experience seamless AI routing across the world's most powerful models.
              </p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 pb-16 md:pb-20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-400`}>
                  {msg.role === 'assistant' && msg.content.startsWith('Error:') ? (
                    <div className="max-w-[90%] md:max-w-3xl w-full p-4 md:p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                      <div className="size-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 text-red-500">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-red-500 text-xs uppercase tracking-widest">System Error</p>
                        <p className="text-red-400 text-sm font-medium mt-1 leading-relaxed">{msg.content.replace('Error: ', '')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-w-[90%] md:max-w-[80%]">
                      <div
                        className={`px-5 py-4 shadow-lg relative backdrop-blur-xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/70 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white/60 dark:bg-slate-900/50 border border-white/20 dark:border-white/5 rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        <div className={`prose dark:prose-invert prose-sm max-w-none leading-relaxed ${msg.role === 'user' ? 'prose-p:text-white text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      {msg.meta && (
                        <div className="flex items-center gap-2 md:gap-3 px-1 flex-wrap">
                          <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 dark:border-white/5">
                            <Globe size={10} className="text-primary" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.meta.platform}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 dark:border-white/5">
                            <Cpu size={10} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.meta.model}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 ml-auto">{msg.meta.latency}ms</span>
                          {msg.meta.fallbackAttempts && msg.meta.fallbackAttempts > 0 && (
                            <span className="text-[10px] font-bold text-amber-500">+{msg.meta.fallbackAttempts} reroute{msg.meta.fallbackAttempts > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Enhanced Thinking Animation */}
              {loading && (
                <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-primary/20 rounded-2xl rounded-tl-sm p-5 shadow-xl max-w-sm w-full">
                    {/* Animated pulse ring */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                          <Radio size={16} className="animate-pulse" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary animate-ping" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Processing</span>
                        <p className="text-[10px] text-slate-500 font-medium">{routingStatus.message || 'Initializing neural gateway...'}</p>
                      </div>
                    </div>
                    
                    {/* Step-by-step routing visualization */}
                    <div className="space-y-2 mt-3 pl-1">
                      {routingSteps.map((step, i) => {
                        const isActive = i === currentStepIdx
                        const isComplete = i < currentStepIdx
                        return (
                          <div key={step.key} className={`flex items-center gap-2.5 transition-all duration-500 ${isActive ? 'opacity-100' : isComplete ? 'opacity-60' : 'opacity-25'}`}>
                            <div className={`size-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 transition-all ${
                              isComplete ? 'bg-emerald-500/20 text-emerald-500' :
                              isActive ? 'bg-primary/20 text-primary ring-2 ring-primary/30' :
                              'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {isComplete ? '✓' : i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{step.label}</p>
                              {isActive && <p className="text-[10px] text-slate-500 truncate">{step.detail}</p>}
                            </div>
                            {isActive && <ArrowRight size={10} className="text-primary animate-pulse shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Fallback info */}
                    {routingStatus.attempt && routingStatus.attempt > 1 && (
                      <div className="mt-3 pt-3 border-t border-white/10 dark:border-white/5">
                        <p className="text-[10px] font-bold text-amber-500">
                          ⚡ Re-routed {routingStatus.attempt - 1} time{routingStatus.attempt > 2 ? 's' : ''} — trying alternative models
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-5 bg-white/30 dark:bg-slate-950/30 backdrop-blur-2xl border-t border-white/15 dark:border-white/5 relative z-20">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex justify-between items-center mb-2 px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Cpu size={12} className={currentTokens > 4000 ? "text-amber-500" : "text-primary"} />
              <span className={currentTokens > 4000 ? "text-amber-500" : ""}>
                {currentTokens.toLocaleString()} tokens
              </span>
            </div>
            {selectedModel !== 'auto' && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Direct: {selectedModel}</span>
            )}
          </div>

          <div className="relative flex items-end gap-2 md:gap-3 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-white/5 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] rounded-2xl p-2 md:p-3 transition-all duration-300">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm md:text-base text-slate-800 dark:text-slate-100 py-2 px-2 md:px-3 resize-none placeholder:text-slate-400 font-medium leading-relaxed"
              style={{ maxHeight: '160px' }}
              onInput={e => {
                const el = e.target as HTMLTextAreaElement
                el.style.height = 'auto'
                el.style.height = el.scrollHeight + 'px'
              }}
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()} 
              size="icon"
              className="size-10 md:size-11 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </div>

          <p className="mt-3 text-center text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">
            OpenLLM Neural Gateway • Enterprise Security • Privacy First
          </p>
        </div>
      </div>
    </div>
  )
}
