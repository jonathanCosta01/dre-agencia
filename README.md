# DRE Agência

Sistema de DRE financeiro para gestores de tráfego pago.

## Stack

- Next.js 16 + TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS v4 + shadcn/ui
- Recharts
- Integração Asaas

## Configuração Local

1. Clone o repositório:
   ```
   git clone https://github.com/SEU_USUARIO/dre-agencia.git
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```
   cp .env.example .env.local
   ```
   Preencha os valores no `.env.local`

4. Execute o projeto:
   ```
   npm run dev
   ```

5. Acesse http://localhost:3000

## Variáveis de Ambiente

Veja `.env.example` para a lista completa.
As variáveis de produção devem ser configuradas no painel da Vercel.

## Banco de Dados

Execute as migrations em `supabase/migrations/` no painel SQL do Supabase.

## Deploy

O projeto é implantado automaticamente na Vercel a cada push para a branch main via GitHub Actions.
