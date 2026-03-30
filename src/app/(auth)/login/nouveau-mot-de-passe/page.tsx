'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function NouveauMotDePasseForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const eyeOff = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  const eyeOn  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">❌</p>
        <p className="font-semibold mb-4" style={{ color: 'var(--couleur-erreur)' }}>Lien invalide</p>
        <a href="/login/mot-de-passe-oublie" className="text-sm underline" style={{ color: 'var(--couleur-primaire)' }}>
          Faire une nouvelle demande
        </a>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    if (password !== confirm) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setErreur('Minimum 8 caractères.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErreur(data.error ?? 'Erreur lors de la mise à jour.')
      } else {
        setSucces(true)
        setTimeout(() => { window.location.href = '/login' }, 2500)
      }
    } catch {
      setErreur('Erreur réseau. Réessayez.')
    }
    setLoading(false)
  }

  return succes ? (
    <div className="text-center py-6">
      <p className="text-4xl mb-4">✅</p>
      <p className="font-semibold mb-2" style={{ color: 'var(--couleur-primaire-fonce)' }}>Mot de passe mis à jour !</p>
      <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Redirection vers la connexion…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Nouveau mot de passe</label>
        <div className="relative">
          <input
            type={voirMdp ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Minimum 8 caractères"
            className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none"
            style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
          />
          <button type="button" onClick={() => setVoirMdp(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-70" tabIndex={-1}>
            {voirMdp ? eyeOff : eyeOn}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Confirmer</label>
        <input
          type={voirMdp ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
        />
      </div>
      {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: 'var(--couleur-primaire)', borderRadius: 'var(--rayon-bordure)' }}
      >
        {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
      </button>
    </form>
  )
}

export default function PageNouveauMotDePasseAdmin() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--couleur-accent)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-modale)' }}>
        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Nouveau mot de passe
        </h1>
        <Suspense>
          <NouveauMotDePasseForm />
        </Suspense>
      </div>
    </div>
  )
}
