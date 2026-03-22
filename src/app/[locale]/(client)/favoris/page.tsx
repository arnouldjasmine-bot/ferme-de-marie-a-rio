'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/client/AuthProvider'
import { usePanier } from '@/lib/panier-context'
import type { Produit } from '@/types'

type FavoriRecord = {
  id: string
  product_id: string
  products: Produit
}

export default function PageFavoris() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'
  const router = useRouter()
  const { user } = useAuth()
  const { ajouterAuPanier } = usePanier()

  const [favoris, setFavoris]     = useState<FavoriRecord[]>([])
  const [chargement, setChargement] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/compte/connexion`)
      return
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function charger() {
    setChargement(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setChargement(false); return }

    const res = await fetch('/api/favoris', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const data = await res.json() as FavoriRecord[]
      setFavoris(data)
    }
    setChargement(false)
  }

  async function supprimer(productId: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(`/api/favoris?product_id=${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    setFavoris(prev => prev.filter(f => f.product_id !== productId))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre, var(--font-playfair))' }}>
        {pt ? 'Meus favoritos' : 'Mes favoris'}
      </h1>

      {chargement && (
        <div className="py-12 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>…</div>
      )}

      {!chargement && favoris.length === 0 && (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
            {pt ? 'Nenhum favorito ainda.' : 'Aucun favori pour l\'instant.'}
          </p>
          <Link
            href={`/${locale}/produits`}
            className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: 'var(--vert-sauge)' }}
          >
            {pt ? 'Ver produtos' : 'Voir les produits'}
          </Link>
        </div>
      )}

      {!chargement && favoris.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoris.map(f => {
            const p = f.products
            return (
              <div key={f.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
                <div className="relative" style={{ height: 140, backgroundColor: 'var(--couleur-accent)' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                  }
                  <button
                    onClick={() => supprimer(f.product_id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                    title={pt ? 'Remover dos favoritos' : 'Retirer des favoris'}
                  >
                    ❤️
                  </button>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm" style={{ color: 'var(--couleur-texte)' }}>{p.nom}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: 'var(--vert-sauge-fonce)' }}>
                    R$ {p.prix.toFixed(2)} <span className="text-xs font-normal" style={{ color: 'var(--couleur-texte-doux)' }}>/ {p.unite}</span>
                  </p>
                  {p.stock > 0 && p.actif ? (
                    <button
                      onClick={() => ajouterAuPanier(p)}
                      className="mt-3 w-full py-2 rounded-full text-white text-xs font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: 'var(--vert-sauge)' }}
                    >
                      {pt ? 'Adicionar ao carrinho' : 'Ajouter au panier'}
                    </button>
                  ) : (
                    <p className="mt-3 text-xs text-center" style={{ color: 'var(--couleur-texte-doux)' }}>
                      {pt ? 'Esgotado' : 'Épuisé'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
