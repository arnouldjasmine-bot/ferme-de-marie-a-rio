import ComprovanteViewer from '@/components/admin/ComprovanteViewer'
import BoutonsStatut from '@/components/admin/BoutonsStatut'
import BoutonLienPaiement from '@/components/admin/BoutonLienPaiement'
import BoutonPaiementStatut from '@/components/admin/BoutonPaiementStatut'
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
  comprovante_url: string | null
  statut: 'en_attente' | 'confirmee' | 'livree'
  paiement_statut: 'en_attente' | 'payee'
  livree_at: string | null
  mode_livraison: string
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

function estEnRetard(c: Commande): boolean {
  if (c.statut !== 'livree' || c.paiement_statut !== 'en_attente') return false
  const dateRef = c.livree_at
    ? new Date(c.livree_at)
    : new Date(new Date(c.created_at).getTime() + 5 * 24 * 60 * 60 * 1000)
  const jours = (Date.now() - dateRef.getTime()) / (1000 * 60 * 60 * 24)
  return jours > 7
}

export const dynamic = 'force-dynamic'

export default async function PageCommandes() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  const raw: Commande[] = data ?? []

  const actives = raw.filter(c => !(c.statut === 'livree' && c.paiement_statut === 'payee'))
  const archivees = raw.filter(c => c.statut === 'livree' && c.paiement_statut === 'payee')
  const nbRetard = actives.filter(estEnRetard).length

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Commandes ({raw.length})
        </h1>
        <div className="flex items-center gap-2">
          {nbRetard > 0 && (
            <Link
              href="/commandes/relances"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--terracotta)' }}
            >
              ⚠️ {nbRetard} relance{nbRetard > 1 ? 's' : ''} à faire
            </Link>
          )}
        </div>
      </div>

      {raw.length === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Aucune commande pour le moment.</p>
        </div>
      )}

      {/* Commandes actives */}
      <div className="flex flex-col gap-3">
        {actives.map(c => {
          const retard = estEnRetard(c)
          const archivee = false
          return <CarteCommande key={c.id} c={c} retard={retard} archivee={archivee} />
        })}
      </div>

      {/* Commandes archivées */}
      {archivees.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            Archives — livrées & payées ({archivees.length})
          </p>
          <div className="flex flex-col gap-3">
            {archivees.map(c => (
              <CarteCommande key={c.id} c={c} retard={false} archivee />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CarteCommande({ c, retard, archivee }: { c: Commande; retard: boolean; archivee: boolean }) {
  const bgCard = archivee
    ? '#f0f4f0'
    : retard
    ? '#fdf0ec'
    : 'var(--couleur-fond-carte)'

  const borderCard = retard ? '1.5px solid #D27D56' : 'none'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: bgCard, boxShadow: archivee ? 'none' : 'var(--ombre-carte)', border: borderCard, opacity: archivee ? 0.75 : 1 }}
    >
      {/* En-tête cliquable */}
      <Link
        href={`/commandes/${c.id}`}
        className="flex items-start justify-between px-4 py-3 gap-2 hover:opacity-80 transition-opacity"
        style={{ borderBottom: '1px solid var(--couleur-bordure)' }}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: 'var(--couleur-primaire-fonce)' }}>
              {c.prenom} {c.nom}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: STATUT_COLORS[c.statut] }}>
              {STATUT_LABELS[c.statut]}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: c.paiement_statut === 'payee' ? '#eef3ee' : '#fdf0ec',
                color: c.paiement_statut === 'payee' ? '#4A5D4E' : '#D27D56',
              }}
            >
              {c.paiement_statut === 'payee' ? '✓ Payée' : '⏳ Paiement en attente'}
            </span>
            {retard && (
              <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold text-white" style={{ backgroundColor: '#D27D56' }}>
                ⚠️ Relance
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>
            {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            {' · '}
            {c.mode_livraison === 'retrait' ? '🏡 Retrait' : '🛵 Livraison'}
          </p>
        </div>
        <p className="font-bold text-sm shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
          R$ {c.total.toFixed(2)} →
        </p>
      </Link>

      {/* Détails desktop uniquement */}
      <div className="hidden md:grid px-4 py-3 grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>Contact</p>
          <p className="text-xs" style={{ color: 'var(--couleur-texte)' }}>📧 {c.email}</p>
          <p className="text-xs" style={{ color: 'var(--couleur-texte)' }}>📞 {c.telephone}</p>
          <p className="text-xs" style={{ color: 'var(--couleur-texte)' }}>📍 {c.adresse}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>Articles</p>
          {(c.articles ?? []).map((a, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--couleur-texte)' }}>
              {a.nom} × {a.quantite} — R$ {(a.prix * a.quantite).toFixed(2)}
            </p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 pt-2 flex flex-col gap-2">
        {c.comprovante_url && <ComprovanteViewer url={c.comprovante_url} />}
        <div className="flex flex-wrap items-center gap-2">
          <BoutonsStatut id={c.id} statut={c.statut} />
          <BoutonPaiementStatut id={c.id} paiement_statut={c.paiement_statut ?? 'en_attente'} />
          <BoutonLienPaiement id={c.id} />
        </div>
      </div>
    </div>
  )
}
