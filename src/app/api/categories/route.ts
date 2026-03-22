import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('ordre')
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const body = await request.json()
  const { value, label_fr, label_pt, emoji, ordre } = body
  if (!value || !label_fr || !label_pt) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('categories')
    .insert({ value: value.toLowerCase().replace(/\s+/g, '_'), label_fr, label_pt, emoji: emoji || '🌿', ordre: ordre || 99 })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = createServiceClient()
  const { id } = await request.json()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
