import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()

  // Support Authorization Bearer token (user connecté)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      const { data } = await supabase
        .from('orders')
        .select('id, prenom, nom, total, statut, articles, adresse, created_at, paiement_statut, comprovante_url, mode_livraison')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      return NextResponse.json(data ?? [])
    }
  }

  // Fallback : recherche par email
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) return NextResponse.json([], { status: 400 })

  const { data } = await supabase
    .from('orders')
    .select('id, prenom, nom, total, statut, articles, adresse, created_at, paiement_statut, comprovante_url, mode_livraison')
    .ilike('email', email)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
