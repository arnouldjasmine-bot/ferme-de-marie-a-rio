import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

type Article = { nom: string; quantite: number; prix: number; id?: string }
type Order   = { id: string; total: number; statut: string; created_at: string; articles: Article[] }

function debutSemaine(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function debutMois(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function semainePrecedente(date: Date): Date {
  const d = debutSemaine(date)
  d.setDate(d.getDate() - 7)
  return d
}

function moisPrecedent(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: '#D27D56',
  confirmee:  '#4A5D4E',
  livree:     '#93A27D',
  annulee:    '#bbb',
}
const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirmee:  'Confirmée',
  livree:     'Livrée',
  annulee:    'Annulée',
}

export default async function PageStatistiques() {
  const supabase = createServiceClient()
  const now = new Date()

  const debutS   = debutSemaine(now)
  const debutM   = debutMois(now)
  const debutSP  = semainePrecedente(now)
  const finSP    = debutS
  const debutMP  = moisPrecedent(now)

  // 8 semaines de données pour le graphe
  const il_y_a_8_semaines = new Date(debutS)
  il_y_a_8_semaines.setDate(il_y_a_8_semaines.getDate() - 49)

  const { data: toutesCommandes } = await supabase
    .from('orders')
    .select('id, total, statut, created_at, articles')
    .gte('created_at', il_y_a_8_semaines.toISOString())
    .order('created_at', { ascending: true })

  const commandes: Order[] = (toutesCommandes ?? []).map(c => ({
    ...c,
    articles: Array.isArray(c.articles) ? c.articles : [],
  }))

  // Filtres de base (exclure annulées pour CA)
  const actives = commandes.filter(c => c.statut !== 'annulee')

  const caSemaine   = actives.filter(c => new Date(c.created_at) >= debutS).reduce((s, c) => s + c.total, 0)
  const caMois      = actives.filter(c => new Date(c.created_at) >= debutM).reduce((s, c) => s + c.total, 0)
  const caSemPrec   = actives.filter(c => { const d = new Date(c.created_at); return d >= debutSP && d < finSP }).reduce((s, c) => s + c.total, 0)
  const caMoisPrec  = actives.filter(c => { const d = new Date(c.created_at); return d >= debutMP && d < debutM }).reduce((s, c) => s + c.total, 0)

  const nbSemaine   = commandes.filter(c => new Date(c.created_at) >= debutS).length
  const nbMois      = commandes.filter(c => new Date(c.created_at) >= debutM).length
  const nbSemPrec   = commandes.filter(c => { const d = new Date(c.created_at); return d >= debutSP && d < finSP }).length
  const nbMoisPrec  = commandes.filter(c => { const d = new Date(c.created_at); return d >= debutMP && d < debutM }).length

  function pct(val: number, prev: number) {
    if (prev === 0) return val > 0 ? '+100%' : '—'
    const diff = ((val - prev) / prev) * 100
    return (diff >= 0 ? '+' : '') + diff.toFixed(0) + '%'
  }

  // Répartition par statut (toute la période)
  const parStatut: Record<string, number> = {}
  commandes.forEach(c => { parStatut[c.statut] = (parStatut[c.statut] ?? 0) + 1 })
  const totalStatut = commandes.length

  // Top produits (toute la période dans la fenêtre 8 semaines)
  const produitMap: Record<string, { quantite: number; ca: number }> = {}
  actives.forEach(c => {
    c.articles.forEach(a => {
      if (!produitMap[a.nom]) produitMap[a.nom] = { quantite: 0, ca: 0 }
      produitMap[a.nom].quantite += a.quantite
      produitMap[a.nom].ca += a.prix * a.quantite
    })
  })
  const topProduits = Object.entries(produitMap)
    .sort((a, b) => b[1].quantite - a[1].quantite)
    .slice(0, 7)
  const maxQte = topProduits[0]?.[1].quantite ?? 1

  // Évolution hebdomadaire (8 dernières semaines)
  const semaines: { label: string; ca: number; nb: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const debut = new Date(debutS)
    debut.setDate(debut.getDate() - i * 7)
    const fin = new Date(debut)
    fin.setDate(fin.getDate() + 7)
    const label = debut.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    const ca = actives
      .filter(c => { const d = new Date(c.created_at); return d >= debut && d < fin })
      .reduce((s, c) => s + c.total, 0)
    const nb = commandes.filter(c => { const d = new Date(c.created_at); return d >= debut && d < fin }).length
    semaines.push({ label, ca, nb })
  }
  const maxCA = Math.max(...semaines.map(s => s.ca), 1)

  return (
    <div>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
      >
        Statistiques
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          {
            label: 'CA cette semaine',
            valeur: `R$ ${caSemaine.toFixed(2)}`,
            comp: pct(caSemaine, caSemPrec),
            pos: caSemaine >= caSemPrec,
            icone: '💰',
          },
          {
            label: 'CA ce mois',
            valeur: `R$ ${caMois.toFixed(2)}`,
            comp: pct(caMois, caMoisPrec),
            pos: caMois >= caMoisPrec,
            icone: '📈',
          },
          {
            label: 'Commandes cette semaine',
            valeur: String(nbSemaine),
            comp: pct(nbSemaine, nbSemPrec),
            pos: nbSemaine >= nbSemPrec,
            icone: '📦',
          },
          {
            label: 'Commandes ce mois',
            valeur: String(nbMois),
            comp: pct(nbMois, nbMoisPrec),
            pos: nbMois >= nbMoisPrec,
            icone: '🗓️',
          },
        ].map(({ label, valeur, comp, pos, icone }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
          >
            <p className="text-lg mb-1">{icone}</p>
            <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>{label}</p>
            <p className="text-xl font-bold leading-tight" style={{ color: 'var(--couleur-primaire-fonce)' }}>{valeur}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: pos ? '#4A5D4E' : '#D27D56' }}>
              {comp} <span style={{ color: 'var(--couleur-texte-doux)', fontWeight: 400 }}>vs période préc.</span>
            </p>
          </div>
        ))}
      </div>

      {/* Graphe évolution CA */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
      >
        <p className="font-semibold text-sm mb-4" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          CA hebdomadaire (8 dernières semaines)
        </p>
        <div className="flex items-end gap-1.5" style={{ height: 100 }}>
          {semaines.map((s, i) => {
            const h = maxCA > 0 ? Math.max((s.ca / maxCA) * 100, s.ca > 0 ? 8 : 2) : 2
            const isCurrent = i === semaines.length - 1
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <p className="text-xs font-medium" style={{ color: 'var(--couleur-primaire-fonce)', fontSize: 9 }}>
                  {s.ca > 0 ? `R$${s.ca.toFixed(0)}` : ''}
                </p>
                <div
                  style={{
                    height: `${h}%`,
                    backgroundColor: isCurrent ? 'var(--couleur-primaire)' : 'var(--couleur-accent)',
                    borderRadius: '4px 4px 0 0',
                    width: '100%',
                    minHeight: 2,
                    border: isCurrent ? '1px solid var(--couleur-primaire-fonce)' : 'none',
                  }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex gap-1.5 mt-1">
          {semaines.map((s, i) => (
            <p
              key={i}
              className="flex-1 text-center"
              style={{ fontSize: 9, color: 'var(--couleur-texte-doux)' }}
            >
              {s.label}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top produits */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
        >
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
            Produits les plus vendus
          </p>
          {topProduits.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Aucune donnée</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topProduits.map(([nom, stats]) => (
                <div key={nom}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm truncate pr-2" style={{ color: 'var(--couleur-texte)', maxWidth: '70%' }}>{nom}</p>
                    <p className="text-xs font-semibold shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                      {stats.quantite} unité{stats.quantite > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 6, backgroundColor: 'var(--couleur-bordure)' }}>
                    <div
                      style={{
                        width: `${(stats.quantite / maxQte) * 100}%`,
                        height: '100%',
                        backgroundColor: 'var(--couleur-primaire)',
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition statuts */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
        >
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
            Répartition des commandes
          </p>
          {totalStatut === 0 ? (
            <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Aucune donnée</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(parStatut).map(([statut, nb]) => {
                const pctVal = Math.round((nb / totalStatut) * 100)
                return (
                  <div key={statut}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: STATUT_COLORS[statut] ?? '#ccc' }}
                        />
                        <p className="text-sm" style={{ color: 'var(--couleur-texte)' }}>
                          {STATUT_LABELS[statut] ?? statut}
                        </p>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                        {nb} ({pctVal}%)
                      </p>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 6, backgroundColor: 'var(--couleur-bordure)' }}>
                      <div
                        style={{
                          width: `${pctVal}%`,
                          height: '100%',
                          backgroundColor: STATUT_COLORS[statut] ?? '#ccc',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs mt-1" style={{ color: 'var(--couleur-texte-doux)' }}>
                Total : {totalStatut} commande{totalStatut > 1 ? 's' : ''} sur 8 semaines
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
