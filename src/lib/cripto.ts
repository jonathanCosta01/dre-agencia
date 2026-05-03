const ALGORITHM = 'AES-GCM'

async function derivarChave(): Promise<CryptoKey> {
  const rawKey = Buffer.from(process.env.ASAAS_ENCRYPTION_KEY!, 'base64')
  return crypto.subtle.importKey('raw', rawKey, { name: ALGORITHM }, false, ['encrypt', 'decrypt'])
}

export async function criptografar(texto: string): Promise<string> {
  const chave = await derivarChave()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(texto)
  const cifrado = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, chave, encoded)
  const resultado = new Uint8Array(iv.byteLength + cifrado.byteLength)
  resultado.set(iv, 0)
  resultado.set(new Uint8Array(cifrado), iv.byteLength)
  return Buffer.from(resultado).toString('base64')
}

export async function decriptografar(textoBase64: string): Promise<string> {
  const chave = await derivarChave()
  const dados = Buffer.from(textoBase64, 'base64')
  const iv = dados.slice(0, 12)
  const cifrado = dados.slice(12)
  const decifrado = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, chave, cifrado)
  return new TextDecoder().decode(decifrado)
}
