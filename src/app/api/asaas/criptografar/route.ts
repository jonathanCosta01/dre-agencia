import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criptografar } from '@/lib/cripto'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { apiKey } = await request.json()
  if (!apiKey) {
    return NextResponse.json({ erro: 'API Key não informada' }, { status: 400 })
  }

  const enc = await criptografar(apiKey)
  return NextResponse.json({ enc })
}
