'use client'

import dynamic from 'next/dynamic'

type Livraison = {
  id: string
  prenom: string
  nom: string
  adresse: string
  total: number
  statut: string
  created_at: string
  lat: number
  lng: number
}

// Leaflet manipule le DOM directement : chargement client uniquement (pas de SSR)
const CarteLeaflet = dynamic(() => import('./CarteLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full rounded-2xl" style={{ backgroundColor: '#f4f7f4' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: 'var(--vert-sauge)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement de la carte…</p>
      </div>
    </div>
  ),
})

export default function CarteLivraisons({ livraisons }: { livraisons: Livraison[] }) {
  return <CarteLeaflet livraisons={livraisons} />
}
