import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { Plus, ShieldCheck, Globe } from 'lucide-react'
import type { ApiKey, Platform } from '../../../shared/types'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'google', label: 'Google AI Studio' },
  { value: 'groq', label: 'Groq' },
  { value: 'cerebras', label: 'Cerebras' },
  { value: 'sambanova', label: 'SambaNova' },
  { value: 'nvidia', label: 'NVIDIA NIM' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'github', label: 'GitHub Models' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'cloudflare', label: 'Cloudflare Workers AI' },
  { value: 'zhipu', label: 'Zhipu AI (Z.ai)' },
]

const statusDot: Record<string, string> = {
  healthy: 'bg-emerald-500',
  rate_limited: 'bg-amber-500',
  invalid: 'bg-rose-500',
  error: 'bg-rose-500',
  unknown: 'bg-slate-300 dark:bg-slate-700',
}

function UnifiedKeySection() {
  const queryClient = useQueryClient()
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data } = useQuery<{ apiKey: string }>({
    queryKey: ['unified-key'],
    queryFn: () => apiFetch('/api/settings/api-key'),
  })

  const regenerate = useMutation({
    mutationFn: () => apiFetch('/api/settings/api-key/regenerate', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unified-key'] }),
  })

  const apiKey = data?.apiKey ?? ''
  const masked = apiKey ? apiKey.slice(0, 13) + '•'.repeat(32) : '…'
  const baseUrl = `${window.location.origin}/v1`

  function copy() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="section-card bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Unified API Key</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Use this key to authenticate your apps with OpenLLM</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => regenerate.mutate()}
          disabled={regenerate.isPending}
          className="rounded-xl font-bold uppercase tracking-wider text-[10px]"
        >
          {regenerate.isPending ? 'Regenerating...' : 'Regenerate Key'}
        </Button>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full bg-white dark:bg-slate-950 border-2 border-primary/10 dark:border-primary/20 rounded-2xl px-5 py-4 flex items-center justify-between shadow-inner">
          <code className="font-mono text-sm text-slate-700 dark:text-slate-300 select-all truncate tabular-nums">
            {showKey ? apiKey : masked}
          </code>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)} className="text-xs font-bold text-primary">
               {showKey ? 'Hide' : 'Show'}
             </Button>
             <Button size="sm" onClick={copy} className="rounded-lg font-bold bg-primary text-white">
               {copied ? 'Copied!' : 'Copy'}
             </Button>
          </div>
        </div>
        
        <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base URL</p>
             <p className="text-xs font-mono text-slate-600 dark:text-slate-400">{baseUrl}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Endpoint</p>
             <p className="text-xs font-mono text-slate-600 dark:text-slate-400">/v1/chat/completions</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function KeysPage() {
  const queryClient = useQueryClient()
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [apiKey, setApiKey] = useState('')
  const [accountId, setAccountId] = useState('')
  const [label, setLabel] = useState('')

  const { data: keys = [] } = useQuery<ApiKey[]>({
    queryKey: ['keys'],
    queryFn: () => apiFetch('/api/keys'),
  })

  const { data: healthData } = useQuery<any>({
    queryKey: ['health'],
    queryFn: () => apiFetch('/api/health'),
    refetchInterval: 30000,
  })

  const addKey = useMutation({
    mutationFn: (body: { platform: string; key: string; label?: string }) =>
      apiFetch('/api/keys', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      queryClient.invalidateQueries({ queryKey: ['health'] })
      setPlatform('')
      setApiKey('')
      setAccountId('')
      setLabel('')
    },
  })

  const deleteKey = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      queryClient.invalidateQueries({ queryKey: ['health'] })
    },
  })

  const checkKey = useMutation({
    mutationFn: (keyId: number) => apiFetch(`/api/health/check/${keyId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] })
      queryClient.invalidateQueries({ queryKey: ['keys'] })
    },
  })

  const needsAccountId = platform === 'cloudflare'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform || !apiKey) return
    if (needsAccountId && !accountId) return
    const key = needsAccountId ? `${accountId}:${apiKey}` : apiKey
    addKey.mutate({ platform, key, label: label || undefined })
  }

  const healthKeyMap = new Map<number, any>()
  for (const k of healthData?.keys ?? []) healthKeyMap.set(k.id, k)

  const grouped = PLATFORMS.map(p => ({
    ...p,
    keys: keys.filter(k => k.platform === p.value),
  })).filter(p => p.keys.length > 0)

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <PageHeader
        title="Security Keys"
        description="Manage your provider credentials and your unified platform access key."
      />

      <UnifiedKeySection />

      <section className="section-card">
        <div className="flex items-center gap-4 mb-8">
           <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
             <Plus size={22} />
           </div>
           <h2 className="text-lg font-extrabold tracking-tight">Add Provider Key</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Platform Provider</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-border shadow-2xl z-[100] pointer-events-auto">
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsAccountId && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Account ID</Label>
              <Input
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                placeholder="Enter ID"
                className="h-12 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-mono text-sm"
              />
            </div>
          )}

          <div className="space-y-2 lg:col-span-1">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">API Key / Token</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste secret key"
              className="h-12 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Label (Optional)</Label>
            <Input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Primary Key, etc."
              className="h-12 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="lg:col-span-4 flex justify-end mt-4">
            <Button type="submit" size="lg" disabled={!platform || !apiKey || (needsAccountId && !accountId) || addKey.isPending} className="px-10 rounded-xl font-bold shadow-lg shadow-primary/20">
              {addKey.isPending ? 'Validating...' : 'Add Provider Key'}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
             <Globe size={22} />
           </div>
           <h2 className="text-lg font-extrabold tracking-tight">Active Provider Nodes</h2>
        </div>

        {keys.length === 0 ? (
          <div className="section-card border-dashed border-2 py-16 text-center">
             <p className="text-slate-500 font-medium">No provider nodes initialized yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {grouped.map(group => (
              <div key={group.value} className="section-card p-0 overflow-hidden border-2 border-slate-50 dark:border-slate-900 shadow-md">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {group.label}
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-widest">{group.keys.length} Node{group.keys.length > 1 ? 's' : ''}</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-900">
                  {group.keys.map(k => {
                    const h = healthKeyMap.get(k.id)
                    const status = h?.status ?? k.status
                    return (
                      <div key={k.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-[200px]">
                           <span className={`size-2.5 rounded-full shrink-0 shadow-sm ${statusDot[status] ?? statusDot.unknown}`} />
                           <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{k.maskedKey}</code>
                        </div>
                        
                        <div className="flex-1 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                           {k.label && <span className="text-slate-600 dark:text-slate-300">{k.label}</span>}
                           <span className={status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}>{status}</span>
                        </div>

                        <div className="flex items-center gap-3">
                           <Button variant="ghost" size="sm" onClick={() => checkKey.mutate(k.id)} disabled={checkKey.isPending} className="text-xs font-bold text-primary">
                             Check Health
                           </Button>
                           <Button variant="ghost" size="sm" onClick={() => deleteKey.mutate(k.id)} disabled={deleteKey.isPending} className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                             Remove
                           </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
