'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SeletorPeriodo } from '@/components/shared/SeletorPeriodo'
import { EstadoVazio } from '@/components/shared/EstadoVazio'
import { FormReceita } from '@/components/lancamentos/FormReceita'
import { FormCusto } from '@/components/lancamentos/FormCusto'
import { TabelaLancamentos } from '@/components/lancamentos/TabelaLancamentos'
import { createClient } from '@/lib/supabase/client'
import { primeiroDiaMes, ultimoDiaMes, formatDateISO } from '@/lib/formatters'
import type { FiltroPeriodo, Receita, Custo, Cliente } from '@/types'

const filtroInicial: FiltroPeriodo = {
  modo: 'mes',
  dataInicio: primeiroDiaMes(new Date()),
  dataFim: ultimoDiaMes(new Date()),
}

export default function LancamentosPage() {
  const [filtro, setFiltro] = useState<FiltroPeriodo>(filtroInicial)
  const [busca, setBusca] = useState('')
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [custos, setCustos] = useState<Custo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modalReceita, setModalReceita] = useState(false)
  const [modalCusto, setModalCusto] = useState(false)
  const [editandoReceita, setEditandoReceita] = useState<Receita | null>(null)
  const [editandoCusto, setEditandoCusto] = useState<Custo | null>(null)

  const buscarDados = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const inicio = formatDateISO(filtro.dataInicio)
    const fim = formatDateISO(filtro.dataFim)

    const [{ data: rec }, { data: cus }, { data: cli }] = await Promise.all([
      supabase
        .from('receitas')
        .select('*, cliente:clientes(id,nome)')
        .eq('user_id', user.id)
        .gte('data_pagamento', inicio)
        .lte('data_pagamento', fim)
        .order('data_pagamento', { ascending: false }),
      supabase
        .from('custos')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_competencia', inicio)
        .lte('data_competencia', fim)
        .order('data_competencia', { ascending: false }),
      supabase.from('clientes').select('*').eq('user_id', user.id).eq('ativo', true),
    ])

    setReceitas((rec as Receita[]) ?? [])
    setCustos((cus as Custo[]) ?? [])
    setClientes((cli as Cliente[]) ?? [])
  }, [filtro])

  useEffect(() => { buscarDados() }, [buscarDados])

  const receitasFiltradas = receitas.filter((r) =>
    r.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    (r.cliente?.nome ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  const custosFiltrados = custos.filter((c) =>
    c.descricao.toLowerCase().includes(busca.toLowerCase())
  )

  function abrirEdicaoReceita(r: Receita) {
    setEditandoReceita(r)
    setModalReceita(true)
  }

  function abrirEdicaoCusto(c: Custo) {
    setEditandoCusto(c)
    setModalCusto(true)
  }

  async function excluirReceita(id: string) {
    const supabase = createClient()
    await supabase.from('receitas').delete().eq('id', id)
    buscarDados()
  }

  async function excluirCusto(id: string) {
    const supabase = createClient()
    await supabase.from('custos').delete().eq('id', id)
    buscarDados()
  }

  async function toggleAtivoCusto(id: string, ativo: boolean) {
    const supabase = createClient()
    await supabase.from('custos').update({ ativo }).eq('id', id)
    buscarDados()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Lançamentos</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gerencie suas receitas e custos.
        </p>
      </div>

      <Tabs defaultValue="receitas">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="custos">Custos</TabsTrigger>
          </TabsList>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SeletorPeriodo filtro={filtro} onChange={setFiltro} compacto />
          <Input
            placeholder="Buscar por descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="sm:max-w-xs focus-visible:ring-orange-500"
          />
        </div>

        <TabsContent value="receitas" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => { setEditandoReceita(null); setModalReceita(true) }}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </div>
          {receitasFiltradas.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma receita no período"
              descricao="Adicione receitas para visualizar aqui."
              labelBotao="Nova Receita"
              onAcao={() => { setEditandoReceita(null); setModalReceita(true) }}
            />
          ) : (
            <TabelaLancamentos
              tipo="receita"
              receitas={receitasFiltradas}
              onEditar={(r) => abrirEdicaoReceita(r as Receita)}
              onExcluir={(id) => excluirReceita(id)}
            />
          )}
        </TabsContent>

        <TabsContent value="custos" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => { setEditandoCusto(null); setModalCusto(true) }}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Custo
            </Button>
          </div>
          {custosFiltrados.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum custo no período"
              descricao="Adicione custos para visualizar aqui."
              labelBotao="Novo Custo"
              onAcao={() => { setEditandoCusto(null); setModalCusto(true) }}
            />
          ) : (
            <TabelaLancamentos
              tipo="custo"
              custos={custosFiltrados}
              onEditar={(c) => abrirEdicaoCusto(c as Custo)}
              onExcluir={(id) => excluirCusto(id)}
              onToggleAtivo={(id, ativo) => toggleAtivoCusto(id, ativo)}
            />
          )}
        </TabsContent>
      </Tabs>

      <FormReceita
        aberto={modalReceita}
        onFechar={() => { setModalReceita(false); setEditandoReceita(null) }}
        onSalvo={buscarDados}
        clientes={clientes}
        receita={editandoReceita}
      />

      <FormCusto
        aberto={modalCusto}
        onFechar={() => { setModalCusto(false); setEditandoCusto(null) }}
        onSalvo={buscarDados}
        custo={editandoCusto}
      />
    </div>
  )
}
