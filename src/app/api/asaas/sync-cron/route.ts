import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { listarPagamentosAsaas } from '@/lib/asaas'
import { decriptografar } from '@/lib/cripto'
import { primeiroDiaMes, ultimoDiaMes, formatDateISO } from '@/lib/formatters'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: configs } = await supabase
    .from('configuracoes')
    .select('*')
    .not('asaas_api_key_enc', 'is', null)

  if (!configs?.length) {
    return NextResponse.json({ usuariosSincronizados: 0 })
  }

  const agora = new Date()
  const dataInicio = formatDateISO(primeiroDiaMes(agora))
  const dataFim = formatDateISO(ultimoDiaMes(agora))

  let usuariosSincronizados = 0

  for (const cfg of configs) {
    try {
      const apiKey = await decriptografar(cfg.asaas_api_key_enc)
      const resultado = await listarPagamentosAsaas(apiKey, cfg.asaas_ambiente, dataInicio, dataFim)

      for (const pagamento of resultado.data) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id')
          .eq('user_id', cfg.user_id)
          .eq('asaas_customer_id', pagamento.customer)
          .single()

        await supabase.from('receitas').upsert({
          user_id: cfg.user_id,
          cliente_id: cliente?.id ?? null,
          descricao: pagamento.description ?? `Pagamento Asaas #${pagamento.id}`,
          valor: pagamento.value,
          data_pagamento: pagamento.paymentDate,
          origem: 'asaas',
          asaas_payment_id: pagamento.id,
        }, { onConflict: 'asaas_payment_id' })
      }

      await supabase
        .from('configuracoes')
        .update({ ultima_sincronizacao: new Date().toISOString() })
        .eq('user_id', cfg.user_id)

      usuariosSincronizados++
    } catch {
      // continuar com próximo usuário em caso de erro
    }
  }

  return NextResponse.json({ usuariosSincronizados })
}
