import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) return NextResponse.json([], { status: 400 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('id, prenom, nom, total, statut, articles, adresse, created_at')
    .ilike('email', email)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
