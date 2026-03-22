import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articles, adresse, adresse2, total } = body

    if (!articles || articles.length === 0) {
      return NextResponse.json({ ok: false, error: 'Aucun article' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: commande, error } = await supabase
      .from('orders')
      .insert({
        prenom: 'MedRio',
        nom: '',
        email: '',
        telephone: '02498166 8526',
        adresse: adresse ?? '',
        adresse2: adresse2 ?? null,
        total,
        articles,
        statut: 'confirmee',
        comprovante_url: null,
        is_medrio: true,
        mode_livraison: 'livraison',
        frais_livraison: 0,
        locale: 'pt-BR',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ ok: true, id: commande.id })
  } catch (err) {
    console.error('Erreur commande MedRio:', err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
