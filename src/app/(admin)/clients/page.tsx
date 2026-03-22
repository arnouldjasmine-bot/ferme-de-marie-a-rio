import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

type Article = { nom: string; quantite: number; prix: number }
type Commande = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  total: number
  articles: Article[]
  statut: string
  comprovante_url: string | null
  paiement_statut: string
  locale: string
  created_at: string
}

type ClientFidele = {
  email: string
  prenom: string
  nom: string
  telephone: string
  locale: string
  nbCommandes: number
  totalDepense: number
  derniereCommande: string
  commandes: Commande[]
}

function medaille(nb: number) {
  if (nb >= 10) return { emoji: '🥇', label: 'Client fidèle', color: '#C9A84C' }
  if (nb >= 6)  return { emoji: '🥈', label: 'Habitué',       color: '#8A9BA8' }
  return             { emoji: '🥉', label: 'Régulier',       color: '#A0785A' }
}

export const dynamic = 'force-dynamic'

export default async function PageClients() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('id, prenom, nom, email, telephone, total, articles, statut, comprovante_url, paiement_statut, locale, created_at')
    .eq('is_medrio', false)
    .order('created_at', { ascending: false })

  const raw: Commande[] = data ?? []

  // Grouper par email
  const map = new Map<string, Commande[]>()
  for (const c of raw) {
    if (!c.email) continue
    if (!map.has(c.email)) map.set(c.email, [])
    map.get(c.email)!.push(c)
  }

  // Filtrer >= 3 commandes et construire les profils
  const clients: ClientFidele[] = []
  for (const [email, cmds] of map.entries()) {
    if (cmds.length < 3) continue
    const derniere = cmds[0] // déjà trié par date desc
    clients.push({
      email,
      prenom: derniere.prenom,
      nom: derniere.nom,
      telephone: derniere.telephone,
      locale: derniere.locale,
      nbCommandes: cmds.length,
      totalDepense: cmds.reduce((s, c) => s + (c.total ?? 0), 0),
      derniereCommande: derniere.created_at,
      commandes: cmds,
    })
  }

  // Trier par nombre de commandes décroissant
  clients.sort((a, b) => b.nbCommandes - a.nbCommandes)

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
            Clients fidèles
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            {clients.length} client{clients.length > 1 ? 's' : ''} avec 3 commandes ou plus
          </p>
        </div>
      </div>

      {clients.length === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium mb-1" style={{ color: 'var(--couleur-primaire-fonce)' }}>Aucun client fidèle pour le moment</p>
          <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Les clients apparaissent ici dès leur 3ème commande.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map(client => {
          const m = medaille(client.nbCommandes)
          return (
            <Link
              key={client.email}
              href={`/clients/${encodeURIComponent(client.email)}`}
              className="rounded-xl overflow-hidden transition-transform hover:scale-[1.01] hover:shadow-lg"
              style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)', display: 'block' }}
            >
              {/* Bandeau couleur médaille */}
              <div className="h-1.5" style={{ backgroundColor: m.color }} />

              <div className="p-4">
                {/* Nom + médaille */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-base truncate" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                      {client.prenom} {client.nom}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
                      {client.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: m.color }}>{m.label}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--couleur-fond)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>{client.nbCommandes}</p>
                    <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>commandes</p>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--couleur-fond)' }}>
                    <p className="text-base font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                      R${client.totalDepense.toFixed(0)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>dépensés</p>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--couleur-fond)' }}>
                    <p className="text-base font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                      {client.locale === 'pt-BR' ? '🇧🇷' : '🇫🇷'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>langue</p>
                  </div>
                </div>

                {/* Dernière commande */}
                <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>
                  Dernière commande :{' '}
                  <span style={{ color: 'var(--couleur-texte)' }}>
                    {new Date(client.derniereCommande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
