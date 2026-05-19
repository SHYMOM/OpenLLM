import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChatProvider } from '@/contexts/ChatContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import KeysPage from '@/pages/KeysPage'
import PlaygroundPage from '@/pages/PlaygroundPage'
import FallbackPage from '@/pages/FallbackPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import { Menu } from 'lucide-react'

const queryClient = new QueryClient()

function DarkModeToggle() {
  const { isDark, toggleDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDark}
      className="size-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-500"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in rotate-in duration-500"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in -rotate-in duration-500"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      )}
    </Button>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <AppLayout />
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function AppLayout() {
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans antialiased text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      {isAuthenticated && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 h-full w-72 animate-in slide-in-from-left duration-300">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`flex items-center ${isAuthenticated ? 'justify-between' : 'justify-center'} px-4 md:px-6 py-3 border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl z-10 border-white/10`}>
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Menu size={20} />
            </button>
          )}
          {!isAuthenticated && <div className="flex items-center gap-2 mr-auto"><span className="size-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" /><span className="font-bold text-lg tracking-tighter">OPENLLM</span></div>}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent)] pointer-events-none" />
          <div className="max-w-5xl mx-auto h-full relative z-0 px-4 md:px-0">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Navigate to="/playground" replace /></ProtectedRoute>} />
              <Route path="/playground/:id?" element={<ProtectedRoute><PlaygroundPage /></ProtectedRoute>} />
              <Route path="/keys" element={<ProtectedRoute><KeysPage /></ProtectedRoute>} />
              <Route path="/fallback" element={<ProtectedRoute><FallbackPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
