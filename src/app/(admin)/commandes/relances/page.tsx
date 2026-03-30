import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'
import BoutonRelanceIndividuel from '@/components/admin/BoutonRelanceIndividuel'

type Commande = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  total: number
  statut: string
  paiement_statut: string
  livree_at: string | null
  locale: string
  user_id: string | null
  created_at: string
}

function joursSansRegler(c: Commande): number {
  const dateRef = c.livree_at
    ? new Date(c.livree_at)
    : new Date(c.created_at)
  return Math.floor((Date.now() - dateRef.getTime()) / (1000 * 60 * 60 * 24))
}


export const dynamic = 'force-dynamic'

export default async function PageRelances() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .in('statut', ['confirmee', 'livree'])
    .eq('paiement_statut', 'en_attente')
    .eq('is_medrio', false)
    .order('created_at', { ascending: false })

  const toutes: Commande[] = data ?? []

  // Livrées (non payées) — priorité absolue, compteur depuis livree_at
  const livreesNonPayees = toutes
    .filter(c => c.statut === 'livree')
    .sort((a, b) => joursSansRegler(b) - joursSansRegler(a))

  // Confirmées en retard > 3 jours
  const confirmeesRetard = toutes
    .filter(c => c.statut === 'confirmee' && joursSansRegler(c) > 3)
    .sort((a, b) => joursSansRegler(b) - joursSansRegler(a))

  // Confirmées récentes ≤ 3 jours
  const confirmeesRecentes = toutes
    .filter(c => c.statut === 'confirmee' && joursSansRegler(c) <= 3)

  const total = toutes.length

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/commandes" className="text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--couleur-texte-doux)' }}>
          ← Commandes
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Paiements à relancer
        </h1>
      </div>

      {total === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p className="text-2xl mb-2">🎉</p>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Tous les paiements sont à jour !</p>
        </div>
      )}

      {/* 🔴 PRIORITÉ — Livrées non payées */}
      {livreesNonPayees.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: '#B91C1C' }}>
            🔴 Livrées non payées — urgent ({livreesNonPayees.length})
          </p>
          <div className="flex flex-col gap-3">
            {livreesNonPayees.map(c => (
              <CarteRelance key={c.id} c={c} priorite="urgente" />
            ))}
          </div>
        </div>
      )}

      {/* 🟠 Confirmées en retard > 3 jours */}
      {confirmeesRetard.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: '#D27D56' }}>
            ⚠️ À relancer — plus de 3 jours sans paiement ({confirmeesRetard.length})
          </p>
          <div className="flex flex-col gap-3">
            {confirmeesRetard.map(c => (
              <CarteRelance key={c.id} c={c} priorite="retard" />
            ))}
          </div>
        </div>
      )}

      {/* Confirmées récentes */}
      {confirmeesRecentes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            Récentes — paiement en attente ({confirmeesRecentes.length})
          </p>
          <div className="flex flex-col gap-3">
            {confirmeesRecentes.map(c => (
              <CarteRelance key={c.id} c={c} priorite="normale" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type Priorite = 'urgente' | 'retard' | 'normale'

function CarteRelance({ c, priorite }: { c: Commande; priorite: Priorite }) {
  const jours = joursSansRegler(c)

  const styles: Record<Priorite, { bg: string; border: string; badge: string }> = {
    urgente: { bg: '#fee2e2', border: '2px solid #B91C1C', badge: '#B91C1C' },
    retard:  { bg: '#f5c6b8', border: '2px solid #C0522A', badge: '#C0522A' },
    normale: { bg: 'var(--couleur-fond-carte)', border: 'none', badge: 'var(--couleur-texte-doux)' },
  }
  const s = styles[priorite]

  const labelJours = c.statut === 'livree'
    ? `${jours} jour${jours > 1 ? 's' : ''} depuis la livraison`
    : `${jours} jour${jours > 1 ? 's' : ''} sans paiement`

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: s.bg, boxShadow: 'var(--ombre-carte)', border: s.border }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link href={`/commandes/${c.id}`} className="font-bold text-sm hover:underline" style={{ color: 'var(--couleur-primaire-fonce)' }}>
            {c.prenom} {c.nom}
          </Link>
          <p className="text-xs mt-0.5 font-medium" style={{ color: s.badge }}>
            {labelJours} · {c.statut === 'livree' ? '✅ Livrée' : 'Confirmée'}
          </p>
        </div>
        <p className="font-bold text-sm shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
          R$ {c.total.toFixed(2)}
        </p>
      </div>

      <p className="text-xs mb-3" style={{ color: 'var(--couleur-texte)' }}>
        📞 {c.telephone} · 📧 {c.email}
      </p>

      <BoutonRelanceIndividuel
        commandeId={c.id}
        userId={c.user_id}
        telephone={c.telephone}
        prenom={c.prenom}
        total={c.total}
        locale={c.locale}
      />
    </div>
  )
}
