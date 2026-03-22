'use client'

import { useState, useEffect } from 'react'

type PageContent = Record<string, { fr: string; pt: string }>

const CHAMPS: { cle: string; label: string; multiline?: boolean }[] = [
  { cle: 'hero_titre',      label: 'Titre principal (Hero)' },
  { cle: 'hero_sous_titre', label: 'Sous-titre Hero',        multiline: false },
  { cle: 'description',     label: 'Description ferme',      multiline: true },
  { cle: 'annonce',         label: 'Annonce / bandeau',      multiline: true },
]

export default function PageAccueilAdmin() {
  const [contenu, setContenu] = useState<PageContent>({})
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/page-content')
      .then(r => r.json())
      .then((data: PageContent) => { setContenu(data); setChargement(false) })
  }, [])

  function setValeur(cle: string, lang: 'fr' | 'pt', valeur: string) {
    setContenu(prev => ({
      ...prev,
      [cle]: { ...(prev[cle] ?? { fr: '', pt: '' }), [lang]: valeur },
    }))
  }

  async function sauvegarder() {
    setSauvegarde('...')
    const res = await fetch('/api/page-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contenu),
    })
    const json = await res.json() as { ok: boolean; error?: string }
    setSauvegarde(json.ok ? 'Sauvegardé ✓' : (json.error ?? 'Erreur'))
    setTimeout(() => setSauvegarde(null), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Page d'accueil
        </h1>
        <button
          onClick={sauvegarder}
          className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          {sauvegarde ?? 'Sauvegarder'}
        </button>
      </div>

      {chargement ? (
        <div className="py-12 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement…</div>
      ) : (
        <div className="flex flex-col gap-6">
          {CHAMPS.map(({ cle, label, multiline }) => (
            <div key={cle} className="rounded-xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--couleur-primaire-fonce)' }}>{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['fr', 'pt'] as const).map(lang => (
                  <div key={lang}>
                    <label className="block text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: 'var(--couleur-texte-doux)' }}>
                      {lang === 'fr' ? '🇫🇷 Français' : '🇧🇷 Português'}
                    </label>
                    {multiline ? (
                      <textarea
                        rows={4}
                        value={contenu[cle]?.[lang] ?? ''}
                        onChange={e => setValeur(cle, lang, e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                        style={{ borderColor: 'var(--couleur-bordure)' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={contenu[cle]?.[lang] ?? ''}
                        onChange={e => setValeur(cle, lang, e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ borderColor: 'var(--couleur-bordure)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
