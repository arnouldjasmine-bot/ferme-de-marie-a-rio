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

function joursDepuisLivraison(c: Commande): number {
  const dateRef = c.livree_at
    ? new Date(c.livree_at)
    : new Date(new Date(c.created_at).getTime() + 5 * 24 * 60 * 60 * 1000)
  return Math.floor((Date.now() - dateRef.getTime()) / (1000 * 60 * 60 * 24))
}


export const dynamic = 'force-dynamic'

export default async function PageRelances() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('statut', 'livree')
    .eq('paiement_statut', 'en_attente')
    .order('created_at', { ascending: false })

  const toutes: Commande[] = data ?? []
  const relances = toutes.filter(c => joursDepuisLivraison(c) > 7)
  const enAttente = toutes.filter(c => joursDepuisLivraison(c) <= 7)

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

      {relances.length === 0 && enAttente.length === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p className="text-2xl mb-2">🎉</p>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Tous les paiements sont à jour !</p>
        </div>
      )}

      {/* En retard > 7 jours */}
      {relances.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: '#D27D56' }}>
            ⚠️ En retard — plus d'une semaine ({relances.length})
          </p>
          <div className="flex flex-col gap-3">
            {relances.map(c => (
              <CarteRelance key={c.id} c={c} retard />
            ))}
          </div>
        </div>
      )}

      {/* En attente récents */}
      {enAttente.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            Livrées récemment — paiement en attente ({enAttente.length})
          </p>
          <div className="flex flex-col gap-3">
            {enAttente.map(c => (
              <CarteRelance key={c.id} c={c} retard={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CarteRelance({ c, retard }: { c: Commande; retard: boolean }) {
  const jours = joursDepuisLivraison(c)

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: retard ? '#f5c6b8' : 'var(--couleur-fond-carte)',
        boxShadow: 'var(--ombre-carte)',
        border: retard ? '2px solid #C0522A' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link href={`/commandes/${c.id}`} className="font-bold text-sm hover:underline" style={{ color: 'var(--couleur-primaire-fonce)' }}>
            {c.prenom} {c.nom}
          </Link>
          <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            {jours} jour{jours > 1 ? 's' : ''} depuis la livraison
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
