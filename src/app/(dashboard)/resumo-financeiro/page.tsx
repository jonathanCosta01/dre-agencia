import { FileBarChart } from 'lucide-react'

export default function ResumoFinanceiroPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
        <FileBarChart className="h-8 w-8 text-[#FF6B00]" />
      </div>
      <h1 className="text-xl font-bold text-[#111827]">Resumo Financeiro</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Em breve: visão consolidada do DRE mensal e anual da agência.</p>
    </div>
  )
}
