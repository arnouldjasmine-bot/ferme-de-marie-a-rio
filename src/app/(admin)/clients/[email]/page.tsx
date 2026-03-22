import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

type Article = { nom: string; quantite: number; prix: number }
type Commande = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  adresse: string
  total: number
  articles: Article[]
  statut: 'en_attente' | 'confirmee' | 'livree'
  comprovante_url: string | null
  paiement_statut: string
  mode_livraison: string
  frais_livraison: number
  locale: string
  created_at: string
}

const STATUT_LABELS: Record<Commande['statut'], string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  livree: 'Livrée',
}
const STATUT_COLORS: Record<Commande['statut'], string> = {
  en_attente: '#D27D56',
  confirmee: '#4A5D4E',
  livree: '#93A27D',
}

function estPayee(c: Commande) {
  return c.paiement_statut === 'payee' || c.comprovante_url !== null
}

export const dynamic = 'force-dynamic'

export default async function PageClient({ params }: { params: Promise<{ email: string }> }) {
  const { email: emailParam } = await params
  const email = decodeURIComponent(emailParam)

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('email', email)
    .eq('is_medrio', false)
    .order('created_at', { ascending: false })

  const commandes: Commande[] = data ?? []

  if (commandes.length === 0) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--couleur-texte-doux)' }}>Client introuvable.</p>
        <Link href="/clients" className="text-sm underline mt-2 block" style={{ color: 'var(--couleur-texte-doux)' }}>← Retour</Link>
      </div>
    )
  }

  const client = commandes[0]
  const totalDepense = commandes.reduce((s, c) => s + (c.total ?? 0), 0)
  const nbPayees = commandes.filter(estPayee).length
  const produitsCounts: Record<string, number> = {}
  for (const c of commandes) {
    for (const a of c.articles ?? []) {
      produitsCounts[a.nom] = (produitsCounts[a.nom] ?? 0) + a.quantite
    }
  }
  const topProduits = Object.entries(produitsCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Retour */}
      <Link href="/clients" className="text-sm transition-opacity hover:opacity-70 mb-4 inline-block" style={{ color: 'var(--couleur-texte-doux)' }}>
        ← Clients fidèles
      </Link>

      {/* En-tête client */}
      <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
              {client.prenom} {client.nom}
              <span className="ml-2 text-base">{client.locale === 'pt-BR' ? '🇧🇷' : '🇫🇷'}</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>📧 {email}</p>
            {client.telephone && (
              <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>📞 {client.telephone}</p>
            )}
            {client.adresse && (
              <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>📍 {client.adresse}</p>
            )}
          </div>

          {/* KPIs */}
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: 'var(--couleur-fond)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>{commandes.length}</p>
              <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>commandes</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: 'var(--couleur-fond)' }}>
              <p className="text-xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {totalDepense.toFixed(2)}</p>
              <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>total dépensé</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: 'var(--couleur-fond)' }}>
              <p className="text-2xl font-bold" style={{ color: '#4A5D4E' }}>{nbPayees}</p>
              <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>payées</p>
            </div>
          </div>
        </div>

        {/* Top produits */}
        {topProduits.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--couleur-bordure)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--couleur-texte-doux)' }}>
              Produits préférés
            </p>
            <div className="flex flex-wrap gap-2">
              {topProduits.map(([nom, qte]) => (
                <span key={nom} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#eef3ee', color: '#4A5D4E' }}>
                  {nom} × {qte}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Liste des commandes */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
        Historique des commandes
      </p>
      <div className="flex flex-col gap-3">
        {commandes.map(c => (
          <Link
            key={c.id}
            href={`/commandes/${c.id}`}
            className="rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: estPayee(c) && c.statut === 'livree' ? '#d4e8d4' : 'var(--couleur-fond-carte)',
              boxShadow: 'var(--ombre-carte)',
              display: 'block',
            }}
          >
            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                {/* Statuts */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: STATUT_COLORS[c.statut] }}>
                    {STATUT_LABELS[c.statut]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: estPayee(c) ? '#eef3ee' : '#fdf0ec',
                      color: estPayee(c) ? '#4A5D4E' : '#D27D56',
                    }}>
                    {estPayee(c) ? '✓ Payée' : '⏳ En attente'}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: 'var(--couleur-texte-doux)' }}>
                    {c.mode_livraison === 'retrait' ? '🏡 Retrait' : '🛵 Livraison'}
                  </span>
                </div>

                {/* Date */}
                <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                {/* Articles */}
                <div className="mt-1 flex flex-col gap-0.5">
                  {(c.articles ?? []).map((a, i) => (
                    <p key={i} className="text-xs" style={{ color: 'var(--couleur-texte)' }}>
                      {a.nom} × {a.quantite}
                    </p>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="text-right shrink-0">
                <p className="font-bold text-sm" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                  R$ {c.total.toFixed(2)}
                </p>
                {c.frais_livraison > 0 && (
                  <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>
                    dont R$ {c.frais_livraison.toFixed(2)} livraison
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--vert-sauge-fonce)' }}>Voir →</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
