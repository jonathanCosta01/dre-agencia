'use client'

import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatPercent } from '@/lib/formatters'
import type { DREResult } from '@/types'

interface MetasFinanceirasProps {
  dre: DREResult
}

interface Meta {
  label: string
  atual: number
  alvo: number
  unidade: 'brl' | 'pct'
  cor: string
}

export function MetasFinanceiras({ dre }: MetasFinanceirasProps) {
  const metas: Meta[] = [
    {
      label: 'Meta de Faturamento',
      atual: dre.faturamentoBruto,
      alvo: 50000,
      unidade: 'brl',
      cor: '#FF6B00',
    },
    {
      label: 'Meta de Margem',
      atual: dre.percentualMargemLiquida,
      alvo: 40,
      unidade: 'pct',
      cor: '#22C55E',
    },
    {
      label: 'Redução de Custos',
      atual: Math.max(0, 15000 - dre.totalCustos),
      alvo: 15000,
      unidade: 'brl',
      cor: '#4F7CFF',
    },
  ]

  return (
    <Card className="border border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="px-6 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <Target className="h-4 w-4 text-[#FF6B00]" />
          </div>
          <div>
            <CardTitle className="text-[15px] font-semibold text-[#111827]">Metas Financeiras</CardTitle>
            <p className="text-xs text-[#6B7280]">Progresso em relação aos objetivos do período</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <div className="space-y-5">
          {metas.map((meta, i) => {
            const progresso = Math.min((meta.atual / meta.alvo) * 100, 100)
            const atualFormatado = meta.unidade === 'brl' ? formatBRL(meta.atual) : formatPercent(meta.atual)
            const alvoFormatado = meta.unidade === 'brl' ? formatBRL(meta.alvo) : formatPercent(meta.alvo)

            return (
              <motion.div
                key={meta.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#374151]">{meta.label}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold" style={{ color: meta.cor }}>{atualFormatado}</span>
                    <span className="text-[#9CA3AF]">/ {alvoFormatado}</span>
                  </div>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ backgroundColor: meta.cor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-[#9CA3AF]">{formatPercent(progresso)} atingido</p>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
