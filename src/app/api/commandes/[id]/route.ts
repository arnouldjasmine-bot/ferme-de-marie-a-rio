import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service'

function emailConfirmationHtml(opts: {
  locale: string
  prenom: string
  adresse: string
  total: number
  lignesArticles: string
}) {
  const pt = opts.locale === 'pt-BR'
  const titre      = pt ? 'Seu pedido foi confirmado! 🎉' : 'Votre commande est confirmée ! 🎉'
  const bonjour    = pt ? `Olá <strong>${opts.prenom}</strong>,` : `Bonjour <strong>${opts.prenom}</strong>,`
  const corps      = pt
    ? 'Ótima notícia! Seu pedido está confirmado. Entraremos em contato para organizar a entrega.'
    : 'Bonne nouvelle ! Votre commande est confirmée. Nous vous contacterons pour organiser la livraison.'
  const colProduit = pt ? 'Produto' : 'Produit'
  const colQte     = pt ? 'Qtd' : 'Qté'
  const colMontant = pt ? 'Valor' : 'Montant'
  const totalLabel = pt ? 'Total' : 'Total'
  const livrLabel  = pt ? '📍 Entrega:' : '📍 Livraison :'
  const footer     = 'La Ferme de Marie à Rio · Rio de Janeiro'

  return `<!DOCTYPE html>
<html lang="${opts.locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F2E9;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#4A5D4E;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:26px;color:#fff;font-weight:normal;">${titre}</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#4A5D4E;font-size:15px;">${bonjour}</p>
      <p style="color:#5a5a4a;font-size:14px;line-height:1.6;">${corps}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
        <thead><tr style="background:#4A5D4E;color:#fff;">
          <th style="padding:8px 12px;text-align:left;">${colProduit}</th>
          <th style="padding:8px 12px;text-align:center;">${colQte}</th>
          <th style="padding:8px 12px;text-align:right;">${colMontant}</th>
        </tr></thead>
        <tbody>${opts.lignesArticles}</tbody>
        <tfoot><tr>
          <td colspan="2" style="padding:12px;font-weight:bold;color:#4A5D4E;">${totalLabel}</td>
          <td style="padding:12px;font-weight:bold;color:#4A5D4E;text-align:right;">R$ ${opts.total.toFixed(2)}</td>
        </tr></tfoot>
      </table>
      <p style="margin-top:16px;color:#5a5a4a;font-size:14px;">${livrLabel} ${opts.adresse}</p>
    </div>
    <div style="background:#f8f6f0;padding:20px 24px;text-align:center;border-top:1px solid #e8e4d8;">
      <p style="margin:0;font-size:12px;color:#9a9a8a;">${footer}</p>
    </div>
  </div>
</body>
</html>`
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createServiceClient()

    // Mise à jour articles + total
    if (body.articles !== undefined) {
      const { error } = await supabase
        .from('orders')
        .update({ articles: body.articles, total: body.total })
        .eq('id', id)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }

    // Mise à jour statut paiement
    if (body.paiement_statut !== undefined) {
      if (!['en_attente', 'payee'].includes(body.paiement_statut)) {
        return NextResponse.json({ ok: false, error: 'Statut paiement invalide' }, { status: 400 })
      }
      const { error } = await supabase
        .from('orders')
        .update({ paiement_statut: body.paiement_statut })
        .eq('id', id)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }

    const { statut } = body

    if (!['en_attente', 'confirmee', 'livree'].includes(statut)) {
      return NextResponse.json({ ok: false, error: 'Statut invalide' }, { status: 400 })
    }

    const { data: commande, error: readError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (readError || !commande) {
      return NextResponse.json({ ok: false, error: 'Commande introuvable' }, { status: 404 })
    }

    const ancienStatut = commande.statut

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
        const locale = commande.locale ?? 'fr'
        const lignesArticles = articles.map((a: { nom: string; quantite: number; prix: number }) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;">${a.nom}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:center;">${a.quantite}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:right;">R$ ${(a.prix * a.quantite).toFixed(2)}</td>
          </tr>`
        ).join('')

        const subject = locale === 'pt-BR'
          ? `🎉 Seu pedido foi confirmado — La Ferme de Marie à Rio`
          : `🎉 Votre commande est confirmée — La Ferme de Marie à Rio`

        await resend.emails.send({
          from: 'La Ferme de Marie à Rio <onboarding@resend.dev>',
          replyTo: 'arnould.jasmine@gmail.com',
          to: commande.email,
          subject,
          html: emailConfirmationHtml({
            locale,
            prenom: commande.prenom,
            adresse: commande.adresse,
            total: commande.total,
            lignesArticles,
          }),
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
