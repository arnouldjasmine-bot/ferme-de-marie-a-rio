'use client'

import { useState } from 'react'

export default function PageMotDePasseOublieAdmin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)
    try {
      await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setEnvoi(true)
    } catch {
      setErreur('Erreur lors de l\'envoi. Réessayez.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--couleur-accent)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-modale)' }}>
        <a href="/login" className="flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-70" style={{ color: 'var(--couleur-texte-doux)' }}>
          ← Retour à la connexion
        </a>

        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Mot de passe oublié
        </h1>

        {envoi ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-4">📧</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--couleur-primaire-fonce)' }}>Email envoyé !</p>
            <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>
              Si cet email correspond à un compte admin, vous recevrez un lien de réinitialisation valable 1 heure.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
