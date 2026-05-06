import { CheckCircle2 } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

function badgeMargem(percentual: number) {
  if (percentual > 50) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Ótima
      </span>
    )
  }
  if (percentual >= 30) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        Média
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Baixa
    </span>
  )
}

export function MargemLiquida({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Margem Líquida"
      valor={dre.margemLiquida}
      percentual={dre.percentualMargemLiquida}
      icon={CheckCircle2}
      corIcone="text-green-500"
      corFundo="bg-green-50"
      corGrafico="#22C55E"
      badge={badgeMargem(dre.percentualMargemLiquida)}
    />
  )
}
