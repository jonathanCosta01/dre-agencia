'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { formatBRL, formatPercent } from '@/lib/formatters'
import type { FaturamentoPorCliente } from '@/types'

interface GraficoPizzaProps {
  dados: FaturamentoPorCliente[]
  total: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-[#111827]">{payload[0].name}</p>
        <p className="text-sm font-bold text-[#FF6B00]">{formatBRL(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function GraficoPizza({ dados, total }: GraficoPizzaProps) {
  if (dados.length === 0) {
    return (
      <Card className="border border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="px-6 pb-2 pt-5">
          <CardTitle className="text-[15px] font-semibold text-[#111827]">Receita por Cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-[#9CA3AF]">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
        <div>
          <CardTitle className="text-[15px] font-semibold text-[#111827]">Receita por Cliente</CardTitle>
          <p className="mt-0.5 text-xs text-[#6B7280]">Distribuição de faturamento por cliente</p>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <div className="relative flex justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={dados}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="valor"
                nameKey="nome"
                paddingAngle={2}
              >
                {dados.map((entry) => (
                  <Cell key={entry.clienteId} fill={entry.cor} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Total</p>
              <p className="text-base font-bold text-[#111827]">{formatBRL(total)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {dados.map((item) => (
            <div key={item.clienteId} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.cor }} />
                <span className="truncate text-sm text-[#374151]">{item.nome}</span>
              </div>
              <div className="ml-3 flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold text-[#111827]">{formatBRL(item.valor)}</span>
                <span className="w-11 text-right text-xs text-[#9CA3AF]">{formatPercent(item.percentual)}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] py-2 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]">
          Ver relatório completo
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  )
}
