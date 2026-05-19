import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, Cell
} from 'recharts'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { Activity, Zap, Layers, AlertCircle, Clock, DollarSign } from 'lucide-react'

type TimeRange = '24h' | '7d' | '30d'

function formatTokens(n?: number): string {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function GlassStat({ label, value, icon: Icon, colorClass }: { label: string; value: string | number; icon: React.ElementType, colorClass: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 dark:text-white tabular-nums mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function GlassPanel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-panel rounded-3xl flex flex-col overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/10">
        <h3 className="text-sm font-extrabold tracking-wide text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      <div className="p-6 flex-1 flex flex-col">{children}</div>
    </div>
  )
}

const axisStyle = { fontSize: 11, fill: '#94a3b8', fontWeight: 600 } as const
const gridStyle = 'rgba(148, 163, 184, 0.1)'

const platformColors: Record<string, string> = {
  google:      '#4285f4',
  groq:        '#f55036',
  cerebras:    '#8b5cf6',
  sambanova:   '#14b8a6',
  nvidia:      '#76b900',
  mistral:     '#f59e0b',
  openrouter:  '#ec4899',
  github:      '#6e7b8b',
  cohere:      '#d946ef',
  cloudflare:  '#f38020',
  zhipu:       '#06b6d4',
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>('7d')

  const { data: summary } = useQuery({
    queryKey: ['analytics', 'summary', range],
    queryFn: () => apiFetch<any>(`/api/analytics/summary?range=${range}`),
  })

  const { data: byPlatform = [] } = useQuery({
    queryKey: ['analytics', 'by-platform', range],
    queryFn: () => apiFetch<any[]>(`/api/analytics/by-platform?range=${range}`),
  })

  const { data: timeline = [] } = useQuery({
    queryKey: ['analytics', 'timeline', range],
    queryFn: () => apiFetch<any[]>(`/api/analytics/timeline?range=${range}`),
  })

  const { data: byModel = [] } = useQuery({
    queryKey: ['analytics', 'by-model', range],
    queryFn: () => apiFetch<any[]>(`/api/analytics/by-model?range=${range}`),
  })

  const { data: errors = [] } = useQuery({
    queryKey: ['analytics', 'errors', range],
    queryFn: () => apiFetch<any[]>(`/api/analytics/errors?range=${range}`),
  })

  const { data: errorDist } = useQuery({
    queryKey: ['analytics', 'error-distribution', range],
    queryFn: () => apiFetch<{ byCategory: any[]; byPlatform: any[]; detailed: any[] }>(`/api/analytics/error-distribution?range=${range}`),
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 relative z-10">
      <PageHeader
        title="Neural Analytics"
        description="Deep insights into request volume, platform routing, latency, and cost efficiency."
        actions={
          <div className="flex gap-1 rounded-xl glass-panel p-1 border-white/20">
            {(['24h', '7d', '30d'] as TimeRange[]).map(r => (
              <Button
                key={r}
                variant={range === r ? 'secondary' : 'ghost'}
                size="sm"
                className={`rounded-lg font-bold transition-all ${range === r ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        }
      />

      <div className="space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          <GlassStat label="Total Requests" value={summary?.totalRequests ?? 0} icon={Activity} colorClass="bg-primary" />
          <GlassStat label="Success Rate" value={`${summary?.successRate ?? 0}%`} icon={Zap} colorClass="bg-emerald-500" />
          <GlassStat label="Input Tokens" value={formatTokens(summary?.totalInputTokens)} icon={Layers} colorClass="bg-cyan-500" />
          <GlassStat label="Output Tokens" value={formatTokens(summary?.totalOutputTokens)} icon={Layers} colorClass="bg-purple-500" />
          <GlassStat label="Avg Latency" value={`${summary?.avgLatencyMs ?? 0} ms`} icon={Clock} colorClass="bg-amber-500" />
          <GlassStat label="Est. Savings" value={`$${summary?.estimatedCostSavings ?? '0.00'}`} icon={DollarSign} colorClass="bg-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Timeline Chart */}
          <div className="lg:col-span-2">
            <GlassPanel title="Platform Request Activity">
              {timeline.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12 font-medium">Accumulating data...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeline} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
                    <XAxis dataKey="timestamp" tick={axisStyle} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 'bold', paddingTop: 20 }} iconType="circle" />
                    <Area type="monotone" dataKey="successCount" name="Successful Requests" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSuccess)" />
                    <Area type="monotone" dataKey="failureCount" name="Failed Requests" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFail)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </GlassPanel>
          </div>

          <GlassPanel title="Traffic by Gateway Node">
            {byPlatform.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12 font-medium">Accumulating data...</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byPlatform} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
                  <XAxis dataKey="platform" tick={axisStyle} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148,163,184,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontWeight: 600 }} 
                  />
                  <Bar dataKey="requests" radius={[6, 6, 0, 0]}>
                    {byPlatform.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={platformColors[entry.platform] || '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassPanel>

          <GlassPanel title="Latency Profile by Node">
            {byPlatform.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12 font-medium">Accumulating data...</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byPlatform} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
                  <XAxis dataKey="platform" tick={axisStyle} tickLine={false} axisLine={false} dy={10} />
                  <YAxis unit="ms" tick={axisStyle} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148,163,184,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontWeight: 600 }} 
                  />
                  <Bar dataKey="avgLatencyMs" name="Latency (ms)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassPanel>

          <div className="lg:col-span-2">
            <GlassPanel title="Per-Model Neural Matrix">
              {byModel.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12 font-medium">Accumulating data...</p>
              ) : (
                <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
                        <TableHead className="pl-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Neural Model</TableHead>
                        <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gateway Node</TableHead>
                        <TableHead className="text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Requests</TableHead>
                        <TableHead className="text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Stability</TableHead>
                        <TableHead className="text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Response Speed</TableHead>
                        <TableHead className="text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Context In</TableHead>
                        <TableHead className="text-right pr-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Context Out</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byModel.map((m: any, i: number) => (
                        <TableRow key={i} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <TableCell className="pl-4 text-sm font-bold text-slate-700 dark:text-slate-200">{m.displayName}</TableCell>
                          <TableCell>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white dark:bg-black/30 text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-white/5">
                              {m.platform}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{m.requests}</TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold">
                            <span className={m.successRate > 90 ? 'text-emerald-500' : 'text-amber-500'}>{m.successRate}%</span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{m.avgLatencyMs} ms</TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{formatTokens(m.totalInputTokens)}</TableCell>
                          <TableCell className="text-right pr-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{formatTokens(m.totalOutputTokens)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GlassPanel>
          </div>

          <GlassPanel title="Anomaly Distribution by Node">
            {!errorDist?.byPlatform?.length ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                <AlertCircle size={40} className="text-emerald-500 mb-3" />
                <p className="text-sm text-emerald-600 font-bold tracking-widest uppercase">System Optimal</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={errorDist.byPlatform} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
                  <XAxis dataKey="platform" tick={axisStyle} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148,163,184,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontWeight: 600 }} 
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassPanel>

          <GlassPanel title="Recent System Anomalies">
            {errors.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 opacity-50">
                 <AlertCircle size={40} className="text-emerald-500 mb-3" />
                 <p className="text-sm text-emerald-600 font-bold tracking-widest uppercase">No Recent Errors</p>
               </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto pr-2 scrollbar-thin">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
                      <TableHead className="pl-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gateway Node</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Error Signature</TableHead>
                      <TableHead className="text-right pr-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.slice(0, 20).map((e: any) => (
                      <TableRow key={e.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                        <TableCell className="pl-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded text-red-500 bg-red-100 dark:bg-red-500/10 uppercase tracking-widest border border-red-200 dark:border-red-500/20">
                            {e.platform}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{e.error}</TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold text-slate-500 pr-4">
                          {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
