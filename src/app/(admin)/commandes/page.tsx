import { readFile } from 'fs/promises'
import path from 'path'
import ComprovanteViewer from '@/components/admin/ComprovanteViewer'
import BoutonsStatut from '@/components/admin/BoutonsStatut'

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
  comprovanteUrl: string | null
  statut: 'en_attente' | 'confirmee' | 'livree'
  createdAt: string
}

async function getCommandes(): Promise<Commande[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), 'data', 'commandes.json'), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
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

export default async function PageAdminCommandes() {
  const commandes = await getCommandes()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair, Georgia)' }}>
          Commandes
        </h1>
        <span className="text-sm px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: '#eef3ee', color: 'var(--vert-sauge-fonce)' }}>
          {commandes.length} commande{commandes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {commandes.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {commandes.map(cmd => (
            <div key={cmd.id} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
              {/* En-tête */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-base" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair, Georgia)' }}>
                    {cmd.prenom} {cmd.nom}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
                    {new Date(cmd.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: STATUT_COLORS[cmd.statut] }}
                  >
                    {STATUT_LABELS[cmd.statut]}
                  </span>
                  <span className="font-bold text-base" style={{ color: 'var(--vert-sauge-fonce)' }}>
                    R$ {cmd.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Infos contact */}
              <div className="grid grid-cols-2 gap-1 text-xs mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
                <span>📧 {cmd.email}</span>
                <span>📱 {cmd.telephone}</span>
                <span className="col-span-2">📍 {cmd.adresse}</span>
              </div>

              {/* Articles */}
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#f4f7f4' }}>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--vert-sauge-fonce)' }}>Articles</p>
                {cmd.articles.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm py-0.5">
                    <span style={{ color: 'var(--couleur-texte)' }}>{a.nom} × {a.quantite}</span>
                    <span className="font-medium" style={{ color: 'var(--vert-sauge-fonce)' }}>R$ {(a.prix * a.quantite).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Changer statut */}
              <BoutonsStatut id={cmd.id} statut={cmd.statut} />

              {/* Comprovante */}
              {cmd.comprovanteUrl ? (
                <ComprovanteViewer url={cmd.comprovanteUrl} />
              ) : (
                <div className="rounded-xl p-3 text-center text-xs" style={{ backgroundColor: '#fdf8f0', border: '1px solid #f0e8d0', color: 'var(--couleur-texte-doux)' }}>
                  ⚠️ Aucun comprovante joint
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
