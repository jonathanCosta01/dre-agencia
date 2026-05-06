'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { BlocoFaturamento } from '@/components/dre/BlocoFaturamento'
import { BlocoImposto } from '@/components/dre/BlocoImposto'
import { BlocoCustoFixo } from '@/components/dre/BlocoCustoFixo'
import { BlocoDespesaVariavel } from '@/components/dre/BlocoDespesaVariavel'
import { BlocoMarketing } from '@/components/dre/BlocoMarketing'
import { MargemLiquida } from '@/components/dre/MargemLiquida'
import { GraficoCrescimento } from '@/components/graficos/GraficoCrescimento'
import { GraficoPizza } from '@/components/graficos/GraficoPizza'
import { GraficoFluxoCaixa } from '@/components/graficos/GraficoFluxoCaixa'
import { ResumoPeriodo } from '@/components/dashboard/ResumoPeriodo'
import { MetasFinanceiras } from '@/components/dashboard/MetasFinanceiras'
import { InsightsInteligentes } from '@/components/dashboard/InsightsInteligentes'
import { SeletorPeriodo } from '@/components/shared/SeletorPeriodo'
import { EstadoVazio } from '@/components/shared/EstadoVazio'
import { LoadingDRE } from '@/components/shared/LoadingDRE'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { calcularDRE, gerarSerieHistorica } from '@/lib/dre-calc'
import { primeiroDiaMes, ultimoDiaMes, formatDateISO } from '@/lib/formatters'
import type { FiltroPeriodo, Receita, Custo } from '@/types'

const filtroInicial: FiltroPeriodo = {
  modo: 'mes',
  dataInicio: primeiroDiaMes(new Date()),
  dataFim: ultimoDiaMes(new Date()),
}

export default function DashboardPage() {
  const [filtro, setFiltro] = useState<FiltroPeriodo>(filtroInicial)
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [custos, setCustos] = useState<Custo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [sincronizando, setSincronizando] = useState(false)
  const [nomeUsuario, setNomeUsuario] = useState('')

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  useEffect(() => {
    async function carregarUsuario() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setNomeUsuario(user?.user_metadata?.nome ?? user?.email?.split('@')[0] ?? 'Usuário')
    }
    carregarUsuario()
  }, [])

  const buscarDados = useCallback(async () => {
    setCarregando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const inicio = formatDateISO(filtro.dataInicio)
    const fim = formatDateISO(filtro.dataFim)

    const [{ data: rec }, { data: cusNoPeriodo }, { data: cusRecorrentes }] = await Promise.all([
      supabase
        .from('receitas')
        .select('*, cliente:clientes(id,nome)')
        .eq('user_id', user.id)
        .gte('data_pagamento', inicio)
        .lte('data_pagamento', fim),
      supabase
        .from('custos')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_competencia', inicio)
        .lte('data_competencia', fim),
      supabase
        .from('custos')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorrente', true)
        .eq('ativo', true),
    ])

    const mapaCustos = new Map<string, Custo>()
    for (const c of [...(cusNoPeriodo ?? []), ...(cusRecorrentes ?? [])]) {
      mapaCustos.set(c.id, c)
    }

    setReceitas((rec as Receita[]) ?? [])
    setCustos(Array.from(mapaCustos.values()))
    setCarregando(false)
  }, [filtro])

  useEffect(() => {
    buscarDados()
  }, [buscarDados])

  async function sincronizarAsaas() {
    setSincronizando(true)
    const id = toast.loading('Sincronizando pagamentos do Asaas...')
    try {
      const res = await fetch('/api/asaas/sync', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.erro ?? 'Erro ao sincronizar com o Asaas.', { id })
      } else {
        const { sincronizados, erros } = json
        if (sincronizados === 0) {
          toast.info('Nenhum pagamento novo encontrado.', { id })
        } else {
          toast.success(`${sincronizados} pagamento(s) importado(s)!${erros > 0 ? ` (${erros} erro(s))` : ''}`, { id })
        }
        await buscarDados()
      }
    } catch {
      toast.error('Não foi possível conectar ao servidor.', { id })
    } finally {
      setSincronizando(false)
    }
  }

  const dre = useMemo(
    () => calcularDRE(receitas, custos, {
      inicio: formatDateISO(filtro.dataInicio),
      fim: formatDateISO(filtro.dataFim),
    }),
    [receitas, custos, filtro]
  )

  const sparklineFaturamento = useMemo(
    () => gerarSerieHistorica(receitas, 'mensal').map((d) => ({ valor: d.valor })),
    [receitas]
  )

  const semDados = !carregando && dre.faturamentoBruto === 0 && dre.totalCustos === 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#111827]">
              {saudacao}, {nomeUsuario}! 👋
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">
            Resumo financeiro da sua agência
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sincronizarAsaas}
            disabled={sincronizando}
            aria-label="Sincronizar pagamentos do Asaas"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-medium text-[#374151] shadow-sm transition-all hover:border-[#FF6B00] hover:text-[#FF6B00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${sincronizando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{sincronizando ? 'Sincronizando...' : 'Sincronizar Asaas'}</span>
          </button>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      {/* Seletor de Período */}
      <SeletorPeriodo filtro={filtro} onChange={setFiltro} />

      {/* Conteúdo */}
      {carregando ? (
        <LoadingDRE />
      ) : semDados ? (
        <EstadoVazio />
      ) : (
        <div className="space-y-6">
          {/* Blocos DRE */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BlocoFaturamento dre={dre} sparkline={sparklineFaturamento} />
            <BlocoImposto dre={dre} />
            <BlocoCustoFixo dre={dre} />
            <BlocoDespesaVariavel dre={dre} />
            <BlocoMarketing dre={dre} />
            <MargemLiquida dre={dre} />
          </div>

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <GraficoCrescimento receitas={receitas} />
            <GraficoPizza dados={dre.faturamentoPorCliente} total={dre.faturamentoBruto} />
          </div>

          {/* Fluxo de Caixa + Resumo do Período */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <GraficoFluxoCaixa receitas={receitas} custos={custos} />
            </div>
            <ResumoPeriodo dre={dre} />
          </div>

          {/* Metas Financeiras */}
          <MetasFinanceiras dre={dre} />

          {/* Insights Inteligentes */}
          <InsightsInteligentes dre={dre} />
        </div>
      )}
    </div>
  )
}
