'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatBRL, formatPercent } from '@/lib/formatters'
import type { LucideIcon } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface BlocoDREProps {
  titulo: string
  valor: number
  percentual: number
  icon: LucideIcon
  corIcone: string
  corFundo: string
  corGrafico: string
  badge?: React.ReactNode
  destaque?: boolean
  sparkline?: { valor: number }[]
}

export function BlocoDRE({
  titulo,
  valor,
  percentual,
  icon: Icon,
  corIcone,
  corFundo,
  corGrafico,
  badge,
  destaque = false,
  sparkline,
}: BlocoDREProps) {
  const dadosGrafico = sparkline && sparkline.length > 1 ? sparkline : Array.from({ length: 7 }, (_, i) => ({ valor: Math.random() * 100 }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card className={cn(
        'relative overflow-hidden border bg-white transition-shadow duration-200 hover:shadow-md',
        destaque ? 'border-orange-200 shadow-orange-50' : 'border-[#E5E7EB]',
      )}>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', corFundo)}>
                  <Icon className={cn('h-4.5 w-4.5', corIcone)} style={{ width: 18, height: 18 }} />
                </div>
                <span className="text-[13px] font-medium text-[#6B7280] truncate">{titulo}</span>
              </div>
              <div className={cn('text-2xl font-bold tracking-tight', destaque ? 'text-[#FF6B00]' : 'text-[#111827]')}>
                {formatBRL(valor)}
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">
                {formatPercent(percentual)} do faturamento
              </p>
            </div>
            {badge && <div className="ml-2 flex-shrink-0">{badge}</div>}
          </div>

          {/* Mini sparkline */}
          <div className="mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGrafico} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${titulo.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={corGrafico} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={corGrafico} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke={corGrafico}
                  strokeWidth={1.5}
                  fill={`url(#grad-${titulo.replace(/\s/g, '')})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
