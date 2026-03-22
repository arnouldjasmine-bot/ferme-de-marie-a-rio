'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

const PAYS = [
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+351', flag: '🇵🇹', label: 'PT' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
] as const
type Pays = typeof PAYS[number]

export default function PageInscription() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const router = useRouter()

  // La langue est celle du site (URL), pas le pays du téléphone
  const pt = locale === 'pt-BR'
  const paysDefaut = locale === 'pt-BR' ? PAYS[0] : PAYS[1]
  const [paysSelectionne, setPaysSelectionne] = useState<Pays>(paysDefaut)

  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', password: '' })
  const [erreur, setErreur]   = useState('')
  const [loading, setLoading] = useState(false)
  const [succes, setSucces]   = useState(false)

  function set(champ: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [champ]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    const telDigits = form.telephone.replace(/\D/g, '')
    const telephoneComplet = paysSelectionne.code + telDigits

    const fd = new FormData()
    fd.append('prenom', form.prenom.trim())
    fd.append('nom', form.nom.trim())
    fd.append('email', form.email.trim())
    fd.append('telephone', telephoneComplet)
    fd.append('password', form.password)
    fd.append('locale', locale)

    const res = await fetch('/api/auth/client/signup', { method: 'POST', body: fd })
    const json = await res.json() as { ok: boolean; error?: string }

    if (!json.ok) {
      setErreur(json.error ?? (pt ? 'Erro ao criar conta.' : 'Erreur lors de la création du compte.'))
      setLoading(false)
      return
    }

    setSucces(true)
    setLoading(false)
    setTimeout(() => router.push(`/${locale}/compte/connexion`), 2500)
  }

  if (succes) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#eef3ee' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16 L13 21 L24 10" stroke="#4A5D4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre)' }}>
          {pt ? 'Conta criada!' : 'Compte créé !'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Redirecionando para o login…' : 'Redirection vers la connexion…'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre)' }}>
          {pt ? 'Criar conta' : 'Créer un compte'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Para acompanhar seus pedidos e favoritos.' : 'Pour suivre vos commandes et vos favoris.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                {pt ? 'Nome' : 'Prénom'}
              </label>
              <input
                type="text"
                value={form.prenom}
                onChange={set('prenom')}
                required
                autoComplete="given-name"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                {pt ? 'Sobrenome' : 'Nom'}
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={set('nom')}
                required
                autoComplete="family-name"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
              {pt ? 'E-mail' : 'Email'}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--couleur-bordure)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
              {pt ? 'Telefone' : 'Téléphone'}
            </label>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--couleur-bordure)' }}>
              <select
                value={paysSelectionne.code}
                onChange={e => {
                  const p = PAYS.find(p => p.code === e.target.value)
                  if (p) setPaysSelectionne(p)
                }}
                className="shrink-0 border-r px-2 py-2.5 text-sm bg-transparent outline-none cursor-pointer"
                style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
              >
                {PAYS.map(p => (
                  <option key={p.code} value={p.code}>{p.flag} {p.code}</option>
                ))}
              </select>
              <input
                type="tel"
                value={form.telephone}
                onChange={set('telephone')}
                autoComplete="tel-national"
                placeholder={paysSelectionne.code === '+55' ? '21 99999-9999' : '6 12 34 56 78'}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Selecione o código do seu país' : 'Sélectionnez l\'indicatif de votre pays'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
              {pt ? 'Senha' : 'Mot de passe'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="new-password"
              minLength={8}
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
            {loading ? '…' : (pt ? 'Criar conta' : 'Créer mon compte')}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Já tem conta? ' : 'Déjà un compte ? '}
          <Link
            href={`/${locale}/compte/connexion`}
            className="font-semibold underline"
            style={{ color: 'var(--vert-sauge)' }}
          >
            {pt ? 'Entrar' : 'Se connecter'}
          </Link>
        </p>
      </div>
    </div>
  )
}
