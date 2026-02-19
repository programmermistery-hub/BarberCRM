import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Create usuarios table for authentication
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      login VARCHAR(100) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created usuarios table');

  // Create agendamentos table for appointments
  await sql`
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
    )
  `;
  console.log('Created agendamentos table');

  // Create index for fast date lookups
  await sql`CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data)`;
  console.log('Created index');

  // Insert default admin user (password: admin123)
  // bcrypt hash for 'admin123'
  await sql`
    INSERT INTO usuarios (login, senha_hash)
    VALUES ('admin', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9pP3Z1IK5E3N1Q6Z5Y3A4v3K3C')
    ON CONFLICT (login) DO NOTHING
  `;
  console.log('Inserted default admin user');

  console.log('Migration complete!');
}

migrate().catch(console.error);
