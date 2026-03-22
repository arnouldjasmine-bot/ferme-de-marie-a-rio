'use client'

import { useState, useRef } from 'react'
import { CATEGORIES, type Produit, type Categorie } from '@/types'

type Props = {
  produit: Produit | null
  onSauvegarder: (data: Omit<Produit, 'id' | 'created_at'>) => void
  onFermer: () => void
}

export default function ModalProduit({ produit, onSauvegarder, onFermer }: Props) {
  const [nom, setNom] = useState(produit?.nom ?? '')
  const [description, setDescription] = useState(produit?.description ?? '')
  const [prix, setPrix] = useState(produit?.prix?.toString() ?? '')
  const [unite, setUnite] = useState(produit?.unite ?? '')
  const [stock, setStock] = useState(produit?.stock?.toString() ?? '')
  const [categorie, setCategorie] = useState<Categorie | ''>(produit?.categorie ?? '')
  const [actif, setActif] = useState(produit?.actif ?? true)
  const [imagePreview, setImagePreview] = useState<string | null>(produit?.image_url ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim() || !prix || !stock || !unite) {
      setErreur('Veuillez remplir tous les champs obligatoires.')
      return
    }
    onSauvegarder({
      nom: nom.trim(),
      description: description.trim() || null,
      prix: parseFloat(prix),
      unite: unite.trim(),
      stock: parseInt(stock),
      categorie: categorie || null,
      // En prod, image_url viendra de Supabase Storage après upload
      image_url: imagePreview,
      actif,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-modale)' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
              {produit ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>
            <button onClick={onFermer} className="text-2xl leading-none opacity-40 hover:opacity-70" style={{ color: 'var(--couleur-texte)' }}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Upload image */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--couleur-texte)' }}>
                Photo du produit
              </label>
              <div
                className="relative rounded-xl overflow-hidden cursor-pointer flex items-center justify-center"
                style={{ height: 160, backgroundColor: 'var(--couleur-accent)', border: '2px dashed var(--couleur-bordure)' }}
                onClick={() => inputImageRef.current?.click()}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                  : (
                    <div className="text-center">
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Cliquer pour ajouter une photo</p>
                    </div>
                  )
                }
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Changer la photo</span>
                  </div>
                )}
              </div>
              <input ref={inputImageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                Nom du produit <span style={{ color: 'var(--couleur-erreur)' }}>*</span>
              </label>
              <input
                type="text" value={nom} onChange={e => setNom(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
                placeholder="Ex : Tomates cerises"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                Description
              </label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
                placeholder="Description courte..."
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                Catégorie
              </label>
              <select
                value={categorie} onChange={e => setCategorie(e.target.value as Categorie | '')}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
              >
                <option value="">— Choisir une catégorie —</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.labelFr}</option>
                ))}
              </select>
            </div>

            {/* Prix + Unité */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                  Prix (R$) <span style={{ color: 'var(--couleur-erreur)' }}>*</span>
                </label>
                <input
                  type="number" value={prix} onChange={e => setPrix(e.target.value)}
                  min="0" step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                  Unité <span style={{ color: 'var(--couleur-erreur)' }}>*</span>
                </label>
                <input
                  type="text" value={unite} onChange={e => setUnite(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
                  placeholder="kg, pot 300g, unité…"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
                Stock disponible <span style={{ color: 'var(--couleur-erreur)' }}>*</span>
              </label>
              <input
                type="number" value={stock} onChange={e => setStock(e.target.value)}
                min="0" step="1"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
                placeholder="0"
              />
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActif(v => !v)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: actif ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)' }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                  style={{ transform: actif ? 'translateX(24px)' : 'translateX(2px)' }}
                />
              </button>
              <span className="text-sm" style={{ color: 'var(--couleur-texte)' }}>
                {actif ? 'Visible dans le catalogue' : 'Masqué du catalogue'}
              </span>
            </div>

            {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button" onClick={onFermer}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
                style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--couleur-primaire)' }}
              >
                {produit ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
