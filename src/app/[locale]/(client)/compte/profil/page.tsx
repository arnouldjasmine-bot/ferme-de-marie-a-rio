'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/client/AuthProvider'
import AdresseAutocomplete from '@/components/client/AdresseAutocomplete'

const PAYS = [
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+351', flag: '🇵🇹', label: 'PT' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
] as const
type Pays = typeof PAYS[number]

export default function PageProfil() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'
  const router = useRouter()
  const { user, profile } = useAuth()

  const [form, setForm] = useState({ prenom: '', nom: '', adresse: '' })
  const [pays, setPays] = useState<Pays>(PAYS[0])
  const [tel, setTel] = useState('')
  const [loading, setLoading] = useState(false)
  const [succes, setSucces] = useState(false)
  const [erreur, setErreur] = useState('')

  // Nouveau mot de passe
  const [ancienMdp, setAncienMdp] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [loadingMdp, setLoadingMdp] = useState(false)
  const [succesMdp, setSuccesMdp] = useState(false)
  const [erreurMdp, setErreurMdp] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (!profile) return
    setForm({
      prenom: profile.prenom ?? '',
      nom: profile.nom ?? '',
      adresse: profile.adresse ?? '',
    })
    // Extraire indicatif du téléphone stocké
    const tel = profile.telephone ?? ''
    const paysMatch = PAYS.find(p => tel.startsWith(p.code))
    if (paysMatch) {
      setPays(paysMatch)
      setTel(tel.slice(paysMatch.code.length))
    } else {
      setTel(tel)
    }
  }, [profile])

  useEffect(() => {
    if (!user && !loading) router.push(`/${locale}/compte/connexion`)
  }, [user, loading, locale, router])

  async function sauvegarder(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setSucces(false)
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        adresse: form.adresse.trim(),
        telephone: pays.code + tel.replace(/\D/g, ''),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)

    if (error) {
      setErreur(pt ? 'Erro ao salvar.' : 'Erreur lors de la sauvegarde.')
    } else {
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    }
    setLoading(false)
  }

  async function changerMotDePasse(e: React.FormEvent) {
    e.preventDefault()
    setErreurMdp('')
    setSuccesMdp(false)
    setLoadingMdp(true)

    // Vérifier l'ancien mot de passe
    const { error: errLogin } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: ancienMdp,
    })
    if (errLogin) {
      setErreurMdp(pt ? 'Senha atual incorreta.' : 'Mot de passe actuel incorrect.')
      setLoadingMdp(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: nouveauMdp })
    if (error) {
      setErreurMdp(pt ? 'Erro ao atualizar senha.' : 'Erreur lors du changement.')
    } else {
      setSuccesMdp(true)
      setAncienMdp('')
      setNouveauMdp('')
      setTimeout(() => setSuccesMdp(false), 3000)
    }
    setLoadingMdp(false)
  }

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full" style={{ backgroundColor: 'var(--couleur-fond-carte)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
            {pt ? 'Meu perfil' : 'Mon profil'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>{user.email}</p>
        </div>
      </div>

      {/* ── Informations personnelles ── */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: '0 2px 12px rgba(74,93,78,0.08)' }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Informações pessoais' : 'Informations personnelles'}
        </h2>

        <form onSubmit={sauvegarder} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'prenom', label: pt ? 'Nome' : 'Prénom', auto: 'given-name' },
              { key: 'nom', label: pt ? 'Sobrenome' : 'Nom', auto: 'family-name' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>{f.label}</label>
                <input
                  type="text"
                  value={form[f.key as 'prenom' | 'nom']}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  autoComplete={f.auto}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                  style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond)' }}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Telefone' : 'Téléphone'}
            </label>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond)' }}>
              <select
                value={pays.code}
                onChange={e => { const p = PAYS.find(p => p.code === e.target.value); if (p) setPays(p) }}
                className="shrink-0 border-r px-2 py-2.5 text-sm bg-transparent outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              >
                {PAYS.map(p => <option key={p.code} value={p.code}>{p.flag} {p.code}</option>)}
              </select>
              <input
                type="tel" value={tel} onChange={e => setTel(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                placeholder={pays.code === '+55' ? '21 99999-9999' : '6 12 34 56 78'}
              />
            </div>
          </div>

          <AdresseAutocomplete
            value={form.adresse}
            label={pt ? 'Endereço de entrega' : 'Adresse de livraison'}
            locale={locale}
            onChange={adresse => setForm(p => ({ ...p, adresse }))}
          />

          {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
            style={{ backgroundColor: succes ? 'var(--couleur-succes)' : 'var(--vert-sauge-fonce)' }}
          >
            {loading ? '…' : succes ? (pt ? 'Salvo ✓' : 'Enregistré ✓') : (pt ? 'Salvar alterações' : 'Enregistrer')}
          </button>
        </form>
      </div>

      {/* ── Changer mot de passe ── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: '0 2px 12px rgba(74,93,78,0.08)' }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Alterar senha' : 'Changer le mot de passe'}
        </h2>

        <form onSubmit={changerMotDePasse} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Senha atual' : 'Mot de passe actuel'}
            </label>
            <input
              type="password" value={ancienMdp} onChange={e => setAncienMdp(e.target.value)}
              required minLength={6}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
              style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Nova senha' : 'Nouveau mot de passe'}
            </label>
            <input
              type="password" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)}
              required minLength={8}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
              style={{ borderColor: 'var(--couleur-bordure)', backgroundColor: 'var(--couleur-fond)' }}
            />
          </div>

          {erreurMdp && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreurMdp}</p>}

          <button
            type="submit" disabled={loadingMdp}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-95"
            style={{ backgroundColor: succesMdp ? 'var(--couleur-succes)' : 'var(--vert-sauge)' }}
          >
            {loadingMdp ? '…' : succesMdp ? (pt ? 'Alterado ✓' : 'Modifié ✓') : (pt ? 'Alterar senha' : 'Changer le mot de passe')}
          </button>
        </form>
      </div>
    </div>
  )
}
