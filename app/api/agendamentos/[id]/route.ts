import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { nome, numero, servico } = await request.json()

    if (!nome || !servico) {
      return NextResponse.json(
        { error: 'Nome e servico sao obrigatorios' },
        { status: 400 }
      )
    }

    const cleanNome = nome.trim().toUpperCase().replace(/\s+/g, ' ')
    const cleanNumero = (numero || '').replace(/[^\d]/g, '')

    const supabase = await createClient()
    const { data: result, error } = await supabase
      .from('agendamentos')
      .update({
        nome: cleanNome,
        numero: cleanNumero,
        servico: servico.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select('id, data, horario, nome, numero, servico')
      .single()

    if (error || !result) {
      return NextResponse.json(
        { error: 'Agendamento nao encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json(
        { error: 'Agendamento nao encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir agendamento' },
      { status: 500 }
    )
  }
}
