import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

function emailHtml(opts: {
  locale: string
  prenom: string
  total: number
  lignesArticles: string
  frais_livraison?: number
  mode_livraison?: string
  adresse?: string
}) {
  const pt = opts.locale === 'pt-BR'
  const titre      = pt ? 'Obrigado pelo seu pedido !' : 'Merci pour votre commande !'
  const bonjour    = pt ? `Olá <strong>${opts.prenom}</strong>,` : `Bonjour <strong>${opts.prenom}</strong>,`
  const corps      = pt
    ? 'Recebemos seu pedido. Vamos te enviar o link de pagamento pelo WhatsApp assim que prepararmos seu pedido (segunda-feira).'
    : 'Nous avons bien reçu votre commande. Nous vous enverrons le lien de paiement par WhatsApp une fois la commande préparée (le lundi).'
  const titreCmde  = pt ? 'Seu pedido' : 'Votre commande'
  const colProduit = pt ? 'Produto' : 'Produit'
  const colQte     = pt ? 'Qtd' : 'Qté'
  const colMontant = pt ? 'Valor' : 'Montant'
  const totalLabel = pt ? 'Total' : 'Total'
  const pied       = pt ? 'Dúvidas? Responda este e-mail ou fale no WhatsApp.' : 'Des questions ? Répondez simplement à cet email ou contactez-nous sur WhatsApp.'
  const footer     = 'La Ferme de Marie à Rio · Rio de Janeiro'
  const fraisLigne = opts.frais_livraison
    ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;">${pt ? 'Taxa de entrega' : 'Frais de livraison'}</td><td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:center;">—</td><td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:right;">R$ ${opts.frais_livraison.toFixed(2)}</td></tr>`
    : ''
  const adresseLigne = opts.mode_livraison === 'retrait'
    ? `<p style="margin:16px 0 0;font-size:14px;color:#4A5D4E;">
        📍 ${pt ? 'Local de retirada' : 'Adresse de retrait'} : <strong>Rue Julio de Castilhos, 89 — Copacabana, Rio de Janeiro</strong>
       </p>`
    : opts.adresse
    ? `<p style="margin:16px 0 0;font-size:14px;color:#4A5D4E;">
        🛵 ${pt ? 'Endereço de entrega' : 'Adresse de livraison'} : <strong>${opts.adresse}</strong>
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="${opts.locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F2E9;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(74,93,78,0.10);">
    <div style="background:#4A5D4E;padding:32px 24px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#c8d8c0;letter-spacing:2px;text-transform:uppercase;">La Ferme de Marie à Rio</p>
      <h1 style="margin:8px 0 0;font-size:26px;color:#fff;font-weight:normal;">${titre}</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="margin:0 0 8px;color:#4A5D4E;font-size:15px;">${bonjour}</p>
      <p style="margin:0 0 24px;color:#5a5a4a;font-size:14px;line-height:1.6;">${corps}</p>
      <div style="background:#f8f6f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#4A5D4E;text-transform:uppercase;letter-spacing:1px;">${titreCmde}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#4A5D4E;color:#fff;">
              <th style="padding:8px 12px;text-align:left;">${colProduit}</th>
              <th style="padding:8px 12px;text-align:center;">${colQte}</th>
              <th style="padding:8px 12px;text-align:right;">${colMontant}</th>
            </tr>
          </thead>
          <tbody>${opts.lignesArticles}${fraisLigne}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:bold;color:#4A5D4E;font-size:15px;">${totalLabel}</td>
              <td style="padding:12px;font-weight:bold;color:#4A5D4E;font-size:15px;text-align:right;">R$ ${opts.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      ${adresseLigne}
      <p style="margin:16px 0 0;font-size:13px;color:#7a7a6a;line-height:1.6;">${pied}</p>
    </div>
    <div style="background:#f8f6f0;padding:20px 24px;text-align:center;border-top:1px solid #e8e4d8;">
      <p style="margin:0;font-size:12px;color:#9a9a8a;">${footer}</p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prenom    = formData.get('prenom')?.toString() ?? ''
    const nom       = formData.get('nom')?.toString() ?? ''
    const email     = formData.get('email')?.toString() ?? ''
    const telephone = formData.get('telephone')?.toString() ?? ''
    const adresse   = formData.get('adresse')?.toString() ?? ''
    const total     = parseFloat(formData.get('total')?.toString() ?? '0')
    const articles       = JSON.parse(formData.get('articles')?.toString() ?? '[]')
    const locale         = formData.get('locale')?.toString() ?? 'fr'
    const mode_livraison = formData.get('mode_livraison')?.toString() ?? 'livraison'
    const frais_livraison = parseFloat(formData.get('frais_livraison')?.toString() ?? '0')

    const supabase = createServiceClient()

    // Sauvegarder la commande dans Supabase
    const { data: commande, error: orderError } = await supabase
      .from('orders')
      .insert({
        prenom, nom, email, telephone, adresse,
        total, articles, comprovante_url: null,
        statut: 'en_attente', locale, mode_livraison, frais_livraison,
      })
      .select()
      .single()

    if (orderError) throw new Error(orderError.message)

    // Décrémenter le stock de chaque produit
    await Promise.all(
      articles
        .filter((a: { id?: string; quantite: number }) => a.id)
        .map(async (a: { id: string; quantite: number }) => {
          await supabase.rpc('decrementer_stock', { produit_id: a.id, quantite: a.quantite })
        })
    )

    // Email de confirmation client
    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const lignesArticles = articles.map((a: { nom: string; quantite: number; prix: number }) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;">${a.nom}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:center;">${a.quantite}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e4d8;text-align:right;">R$ ${(a.prix * a.quantite).toFixed(2)}</td>
          </tr>`
        ).join('')

        const subject = locale === 'pt-BR'
          ? `✅ Pedido recebido — La Ferme de Marie à Rio`
          : `✅ Commande reçue — La Ferme de Marie à Rio`

        await resend.emails.send({
          from: 'La Ferme de Marie à Rio <onboarding@resend.dev>',
          replyTo: 'arnould.jasmine@gmail.com',
          to: email,
          subject,
          html: emailHtml({ locale, prenom, total, lignesArticles, frais_livraison: frais_livraison > 0 ? frais_livraison : undefined, mode_livraison, adresse }),
        })
      } catch (emailErr) {
        console.error('Erreur envoi email:', emailErr)
      }
    }

    return NextResponse.json({ ok: true, id: commande.id })
  } catch (err) {
    console.error('Erreur commande:', err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
