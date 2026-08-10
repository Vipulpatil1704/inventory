import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingSpinner({ className, label = 'Loading...' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-muted-foreground)]', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
