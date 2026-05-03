'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatPercent } from '@/lib/formatters'
import type { FaturamentoPorCliente } from '@/types'

interface GraficoPizzaProps {
  dados: FaturamentoPorCliente[]
  total: number
}

export function GraficoPizza({ dados, total }: GraficoPizzaProps) {
  if (dados.length === 0) {
    return (
      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="px-5 pb-2 pt-4">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Receita por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-zinc-400">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader className="px-5 pb-2 pt-4">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Receita por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="relative flex justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dados}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="valor"
                nameKey="nome"
              >
                {dados.map((entry, index) => (
                  <Cell key={entry.clienteId} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatBRL(Number(value)), 'Receita']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-zinc-500">Total</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {formatBRL(total)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {dados.map((item) => (
            <div key={item.clienteId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: item.cor }}
                />
                <span className="truncate text-zinc-700 dark:text-zinc-300">{item.nome}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <span className="text-zinc-900 dark:text-zinc-50 font-medium">{formatBRL(item.valor)}</span>
                <span className="text-zinc-400 text-xs w-12 text-right">{formatPercent(item.percentual)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
