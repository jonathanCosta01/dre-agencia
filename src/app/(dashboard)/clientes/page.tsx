'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { EstadoVazio } from '@/components/shared/EstadoVazio'
import { formatBRL } from '@/lib/formatters'
import { toast } from 'sonner'
import type { Cliente } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schemaCliente = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  documento: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  asaas_customer_id: z.string().optional(),
})

type FormCliente = z.infer<typeof schemaCliente>

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [totalPorCliente, setTotalPorCliente] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [salvando, setSalvando] = useState(false)

  const form = useForm<FormCliente>({
    resolver: zodResolver(schemaCliente),
    defaultValues: { nome: '', documento: '', email: '', telefone: '', asaas_customer_id: '' },
  })

  const buscarClientes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: cli } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome')

    const { data: rec } = await supabase
      .from('receitas')
      .select('cliente_id, valor')
      .eq('user_id', user.id)

    setClientes((cli as Cliente[]) ?? [])

    const totais: Record<string, number> = {}
    rec?.forEach((r) => {
      if (r.cliente_id) {
        totais[r.cliente_id] = (totais[r.cliente_id] ?? 0) + Number(r.valor)
      }
    })
    setTotalPorCliente(totais)
  }, [])

  useEffect(() => { buscarClientes() }, [buscarClientes])

  function abrirNovo() {
    setEditando(null)
    form.reset({ nome: '', documento: '', email: '', telefone: '', asaas_customer_id: '' })
    setModalAberto(true)
  }

  function abrirEdicao(c: Cliente) {
    setEditando(c)
    form.reset({
      nome: c.nome,
      documento: c.documento ?? '',
      email: c.email ?? '',
      telefone: c.telefone ?? '',
      asaas_customer_id: c.asaas_customer_id ?? '',
    })
    setModalAberto(true)
  }

  async function salvar(dados: FormCliente) {
    setSalvando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { ...dados, user_id: user.id }

    if (editando) {
      const { error } = await supabase.from('clientes').update(payload).eq('id', editando.id)
      if (error) { toast.error('Erro ao salvar cliente'); setSalvando(false); return }
      toast.success('Cliente atualizado!')
    } else {
      const { error } = await supabase.from('clientes').insert(payload)
      if (error) { toast.error('Erro ao salvar cliente'); setSalvando(false); return }
      toast.success('Cliente adicionado!')
    }

    setModalAberto(false)
    buscarClientes()
    setSalvando(false)
  }

  async function inativar(id: string, ativo: boolean) {
    const supabase = createClient()
    await supabase.from('clientes').update({ ativo: !ativo }).eq('id', id)
    buscarClientes()
    toast.success(ativo ? 'Cliente inativado' : 'Cliente reativado')
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  const cores = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Clientes</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gerencie seus clientes e veja o faturamento por cliente.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 focus-visible:ring-orange-500"
          />
        </div>
        <Button onClick={abrirNovo} className="bg-orange-500 text-white hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {clientesFiltrados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum cliente cadastrado"
          descricao="Adicione clientes para vincular às suas receitas."
          labelBotao="Novo Cliente"
          onAcao={abrirNovo}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clientesFiltrados.map((c, i) => (
            <Card key={c.id} className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white font-bold ${cores[i % cores.length]}`}>
                    {c.nome[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-50">{c.nome}</h3>
                      <Badge className={c.ativo ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-zinc-100 text-zinc-500 border-0 text-xs'}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {c.email && <p className="truncate text-xs text-zinc-500">{c.email}</p>}
                    {c.telefone && <p className="text-xs text-zinc-500">{c.telefone}</p>}
                    {c.documento && <p className="text-xs text-zinc-500">{c.documento}</p>}
                    <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatBRL(totalPorCliente[c.id] ?? 0)}
                    </p>
                    <p className="text-xs text-zinc-400">total recebido</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrirEdicao(c)} className="flex-1 text-xs">
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inativar(c.id, c.ativo)}
                    className="flex-1 text-xs"
                    aria-label={c.ativo ? 'Inativar cliente' : 'Reativar cliente'}
                  >
                    <UserX className="mr-1 h-3 w-3" />
                    {c.ativo ? 'Inativar' : 'Reativar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent aria-labelledby="dialog-cliente-titulo" aria-describedby="dialog-cliente-desc">
          <DialogHeader>
            <DialogTitle id="dialog-cliente-titulo">
              {editando ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <p id="dialog-cliente-desc" className="text-sm text-zinc-500">
              {editando ? 'Atualize os dados do cliente.' : 'Preencha os dados do novo cliente.'}
            </p>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(salvar)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl><Input placeholder="Nome do cliente" {...field} className="focus-visible:ring-orange-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="documento" render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ/CPF</FormLabel>
                  <FormControl><Input placeholder="00.000.000/0000-00" {...field} className="focus-visible:ring-orange-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input type="email" placeholder="cliente@email.com" {...field} className="focus-visible:ring-orange-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="telefone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl><Input placeholder="(11) 99999-9999" {...field} className="focus-visible:ring-orange-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="asaas_customer_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID no Asaas</FormLabel>
                  <FormControl><Input placeholder="cus_xxxxxxxxxxxxxxxx" {...field} className="focus-visible:ring-orange-500" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando} className="bg-orange-500 text-white hover:bg-orange-600">
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
