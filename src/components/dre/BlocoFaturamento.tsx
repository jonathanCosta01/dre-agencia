import { TrendingUp } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

export function BlocoFaturamento({ dre, sparkline }: { dre: DREResult; sparkline?: { valor: number }[] }) {
  return (
    <BlocoDRE
      titulo="Faturamento Bruto"
      valor={dre.faturamentoBruto}
      percentual={100}
      icon={TrendingUp}
      corIcone="text-[#FF6B00]"
      corFundo="bg-orange-50"
      corGrafico="#FF6B00"
      destaque
      sparkline={sparkline}
    />
  )
}
