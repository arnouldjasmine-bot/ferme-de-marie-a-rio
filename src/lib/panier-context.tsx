'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { ArticlePanier, Produit } from '@/types'

interface PanierContextType {
  articles: ArticlePanier[]
  totalArticles: number
  totalPrix: number
  ajouterAuPanier: (produit: Produit) => void
  retirerDuPanier: (produitId: string) => void
  modifierQuantite: (produitId: string, quantite: number) => void
  viderPanier: () => void
}

const PanierContext = createContext<PanierContextType | null>(null)

export function PanierProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<ArticlePanier[]>([])

  const ajouterAuPanier = useCallback((produit: Produit) => {
    setArticles(prev => {
      const existant = prev.find(a => a.produit.id === produit.id)
      if (existant) {
        return prev.map(a =>
          a.produit.id === produit.id
            ? { ...a, quantite: Math.min(a.quantite + 1, produit.stock) }
            : a
        )
      }
      return [...prev, { produit, quantite: 1 }]
    })
  }, [])

  const retirerDuPanier = useCallback((produitId: string) => {
    setArticles(prev => prev.filter(a => a.produit.id !== produitId))
  }, [])

  const modifierQuantite = useCallback((produitId: string, quantite: number) => {
    if (quantite <= 0) {
      setArticles(prev => prev.filter(a => a.produit.id !== produitId))
    } else {
      setArticles(prev =>
        prev.map(a => a.produit.id === produitId ? { ...a, quantite } : a)
      )
    }
  }, [])

  const viderPanier = useCallback(() => setArticles([]), [])

  const totalArticles = articles.reduce((s, a) => s + a.quantite, 0)
  const totalPrix = articles.reduce((s, a) => s + a.produit.prix * a.quantite, 0)

  return (
    <PanierContext.Provider value={{ articles, totalArticles, totalPrix, ajouterAuPanier, retirerDuPanier, modifierQuantite, viderPanier }}>
      {children}
    </PanierContext.Provider>
  )
}

export function usePanier() {
  const ctx = useContext(PanierContext)
  if (!ctx) throw new Error('usePanier doit être utilisé dans PanierProvider')
  return ctx
}
