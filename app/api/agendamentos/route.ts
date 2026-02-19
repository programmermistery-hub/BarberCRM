import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')

    if (!data) {
      return NextResponse.json(
        { error: 'Data e obrigatoria' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select('id, data, horario, nome, numero, servico')
      .eq('data', data)
      .order('horario')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(agendamentos || [])
  } catch (error) {
    console.error('Error fetching agendamentos:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { data, horario, nome, numero, servico, cliente_id } = await request.json()

    if (!data || !horario || !nome || !servico) {
      return NextResponse.json(
        { error: 'Data, horario, nome e servico sao obrigatorios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check for existing appointment at same date/time
    const { data: existing } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', data)
      .eq('horario', horario)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Ja existe um agendamento neste horario' },
        { status: 409 }
      )
    }

    const cleanNome = nome.trim().toUpperCase().replace(/\s+/g, ' ')
    const cleanNumero = (numero || '').replace(/[^\d]/g, '')

    let resolvedClienteId = cliente_id || null

    // If no client selected, try to find or create
    if (!resolvedClienteId && cleanNumero) {
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('numero', cleanNumero)
        .limit(1)

      if (existingClient && existingClient.length > 0) {
        resolvedClienteId = existingClient[0].id
      } else {
        const { data: newClient } = await supabase
          .from('clientes')
          .insert({ nome_completo: cleanNome, numero: cleanNumero })
          .select('id')
          .single()

        if (newClient) {
          resolvedClienteId = newClient.id
        }
      }
    }

    const { data: result, error } = await supabase
      .from('agendamentos')
      .insert({
        data,
        horario,
        nome: cleanNome,
        numero: cleanNumero,
        servico,
        cliente_id: resolvedClienteId,
      })
      .select('id, data, horario, nome, numero, servico')
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: 'Erro ao criar agendamento' },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
