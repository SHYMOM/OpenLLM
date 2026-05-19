import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { Shield, RefreshCw, AlertTriangle, BrainCircuit, Palette, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme, THEME_PRESETS } from '@/contexts/ThemeContext'

export default function SettingsPage() {
  const { logout } = useAuth()
  const { currentTheme, setTheme, isDark, toggleDark } = useTheme()
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [successPassword, setSuccessPassword] = useState('')
  const [errorPassword, setErrorPassword] = useState('')

  // Memory State
  const [globalMemory, setGlobalMemory] = useState('')
  const [loadingMemory, setLoadingMemory] = useState(false)
  const [successMemory, setSuccessMemory] = useState('')

  useEffect(() => {
    // Fetch initial global memory
    apiFetch<{ memory: string }>('/api/settings/global-memory')
      .then(res => setGlobalMemory(res.memory || ''))
      .catch(console.error)
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingPassword(true)
    setErrorPassword('')
    setSuccessPassword('')

    if (newPassword !== confirmPassword) {
      setErrorPassword('New access codes do not match.')
      setLoadingPassword(false)
      return
    }

    try {
      await apiFetch('/api/settings/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setSuccessPassword('Access code updated successfully. You will need to log in again.')
      setTimeout(() => logout(), 2000)
    } catch (err: any) {
      setErrorPassword(err.message || 'Failed to update access code.')
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleMemorySave = async () => {
    setLoadingMemory(true)
    setSuccessMemory('')
    try {
      await apiFetch('/api/settings/global-memory', {
        method: 'POST',
        body: JSON.stringify({ memory: globalMemory }),
      })
      setSuccessMemory('Global Memory saved. The AI will now use this context across all new chats.')
      setTimeout(() => setSuccessMemory(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMemory(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <PageHeader
        title="Settings & Customization"
        description="Theme, AI memory, and security configuration."
      />

      <div className="grid grid-cols-1 gap-8">

        {/* Theme & Appearance */}
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Appearance & Theme</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Customize your dashboard's look and feel.</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Switch between light and dark appearance.</p>
            </div>
            <button
              onClick={toggleDark}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                isDark ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block size-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Presets */}
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Color Theme</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {THEME_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setTheme(preset.id)}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] ${
                    currentTheme.id === preset.id
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5 hover:border-white/40 dark:hover:border-white/10'
                  }`}
                >
                  {currentTheme.id === preset.id && (
                    <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div
                    className="size-10 rounded-xl shadow-md border-2 border-white/50 dark:border-white/10"
                    style={{ 
                      background: `linear-gradient(135deg, ${preset.accent}, ${preset.accent}88)`,
                      boxShadow: `0 4px 15px ${preset.accent}40`
                    }}
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Global Memory Section */}
          <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Global Memory</h2>
                <p className="text-xs font-medium text-slate-500">Personal context for all conversations.</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                System Instructions
              </label>
              <textarea
                className="flex-1 w-full min-h-[200px] p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/30 dark:border-white/5 focus:border-primary outline-none transition-all resize-y text-sm font-medium"
                placeholder="E.g., My name is Alex. I am a frontend developer working with React and Tailwind. Please always provide concise, copy-pasteable code."
                value={globalMemory}
                onChange={e => setGlobalMemory(e.target.value)}
              />
              <div className="flex items-center justify-between">
                {successMemory ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{successMemory}</span>
                ) : <span />}
                <Button 
                  onClick={handleMemorySave} 
                  disabled={loadingMemory}
                  className="rounded-xl font-bold px-8 shadow-md"
                >
                  {loadingMemory ? 'Saving...' : 'Save Memory'}
                </Button>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-10 rounded-xl bg-slate-500/20 flex items-center justify-center text-slate-500">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Access Control</h2>
                <p className="text-xs font-medium text-slate-500">Change your master password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/30 dark:border-white/5 rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/30 dark:border-white/5 rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/30 dark:border-white/5 rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {errorPassword && (
                <div className="bg-red-500/10 text-red-500 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-red-500/20">
                  <AlertTriangle size={14} />
                  {errorPassword}
                </div>
              )}

              {successPassword && (
                <div className="bg-emerald-500/10 text-emerald-500 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-emerald-500/20">
                  <RefreshCw className="animate-spin" size={14} />
                  {successPassword}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={loadingPassword}
                  variant="outline"
                  className="rounded-xl font-bold px-8 shadow-sm"
                >
                  {loadingPassword ? 'Processing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </section>
        </div>

      </div>
    </div>
  )
}
