import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { statut } = await request.json()

    if (!['en_attente', 'confirmee', 'livree'].includes(statut)) {
      return NextResponse.json({ ok: false, error: 'Statut invalide' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Lire la commande actuelle
    const { data: commande, error: readError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (readError || !commande) {
      return NextResponse.json({ ok: false, error: 'Commande introuvable' }, { status: 404 })
    }

    const ancienStatut = commande.statut

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('orders')
      .update({ statut })
      .eq('id', id)

    if (updateError) throw new Error(updateError.message)

    // Email au client quand la commande passe à "confirmee"
    if (statut === 'confirmee' && ancienStatut !== 'confirmee' && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const articles = commande.articles ?? []
        const lignesArticles = articles.map((a: { nom: string; quantite: number; prix: number }) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;">${a.nom}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:center;">${a.quantite}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:right;">R$ ${(a.prix * a.quantite).toFixed(2)}</td>
          </tr>`
        ).join('')

        await resend.emails.send({
          from: 'Ferme de Marie à Rio <onboarding@resend.dev>',
          replyTo: 'arnould.jasmine@gmail.com',
          to: commande.email,
          subject: `🎉 Votre commande est confirmée — Ferme de Marie à Rio`,
          html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F2E9;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#4A5D4E;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:26px;color:#fff;font-weight:normal;">Votre commande est confirmée ! 🎉</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#4A5D4E;font-size:15px;">Bonjour <strong>${commande.prenom}</strong>,</p>
      <p style="color:#5a5a4a;font-size:14px;line-height:1.6;">Bonne nouvelle ! Votre commande est confirmée. Nous vous contacterons pour organiser la livraison.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
        <thead><tr style="background:#4A5D4E;color:#fff;">
          <th style="padding:8px 12px;text-align:left;">Produit</th>
          <th style="padding:8px 12px;text-align:center;">Qté</th>
          <th style="padding:8px 12px;text-align:right;">Montant</th>
        </tr></thead>
        <tbody>${lignesArticles}</tbody>
        <tfoot><tr>
          <td colspan="2" style="padding:12px;font-weight:bold;color:#4A5D4E;">Total</td>
          <td style="padding:12px;font-weight:bold;color:#4A5D4E;text-align:right;">R$ ${commande.total.toFixed(2)}</td>
        </tr></tfoot>
      </table>
      <p style="margin-top:16px;color:#5a5a4a;font-size:14px;">📍 Livraison : ${commande.adresse}</p>
    </div>
  </div>
</body>
</html>`.trim(),
        })
      } catch (emailErr) {
        console.error('Erreur email confirmation:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
