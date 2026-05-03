import { TrendingUp } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

export function BlocoFaturamento({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Faturamento Bruto"
      valor={dre.faturamentoBruto}
      percentual={100}
      icon={TrendingUp}
      corProgress="[&>div]:bg-orange-500"
      destaque
    />
  )
}
