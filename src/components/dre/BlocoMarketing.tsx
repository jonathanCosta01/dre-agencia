import { Megaphone } from 'lucide-react'
import { BlocoDRE } from './BlocoDRE'
import type { DREResult } from '@/types'

export function BlocoMarketing({ dre }: { dre: DREResult }) {
  return (
    <BlocoDRE
      titulo="Investimento em Mídia"
      valor={dre.totalMarketing}
      percentual={dre.percentualMarketing}
      icon={Megaphone}
      corIcone="text-yellow-500"
      corFundo="bg-yellow-50"
      corGrafico="#FBBF24"
    />
  )
}
