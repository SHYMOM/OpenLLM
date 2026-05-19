import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Eye, EyeOff, Sparkles, Zap } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const success = await login(password)
    if (success) {
      navigate('/playground')
    } else {
      setError('Invalid access code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background overflow-hidden relative">
      {/* Futuristic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="w-full max-w-md relative group">
        {/* Glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative flex flex-col bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
          {/* Top Bar Decoration */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="mb-8 text-center relative">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse" />
              <Shield className="w-10 h-10 text-primary relative z-10" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary fill-primary animate-pulse" />
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">OpenLLM</h1>
              <Zap className="w-4 h-4 text-primary fill-primary animate-pulse" />
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] opacity-60 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" /> Secure Access Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 ml-1">
                Access Code
              </label>
              <div className="relative group/input">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator key..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Authorize Session</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Distributed Intelligence Network v2.0
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Decoration */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4">
        <div className="h-px w-12 bg-white/10" />
        <span className="text-[10px] font-mono text-white/20 tracking-tighter uppercase">EST. 2026 / PROXY_GATEWAY_v2</span>
      </div>
    </div>
  )
}
