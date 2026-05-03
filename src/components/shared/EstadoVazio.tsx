import { FileX2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EstadoVazioProps {
  titulo?: string
  descricao?: string
  labelBotao?: string
  onAcao?: () => void
}

export function EstadoVazio({
  titulo = 'Nenhum lançamento no período',
  descricao = 'Adicione receitas e custos para visualizar seu DRE.',
  labelBotao = 'Adicionar lançamento',
  onAcao,
}: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <FileX2 className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
      <div>
        <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">{titulo}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{descricao}</p>
      </div>
      {onAcao && (
        <Button
          onClick={onAcao}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          {labelBotao}
        </Button>
      )}
    </div>
  )
}
