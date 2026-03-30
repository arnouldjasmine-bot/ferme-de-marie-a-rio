'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function PageMotDePasseOublie() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'

  const [email, setEmail] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    const redirectTo = `${window.location.origin}/${locale}/compte/nouveau-mot-de-passe`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

    if (error) {
      setErreur(pt ? 'Erro ao enviar. Verifique o e-mail.' : 'Erreur lors de l\'envoi. Vérifiez l\'email.')
    } else {
      setEnvoi(true)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre)' }}>
          {pt ? 'Redefinir senha' : 'Mot de passe oublié'}
        </h1>

        {envoi ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-4">📧</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--vert-sauge-fonce)' }}>
              {pt ? 'E-mail enviado !' : 'Email envoyé !'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt
                ? 'Verifique sua caixa de entrada e clique no link para redefinir sua senha.'
                : 'Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.'}
            </p>
            <Link href={`/${locale}/compte/connexion`} className="text-sm underline" style={{ color: 'var(--vert-sauge)' }}>
              {pt ? 'Voltar para o login' : 'Retour à la connexion'}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt
                ? 'Digite seu e-mail para receber um link de redefinição de senha.'
                : 'Entrez votre email pour recevoir un lien de réinitialisation.'}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                  {pt ? 'E-mail' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: 'var(--couleur-bordure)' }}
                />
              </div>

              {erreur && (
                <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
              >
                {loading ? '…' : (pt ? 'Enviar link' : 'Envoyer le lien')}
              </button>
            </form>
            <p className="text-center text-sm mt-4">
              <Link href={`/${locale}/compte/connexion`} className="underline opacity-60 hover:opacity-90" style={{ color: 'var(--vert-sauge)' }}>
                {pt ? '← Voltar' : '← Retour'}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
