'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatBRL, formatBRLCompacto } from '@/lib/formatters'
import { gerarSerieHistorica } from '@/lib/dre-calc'
import type { Receita } from '@/types'

type Modo = 'diario' | 'mensal' | 'anual'

interface GraficoCrescimentoProps {
  receitas: Receita[]
}

export function GraficoCrescimento({ receitas }: GraficoCrescimentoProps) {
  const [modo, setModo] = useState<Modo>('mensal')
  const dados = gerarSerieHistorica(receitas, modo)

  return (
    <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-4">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Evolução do Faturamento
        </CardTitle>
        <div className="flex gap-1">
          {(['diario', 'mensal', 'anual'] as Modo[]).map((m) => (
            <Button
              key={m}
              variant={modo === m ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setModo(m)}
              className={modo === m ? 'bg-orange-500 text-white hover:bg-orange-600 h-7 text-xs' : 'h-7 text-xs'}
            >
              {m === 'diario' ? 'Diário' : m === 'mensal' ? 'Mensal' : 'Anual'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradienteOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatBRLCompacto(v)}
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value) => [formatBRL(Number(value)), 'Faturamento']}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#gradienteOrange)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
