'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatBRLCompacto } from '@/lib/formatters'
import type { Receita, Custo } from '@/types'

interface GraficoFluxoCaixaProps {
  receitas: Receita[]
  custos: Custo[]
}

interface PontoFluxo {
  mes: string
  entradas: number
  saidas: number
  saldo: number
}

function gerarFluxo(receitas: Receita[], custos: Custo[]): PontoFluxo[] {
  const mapa = new Map<string, { entradas: number; saidas: number }>()

  receitas.forEach((r) => {
    const d = new Date(r.data_pagamento + 'T00:00:00')
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const atual = mapa.get(chave) ?? { entradas: 0, saidas: 0 }
    mapa.set(chave, { ...atual, entradas: atual.entradas + Number(r.valor) })
  })

  custos.forEach((c) => {
    const d = new Date(c.data_competencia + 'T00:00:00')
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const atual = mapa.get(chave) ?? { entradas: 0, saidas: 0 }
    mapa.set(chave, { ...atual, saidas: atual.saidas + Number(c.valor) })
  })

  return Array.from(mapa.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, { entradas, saidas }]) => {
      const [ano, mes] = chave.split('-')
      const data = new Date(Number(ano), Number(mes) - 1, 1)
      return {
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        entradas,
        saidas,
        saldo: entradas - saidas,
      }
    })
    .slice(-6)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg">
        <p className="mb-2 text-xs font-semibold text-[#111827]">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[#6B7280]">{p.name}:</span>
            <span className="font-medium text-[#111827]">{formatBRL(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function GraficoFluxoCaixa({ receitas, custos }: GraficoFluxoCaixaProps) {
  const dados = useMemo(() => gerarFluxo(receitas, custos), [receitas, custos])

  return (
    <Card className="border border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
        <div>
          <CardTitle className="text-[15px] font-semibold text-[#111827]">
            Fluxo de Caixa
          </CardTitle>
          <p className="mt-0.5 text-xs text-[#6B7280]">Entradas vs. saídas mensais</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#22C55E]" />Entradas</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#FF4D6D]" />Saídas</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FF6B00]" />Saldo</span>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={dados} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatBRLCompacto(v)}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="entradas" name="Entradas" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="saidas" name="Saídas" fill="#FF4D6D" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="#FF6B00"
              strokeWidth={2}
              dot={{ fill: '#FF6B00', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
