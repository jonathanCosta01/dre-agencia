import { Wrench } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

export function BlocoCustoFixo({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Custos Fixos"
      valor={dre.totalCustoFixo}
      percentual={dre.percentualCustoFixo}
      icon={Wrench}
      corProgress="[&>div]:bg-blue-500"
    />
  )
}
