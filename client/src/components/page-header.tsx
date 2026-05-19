import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-8 mb-8 border-b border-slate-100 dark:border-slate-800">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          {title}
        </h1>
        {description && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">{actions}</div>}
    </div>
  )
}
