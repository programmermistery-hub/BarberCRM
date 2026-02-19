import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Create clientes table
  await sql`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nome_completo VARCHAR(200) NOT NULL,
      numero VARCHAR(30) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('Created clientes table');

  // Add cliente_id column to agendamentos if not exists
  await sql`
    ALTER TABLE agendamentos
    ADD COLUMN IF NOT EXISTS cliente_id INTEGER REFERENCES clientes(id)
  `;
  console.log('Added cliente_id to agendamentos');

  // Create index for fast name search
  await sql`CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(LOWER(nome_completo))`;
  console.log('Created clientes name index');

  console.log('Migration complete!');
}

migrate().catch(console.error);
