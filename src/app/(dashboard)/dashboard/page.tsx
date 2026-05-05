'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { BlocoFaturamento } from '@/components/dre/BlocoFaturamento'
import { BlocoImposto } from '@/components/dre/BlocoImposto'
import { BlocoCustoFixo } from '@/components/dre/BlocoCustoFixo'
import { BlocoDespesaVariavel } from '@/components/dre/BlocoDespesaVariavel'
import { BlocoMarketing } from '@/components/dre/BlocoMarketing'
import { MargemLiquida } from '@/components/dre/MargemLiquida'
import { GraficoCrescimento } from '@/components/graficos/GraficoCrescimento'
import { GraficoPizza } from '@/components/graficos/GraficoPizza'
import { SeletorPeriodo } from '@/components/shared/SeletorPeriodo'
import { EstadoVazio } from '@/components/shared/EstadoVazio'
import { LoadingDRE } from '@/components/shared/LoadingDRE'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { calcularDRE } from '@/lib/dre-calc'
import { primeiroDiaMes, ultimoDiaMes, formatDateISO, nomeMes } from '@/lib/formatters'
import type { FiltroPeriodo, Receita, Custo, DREResult } from '@/types'

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

    const [{ data: rec }, { data: cus }] = await Promise.all([
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
    ])

    setReceitas((rec as Receita[]) ?? [])
    setCustos((cus as Custo[]) ?? [])
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

  const semDados = !carregando && dre.faturamentoBruto === 0 && dre.totalCustos === 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {saudacao}, {nomeUsuario}!
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Resumo financeiro do período selecionado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sincronizarAsaas}
            disabled={sincronizando}
            aria-label="Sincronizar pagamentos do Asaas"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-orange-950 dark:hover:border-orange-800 dark:hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <RefreshCw className={`h-4 w-4 ${sincronizando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{sincronizando ? 'Sincronizando...' : 'Sincronizar Asaas'}</span>
          </button>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Seletor de Período */}
      <SeletorPeriodo filtro={filtro} onChange={setFiltro} />

      {/* Conteúdo */}
      {carregando ? (
        <LoadingDRE />
      ) : semDados ? (
        <EstadoVazio />
      ) : (
        <>
          {/* Blocos DRE */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BlocoFaturamento dre={dre} />
            <BlocoImposto dre={dre} />
            <BlocoCustoFixo dre={dre} />
            <BlocoDespesaVariavel dre={dre} />
            <BlocoMarketing dre={dre} />
            <MargemLiquida dre={dre} />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <GraficoCrescimento receitas={receitas} />
            <GraficoPizza dados={dre.faturamentoPorCliente} total={dre.faturamentoBruto} />
          </div>
        </>
      )}
    </div>
  )
}
