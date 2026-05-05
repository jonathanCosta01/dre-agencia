'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { FiltroPeriodo, ModoPeriodo } from '@/types'
import { primeiroDiaMes, ultimoDiaMes, formatDateISO } from '@/lib/formatters'

interface SeletorPeriodoProps {
  filtro: FiltroPeriodo
  onChange: (filtro: FiltroPeriodo) => void
  compacto?: boolean
}

const hoje = new Date()

function calcularDatas(modo: ModoPeriodo): { dataInicio: Date; dataFim: Date } {
  const agora = new Date()
  switch (modo) {
    case 'hoje':
      return { dataInicio: agora, dataFim: agora }
    case 'semana': {
      const inicio = new Date(agora)
      inicio.setDate(agora.getDate() - agora.getDay())
      const fim = new Date(inicio)
      fim.setDate(inicio.getDate() + 6)
      return { dataInicio: inicio, dataFim: fim }
    }
    case 'mes':
      return { dataInicio: primeiroDiaMes(agora), dataFim: ultimoDiaMes(agora) }
    case 'mes_anterior': {
      const mesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
      return { dataInicio: primeiroDiaMes(mesAnterior), dataFim: ultimoDiaMes(mesAnterior) }
    }
    case 'ano':
      return {
        dataInicio: new Date(agora.getFullYear(), 0, 1),
        dataFim: new Date(agora.getFullYear(), 11, 31),
      }
    default:
      return { dataInicio: primeiroDiaMes(agora), dataFim: ultimoDiaMes(agora) }
  }
}

export function SeletorPeriodo({ filtro, onChange, compacto = false }: SeletorPeriodoProps) {
  const [aberto, setAberto] = useState(false)
  const [rangeTemp, setRangeTemp] = useState<{ from?: Date; to?: Date }>({
    from: filtro.dataInicio,
    to: filtro.dataFim,
  })

  function selecionar(modo: ModoPeriodo) {
    if (modo === 'personalizado') {
      setAberto(true)
      return
    }
    // fechar popover e desativar personalizado ao escolher outro período
    setAberto(false)
    const { dataInicio, dataFim } = calcularDatas(modo)
    onChange({ modo, dataInicio, dataFim })
  }

  function confirmarPersonalizado() {
    if (rangeTemp.from && rangeTemp.to) {
      onChange({ modo: 'personalizado', dataInicio: rangeTemp.from, dataFim: rangeTemp.to })
      setAberto(false)
    }
  }

  const modos: { label: string; valor: ModoPeriodo }[] = [
    { label: 'Hoje', valor: 'hoje' },
    { label: 'Esta semana', valor: 'semana' },
    { label: 'Este mês', valor: 'mes' },
    { label: 'Mês anterior', valor: 'mes_anterior' },
    { label: 'Este ano', valor: 'ano' },
  ]

  return (
    <div className={cn('flex flex-wrap items-center gap-2', compacto && 'gap-1')}>
      {modos.map((m) => (
        <Button
          key={m.valor}
          variant={filtro.modo === m.valor ? 'default' : 'outline'}
          size={compacto ? 'sm' : 'sm'}
          onClick={() => selecionar(m.valor)}
          className={cn(
            filtro.modo === m.valor && 'bg-orange-500 text-white hover:bg-orange-600'
          )}
        >
          {m.label}
        </Button>
      ))}

      <Popover open={aberto} onOpenChange={(v) => { if (!v) setAberto(false) }}>
        <PopoverTrigger
          className={cn(
            'inline-flex h-8 items-center justify-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            filtro.modo === 'personalizado'
              ? 'border-transparent bg-orange-500 text-white hover:bg-orange-600'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          {filtro.modo === 'personalizado'
            ? `${format(filtro.dataInicio, 'dd/MM')} – ${format(filtro.dataFim, 'dd/MM')}`
            : 'Personalizado'}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Calendar
            mode="range"
            selected={{ from: rangeTemp.from, to: rangeTemp.to }}
            onSelect={(range) => setRangeTemp({ from: range?.from, to: range?.to })}
            locale={ptBR}
            numberOfMonths={2}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAberto(false)
                // se cancelou sem ter aplicado, volta para 'mes' para não deixar personalizado ativo
                if (filtro.modo !== 'personalizado') return
                const { dataInicio, dataFim } = calcularDatas('mes')
                onChange({ modo: 'mes', dataInicio, dataFim })
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={confirmarPersonalizado}
              disabled={!rangeTemp.from || !rangeTemp.to}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
