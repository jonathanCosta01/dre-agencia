'use client'

import { Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { formatDate, formatBRL } from '@/lib/formatters'
import { CATEGORIAS } from '@/types'
import type { Receita, Custo } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TabelaReceitasProps {
  tipo: 'receita'
  receitas: Receita[]
  onEditar: (item: Receita) => void
  onExcluir: (id: string) => void
}

interface TabelaCustosProps {
  tipo: 'custo'
  custos: Custo[]
  onEditar: (item: Custo) => void
  onExcluir: (id: string) => void
  onToggleAtivo: (id: string, ativo: boolean) => void
}

type TabelaLancamentosProps = TabelaReceitasProps | TabelaCustosProps

export function TabelaLancamentos(props: TabelaLancamentosProps) {
  if (props.tipo === 'receita') {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <Table aria-label="Tabela de receitas">
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-900">
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.receitas.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm text-zinc-500">{formatDate(r.data_pagamento)}</TableCell>
                <TableCell className="text-sm">{r.cliente?.nome ?? '—'}</TableCell>
                <TableCell className="text-sm font-medium">{r.descricao}</TableCell>
                <TableCell className="text-right text-sm font-semibold text-green-600">{formatBRL(r.valor)}</TableCell>
                <TableCell>
                  <Badge className={r.origem === 'asaas' ? 'bg-blue-100 text-blue-700 border-0 text-xs' : 'bg-zinc-100 text-zinc-600 border-0 text-xs'}>
                    {r.origem === 'asaas' ? 'Asaas' : 'Manual'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => props.onEditar(r)} aria-label="Editar receita">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        aria-label="Excluir receita"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-500 hover:bg-accent hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A receita será removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => props.onExcluir(r.id)} className="bg-red-500 text-white hover:bg-red-600">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <Table aria-label="Tabela de custos">
        <TableHeader>
          <TableRow className="bg-zinc-50 dark:bg-zinc-900">
            <TableHead>Competência</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Recorrente</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.custos.map((c) => (
            <TableRow key={c.id} className={!c.ativo ? 'opacity-50' : ''}>
              <TableCell className="text-sm text-zinc-500">{formatDate(c.data_competencia)}</TableCell>
              <TableCell className="text-sm font-medium">{c.descricao}</TableCell>
              <TableCell>
                <Badge className={`${CATEGORIAS[c.categoria].corBadge} border-0 text-xs`}>
                  {CATEGORIAS[c.categoria].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm font-semibold text-red-600">{formatBRL(c.valor)}</TableCell>
              <TableCell className="text-sm text-zinc-500">{c.recorrente ? 'Sim' : 'Não'}</TableCell>
              <TableCell>
                <Switch
                  checked={c.ativo}
                  onCheckedChange={(v) => props.onToggleAtivo(c.id, v)}
                  aria-label={`${c.ativo ? 'Desativar' : 'Ativar'} custo`}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => props.onEditar(c)} aria-label="Editar custo">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      aria-label="Excluir custo"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-500 hover:bg-accent hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir custo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O custo será removido permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => props.onExcluir(c.id)} className="bg-red-500 text-white hover:bg-red-600">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
