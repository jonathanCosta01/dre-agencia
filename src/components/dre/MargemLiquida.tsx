import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

function badgeMargem(percentual: number) {
  if (percentual > 50) {
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-0 text-xs">
        Ótima
      </Badge>
    )
  }
  if (percentual >= 30) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
        Média
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-0 text-xs">
      Baixa
    </Badge>
  )
}

export function MargemLiquida({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Margem Líquida"
      valor={dre.margemLiquida}
      percentual={dre.percentualMargemLiquida}
      icon={CheckCircle2}
      corProgress="[&>div]:bg-green-500"
      badge={badgeMargem(dre.percentualMargemLiquida)}
    />
  )
}
