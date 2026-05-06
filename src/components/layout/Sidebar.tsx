'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  LayoutDashboard,
  ArrowUpDown,
  Users,
  Settings,
  LogOut,
  FileBarChart,
  BarChart2,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resumo-financeiro', label: 'Resumo Financeiro', icon: FileBarChart },
  { href: '/lancamentos', label: 'Lançamentos', icon: ArrowUpDown },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  nomeUsuario?: string
  emailUsuario?: string
}

function Avatar({ nome }: { nome: string }) {
  const iniciais = nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#EA580C] text-xs font-bold text-white shadow-sm">
      {iniciais}
    </div>
  )
}

export function Sidebar({ nomeUsuario = 'Usuário', emailUsuario }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Você saiu com sucesso')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[#F3F4F6] bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[#F3F4F6] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#EA580C] shadow-sm">
          <BarChart3 className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <span className="text-[15px] font-bold text-[#111827]">DRE Agência</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-0.5 p-3 pt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                ativo
                  ? 'bg-orange-50 text-[#FF6B00]'
                  : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]'
              )}
            >
              <Icon
                className={cn('flex-shrink-0', ativo ? 'text-[#FF6B00]' : 'text-[#9CA3AF]')}
                style={{ width: 16, height: 16 }}
              />
              {item.label}
              {ativo && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-[#F3F4F6] p-3">
        <div className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar nome={nomeUsuario} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#111827]">{nomeUsuario}</p>
            <p className="truncate text-[11px] text-[#9CA3AF]">{emailUsuario}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sair da conta"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut style={{ width: 15, height: 15 }} className="flex-shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
