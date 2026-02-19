import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const nome = searchParams.get('nome')

    if (!nome || nome.trim().length < 2) {
      return Response.json([])
    }

    const supabase = await createClient()
    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nome_completo, numero')
      .ilike('nome_completo', `%${nome.trim()}%`)
      .order('nome_completo')
      .limit(10)

    if (error) {
      console.error('Error searching clientes:', error)
      return Response.json([])
    }

    return Response.json(clientes || [])
  } catch (error) {
    console.error('Error searching clientes:', error)
    return Response.json([])
  }
}
