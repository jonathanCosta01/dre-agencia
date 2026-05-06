'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react'
import { formatPercent, formatBRL } from '@/lib/formatters'
import type { DREResult } from '@/types'

interface InsightsInteligentesProps {
  dre: DREResult
}

interface Insight {
  icone: React.ElementType
  titulo: string
  descricao: string
  tipo: 'sucesso' | 'alerta' | 'info' | 'destaque'
}

function gerarInsights(dre: DREResult): Insight[] {
  const insights: Insight[] = []

  if (dre.faturamentoBruto === 0) {
    insights.push({
      icone: Info,
      titulo: 'Nenhuma receita no período',
      descricao: 'Adicione receitas para visualizar insights financeiros.',
      tipo: 'info',
    })
    return insights
  }

  if (dre.percentualMargemLiquida > 40) {
    insights.push({
      icone: CheckCircle2,
      titulo: 'Margem líquida saudável',
      descricao: `Sua margem está em ${formatPercent(dre.percentualMargemLiquida)}, acima da meta de 40%.`,
      tipo: 'sucesso',
    })
  } else if (dre.percentualMargemLiquida < 20) {
    insights.push({
      icone: AlertTriangle,
      titulo: 'Margem líquida baixa',
      descricao: `Margem em ${formatPercent(dre.percentualMargemLiquida)}. Revise custos para melhorar a rentabilidade.`,
      tipo: 'alerta',
    })
  }

  if (dre.percentualDespesaVariavel > 30) {
    insights.push({
      icone: TrendingUp,
      titulo: 'Despesas variáveis altas',
      descricao: `Despesas variáveis representam ${formatPercent(dre.percentualDespesaVariavel)} do faturamento.`,
      tipo: 'alerta',
    })
  }

  if (dre.faturamentoBruto >= 50000) {
    insights.push({
      icone: Zap,
      titulo: 'Meta mensal atingida!',
      descricao: `Parabéns! Faturamento de ${formatBRL(dre.faturamentoBruto)} supera a meta de R$ 50.000.`,
      tipo: 'destaque',
    })
  } else {
    const falta = 50000 - dre.faturamentoBruto
    insights.push({
      icone: TrendingUp,
      titulo: 'Meta mensal em andamento',
      descricao: `Faltam ${formatBRL(falta)} para atingir a meta de R$ 50.000 este mês.`,
      tipo: 'info',
    })
  }

  if (dre.quantidadeClientes >= 5) {
    insights.push({
      icone: CheckCircle2,
      titulo: 'Carteira em crescimento',
      descricao: `${dre.quantidadeClientes} clientes ativos gerando receita no período.`,
      tipo: 'sucesso',
    })
  }

  if (dre.percentualImposto > 10) {
    insights.push({
      icone: AlertTriangle,
      titulo: 'Carga tributária elevada',
      descricao: `Impostos em ${formatPercent(dre.percentualImposto)} do faturamento. Avalie seu regime tributário.`,
      tipo: 'alerta',
    })
  }

  return insights.slice(0, 4)
}

const estilos = {
  sucesso: {
    fundo: 'bg-green-50 border-green-100',
    icone: 'bg-green-100 text-green-600',
    titulo: 'text-green-800',
    desc: 'text-green-700',
  },
  alerta: {
    fundo: 'bg-amber-50 border-amber-100',
    icone: 'bg-amber-100 text-amber-600',
    titulo: 'text-amber-800',
    desc: 'text-amber-700',
  },
  info: {
    fundo: 'bg-blue-50 border-blue-100',
    icone: 'bg-blue-100 text-blue-600',
    titulo: 'text-blue-800',
    desc: 'text-blue-700',
  },
  destaque: {
    fundo: 'bg-orange-50 border-orange-100',
    icone: 'bg-orange-100 text-[#FF6B00]',
    titulo: 'text-orange-800',
    desc: 'text-orange-700',
  },
}

export function InsightsInteligentes({ dre }: InsightsInteligentesProps) {
  const insights = gerarInsights(dre)

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <Zap className="h-3.5 w-3.5 text-[#FF6B00]" />
        </div>
        <h2 className="text-[15px] font-semibold text-[#111827]">Insights Inteligentes</h2>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-[#FF6B00]">
          IA
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight, i) => {
          const Icon = insight.icone
          const estilo = estilos[insight.tipo]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-xl border p-4 ${estilo.fundo}`}
            >
              <div className="mb-2 flex items-start gap-3">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${estilo.icone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`text-sm font-semibold ${estilo.titulo}`}>{insight.titulo}</p>
              </div>
              <p className={`text-xs leading-relaxed ${estilo.desc}`}>{insight.descricao}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
