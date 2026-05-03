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
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { mascararMoeda } from '@/lib/formatters'
import { CATEGORIAS } from '@/types'
import { toast } from 'sonner'
import type { Custo, CategoriaCusto } from '@/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  descricao: z.string().min(3, 'Mínimo 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  categoria: z.enum(['imposto', 'fixo', 'variavel', 'marketing'] as const),
  data_competencia: z.date(),
  recorrente: z.boolean(),
  observacao: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface FormCustoProps {
  aberto: boolean
  onFechar: () => void
  onSalvo: () => void
  custo?: Custo | null
  forcarRecorrente?: boolean
}

export function FormCusto({ aberto, onFechar, onSalvo, custo, forcarRecorrente = false }: FormCustoProps) {
  const [valorDisplay, setValorDisplay] = React.useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: '',
      valor: undefined,
      categoria: 'fixo',
      data_competencia: undefined,
      recorrente: forcarRecorrente,
      observacao: '',
    },
  })

  useEffect(() => {
    if (custo) {
      form.reset({
        descricao: custo.descricao,
        valor: Number(custo.valor),
        categoria: custo.categoria,
        data_competencia: new Date(custo.data_competencia + 'T00:00:00'),
        recorrente: custo.recorrente,
        observacao: custo.observacao ?? '',
      })
      setValorDisplay(Number(custo.valor).toFixed(2).replace('.', ','))
    } else {
      form.reset({
        descricao: '',
        valor: undefined,
        categoria: 'fixo',
        data_competencia: undefined,
        recorrente: forcarRecorrente,
        observacao: '',
      })
      setValorDisplay('')
    }
  }, [custo, aberto, forcarRecorrente])

  async function onSubmit(dados: FormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      descricao: dados.descricao,
      valor: dados.valor,
      categoria: dados.categoria,
      data_competencia: format(dados.data_competencia, 'yyyy-MM-dd'),
      recorrente: dados.recorrente,
      observacao: dados.observacao || null,
      ativo: true,
    }

    if (custo) {
      const { error } = await supabase.from('custos').update(payload).eq('id', custo.id)
      if (error) { toast.error('Erro ao salvar custo'); return }
      toast.success('Custo atualizado!')
    } else {
      const { error } = await supabase.from('custos').insert(payload)
      if (error) { toast.error('Erro ao salvar custo'); return }
      toast.success('Custo adicionado com sucesso!')
    }

    onSalvo()
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent aria-labelledby="form-custo-titulo" aria-describedby="form-custo-desc">
        <DialogHeader>
          <DialogTitle id="form-custo-titulo">{custo ? 'Editar Custo' : 'Novo Custo'}</DialogTitle>
          <p id="form-custo-desc" className="text-sm text-zinc-500">
            {custo ? 'Atualize os dados do custo.' : 'Adicione um novo custo ao DRE.'}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ferramentas SaaS" {...field} className="focus-visible:ring-orange-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
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

              <FormField control={form.control} name="categoria" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="focus:ring-orange-500">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(CATEGORIAS) as CategoriaCusto[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>{CATEGORIAS[cat].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="data_competencia" render={({ field }) => (
              <FormItem>
                <FormLabel>Mês de competência *</FormLabel>
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
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="recorrente" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={forcarRecorrente}
                    aria-label="Custo recorrente"
                  />
                </FormControl>
                <FormLabel className="!mt-0">Custo recorrente</FormLabel>
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
