'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePanier } from '@/lib/panier-context'
import type { Produit } from '@/types'

export default function BoutonAjouterProduit({ produit, locale }: { produit: Produit; locale: string }) {
  const t = useTranslations('produits')
  const { ajouterAuPanier, articles } = usePanier()
  const [ajoute, setAjoute] = useState(false)

  const quantiteAuPanier = articles.find(a => a.produit.id === produit.id)?.quantite ?? 0

  function handleAjouter() {
    ajouterAuPanier(produit)
    setAjoute(true)
    setTimeout(() => setAjoute(false), 1200)
  }

  if (produit.stock === 0) {
    return (
      <p className="w-full text-center py-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-texte-doux)' }}>
        {t('rupture')}
      </p>
    )
  }

  return (
    <button
      onClick={handleAjouter}
      className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all"
      style={{
        backgroundColor: ajoute ? 'var(--couleur-succes)' : 'var(--couleur-primaire)',
        transform: ajoute ? 'scale(0.97)' : 'scale(1)'
      }}
    >
      {ajoute
        ? (locale === 'pt-BR' ? '✓ Adicionado' : '✓ Ajouté')
        : quantiteAuPanier > 0
          ? `${t('ajouter')} (${quantiteAuPanier})`
          : t('ajouter')}
    </button>
  )
}
