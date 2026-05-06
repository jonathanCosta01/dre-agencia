import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const nomeUsuario = user.user_metadata?.nome ?? user.email?.split('@')[0] ?? 'Usuário'
  const emailUsuario = user.email ?? ''

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
        <Sidebar nomeUsuario={nomeUsuario} emailUsuario={emailUsuario} />
      </div>

      {/* Mobile Header */}
      <Header nomeUsuario={nomeUsuario} emailUsuario={emailUsuario} />

      {/* Conteúdo principal */}
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
