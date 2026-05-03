'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, LayoutDashboard, ArrowUpDown, Users, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: ArrowUpDown },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  nomeUsuario?: string
  emailUsuario?: string
}

export function Sidebar({ nomeUsuario, emailUsuario }: SidebarProps) {
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
    <aside className="flex h-full w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <BarChart3 className="h-6 w-6 text-orange-500" />
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">DRE Agência</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                ativo
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {nomeUsuario ?? 'Usuário'}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{emailUsuario}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          aria-label="Sair da conta"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
