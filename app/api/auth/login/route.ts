import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { login, senha } = await request.json()

    if (!login || !senha) {
      return NextResponse.json(
        { error: 'Login e senha sao obrigatorios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('login', login)
      .limit(1)

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Login ou senha incorretos' },
        { status: 401 }
      )
    }

    const user = users[0]
    // Support both column names: `senha_hash` (migrations) or `senha` (legacy)
    const hash = user.senha_hash ?? user.senha
    if (!hash) {
      return NextResponse.json(
        { error: 'Senha nao encontrada para o usuario' },
        { status: 500 }
      )
    }

    const isValid = await bcrypt.compare(senha, hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Login ou senha incorretos' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify({ userId: user.id, login: user.login }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
