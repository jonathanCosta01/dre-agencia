'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/formatters'
import { toast } from 'sonner'
import type { Configuracao } from '@/types'

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Partial<Configuracao>>({})
  const [nomeAgencia, setNomeAgencia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [percentualImposto, setPercentualImposto] = useState('6.00')
  const [asaasKey, setAsaasKey] = useState('')
  const [ambiente, setAmbiente] = useState<'sandbox' | 'producao'>('sandbox')
  const [chaveSalva, setChaveSalva] = useState(false)
  const [mostrarKey, setMostrarKey] = useState(false)
  const [testandoConexao, setTestandoConexao] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<{ ok: boolean; mensagem: string } | null>(null)
  const [sincronizando, setSincronizando] = useState(false)

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: cfg } = await supabase.from('configuracoes').select('*').eq('user_id', user.id).single()

    if (cfg) {
      setConfig(cfg as Configuracao)
      setNomeAgencia(cfg.nome_agencia ?? '')
      setCnpj(cfg.documento_cnpj ?? '')
      setPercentualImposto(String(cfg.percentual_imposto ?? '6.00'))
      setAmbiente(cfg.asaas_ambiente ?? 'sandbox')
      setChaveSalva(!!cfg.asaas_api_key_enc)
    }
  }

  useEffect(() => { carregarDados() }, [])

  async function salvarPerfil() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('configuracoes').upsert({
      user_id: user.id,
      nome_agencia: nomeAgencia,
      documento_cnpj: cnpj,
    }, { onConflict: 'user_id' })
    if (error) { toast.error('Erro ao salvar'); return }
    toast.success('Perfil atualizado!')
  }

  async function salvarImposto() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('configuracoes').upsert({
      user_id: user.id,
      percentual_imposto: parseFloat(percentualImposto),
    }, { onConflict: 'user_id' })
    if (error) { toast.error('Erro ao salvar'); return }
    toast.success('Configuração fiscal salva!')
  }

  async function testarConexao() {
    setTestandoConexao(true)
    setResultadoTeste(null)

    // Se há chave no campo, testa direto sem precisar salvar antes
    const res = asaasKey
      ? await fetch('/api/asaas/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: asaasKey, ambiente }),
        })
      : await fetch('/api/asaas/test')

    const data = await res.json()
    setResultadoTeste(data)
    setTestandoConexao(false)
  }

  async function sincronizar() {
    setSincronizando(true)
    const id = toast.loading('Sincronizando com Asaas...')
    const res = await fetch('/api/asaas/sync', { method: 'POST' })
    const data = await res.json()
    if (data.sincronizados !== undefined) {
      toast.success(`${data.sincronizados} pagamentos importados!`, { id })
    } else {
      toast.error(data.erro ?? 'Erro na sincronização', { id })
    }
    setSincronizando(false)
    carregarDados()
  }

  async function salvarAsaas() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload: Record<string, unknown> = {
      user_id: user.id,
      asaas_ambiente: ambiente,
    }

    if (asaasKey) {
      const res = await fetch('/api/asaas/criptografar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: asaasKey }),
      })
      if (res.ok) {
        const { enc } = await res.json()
        payload.asaas_api_key_enc = enc
      }
    }

    const { error } = await supabase.from('configuracoes').upsert(payload, { onConflict: 'user_id' })
    if (error) { toast.error('Erro ao salvar'); return }
    toast.success('Configurações do Asaas salvas!')
    setAsaasKey('')
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Personalize sua agência e integrações.
        </p>
      </div>

      {/* Perfil da Agência */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Perfil da Agência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeAgencia">Nome da agência *</Label>
            <Input id="nomeAgencia" value={nomeAgencia} onChange={(e) => setNomeAgencia(e.target.value)} className="focus-visible:ring-orange-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="focus-visible:ring-orange-500" />
          </div>
          <Button onClick={salvarPerfil} className="bg-orange-500 text-white hover:bg-orange-600">
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Configurações Fiscais */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Configurações Fiscais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imposto">Percentual de imposto (%)</Label>
            <Input
              id="imposto"
              type="number"
              step="0.01"
              placeholder="6.00"
              value={percentualImposto}
              onChange={(e) => setPercentualImposto(e.target.value)}
              className="max-w-xs focus-visible:ring-orange-500"
            />
            <p className="text-xs text-zinc-500">
              Padrão Simples Nacional. Usado para calcular automaticamente o bloco de impostos no DRE.
            </p>
          </div>
          <Button onClick={salvarImposto} className="bg-orange-500 text-white hover:bg-orange-600">
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Integração Asaas */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Integração Asaas</CardTitle>
          <CardDescription>Sincronize pagamentos automaticamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ambiente</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ambiente"
                  value="sandbox"
                  checked={ambiente === 'sandbox'}
                  onChange={() => setAmbiente('sandbox')}
                  className="text-orange-500"
                />
                <span className="text-sm">Sandbox</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ambiente"
                  value="producao"
                  checked={ambiente === 'producao'}
                  onChange={() => setAmbiente('producao')}
                  className="text-orange-500"
                />
                <span className="text-sm">Produção</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="asaasKey">API Key do Asaas</Label>
            {chaveSalva && !asaasKey && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-950">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-700 dark:text-green-400">Chave configurada e salva com segurança</span>
                <button
                  type="button"
                  onClick={() => setChaveSalva(false)}
                  className="ml-auto text-xs text-zinc-400 underline hover:text-zinc-600"
                >
                  Substituir
                </button>
              </div>
            )}
            {(!chaveSalva || asaasKey) && (
              <div className="relative">
                <Input
                  id="asaasKey"
                  type={mostrarKey ? 'text' : 'password'}
                  placeholder="$aact_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={asaasKey}
                  onChange={(e) => setAsaasKey(e.target.value)}
                  className="pr-10 focus-visible:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setMostrarKey(!mostrarKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={mostrarKey ? 'Ocultar API Key' : 'Mostrar API Key'}
                >
                  {mostrarKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-500">
              Armazenada com criptografia AES-256-GCM. Nunca exposta no frontend.
            </p>
          </div>

          {resultadoTeste && (
            <Alert className={resultadoTeste.ok ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'}>
              <AlertDescription className={resultadoTeste.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {resultadoTeste.mensagem}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={testarConexao} disabled={testandoConexao}>
              <Wifi className="mr-2 h-4 w-4" />
              {testandoConexao ? 'Testando...' : 'Testar Conexão'}
            </Button>
            <Button variant="outline" onClick={sincronizar} disabled={sincronizando}>
              <RefreshCw className={`mr-2 h-4 w-4 ${sincronizando ? 'animate-spin' : ''}`} />
              {sincronizando ? 'Sincronizando...' : 'Sincronizar Agora'}
            </Button>
            <Button onClick={salvarAsaas} className="bg-orange-500 text-white hover:bg-orange-600">
              Salvar configurações do Asaas
            </Button>
          </div>

          {config.ultima_sincronizacao && !isNaN(new Date(config.ultima_sincronizacao).getTime()) && (
            <p className="text-xs text-zinc-500">
              Última sincronização: {formatDate(config.ultima_sincronizacao)}
            </p>
          )}
          {!config.ultima_sincronizacao && (
            <p className="text-xs text-zinc-500">Nunca sincronizado</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
