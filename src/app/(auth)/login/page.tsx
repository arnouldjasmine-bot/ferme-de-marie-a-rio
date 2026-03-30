'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(searchParams.get('erreur') ? 'Email ou mot de passe incorrect.' : '')
  const [voirMdp, setVoirMdp] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.ok) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : ''
        document.cookie = `dev-admin-session=authenticated; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`
        window.location.href = '/dashboard'
      } else {
        setErreur('Email ou mot de passe incorrect.')
      }
    } catch {
      setErreur('Erreur de connexion. Réessayez.')
    }
    setChargement(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--couleur-accent)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{
          backgroundColor: 'var(--couleur-fond-carte)',
          boxShadow: 'var(--ombre-modale)'
        }}
      >
        <a
          href="/fr"
          className="flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--couleur-texte-doux)' }}
        >
          ← Retour au site
        </a>

        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
        >
          La Ferme de Marie à Rio
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>
          Espace administrateur
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border rounded-lg px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={voirMdp ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full border rounded-lg px-3 py-2 pr-10 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
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
            <p className="text-sm text-center" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>
          )}

          <p className="text-xs text-center" style={{ color: 'var(--couleur-texte-doux)' }}>
            Mot de passe oublié ?{' '}
            <a href="mailto:arnould.jasmine@gmail.com" className="underline hover:opacity-80">
              Contacter Jasmine
            </a>
          </p>

          <button
            type="submit"
            disabled={chargement}
            className="mt-2 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--couleur-primaire)', borderRadius: 'var(--rayon-bordure)' }}
          >
            {chargement ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PageLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
