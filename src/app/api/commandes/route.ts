import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { Resend } from 'resend'

const DATA_FILE = path.join(process.cwd(), 'data', 'commandes.json')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'comprovantes')

export async function GET() {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json([])
  }
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
    const articles  = JSON.parse(formData.get('articles')?.toString() ?? '[]')
    const comprovante = formData.get('comprovante') as File | null

    let comprovanteUrl: string | null = null

    if (comprovante && comprovante.size > 0) {
      const bytes = await comprovante.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = comprovante.name.split('.').pop() ?? 'png'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      await writeFile(filepath, buffer)
      comprovanteUrl = `/comprovantes/${filename}`
    }

    const commande = {
      id: `cmd-${Date.now()}`,
      prenom,
      nom,
      email,
      telephone,
      adresse,
      total,
      articles,
      comprovanteUrl,
      statut: 'en_attente',
      createdAt: new Date().toISOString(),
    }

    const raw = await readFile(DATA_FILE, 'utf-8').catch(() => '[]')
    const commandes = JSON.parse(raw)
    commandes.unshift(commande)
    await writeFile(DATA_FILE, JSON.stringify(commandes, null, 2))

    // Envoi email de confirmation au client
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

        await resend.emails.send({
          from: 'Ferme de Marie à Rio <commandes@lafermedemarie.com.br>',
          to: email,
          subject: `✅ Commande confirmée — Ferme de Marie à Rio`,
          html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F2E9;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(74,93,78,0.10);">

    <!-- En-tête -->
    <div style="background:#4A5D4E;padding:32px 24px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#c8d8c0;letter-spacing:2px;text-transform:uppercase;">Ferme de Marie à Rio</p>
      <h1 style="margin:8px 0 0;font-size:26px;color:#fff;font-weight:normal;">Merci pour votre commande !</h1>
    </div>

    <!-- Corps -->
    <div style="padding:32px 24px;">
      <p style="margin:0 0 8px;color:#4A5D4E;font-size:15px;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="margin:0 0 24px;color:#5a5a4a;font-size:14px;line-height:1.6;">
        Nous avons bien reçu votre commande et votre comprovante de paiement PIX.
        Nous allons la préparer avec soin et vous contacter pour confirmer la livraison.
      </p>

      <!-- Récapitulatif commande -->
      <div style="background:#f8f6f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#4A5D4E;text-transform:uppercase;letter-spacing:1px;">
          Votre commande
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#4A5D4E;color:#fff;">
              <th style="padding:8px 12px;text-align:left;border-radius:6px 0 0 0;">Produit</th>
              <th style="padding:8px 12px;text-align:center;">Qté</th>
              <th style="padding:8px 12px;text-align:right;border-radius:0 6px 0 0;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${lignesArticles}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:bold;color:#4A5D4E;font-size:15px;">Total payé</td>
              <td style="padding:12px;font-weight:bold;color:#4A5D4E;font-size:15px;text-align:right;">R$ ${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Infos livraison -->
      <div style="border-left:3px solid #93A27D;padding:12px 16px;background:#f4f7f4;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#4A5D4E;text-transform:uppercase;letter-spacing:1px;">Livraison à</p>
        <p style="margin:0;font-size:14px;color:#3a3a2a;">${adresse}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#5a5a4a;">📞 ${telephone}</p>
      </div>

      <p style="margin:0;font-size:13px;color:#7a7a6a;line-height:1.6;">
        Des questions ? Répondez simplement à cet email ou contactez-nous sur WhatsApp.
      </p>
    </div>

    <!-- Pied de page -->
    <div style="background:#f8f6f0;padding:20px 24px;text-align:center;border-top:1px solid #e8e4d8;">
      <p style="margin:0;font-size:12px;color:#9a9a8a;">
        Ferme de Marie à Rio · Barra da Tijuca, Rio de Janeiro<br>
        Produits fermiers frais, avec amour 🌿
      </p>
    </div>
  </div>
</body>
</html>
          `.trim(),
        })
      } catch (emailErr) {
        // L'email échoue silencieusement — la commande est déjà enregistrée
        console.error('Erreur envoi email:', emailErr)
      }
    }

    return NextResponse.json({ ok: true, id: commande.id })
  } catch (err) {
    console.error('Erreur commande:', err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
