import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

async function isAdmin(request: NextRequest): Promise<boolean> {
  // Dev cookie
  if (request.cookies.get('dev-admin-session')?.value === 'authenticated') return true

  // Supabase Auth session (production)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  const hostname = new URL(supabaseUrl).hostname.split('.')[0]
  const accessToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get(`sb-${hostname}-auth-token`)?.value

  if (!accessToken) return false

  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  return !!user
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json() as { approuve?: boolean }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('avis')
    .update({ approuve: body.approuve ?? true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('avis').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
