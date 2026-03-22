// Types TypeScript globaux — Ferme de Marie à Rio

export type Statut = 'en_attente' | 'confirmee' | 'livree' | 'annulee'

export type Categorie = 'fruits' | 'legumes' | 'confiture' | 'produits_laitiers'

export const CATEGORIES: { value: Categorie; labelFr: string; labelPt: string }[] = [
  { value: 'fruits',           labelFr: 'Fruits',            labelPt: 'Frutas' },
  { value: 'legumes',          labelFr: 'Légumes',           labelPt: 'Verduras' },
  { value: 'confiture',        labelFr: 'Confitures',        labelPt: 'Geleias' },
  { value: 'produits_laitiers',labelFr: 'Produits laitiers', labelPt: 'Laticínios' },
]

export interface Produit {
  id: string
  nom: string
  description: string | null
  prix: number
  unite: string
  stock: number
  categorie: Categorie | null
  image_url: string | null
  actif: boolean
  created_at: string
}

export interface Commande {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  adresse: string
  statut: Statut
  total: number
  stripe_session_id: string | null
  created_at: string
  order_items?: LigneCommande[]
}

export interface LigneCommande {
  id: string
  order_id: string
  product_id: string
  quantite: number
  prix_unitaire: number
  produit?: Produit
}

export interface ArticlePanier {
  produit: Produit
  quantite: number
}
