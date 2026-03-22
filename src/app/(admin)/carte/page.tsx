import { readFile } from 'fs/promises'
import path from 'path'
import CarteLivraisons from '@/components/admin/CarteLivraisons'

type Commande = {
  id: string
  prenom: string
  nom: string
  adresse: string
  total: number
  statut: string
  createdAt: string
}

async function geocoder(adresse: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(adresse + ', Rio de Janeiro, Brasil')}&key=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data.status === 'OK' && data.results[0]) {
      return data.results[0].geometry.location
    }
  } catch { /* silencieux */ }
  return null
}

async function getCommandesSemaine(): Promise<Commande[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), 'data', 'commandes.json'), 'utf-8')
    const toutes: Commande[] = JSON.parse(raw)
    // Commandes de la semaine à venir (7 prochains jours) + aujourd'hui
    const maintenant = new Date()
    const dans7jours = new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000)
    return toutes.filter(c => {
      const d = new Date(c.createdAt)
      return d >= maintenant || c.statut !== 'livree'
    }).slice(0, 50) // max 50 marqueurs
  } catch {
    return []
  }
}

export default async function PageAdminCarte() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  const commandes = await getCommandesSemaine()

  // Géocodage server-side (uniquement si clé API dispo)
  const livraisons = apiKey
    ? await Promise.all(
        commandes.map(async c => {
          const coords = await geocoder(c.adresse, apiKey)
          return coords ? { ...c, ...coords } : null
        })
      ).then(r => r.filter(Boolean) as (Commande & { lat: number; lng: number })[])
    : []

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair, Georgia)' }}>
          Carte des livraisons
        </h1>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#D27D56' }} />
            En attente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#4A5D4E' }} />
            Confirmée
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#93A27D' }} />
            Livrée
          </span>
        </div>
      </div>

      {!apiKey ? (
        /* Placeholder quand pas de clé API */
        <div className="rounded-2xl flex flex-col items-center justify-center gap-4 p-12 text-center"
          style={{ height: '560px', backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)', border: '2px dashed var(--couleur-bordure)' }}>
          <div className="text-5xl">🗺️</div>
          <div>
            <p className="font-bold text-lg mb-1" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair, Georgia)' }}>
              Carte des livraisons — Rio de Janeiro Sud
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
              Barra da Tijuca · Recreio · Zona Sul
            </p>
            <div className="inline-block rounded-xl px-5 py-3 text-sm text-left" style={{ backgroundColor: '#f4f7f4', color: 'var(--couleur-texte)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--vert-sauge-fonce)' }}>Pour activer la carte :</p>
              <p>1. Créez une clé sur <strong>Google Cloud Console</strong></p>
              <p>2. Activez <strong>Maps JavaScript API</strong> + <strong>Geocoding API</strong></p>
              <p>3. Ajoutez dans <code className="bg-white px-1 rounded">.env.local</code> :</p>
              <code className="block mt-1 text-xs bg-white px-2 py-1 rounded" style={{ color: 'var(--terracotta)' }}>
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé
              </code>
            </div>
          </div>
          {commandes.length > 0 && (
            <p className="text-sm" style={{ color: 'var(--vert-olive)' }}>
              ✓ {commandes.length} commande{commandes.length > 1 ? 's' : ''} prête{commandes.length > 1 ? 's' : ''} à afficher sur la carte
            </p>
          )}
        </div>
      ) : (
        <div style={{ height: '560px' }}>
          <CarteLivraisons livraisons={livraisons} apiKey={apiKey} />
        </div>
      )}

      {/* Liste des adresses */}
      {commandes.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair, Georgia)' }}>
            Adresses de livraison ({commandes.length})
          </p>
          <div className="flex flex-col gap-2">
            {commandes.map(c => (
              <div key={c.id} className="flex items-center gap-3 text-sm py-1.5" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.statut === 'en_attente' ? '#D27D56' : c.statut === 'confirmee' ? '#4A5D4E' : '#93A27D' }} />
                <span className="font-medium shrink-0" style={{ color: 'var(--vert-sauge-fonce)' }}>{c.prenom} {c.nom}</span>
                <span className="flex-1 truncate" style={{ color: 'var(--couleur-texte-doux)' }}>{c.adresse}</span>
                <span className="font-semibold shrink-0" style={{ color: 'var(--vert-sauge-fonce)' }}>R$ {c.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
