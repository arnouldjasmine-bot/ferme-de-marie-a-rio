'use client'

import { useState, useEffect } from 'react'

type Categorie = {
  id: string
  value: string
  label_fr: string
  label_pt: string
  emoji: string
  ordre: number
}

export default function PageCategories() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [chargement, setChargement] = useState(true)
  const [form, setForm] = useState({ label_fr: '', label_pt: '', emoji: '', ordre: '' })
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  async function charger() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setChargement(false)
  }

  useEffect(() => { charger() }, [])

  async function ajouter() {
    setErreur('')
    setSucces('')
    if (!form.label_fr || !form.label_pt) {
      setErreur('Les noms français et portugais sont obligatoires.')
      return
    }
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: form.label_fr,
        label_fr: form.label_fr,
        label_pt: form.label_pt,
        emoji: form.emoji || '🌿',
        ordre: parseInt(form.ordre) || 99,
      }),
    })
    if (res.ok) {
      setForm({ label_fr: '', label_pt: '', emoji: '', ordre: '' })
      setSucces('Catégorie ajoutée !')
      charger()
    } else {
      const d = await res.json()
      setErreur(d.error ?? 'Erreur')
    }
  }

  async function supprimer(id: string, label: string) {
    if (!confirm(`Supprimer la catégorie "${label}" ?`)) return
    await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    charger()
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
        Catégories de produits
      </h1>

      {/* Liste existante */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider px-4 pt-4 pb-2" style={{ color: 'var(--couleur-texte-doux)' }}>
          Catégories actuelles
        </p>
        {chargement ? (
          <p className="px-4 pb-4 text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement…</p>
        ) : categories.length === 0 ? (
          <p className="px-4 pb-4 text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Aucune catégorie.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--couleur-bordure)' }}>
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>{c.label_fr}</p>
                    <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>{c.label_pt} · <code className="text-xs">{c.value}</code></p>
                  </div>
                </div>
                <button
                  onClick={() => supprimer(c.id, c.label_fr)}
                  className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ color: 'var(--couleur-erreur)', border: '1px solid var(--couleur-erreur)' }}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire ajout */}
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
          Ajouter une catégorie
        </p>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Nom français *</label>
              <input
                type="text"
                value={form.label_fr}
                onChange={e => setForm(f => ({ ...f, label_fr: e.target.value }))}
                placeholder="ex : Œufs"
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Nom portugais *</label>
              <input
                type="text"
                value={form.label_pt}
                onChange={e => setForm(f => ({ ...f, label_pt: e.target.value }))}
                placeholder="ex : Ovos"
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                placeholder="🥚"
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Ordre d'affichage</label>
              <input
                type="number"
                value={form.ordre}
                onChange={e => setForm(f => ({ ...f, ordre: e.target.value }))}
                placeholder="5"
                min={1}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)' }}
              />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}
          {succes && <p className="text-sm" style={{ color: '#4A5D4E' }}>{succes}</p>}

          <button
            onClick={ajouter}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
          >
            + Ajouter la catégorie
          </button>
        </div>
      </div>
    </div>
  )
}
