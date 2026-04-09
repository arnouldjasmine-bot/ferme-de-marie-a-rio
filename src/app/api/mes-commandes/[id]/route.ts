import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service'

type Article = { nom: string; quantite: number; prix: number }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Vérifier l'auth du client
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Non authentifié' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Vérifier que la commande appartient à cet utilisateur et est en_attente
  const { data: commande, error: readError } = await supabase
    .from('orders')
    .select('id, statut, user_id, frais_livraison')
    .eq('id', id)
    .single()

  if (readError || !commande) {
    return NextResponse.json({ ok: false, error: 'Commande introuvable' }, { status: 404 })
  }
  if (commande.user_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 403 })
  }
  if (commande.statut !== 'en_attente') {
    return NextResponse.json({ ok: false, error: 'Cette commande ne peut plus être modifiée.' }, { status: 400 })
  }

  const body = await request.json()
  const articles: Article[] = (body.articles ?? []).filter((a: Article) => a.quantite > 0)

  if (articles.length === 0) {
    return NextResponse.json({ ok: false, error: 'La commande doit contenir au moins un article.' }, { status: 400 })
  }

  const sousTotal = articles.reduce((sum, a) => sum + a.prix * a.quantite, 0)
  const total = sousTotal + (commande.frais_livraison ?? 0)

  const { error } = await supabase
    .from('orders')
    .update({ articles, total })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, total })
}
