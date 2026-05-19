import { NavLink, useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Key, 
  Layers, 
  BarChart3, 
  Plus, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Zap
} from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/components/Logo';

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { chats, currentChatId, setCurrentChatId, deleteChat } = useChat();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className={`flex flex-col h-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-r border-white/20 dark:border-white/5 transition-all duration-300 relative group/sidebar ${collapsed ? 'w-[80px]' : 'w-72'}`}>
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="size-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 text-white">
          <Logo size={22} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight">OpenLLM</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">Neural Gateway</span>
          </div>
        )}
      </div>

      <div className="px-4 mb-6">
        <Button 
          onClick={() => {
            setCurrentChatId(null);
            handleNav('/playground');
          }} 
          className={`w-full justify-start gap-3 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all ${collapsed ? 'px-0 justify-center' : 'px-4'}`}
        >
          <Plus size={20} />
          {!collapsed && <span className="font-semibold">New Chat</span>}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none">
        <div className="pb-4">
          {!collapsed && <p className="px-3 mb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recent Chats</p>}
          <div className="space-y-1">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={`group flex items-center rounded-xl transition-all ${
                  currentChatId === chat.id 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <button
                  onClick={() => handleNav(`/playground/${chat.id}`)}
                  className={`flex-1 flex items-center gap-3 p-3 text-sm font-medium truncate ${collapsed ? 'justify-center' : ''}`}
                >
                  <MessageSquare size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{chat.title}</span>}
                </button>
                {!collapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all mr-1"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 dark:border-white/5">
          {!collapsed && <p className="px-3 mb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Platform</p>}
          <nav className="space-y-1">
            <NavItem to="/playground" icon={<Zap size={18} />} label="Playground" collapsed={collapsed} onNavigate={onNavigate} />
            <NavItem to="/keys" icon={<Key size={18} />} label="API Keys" collapsed={collapsed} onNavigate={onNavigate} />
            <NavItem to="/fallback" icon={<Layers size={18} />} label="Routing" collapsed={collapsed} onNavigate={onNavigate} />
            <NavItem to="/analytics" icon={<BarChart3 size={18} />} label="Analytics" collapsed={collapsed} onNavigate={onNavigate} />
            <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" collapsed={collapsed} onNavigate={onNavigate} />
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-white/10 dark:border-white/5 bg-white/30 dark:bg-slate-950/30">
        <button 
          onClick={logout}
          className={`flex items-center gap-3 p-3 w-full rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-md z-50 hidden md:flex"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}

function NavItem({ to, icon, label, collapsed, onNavigate }: { to: string; icon: React.ReactNode; label: string; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
