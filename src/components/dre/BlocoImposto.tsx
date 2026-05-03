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
      corProgress="[&>div]:bg-red-500"
    />
  )
}
