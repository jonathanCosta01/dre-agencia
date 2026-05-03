'use client'

import { usePathname } from 'next/navigation'
import { Menu, BarChart3, LayoutDashboard, ArrowUpDown, Users, Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { Sidebar } from './Sidebar'

const titulos: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/lancamentos': 'Lançamentos',
  '/clientes': 'Clientes',
  '/configuracoes': 'Configurações',
}

interface HeaderProps {
  nomeUsuario?: string
  emailUsuario?: string
}

export function Header({ nomeUsuario, emailUsuario }: HeaderProps) {
  const pathname = usePathname()
  const titulo = titulos[pathname] ?? 'DRE Agência'

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-accent dark:text-zinc-300"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <Sidebar nomeUsuario={nomeUsuario} emailUsuario={emailUsuario} />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{titulo}</span>
      </div>
      <ThemeToggle />
    </header>
  )
}
