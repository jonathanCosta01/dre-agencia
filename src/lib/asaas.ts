const BASE_URL = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  producao: 'https://api.asaas.com/v3',
}

export interface AsaasPayment {
  id: string
  customer: string
  customerName?: string
  description?: string
  value: number
  paymentDate: string
  status: string
}

export interface AsaasResponse<T> {
  data: T[]
  totalCount: number
  hasMore: boolean
}

export async function listarPagamentosAsaas(
  apiKey: string,
  ambiente: 'sandbox' | 'producao',
  dataInicio: string,
  dataFim: string
): Promise<AsaasResponse<AsaasPayment>> {
  const base = BASE_URL[ambiente]
  const params = new URLSearchParams({
    status: 'RECEIVED',
    'paymentDate[ge]': dataInicio,
    'paymentDate[le]': dataFim,
    limit: '100',
  })

  const res = await fetch(`${base}/payments?${params}`, {
    headers: { access_token: apiKey },
    cache: 'no-store',
  })

  if (!res.ok) {
    const corpo = await res.text()
    throw new Error(`Asaas retornou ${res.status}: ${corpo}`)
  }

  return res.json()
}

export async function testarConexaoAsaas(
  apiKey: string,
  ambiente: 'sandbox' | 'producao'
): Promise<{ ok: boolean; mensagem: string }> {
  try {
    const base = BASE_URL[ambiente]
    const res = await fetch(`${base}/myAccount`, {
      headers: { access_token: apiKey },
      cache: 'no-store',
    })
    if (res.ok) {
      return { ok: true, mensagem: 'Conexão estabelecida com sucesso!' }
    }
    return { ok: false, mensagem: `Erro de autenticação (${res.status})` }
  } catch {
    return { ok: false, mensagem: 'Não foi possível conectar ao Asaas' }
  }
}
