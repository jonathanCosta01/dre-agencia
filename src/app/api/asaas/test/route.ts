import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { testarConexaoAsaas } from '@/lib/asaas'
import { decriptografar } from '@/lib/cripto'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, mensagem: 'Não autenticado' }, { status: 401 })
  }

  const { data: cfg } = await supabase
    .from('configuracoes')
    .select('asaas_api_key_enc, asaas_ambiente')
    .eq('user_id', user.id)
    .single()

  if (!cfg?.asaas_api_key_enc) {
    return NextResponse.json({ ok: false, mensagem: 'API Key não configurada' })
  }

  try {
    const apiKey = await decriptografar(cfg.asaas_api_key_enc)
    const resultado = await testarConexaoAsaas(apiKey, cfg.asaas_ambiente)
    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ ok: false, mensagem: 'Erro ao decriptografar API Key' })
  }
}
