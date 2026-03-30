'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function PageConnexion() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [voirMdp, setVoirMdp]   = useState(false)

  // Login directement côté client pour que AuthProvider détecte la session
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErreur(pt ? 'Email ou senha incorretos.' : 'Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push(`/${locale}/mes-commandes`)
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre)' }}>
          {pt ? 'Entrar' : 'Se connecter'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Acesse sua conta La Ferme de Marie.' : 'Accédez à votre compte La Ferme de Marie.'}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>
                {pt ? 'Senha' : 'Mot de passe'}
              </label>
              <a
                href={`/${locale}/compte/mot-de-passe-oublie`}
                className="text-xs underline opacity-60 hover:opacity-90"
                style={{ color: 'var(--vert-sauge)' }}
              >
                {pt ? 'Esqueceu a senha?' : 'Mot de passe oublié ?'}
              </a>
            </div>
            <div className="relative">
              <input
                type={voirMdp ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
              <button
                type="button"
                onClick={() => setVoirMdp(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-70 transition-opacity"
                tabIndex={-1}
              >
                {voirMdp
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
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
            {loading ? '…' : (pt ? 'Entrar' : 'Se connecter')}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Não tem conta? ' : 'Pas encore de compte ? '}
          <Link
            href={`/${locale}/compte/inscription`}
            className="font-semibold underline"
            style={{ color: 'var(--vert-sauge)' }}
          >
            {pt ? 'Criar conta' : 'Créer un compte'}
          </Link>
        </p>
      </div>
    </div>
  )
}
