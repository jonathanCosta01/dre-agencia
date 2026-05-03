import type { Receita, Custo, DREResult, FaturamentoPorCliente } from '@/types'

const CORES_CLIENTES = [
  '#F97316', '#FB923C', '#FDBA74',
  '#0EA5E9', '#38BDF8', '#7DD3FC',
  '#10B981', '#34D399', '#6EE7B7',
  '#8B5CF6', '#A78BFA', '#C4B5FD',
]

function calcularPorCliente(
  receitas: Receita[],
  faturamentoBruto: number
): FaturamentoPorCliente[] {
  const mapa = new Map<string, { nome: string; valor: number }>()

  receitas.forEach((r) => {
    const chave = r.cliente_id ?? 'sem-cliente'
    const nome = r.cliente?.nome ?? 'Sem cliente vinculado'
    const atual = mapa.get(chave) ?? { nome, valor: 0 }
    mapa.set(chave, { nome, valor: atual.valor + Number(r.valor) })
  })

  return Array.from(mapa.entries())
    .map(([clienteId, { nome, valor }], i) => ({
      clienteId,
      nome,
      valor,
      percentual: faturamentoBruto > 0 ? (valor / faturamentoBruto) * 100 : 0,
      cor: CORES_CLIENTES[i % CORES_CLIENTES.length],
    }))
    .sort((a, b) => b.valor - a.valor)
}

export function calcularDRE(
  receitas: Receita[],
  custos: Custo[],
  periodo: { inicio: string; fim: string }
): DREResult {
  const faturamentoBruto = receitas.reduce((s, r) => s + Number(r.valor), 0)

  const somarCategoria = (cat: string) =>
    custos
      .filter((c) => c.categoria === cat && c.ativo)
      .reduce((s, c) => s + Number(c.valor), 0)

  const totalImpostos        = somarCategoria('imposto')
  const totalCustoFixo       = somarCategoria('fixo')
  const totalDespesaVariavel = somarCategoria('variavel')
  const totalMarketing       = somarCategoria('marketing')
  const totalCustos          = totalImpostos + totalCustoFixo + totalDespesaVariavel + totalMarketing
  const margemLiquida        = faturamentoBruto - totalCustos

  const pct = (v: number) => faturamentoBruto > 0 ? (v / faturamentoBruto) * 100 : 0

  const clientesUnicos = new Set(
    receitas.filter((r) => r.cliente_id).map((r) => r.cliente_id)
  )

  return {
    periodo,
    faturamentoBruto,
    totalImpostos,
    percentualImposto: pct(totalImpostos),
    totalCustoFixo,
    percentualCustoFixo: pct(totalCustoFixo),
    totalDespesaVariavel,
    percentualDespesaVariavel: pct(totalDespesaVariavel),
    totalMarketing,
    percentualMarketing: pct(totalMarketing),
    margemLiquida,
    percentualMargemLiquida: pct(margemLiquida),
    faturamentoPorCliente: calcularPorCliente(receitas, faturamentoBruto),
    totalReceitas: receitas.length,
    totalCustos,
    quantidadeClientes: clientesUnicos.size,
  }
}

export function gerarSerieHistorica(
  receitas: Receita[],
  modo: 'diario' | 'mensal' | 'anual'
): { periodo: string; valor: number; label: string }[] {
  const agrupado = new Map<string, number>()

  receitas.forEach((r) => {
    const data = new Date(r.data_pagamento + 'T00:00:00')
    let chave = ''

    if (modo === 'diario') {
      chave = r.data_pagamento
    } else if (modo === 'mensal') {
      chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    } else {
      chave = String(data.getFullYear())
    }

    agrupado.set(chave, (agrupado.get(chave) ?? 0) + Number(r.valor))
  })

  return Array.from(agrupado.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, valor]) => ({
      periodo,
      valor,
      label: modo === 'diario'
        ? new Date(periodo + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : modo === 'mensal'
        ? new Date(periodo + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        : periodo,
    }))
}
