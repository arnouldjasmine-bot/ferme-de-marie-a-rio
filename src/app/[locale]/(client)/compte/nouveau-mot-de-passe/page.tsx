'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function PageNouveauMotDePasse() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    if (password !== confirm) {
      setErreur(pt ? 'As senhas não coincidem.' : 'Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setErreur(pt ? 'Mínimo 8 caracteres.' : 'Minimum 8 caractères.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setErreur(pt ? 'Erro ao atualizar a senha.' : 'Erreur lors de la mise à jour.')
    } else {
      setSucces(true)
      setTimeout(() => router.push(`/${locale}/mes-commandes`), 2000)
    }
    setLoading(false)
  }

  const eyeOff = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  const eyeOn = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre)' }}>
          {pt ? 'Nova senha' : 'Nouveau mot de passe'}
        </h1>

        {succes ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-4">✅</p>
            <p className="font-semibold" style={{ color: 'var(--vert-sauge-fonce)' }}>
              {pt ? 'Senha atualizada !' : 'Mot de passe mis à jour !'}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Redirecionando...' : 'Redirection en cours…'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                {pt ? 'Nova senha' : 'Nouveau mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={voirMdp ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm outline-none"
                  style={{ borderColor: 'var(--couleur-bordure)' }}
                />
                <button type="button" onClick={() => setVoirMdp(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-70" tabIndex={-1}>
                  {voirMdp ? eyeOff : eyeOn}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                {pt ? 'Confirmar senha' : 'Confirmer'}
              </label>
              <div className="relative">
                <input
                  type={voirMdp ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm outline-none"
                  style={{ borderColor: 'var(--couleur-bordure)' }}
                />
              </div>
            </div>

            {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
            >
              {loading ? '…' : (pt ? 'Salvar' : 'Enregistrer')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
