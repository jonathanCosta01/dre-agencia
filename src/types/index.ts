export type Origem = 'manual' | 'asaas'
export type CategoriaCusto = 'imposto' | 'fixo' | 'variavel' | 'marketing'
export type AmbienteAsaas = 'sandbox' | 'producao'
export type ModoPeriodo = 'hoje' | 'semana' | 'mes' | 'mes_anterior' | 'ano' | 'personalizado'

export interface Cliente {
  id: string
  user_id: string
  nome: string
  documento?: string
  email?: string
  telefone?: string
  asaas_customer_id?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Receita {
  id: string
  user_id: string
  cliente_id?: string
  cliente?: Cliente
  descricao: string
  valor: number
  data_pagamento: string
  origem: Origem
  asaas_payment_id?: string
  observacao?: string
  created_at: string
  updated_at: string
}

export interface Custo {
  id: string
  user_id: string
  descricao: string
  valor: number
  categoria: CategoriaCusto
  data_competencia: string
  recorrente: boolean
  ativo: boolean
  observacao?: string
  created_at: string
  updated_at: string
}

export interface Configuracao {
  id: string
  user_id: string
  nome_agencia: string
  documento_cnpj?: string
  percentual_imposto: number
  asaas_api_key_enc?: string
  asaas_ambiente: AmbienteAsaas
  ultima_sincronizacao?: string
}

export interface FiltroPeriodo {
  modo: ModoPeriodo
  dataInicio: Date
  dataFim: Date
}

export interface FaturamentoPorCliente {
  clienteId: string
  nome: string
  valor: number
  percentual: number
  cor: string
}

export interface DREResult {
  periodo: { inicio: string; fim: string }
  faturamentoBruto: number
  totalImpostos: number
  percentualImposto: number
  totalCustoFixo: number
  percentualCustoFixo: number
  totalDespesaVariavel: number
  percentualDespesaVariavel: number
  totalMarketing: number
  percentualMarketing: number
  margemLiquida: number
  percentualMargemLiquida: number
  faturamentoPorCliente: FaturamentoPorCliente[]
  totalReceitas: number
  totalCustos: number
  quantidadeClientes: number
}

export interface SerieHistorica {
  periodo: string
  valor: number
  label: string
}

export interface CategoriaConfig {
  label: string
  cor: string
  corBadge: string
}

export const CATEGORIAS: Record<CategoriaCusto, CategoriaConfig> = {
  imposto:   { label: 'Imposto',                   cor: 'red',    corBadge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
  fixo:      { label: 'Custo Fixo Operacional',    cor: 'blue',   corBadge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  variavel:  { label: 'Despesa Variável',          cor: 'purple', corBadge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  marketing: { label: 'Investimento em Marketing', cor: 'yellow', corBadge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
}
