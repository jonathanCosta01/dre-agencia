import { Target } from 'lucide-react'

export default function MetasPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
        <Target className="h-8 w-8 text-[#FF6B00]" />
      </div>
      <h1 className="text-xl font-bold text-[#111827]">Metas Financeiras</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Em breve: defina e acompanhe suas metas de faturamento e margem.</p>
    </div>
  )
}
