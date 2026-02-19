import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  // Hash the password properly with bcrypt
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  // Delete old admin and insert fresh one with proper hash
  await sql`DELETE FROM usuarios WHERE login = 'admin'`;
  await sql`INSERT INTO usuarios (login, senha_hash) VALUES ('admin', ${hash})`;
  
  console.log('Admin user seeded successfully');
  console.log('Login: admin');
  console.log('Senha: admin123');
}

seed().catch(console.error);
