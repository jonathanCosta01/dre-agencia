'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Algo deu errado
      </h2>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {error.message || 'Erro desconhecido'}
      </p>
      {error.digest && (
        <p className="text-xs text-zinc-400">Código: {error.digest}</p>
      )}
      <Button onClick={reset} className="bg-orange-500 text-white hover:bg-orange-600">
        Tentar novamente
      </Button>
    </div>
  )
}
