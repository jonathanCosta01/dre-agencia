'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/formatters'
import { CATEGORIAS } from '@/types'
import { toast } from 'sonner'
import type { Configuracao, Custo } from '@/types'
import { FormCusto } from '@/components/lancamentos/FormCusto'

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Partial<Configuracao>>({})
  const [custosRecorrentes, setCustosRecorrentes] = useState<Custo[]>([])
  const [nomeAgencia, setNomeAgencia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [percentualImposto, setPercentualImposto] = useState('6.00')
  const [asaasKey, setAsaasKey] = useState('')
  const [ambiente, setAmbiente] = useState<'sandbox' | 'producao'>('sandbox')
  const [mostrarKey, setMostrarKey] = useState(false)
  const [testandoConexao, setTestandoConexao] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<{ ok: boolean; mensagem: string } | null>(null)
  const [sincronizando, setSincronizando] = useState(false)
  const [modalCusto, setModalCusto] = useState(false)
  const [editandoCusto, setEditandoCusto] = useState<Custo | null>(null)

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: cfg }, { data: cus }] = await Promise.all([
      supabase.from('configuracoes').select('*').eq('user_id', user.id).single(),
      supabase.from('custos').select('*').eq('user_id', user.id).eq('recorrente', true).order('descricao'),
    ])

    if (cfg) {
      setConfig(cfg as Configuracao)
      setNomeAgencia(cfg.nome_agencia ?? '')
      setCnpj(cfg.documento_cnpj ?? '')
      setPercentualImposto(String(cfg.percentual_imposto ?? '6.00'))
      setAmbiente(cfg.asaas_ambiente ?? 'sandbox')
    }
    setCustosRecorrentes((cus as Custo[]) ?? [])
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
    })
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
    })
    if (error) { toast.error('Erro ao salvar'); return }
    toast.success('Configuração fiscal salva!')
  }

  async function testarConexao() {
    setTestandoConexao(true)
    setResultadoTeste(null)
    const res = await fetch('/api/asaas/test')
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

    const { error } = await supabase.from('configuracoes').upsert(payload)
    if (error) { toast.error('Erro ao salvar'); return }
    toast.success('Configurações do Asaas salvas!')
    setAsaasKey('')
  }

  async function toggleAtivoCusto(id: string, ativo: boolean) {
    const supabase = createClient()
    await supabase.from('custos').update({ ativo }).eq('id', id)
    carregarDados()
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

          {config.ultima_sincronizacao && (
            <p className="text-xs text-zinc-500">
              Última sincronização: {formatDate(config.ultima_sincronizacao)}
            </p>
          )}
          {!config.ultima_sincronizacao && (
            <p className="text-xs text-zinc-500">Nunca sincronizado</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Custos Recorrentes */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Custos Recorrentes</CardTitle>
            <CardDescription>Custos que se repetem todo mês.</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => { setEditandoCusto(null); setModalCusto(true) }}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            + Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {custosRecorrentes.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhum custo recorrente cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {custosRecorrentes.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.descricao}</span>
                      <Badge className={`${CATEGORIAS[c.categoria].corBadge} border-0 text-xs`}>
                        {CATEGORIAS[c.categoria].label}
                      </Badge>
                    </div>
                    <span className="text-xs text-zinc-500">R$ {Number(c.valor).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Switch
                    checked={c.ativo}
                    onCheckedChange={(v) => toggleAtivoCusto(c.id, v)}
                    aria-label={`${c.ativo ? 'Desativar' : 'Ativar'} custo recorrente`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FormCusto
        aberto={modalCusto}
        onFechar={() => { setModalCusto(false); setEditandoCusto(null) }}
        onSalvo={carregarDados}
        custo={editandoCusto}
        forcarRecorrente
      />
    </div>
  )
}
