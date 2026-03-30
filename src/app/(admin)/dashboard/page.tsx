import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PageDashboard() {
  const supabase = createServiceClient()

  const aujourd = new Date()
  aujourd.setHours(0, 0, 0, 0)
  const debutSemaine = new Date(aujourd)
  debutSemaine.setDate(aujourd.getDate() - aujourd.getDay())
  const debutMois = new Date(aujourd.getFullYear(), aujourd.getMonth(), 1)

  const [
    { count: commandesAujourdhui },
    { data: commandesSemaine },
    { count: produitsActifs },
    { count: stockFaible },
    { data: dernieresCommandes },
    { data: toutesCommandes },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', aujourd.toISOString()),
    supabase.from('orders').select('total').gte('created_at', debutSemaine.toISOString()).neq('statut', 'annulee'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('actif', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('actif', true).lte('stock', 3).gt('stock', 0),
    supabase.from('orders').select('id, prenom, nom, total, statut, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('statut, total, paiement_statut, created_at').neq('statut', 'annulee'),
  ])

  const caSemaine = (commandesSemaine ?? []).reduce((s, c) => s + (c.total ?? 0), 0)

  const all = toutesCommandes ?? []
  const nbEnAttente  = all.filter(c => c.statut === 'en_attente').length
  const nbConfirmee  = all.filter(c => c.statut === 'confirmee').length
  const nbLivree     = all.filter(c => c.statut === 'livree').length
  const nbTotal      = all.length
  const nbNonPayees  = all.filter(c => c.paiement_statut === 'en_attente').length
  const caMois       = all
    .filter(c => new Date(c.created_at) >= debutMois)
    .reduce((s, c) => s + (c.total ?? 0), 0)
  const caTotal      = all.reduce((s, c) => s + (c.total ?? 0), 0)

  const STATUT_COLORS: Record<string, string> = {
    en_attente: '#D27D56',
    confirmee: '#4A5D4E',
    livree: '#93A27D',
  }
  const STATUT_LABELS: Record<string, string> = {
    en_attente: 'En attente',
    confirmee: 'Confirmée',
    livree: 'Livrée',
  }

  const stats = [
    { label: "Commandes aujourd'hui", valeur: String(commandesAujourdhui ?? 0), icone: '📦' },
    { label: 'CA cette semaine', valeur: `R$ ${caSemaine.toFixed(2)}`, icone: '💰' },
    { label: 'Produits actifs', valeur: String(produitsActifs ?? 0), icone: '🛒' },
    { label: 'Stock faible', valeur: String(stockFaible ?? 0), icone: '⚠️' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
        Tableau de bord
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map(({ label, valeur, icone }) => (
          <div
            key={label}
            className="rounded-xl p-4 md:p-5"
            style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)', borderRadius: 'var(--rayon-bordure-grand)' }}
          >
            <p className="text-xl mb-1">{icone}</p>
            <p className="text-xs md:text-sm mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>{label}</p>
            <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>{valeur}</p>
          </div>
        ))}
      </div>

      {/* Résumé global des commandes */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
            Résumé des commandes
          </p>
          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: 'var(--couleur-primaire)' }}>
            {nbTotal} au total
          </span>
        </div>

        {/* Statuts */}
        <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
          <div className="px-4 py-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>En attente</p>
            <p className="text-2xl font-bold" style={{ color: '#D27D56' }}>{nbEnAttente}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>Confirmées</p>
            <p className="text-2xl font-bold" style={{ color: '#4A5D4E' }}>{nbConfirmee}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>Livrées</p>
            <p className="text-2xl font-bold" style={{ color: '#93A27D' }}>{nbLivree}</p>
          </div>
        </div>

        {/* CA + non payées */}
        <div className="grid grid-cols-3 divide-x">
          <div className="px-4 py-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>Non payées</p>
            {nbNonPayees > 0
              ? <Link href="/commandes/relances" className="text-2xl font-bold hover:underline" style={{ color: '#B91C1C' }}>{nbNonPayees}</Link>
              : <p className="text-2xl font-bold" style={{ color: '#93A27D' }}>0</p>
            }
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>CA ce mois</p>
            <p className="text-lg font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {caMois.toFixed(0)}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>CA total</p>
            <p className="text-lg font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {caTotal.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Dernières commandes */}
      {(dernieresCommandes ?? []).length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
              Dernières commandes
            </p>
          </div>
          {(dernieresCommandes ?? []).map((c, i) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
              style={{ borderBottom: i < (dernieresCommandes?.length ?? 0) - 1 ? '1px solid var(--couleur-bordure)' : 'none' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUT_COLORS[c.statut] ?? '#ccc' }} />
                <span className="font-medium truncate" style={{ color: 'var(--couleur-texte)' }}>{c.prenom} {c.nom}</span>
                <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: STATUT_COLORS[c.statut] ?? '#ccc' }}>
                  {STATUT_LABELS[c.statut] ?? c.statut}
                </span>
              </div>
              <span className="font-bold shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {c.total.toFixed(2)}</span>
            </div>
          ))}
          <div className="px-5 py-3 text-center">
            <a href="/commandes" className="text-xs font-medium underline" style={{ color: 'var(--couleur-texte-doux)' }}>
              Voir toutes les commandes →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
