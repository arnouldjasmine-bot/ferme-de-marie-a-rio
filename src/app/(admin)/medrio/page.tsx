import { createServiceClient } from '@/lib/supabase/service'
import BoutonsStatut from '@/components/admin/BoutonsStatut'
import BoutonLienPaiement from '@/components/admin/BoutonLienPaiement'
import ComprovanteViewer from '@/components/admin/ComprovanteViewer'
import Link from 'next/link'

type Article = { nom: string; quantite: number; prix: number; unite?: string }
type Commande = {
  id: string
  adresse: string
  adresse2: string | null
  total: number
  articles: Article[]
  comprovante_url: string | null
  statut: 'en_attente' | 'confirmee' | 'livree'
  paiement_statut: 'en_attente' | 'payee'
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

export default async function PageMedRio() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('is_medrio', true)
    .order('created_at', { ascending: false })

  const raw: Commande[] = data ?? []
  const actives = raw.filter(c => !(c.statut === 'livree' && estPayee(c)))
  const archivees = raw.filter(c => c.statut === 'livree' && estPayee(c))

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
          >
            🏥 MedRio
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            Commandes grossiste — 📞 024 98166 8526
          </p>
        </div>
        <Link
          href="/medrio/nouvelle"
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
        >
          + Nouvelle commande
        </Link>
      </div>

      {raw.length === 0 && (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
        >
          <p className="text-2xl mb-3">🏥</p>
          <p className="font-medium mb-1" style={{ color: 'var(--couleur-primaire-fonce)' }}>
            Aucune commande MedRio
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
            Créez la première commande grossiste
          </p>
          <Link
            href="/medrio/nouvelle"
            className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
          >
            + Nouvelle commande
          </Link>
        </div>
      )}

      {/* Commandes actives */}
      <div className="flex flex-col gap-3">
        {actives.map(c => (
          <CarteCommandeMedRio key={c.id} c={c} archivee={false} />
        ))}
      </div>

      {/* Archives */}
      {archivees.length > 0 && (
        <div className="mt-8">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
            style={{ color: 'var(--couleur-texte-doux)' }}
          >
            Archives — livrées & payées ({archivees.length})
          </p>
          <div className="flex flex-col gap-3">
            {archivees.map(c => (
              <CarteCommandeMedRio key={c.id} c={c} archivee />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CarteCommandeMedRio({ c, archivee }: { c: Commande; archivee: boolean }) {
  const payee = estPayee(c)
  const bgCard = archivee ? '#d4e8d4' : 'var(--couleur-fond-carte)'
  const borderCard = archivee ? '2px solid #4A5D4E' : 'none'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: bgCard, boxShadow: archivee ? 'none' : 'var(--ombre-carte)', border: borderCard }}
    >
      {/* En-tête */}
      <Link
        href={`/commandes/${c.id}`}
        className="flex items-start justify-between px-4 py-3 gap-2 hover:opacity-80 transition-opacity"
        style={{ borderBottom: '1px solid var(--couleur-bordure)' }}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: 'var(--couleur-primaire-fonce)' }}>
              🏥 MedRio
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white shrink-0"
              style={{ backgroundColor: STATUT_COLORS[c.statut] }}
            >
              {STATUT_LABELS[c.statut]}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: payee ? '#eef3ee' : '#fdf0ec',
                color: payee ? '#4A5D4E' : '#D27D56',
              }}
            >
              {payee ? '✓ Payée' : '⏳ Paiement en attente'}
            </span>
          </div>
          <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            {' · '}🇧🇷
          </p>
        </div>
        <p className="font-bold text-sm shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
          R$ {c.total.toFixed(2)} →
        </p>
      </Link>

      {/* Détails */}
      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            Livraison
          </p>
          <p className="text-xs" style={{ color: 'var(--couleur-texte)' }}>📍 {c.adresse}</p>
          {c.adresse2 && (
            <p className="text-xs mt-1" style={{ color: 'var(--couleur-texte)' }}>📍 {c.adresse2}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            Articles
          </p>
          {(c.articles ?? []).map((a, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--couleur-texte)' }}>
              {a.nom} × {a.quantite} — R$ {(a.prix * a.quantite).toFixed(2)}
            </p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 pt-1 flex flex-col gap-2">
        {c.comprovante_url && <ComprovanteViewer url={c.comprovante_url} />}
        <div className="flex flex-wrap items-center gap-2">
          <BoutonsStatut id={c.id} statut={c.statut} />
          <BoutonLienPaiement id={c.id} telephone="02498166 8526" locale="pt-BR" />
        </div>
      </div>
    </div>
  )
}
