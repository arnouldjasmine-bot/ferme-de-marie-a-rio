'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, type Produit, type Categorie } from '@/types'

type Props = {
  produit?: Produit | null
}

export default function FormulaireProduit({ produit }: Props) {
  const router = useRouter()
  const [nom, setNom] = useState(produit?.nom ?? '')
  const [description, setDescription] = useState(produit?.description ?? '')
  const [prix, setPrix] = useState(produit?.prix?.toString() ?? '')
  const [unite, setUnite] = useState(produit?.unite ?? '')
  const [stock, setStock] = useState(produit?.stock?.toString() ?? '')
  const [categorie, setCategorie] = useState<Categorie | ''>(produit?.categorie ?? '')
  const [actif, setActif] = useState(produit?.actif ?? true)
  const [imagePreview, setImagePreview] = useState<string | null>(produit?.image_url ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const inputImageRef = useRef<HTMLInputElement>(null)

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim() || !prix || !stock || !unite) {
      setErreur('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setChargement(true)
    setErreur('')

    try {
      // Upload image si nouvelle
      let imageUrl = produit?.image_url ?? null
      if (imageFile) {
        const fd = new FormData()
        fd.append('image', imageFile)
        const res = await fetch('/api/produits/image', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) imageUrl = data.url
      }

      const body = {
        nom: nom.trim(),
        description: description.trim() || null,
        prix: parseFloat(prix),
        unite: unite.trim(),
        stock: parseInt(stock),
        categorie: categorie || null,
        image_url: imageUrl,
        actif,
      }

      if (produit) {
        await fetch('/api/produits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: produit.id, ...body }) })
      } else {
        await fetch('/api/produits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }

      router.push('/produits')
      router.refresh()
    } catch {
      setErreur('Erreur lors de la sauvegarde.')
    }
    setChargement(false)
  }

  async function supprimer() {
    if (!produit) return
    if (!confirm(`Supprimer "${produit.nom}" ?`)) return
    await fetch('/api/produits', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: produit.id }) })
    router.push('/produits')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-sm flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: 'var(--couleur-texte-doux)' }}>
          ← Retour
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          {produit ? produit.nom : 'Nouveau produit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Image */}
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center"
          style={{ height: 200, backgroundColor: 'var(--couleur-accent)', border: '2px dashed var(--couleur-bordure)' }}
          onClick={() => inputImageRef.current?.click()}
        >
          {imagePreview
            ? <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
            : <div className="text-center"><div className="text-4xl mb-2">📷</div><p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Ajouter une photo</p></div>
          }
          {imagePreview && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">Changer</span>
            </div>
          )}
        </div>
        <input ref={inputImageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Nom <span style={{ color: 'var(--couleur-erreur)' }}>*</span></label>
          <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--couleur-bordure)' }} placeholder="Ex : Tomates cerises" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none" style={{ borderColor: 'var(--couleur-bordure)' }} placeholder="Description courte..." />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Catégorie</label>
          <select value={categorie} onChange={e => setCategorie(e.target.value as Categorie | '')} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--couleur-bordure)' }}>
            <option value="">— Choisir —</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.labelFr}</option>)}
          </select>
        </div>

        {/* Prix + Unité */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Prix (R$) <span style={{ color: 'var(--couleur-erreur)' }}>*</span></label>
            <input type="number" value={prix} onChange={e => setPrix(e.target.value)} min="0" step="0.01" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--couleur-bordure)' }} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Unité <span style={{ color: 'var(--couleur-erreur)' }}>*</span></label>
            <input type="text" value={unite} onChange={e => setUnite(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--couleur-bordure)' }} placeholder="kg, pot 300g…" />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>Stock <span style={{ color: 'var(--couleur-erreur)' }}>*</span></label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" step="1" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--couleur-bordure)' }} placeholder="0" />
        </div>

        {/* Actif */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--couleur-accent)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>Visible dans le catalogue</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>{actif ? 'Les clients peuvent commander ce produit' : 'Masqué du catalogue client'}</p>
          </div>
          <button type="button" onClick={() => setActif(v => !v)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0" style={{ backgroundColor: actif ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)' }}>
            <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform" style={{ transform: actif ? 'translateX(24px)' : 'translateX(2px)' }} />
          </button>
        </div>

        {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

        <button
          type="submit" disabled={chargement}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          {chargement ? 'Enregistrement…' : produit ? 'Enregistrer les modifications' : 'Ajouter le produit'}
        </button>

        {produit && (
          <button
            type="button" onClick={supprimer}
            className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--couleur-erreur)', border: '1px solid var(--couleur-erreur)' }}
          >
            Supprimer ce produit
          </button>
        )}
      </form>
    </div>
  )
}
