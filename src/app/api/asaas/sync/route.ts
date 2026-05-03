import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listarPagamentosAsaas } from '@/lib/asaas'
import { decriptografar } from '@/lib/cripto'
import { primeiroDiaMes, ultimoDiaMes, formatDateISO } from '@/lib/formatters'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { data: cfg, error: cfgError } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (cfgError || !cfg?.asaas_api_key_enc) {
    return NextResponse.json({ erro: 'API Key do Asaas não configurada' }, { status: 400 })
  }

  let apiKey: string
  try {
    apiKey = await decriptografar(cfg.asaas_api_key_enc)
  } catch {
    return NextResponse.json({ erro: 'Erro ao decriptografar API Key' }, { status: 500 })
  }

  const agora = new Date()
  const dataInicio = formatDateISO(primeiroDiaMes(agora))
  const dataFim = formatDateISO(ultimoDiaMes(agora))

  let sincronizados = 0
  let erros = 0

  try {
    const resultado = await listarPagamentosAsaas(apiKey, cfg.asaas_ambiente, dataInicio, dataFim)

    for (const pagamento of resultado.data) {
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user.id)
        .eq('asaas_customer_id', pagamento.customer)
        .single()

      const payload = {
        user_id: user.id,
        cliente_id: cliente?.id ?? null,
        descricao: pagamento.description ?? `Pagamento Asaas #${pagamento.id}`,
        valor: pagamento.value,
        data_pagamento: pagamento.paymentDate,
        origem: 'asaas' as const,
        asaas_payment_id: pagamento.id,
      }

      const { error } = await supabase
        .from('receitas')
        .upsert(payload, { onConflict: 'asaas_payment_id' })

      if (error) erros++
      else sincronizados++
    }

    await supabase
      .from('configuracoes')
      .update({ ultima_sincronizacao: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({ sincronizados, erros })
  } catch (err) {
    return NextResponse.json({ erro: String(err) }, { status: 500 })
  }
}
