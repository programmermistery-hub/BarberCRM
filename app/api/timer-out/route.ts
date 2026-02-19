import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    const supabase = await createClient()

    // Supabase doesn't support GROUP BY natively via the query builder,
    // so we use rpc or fetch all and group client-side
    let query = supabase
      .from('agendamentos')
      .select('nome, numero, data')
      .order('data', { ascending: false })

    if (search) {
      query = query.ilike('nome', `%${search}%`)
    }

    const { data: agendamentos, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json([])
    }

    // Group by nome+numero and find the latest date
    const groupMap = new Map<string, { nome: string; numero: string; ultimo_agendamento: string }>()

    for (const a of (agendamentos || [])) {
      const key = `${a.nome}|${a.numero || ''}`
      const existing = groupMap.get(key)
      if (!existing || a.data > existing.ultimo_agendamento) {
        groupMap.set(key, {
          nome: a.nome,
          numero: a.numero || '',
          ultimo_agendamento: a.data,
        })
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const results = Array.from(groupMap.values()).map((item) => {
      const lastDate = new Date(item.ultimo_agendamento + 'T00:00:00')
      const diffTime = today.getTime() - lastDate.getTime()
      const dias_timer_out = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return {
        ...item,
        dias_timer_out,
      }
    })

    results.sort((a, b) => b.dias_timer_out - a.dias_timer_out)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching timer-out:', error)
    return NextResponse.json([])
  }
}
