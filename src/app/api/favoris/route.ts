import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  return user ?? null
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('favoris')
    .select('id, product_id, products(id, nom, prix, unite, stock, image_url, actif)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json() as { product_id?: string }
  if (!body.product_id) return NextResponse.json({ error: 'product_id manquant' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('favoris')
    .insert({ user_id: user.id, product_id: body.product_id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true, alreadyExists: true })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, data })
}

export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const product_id = searchParams.get('product_id')
  if (!product_id) return NextResponse.json({ error: 'product_id manquant' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('favoris')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', product_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
