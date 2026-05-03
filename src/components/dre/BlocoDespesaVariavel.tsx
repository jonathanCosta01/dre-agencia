import { BookOpen } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

export function BlocoDespesaVariavel({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Despesas Variáveis"
      valor={dre.totalDespesaVariavel}
      percentual={dre.percentualDespesaVariavel}
      icon={BookOpen}
      corProgress="[&>div]:bg-purple-500"
    />
  )
}
