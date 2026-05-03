'use client'

import { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    async function buscarDados() {
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
    }
    buscarDados()
  }, [filtro])

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {saudacao}, {nomeUsuario}!
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Resumo financeiro do período selecionado.
          </p>
        </div>
        <div className="hidden lg:block">
          <ThemeToggle />
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
