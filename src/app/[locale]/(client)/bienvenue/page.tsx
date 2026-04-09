'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type Etape = 'langue' | 'choix' | 'connexion' | 'inscription'

const PAYS = [
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+351', flag: '🇵🇹', label: 'PT' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
] as const
type Pays = typeof PAYS[number]

export default function PageBienvenue() {
  const router = useRouter()
  const [etape, setEtape]         = useState<Etape>('langue')
  const [locale, setLocale]       = useState<'fr' | 'pt-BR'>('fr')
  const [loading, setLoading]     = useState(false)
  const [erreur, setErreur]       = useState('')
  const [voirMdp, setVoirMdp]     = useState(false)

  // Connexion
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')

  // Inscription
  const [pays, setPays]           = useState<Pays>(PAYS[0])
  const [form, setForm]           = useState({ prenom: '', nom: '', email: '', telephone: '', password: '' })

  const pt = locale === 'pt-BR'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  function choisirLangue(l: 'fr' | 'pt-BR') {
    setLocale(l)
    setEtape('choix')
  }

  function terminer() {
    localStorage.setItem('ferme-onboarding-done', '1')
    router.push(`/${locale}`)
  }

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setErreur(pt ? 'Email ou senha incorretos.' : 'Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }
    terminer()
  }

  async function sInscrire(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)
    const telDigits = form.telephone.replace(/\D/g, '')
    const fd = new FormData()
    fd.append('prenom', form.prenom.trim())
    fd.append('nom', form.nom.trim())
    fd.append('email', form.email.trim())
    fd.append('telephone', pays.code + telDigits)
    fd.append('adresse', '')
    fd.append('password', form.password)
    fd.append('locale', locale)
    const res = await fetch('/api/auth/client/signup', { method: 'POST', body: fd })
    const json = await res.json() as { ok: boolean; error?: string }
    if (!json.ok) {
      setErreur(json.error ?? (pt ? 'Erro ao criar conta.' : 'Erreur lors de la création.'))
      setLoading(false)
      return
    }
    // Connecter directement après inscription
    await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
    terminer()
  }

  // ── Étape 1 : Choix de la langue ────────────────────────────────────────
  if (etape === 'langue') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--couleur-fond)' }}>
        <Image src="/logo.png" alt="Ferme de Marie" width={180} height={120} className="object-contain mb-8" style={{ mixBlendMode: 'multiply' }} priority />

        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          Bienvenue · Bem-vindo
        </h1>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--couleur-texte-doux)' }}>
          Choisissez votre langue · Escolha seu idioma
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => choisirLangue('fr')}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
            style={{ backgroundColor: 'var(--vert-sauge-fonce)', color: '#fff' }}
          >
            <span className="text-2xl">🇫🇷</span>
            <span>Continuer en français</span>
          </button>
          <button
            onClick={() => choisirLangue('pt-BR')}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
            style={{ backgroundColor: 'var(--terracotta)', color: '#fff' }}
          >
            <span className="text-2xl">🇧🇷</span>
            <span>Continuar em português</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Étape 2 : Connexion ou inscription ───────────────────────────────────
  if (etape === 'choix') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--couleur-fond)' }}>
        <Image src="/logo.png" alt="Ferme de Marie" width={150} height={100} className="object-contain mb-6" style={{ mixBlendMode: 'multiply' }} />

        <h1 className="text-xl font-bold text-center mb-1" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {pt ? 'Bem-vindo(a)!' : 'Bienvenue !'}
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Acesse sua conta ou crie uma nova.' : 'Connectez-vous ou créez votre compte.'}
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setEtape('connexion')}
            className="py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
            style={{ backgroundColor: 'var(--vert-sauge-fonce)', color: '#fff' }}
          >
            {pt ? 'Entrar na minha conta' : 'Se connecter'}
          </button>
          <button
            onClick={() => setEtape('inscription')}
            className="py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 border-2"
            style={{ borderColor: 'var(--vert-sauge-fonce)', color: 'var(--vert-sauge-fonce)', backgroundColor: 'transparent' }}
          >
            {pt ? 'Criar conta' : 'Créer un compte'}
          </button>
          <button
            onClick={terminer}
            className="py-3 text-sm transition-all"
            style={{ color: 'var(--couleur-texte-doux)' }}
          >
            {pt ? 'Continuar sem conta →' : 'Continuer sans compte →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Étape 3 : Formulaire connexion ───────────────────────────────────────
  if (etape === 'connexion') {
    return (
      <div className="fixed inset-0 overflow-y-auto" style={{ backgroundColor: 'var(--couleur-fond)' }}>
        <div className="min-h-full px-6 py-8 flex flex-col max-w-sm mx-auto">
          <button onClick={() => setEtape('choix')} className="flex items-center gap-1 text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
            ← {pt ? 'Voltar' : 'Retour'}
          </button>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
            {pt ? 'Entrar' : 'Se connecter'}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--couleur-texte-doux)' }}>
            {pt ? 'Acesse sua conta La Ferme de Marie.' : 'Accédez à votre compte.'}
          </p>

          <form onSubmit={seConnecter} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--couleur-texte)' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                className="w-full rounded-2xl px-4 py-3 text-base outline-none border"
                style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond-carte)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--couleur-texte)' }}>
                {pt ? 'Senha' : 'Mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={voirMdp ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  className="w-full rounded-2xl px-4 py-3 pr-12 text-base outline-none border"
                  style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond-carte)' }}
                />
                <button type="button" onClick={() => setVoirMdp(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 p-1">
                  {voirMdp
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 disabled:opacity-50 transition-all active:scale-95"
              style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}>
              {loading ? '…' : (pt ? 'Entrar' : 'Se connecter')}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--couleur-texte-doux)' }}>
            {pt ? 'Não tem conta? ' : 'Pas de compte ? '}
            <button onClick={() => setEtape('inscription')} className="font-semibold underline" style={{ color: 'var(--vert-sauge)' }}>
              {pt ? 'Criar conta' : 'Créer un compte'}
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ── Étape 4 : Formulaire inscription ─────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ backgroundColor: 'var(--couleur-fond)' }}>
      <div className="min-h-full px-6 py-8 flex flex-col max-w-sm mx-auto">
        <button onClick={() => setEtape('choix')} className="flex items-center gap-1 text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          ← {pt ? 'Voltar' : 'Retour'}
        </button>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {pt ? 'Criar conta' : 'Créer un compte'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Para acompanhar seus pedidos.' : 'Pour suivre vos commandes.'}
        </p>

        <form onSubmit={sInscrire} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'prenom', label: pt ? 'Nome' : 'Prénom', auto: 'given-name' },
              { key: 'nom', label: pt ? 'Sobrenome' : 'Nom', auto: 'family-name' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--couleur-texte)' }}>{f.label}</label>
                <input
                  type="text" value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required autoComplete={f.auto}
                  className="w-full rounded-2xl px-3 py-3 text-base outline-none border"
                  style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond-carte)' }}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--couleur-texte)' }}>Email</label>
            <input
              type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required autoComplete="email"
              className="w-full rounded-2xl px-4 py-3 text-base outline-none border"
              style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond-carte)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--couleur-texte)' }}>
              {pt ? 'Telefone' : 'Téléphone'}
            </label>
            <div className="flex rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond-carte)' }}>
              <select
                value={pays.code} onChange={e => { const p = PAYS.find(p => p.code === e.target.value); if (p) setPays(p) }}
                className="shrink-0 border-r px-3 py-3 text-base bg-transparent outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              >
                {PAYS.map(p => <option key={p.code} value={p.code}>{p.flag} {p.code}</option>)}
              </select>
              <input
                type="tel" value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                placeholder={pays.code === '+55' ? '21 99999-9999' : '6 12 34 56 78'}
                className="flex-1 px-3 py-3 text-base outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--couleur-texte)' }}>
              {pt ? 'Senha' : 'Mot de passe'}
            </label>
            <input
              type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required autoComplete="new-password" minLength={8}
              className="w-full rounded-2xl px-4 py-3 text-base outline-none border"
              style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond-carte)' }}
            />
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 disabled:opacity-50 transition-all active:scale-95"
            style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}>
            {loading ? '…' : (pt ? 'Criar minha conta' : 'Créer mon compte')}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Já tem conta? ' : 'Déjà un compte ? '}
          <button onClick={() => setEtape('connexion')} className="font-semibold underline" style={{ color: 'var(--vert-sauge)' }}>
            {pt ? 'Entrar' : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}
