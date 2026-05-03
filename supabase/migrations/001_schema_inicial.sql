-- ============================================================
-- SCHEMA: DRE Agencia
-- ============================================================

-- CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome              TEXT NOT NULL,
  documento         TEXT,
  email             TEXT,
  telefone          TEXT,
  asaas_customer_id TEXT,
  ativo             BOOLEAN DEFAULT true NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RECEITAS
CREATE TABLE IF NOT EXISTS public.receitas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id        UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  descricao         TEXT NOT NULL,
  valor             NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  data_pagamento    DATE NOT NULL,
  origem            TEXT DEFAULT 'manual' CHECK (origem IN ('manual','asaas')) NOT NULL,
  asaas_payment_id  TEXT UNIQUE,
  observacao        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CUSTOS
CREATE TABLE IF NOT EXISTS public.custos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descricao        TEXT NOT NULL,
  valor            NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  categoria        TEXT NOT NULL CHECK (categoria IN ('imposto','fixo','variavel','marketing')),
  data_competencia DATE NOT NULL,
  recorrente       BOOLEAN DEFAULT false NOT NULL,
  ativo            BOOLEAN DEFAULT true NOT NULL,
  observacao       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CONFIGURACOES
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome_agencia          TEXT DEFAULT 'Minha Agencia',
  documento_cnpj        TEXT,
  percentual_imposto    NUMERIC(5,2) DEFAULT 6.00 NOT NULL,
  asaas_api_key_enc     TEXT,
  asaas_ambiente        TEXT DEFAULT 'sandbox' CHECK (asaas_ambiente IN ('sandbox','producao')),
  ultima_sincronizacao  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDICES
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON public.receitas(user_id, data_pagamento);
CREATE INDEX IF NOT EXISTS idx_receitas_cliente ON public.receitas(user_id, cliente_id);
CREATE INDEX IF NOT EXISTS idx_custos_user_id ON public.custos(user_id);
CREATE INDEX IF NOT EXISTS idx_custos_data ON public.custos(user_id, data_competencia);
CREATE INDEX IF NOT EXISTS idx_custos_categoria ON public.custos(user_id, categoria);

-- RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_user_policy" ON public.clientes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "receitas_user_policy" ON public.receitas
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custos_user_policy" ON public.custos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "configuracoes_user_policy" ON public.configuracoes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_receitas_updated_at
  BEFORE UPDATE ON public.receitas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_custos_updated_at
  BEFORE UPDATE ON public.custos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
