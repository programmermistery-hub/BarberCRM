-- Create usuarios table for authentication
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  login VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create agendamentos table for appointments
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  nome VARCHAR(200) NOT NULL,
  numero VARCHAR(30),
  servico VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(data, horario)
);

-- Create index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);

-- Insert default admin user (password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO usuarios (login, senha_hash)
VALUES ('admin', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9pP3Z1IK5E3N1Q6Z5Y3A4v3K3C')
ON CONFLICT (login) DO NOTHING;
