import ComprovanteViewer from '@/components/admin/ComprovanteViewer'
import BoutonsStatut from '@/components/admin/BoutonsStatut'
import { createServiceClient } from '@/lib/supabase/service'

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

export const dynamic = 'force-dynamic'

export default async function PageCommandes() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  const commandes: Commande[] = data ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
        Commandes ({commandes.length})
      </h1>

      {commandes.length === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Aucune commande pour le moment.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {commandes.map(c => (
          <div key={c.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
            {/* En-tête */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--couleur-bordure)', backgroundColor: 'var(--admin-fond)' }}>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                  {c.prenom} {c.nom}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUT_COLORS[c.statut] }}>
                  {STATUT_LABELS[c.statut]}
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {c.total.toFixed(2)}</p>
                <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Détails */}
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--couleur-texte-doux)' }}>Contact</p>
                <p className="text-sm" style={{ color: 'var(--couleur-texte)' }}>📧 {c.email}</p>
                <p className="text-sm" style={{ color: 'var(--couleur-texte)' }}>📞 {c.telephone}</p>
                <p className="text-sm" style={{ color: 'var(--couleur-texte)' }}>📍 {c.adresse}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--couleur-texte-doux)' }}>Articles</p>
                {(c.articles ?? []).map((a, i) => (
                  <p key={i} className="text-sm" style={{ color: 'var(--couleur-texte)' }}>
                    {a.nom} × {a.quantite} — R$ {(a.prix * a.quantite).toFixed(2)}
                  </p>
                ))}
              </div>
            </div>

            {/* Comprovante + statut */}
            <div className="px-5 pb-4 flex flex-col gap-3">
              {c.comprovante_url && <ComprovanteViewer url={c.comprovante_url} />}
              <BoutonsStatut id={c.id} statut={c.statut} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
