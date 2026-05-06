'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatPercent } from '@/lib/formatters'
import type { DREResult } from '@/types'

interface ResumoPeriodoProps {
  dre: DREResult
}

export function ResumoPeriodo({ dre }: ResumoPeriodoProps) {
  const itens = [
    {
      label: 'Receitas Totais',
      valor: dre.faturamentoBruto,
      icon: TrendingUp,
      cor: 'text-green-600',
      fundo: 'bg-green-50',
      destaque: true,
    },
    {
      label: 'Custos Totais',
      valor: dre.totalCustos,
      icon: TrendingDown,
      cor: 'text-red-500',
      fundo: 'bg-red-50',
      destaque: false,
    },
    {
      label: 'Lucro Líquido',
      valor: dre.margemLiquida,
      icon: DollarSign,
      cor: dre.margemLiquida >= 0 ? 'text-[#FF6B00]' : 'text-red-500',
      fundo: dre.margemLiquida >= 0 ? 'bg-orange-50' : 'bg-red-50',
      destaque: false,
    },
    {
      label: 'Margem Líquida',
      valor: null,
      percentualTexto: formatPercent(dre.percentualMargemLiquida),
      icon: Percent,
      cor: dre.percentualMargemLiquida >= 30 ? 'text-green-600' : 'text-red-500',
      fundo: dre.percentualMargemLiquida >= 30 ? 'bg-green-50' : 'bg-red-50',
      destaque: false,
    },
  ]

  return (
    <Card className="border border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="px-6 pb-3 pt-5">
        <CardTitle className="text-[15px] font-semibold text-[#111827]">Resumo do Período</CardTitle>
        <p className="text-xs text-[#6B7280]">Consolidado financeiro do intervalo selecionado</p>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <div className="space-y-3">
          {itens.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between rounded-xl border border-[#F3F4F6] bg-[#F8FAFC] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.fundo}`}>
                    <Icon className={`h-4 w-4 ${item.cor}`} />
                  </div>
                  <span className="text-sm font-medium text-[#374151]">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${item.cor}`}>
                  {item.valor !== null ? formatBRL(item.valor) : item.percentualTexto}
                </span>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
