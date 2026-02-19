-- Create usuarios table
CREATE TABLE IF NOT EXISTS public.usuarios (
  id SERIAL PRIMARY KEY,
  login TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clientes table
CREATE TABLE IF NOT EXISTS public.clientes (
  id SERIAL PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  numero TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agendamentos table
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  nome TEXT NOT NULL,
  numero TEXT DEFAULT '',
  servico TEXT NOT NULL,
  cliente_id INTEGER REFERENCES public.clientes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data, horario)
);

-- Disable RLS for all tables (admin-only app with custom auth)
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos DISABLE ROW LEVEL SECURITY;
