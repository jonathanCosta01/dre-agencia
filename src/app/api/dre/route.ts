import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcularDRE } from '@/lib/dre-calc'
import type { Receita, Custo } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { dataInicio, dataFim } = await request.json()

  const [{ data: receitas }, { data: cusNoPeriodo }, { data: cusRecorrentes }] = await Promise.all([
    supabase
      .from('receitas')
      .select('*, cliente:clientes(id,nome)')
      .eq('user_id', user.id)
      .gte('data_pagamento', dataInicio)
      .lte('data_pagamento', dataFim),
    supabase
      .from('custos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data_competencia', dataInicio)
      .lte('data_competencia', dataFim)
      .eq('ativo', true),
    // custos recorrentes ativos entram em todos os meses, independente da competência
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

  const dre = calcularDRE(
    (receitas as Receita[]) ?? [],
    Array.from(mapaCustos.values()),
    { inicio: dataInicio, fim: dataFim }
  )

  return NextResponse.json(dre, { headers: { 'Cache-Control': 'no-store' } })
}
