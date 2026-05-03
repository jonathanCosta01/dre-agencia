'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'
import { mascararMoeda } from '@/lib/formatters'
import { toast } from 'sonner'
import type { Receita, Cliente } from '@/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  cliente_id: z.string().optional(),
  descricao: z.string().min(3, 'Mínimo 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  data_pagamento: z.date(),
  observacao: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface FormReceitaProps {
  aberto: boolean
  onFechar: () => void
  onSalvo: () => void
  clientes: Cliente[]
  receita?: Receita | null
}

export function FormReceita({ aberto, onFechar, onSalvo, clientes, receita }: FormReceitaProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_id: '',
      descricao: '',
      valor: undefined,
      data_pagamento: undefined,
      observacao: '',
    },
  })

  const [valorDisplay, setValorDisplay] = React.useState('')

  useEffect(() => {
    if (receita) {
      form.reset({
        cliente_id: receita.cliente_id ?? '',
        descricao: receita.descricao,
        valor: Number(receita.valor),
        data_pagamento: new Date(receita.data_pagamento + 'T00:00:00'),
        observacao: receita.observacao ?? '',
      })
      setValorDisplay(Number(receita.valor).toFixed(2).replace('.', ','))
    } else {
      form.reset({ cliente_id: '', descricao: '', valor: undefined, data_pagamento: undefined, observacao: '' })
      setValorDisplay('')
    }
  }, [receita, aberto])

  async function onSubmit(dados: FormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      cliente_id: dados.cliente_id || null,
      descricao: dados.descricao,
      valor: dados.valor,
      data_pagamento: format(dados.data_pagamento, 'yyyy-MM-dd'),
      observacao: dados.observacao || null,
      origem: 'manual' as const,
    }

    if (receita) {
      const { error } = await supabase.from('receitas').update(payload).eq('id', receita.id)
      if (error) { toast.error('Erro ao salvar receita'); return }
      toast.success('Receita atualizada!')
    } else {
      const { error } = await supabase.from('receitas').insert(payload)
      if (error) { toast.error('Erro ao salvar receita'); return }
      toast.success('Receita adicionada com sucesso!')
    }

    onSalvo()
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent aria-labelledby="form-receita-titulo" aria-describedby="form-receita-desc">
        <DialogHeader>
          <DialogTitle id="form-receita-titulo">{receita ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
          <p id="form-receita-desc" className="text-sm text-zinc-500">
            {receita ? 'Atualize os dados da receita.' : 'Adicione uma nova receita ao DRE.'}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="cliente_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-orange-500">
                      <SelectValue placeholder="Selecionar cliente (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhum cliente</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Gestão de tráfego — Janeiro" {...field} className="focus-visible:ring-orange-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="valor" render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$) *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0,00"
                    value={valorDisplay}
                    onChange={(e) => {
                      const mascarado = mascararMoeda(e.target.value)
                      setValorDisplay(mascarado)
                      const numero = parseFloat(mascarado.replace(/\./g, '').replace(',', '.'))
                      field.onChange(isNaN(numero) ? undefined : numero)
                    }}
                    className="focus-visible:ring-orange-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="data_pagamento" render={({ field }) => (
              <FormItem>
                <FormLabel>Data de recebimento *</FormLabel>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      'flex h-9 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecionar data'}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="observacao" render={({ field }) => (
              <FormItem>
                <FormLabel>Observação</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} className="focus-visible:ring-orange-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onFechar}>Cancelar</Button>
              <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
