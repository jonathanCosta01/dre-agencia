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
      corIcone="text-purple-500"
      corFundo="bg-purple-50"
      corGrafico="#A855F7"
    />
  )
}
