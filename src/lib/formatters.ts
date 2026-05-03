export function formatBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatBRLCompacto(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(valor) >= 1_000) {
    return `R$ ${(valor / 1_000).toFixed(1)}k`
  }
  return formatBRL(valor)
}

export function formatPercent(valor: number, casas = 1): string {
  return `${valor.toFixed(casas)}%`
}

export function formatDate(data: string | Date): string {
  const d = typeof data === 'string'
    ? (data.includes('T') ? new Date(data) : new Date(data + 'T00:00:00'))
    : data
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateISO(data: Date): string {
  return data.toISOString().split('T')[0]
}

export function nomeMes(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(data)
}

export function primeiroDiaMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1)
}

export function ultimoDiaMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0)
}

export function mascararMoeda(valor: string): string {
  const nums = valor.replace(/\D/g, '')
  const numero = Number(nums) / 100
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
