import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatBRL, formatPercent } from '@/lib/formatters'
import type { LucideIcon } from 'lucide-react'

interface BlocoDREProps {
  titulo: string
  valor: number
  percentual: number
  icon: LucideIcon
  corProgress: string
  badge?: React.ReactNode
  destaque?: boolean
}

export function BlocoDRE({
  titulo,
  valor,
  percentual,
  icon: Icon,
  corProgress,
  badge,
  destaque = false,
}: BlocoDREProps) {
  return (
    <Card className={cn(
      'border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900',
      destaque && 'border-orange-200 dark:border-orange-900'
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <Icon className={cn('h-4 w-4', destaque ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500')} />
          {titulo}
        </div>
        {badge}
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className={cn('text-2xl font-bold', destaque ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-zinc-50')}>
          {formatBRL(valor)}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {formatPercent(percentual)} do faturamento
        </p>
        <Progress
          value={Math.min(Math.abs(percentual), 100)}
          className={cn('mt-3 h-1.5', corProgress)}
        />
      </CardContent>
    </Card>
  )
}
