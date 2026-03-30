import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ferme-marie.test'
  if (!email || email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
    // On répond toujours OK pour ne pas révéler si l'email existe
    return NextResponse.json({ ok: true })
  }

  const supabase = createServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Générer un token aléatoire sécurisé
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

  // Invalider les anciens tokens
  await supabase.from('admin_reset_tokens').update({ used: true }).eq('used', false)

  // Stocker le nouveau token
  await supabase.from('admin_reset_tokens').insert({
    token,
    expires_at: expiresAt.toISOString(),
    used: false,
  })

  const origin = request.headers.get('origin') ?? 'https://lafermedemarieario.com.br'
  const lienReset = `${origin}/login/nouveau-mot-de-passe?token=${token}`

  await resend.emails.send({
    from: 'La Ferme de Marie <noreply@lafermedemarieario.com.br>',
    to: adminEmail,
    subject: 'Réinitialisation de votre mot de passe admin',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #2E3D31;">
        <h2 style="color: #4A5D4E; margin-bottom: 16px;">Réinitialisation du mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe de l'espace administrateur de <strong>La Ferme de Marie à Rio</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous. Ce lien est valable <strong>1 heure</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${lienReset}" style="background-color: #4A5D4E; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="font-size: 13px; color: #888;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr style="border: none; border-top: 1px solid #e5e0d5; margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">La Ferme de Marie à Rio · Espace Admin</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
