import { Landmark } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

export function BlocoImposto({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Impostos"
      valor={dre.totalImpostos}
      percentual={dre.percentualImposto}
      icon={Landmark}
      corIcone="text-red-500"
      corFundo="bg-red-50"
      corGrafico="#FF4D6D"
    />
  )
}
