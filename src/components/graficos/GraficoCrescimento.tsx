'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatBRLCompacto } from '@/lib/formatters'
import { gerarSerieHistorica } from '@/lib/dre-calc'
import type { Receita } from '@/types'

type Modo = 'diario' | 'mensal' | 'anual'

const modos: { key: Modo; label: string }[] = [
  { key: 'diario', label: 'Diário' },
  { key: 'mensal', label: 'Mensal' },
  { key: 'anual', label: 'Anual' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg">
        <p className="mb-1 text-xs text-[#6B7280]">{label}</p>
        <p className="text-sm font-bold text-[#FF6B00]">{formatBRL(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function GraficoCrescimento({ receitas }: { receitas: Receita[] }) {
  const [modo, setModo] = useState<Modo>('mensal')
  const dados = gerarSerieHistorica(receitas, modo)

  return (
    <Card className="border border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
        <div>
          <CardTitle className="text-[15px] font-semibold text-[#111827]">
            Evolução do Faturamento
          </CardTitle>
          <p className="mt-0.5 text-xs text-[#6B7280]">Tendência de receitas no período</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-0.5">
          {modos.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setModo(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                modo === key
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-5">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dados} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFaturamento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatBRLCompacto(v)}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#FF6B00"
              strokeWidth={2.5}
              fill="url(#gradFaturamento)"
              dot={false}
              activeDot={{ r: 5, fill: '#FF6B00', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
