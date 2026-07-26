import CarteLivraisons from '@/components/admin/CarteLivraisons'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

type Commande = {
  id: string
  prenom: string
  nom: string
  adresse: string
  total: number
  statut: string
  created_at: string
}

function attendre(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Nominatim (OpenStreetMap) : gratuit, sans clé, mais limité à ~1 requête/seconde
// et exige un User-Agent identifiant l'application.
async function geocoder(adresse: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(adresse + ', Rio de Janeiro, Brasil')}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LaFermeDeMarie-Admin/1.0' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    if (Array.isArray(data) && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch { /* silencieux */ }
  return null
}

async function geocoderAdresses(adresses: string[]): Promise<Map<string, { lat: number; lng: number }>> {
  const resultats = new Map<string, { lat: number; lng: number }>()
  for (const adresse of adresses) {
    const coords = await geocoder(adresse)
    if (coords) resultats.set(adresse, coords)
    await attendre(1100) // respecte la politique d'usage Nominatim (1 requête/s max)
  }
  return resultats
}

async function getCommandesSemaine(): Promise<Commande[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('id, prenom, nom, adresse, total, statut, created_at')
    .neq('statut', 'livree')
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}

export default async function PageAdminCarte() {
  const commandes = await getCommandesSemaine()

  // Géocodage server-side : une requête par adresse unique (Nominatim limite à 1 req/s)
  const adressesUniques = Array.from(new Set(commandes.map(c => c.adresse)))
  const coordsParAdresse = await geocoderAdresses(adressesUniques)
  const livraisons = commandes
    .map(c => {
      const coords = coordsParAdresse.get(c.adresse)
      return coords ? { ...c, ...coords } : null
    })
    .filter(Boolean) as (Commande & { lat: number; lng: number })[]

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

      <div style={{ height: '560px' }}>
        <CarteLivraisons livraisons={livraisons} />
      </div>

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
                <span className="font-medium shrink-0" style={{ color: 'var(--vert-sauge-fonce)' }}>{c.prenom} {c.nom ?? ''}</span>
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
