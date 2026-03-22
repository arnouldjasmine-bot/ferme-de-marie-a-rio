import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import EditionCommande from '@/components/admin/EditionCommande'
import BoutonsStatut from '@/components/admin/BoutonsStatut'
import BoutonLienPaiement from '@/components/admin/BoutonLienPaiement'
import ComprovanteViewer from '@/components/admin/ComprovanteViewer'
import Link from 'next/link'
import BoutonRetour from '@/components/admin/BoutonRetour'

export const dynamic = 'force-dynamic'

type Article = { nom: string; quantite: number; prix: number }
type Commande = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  adresse: string
  total: number
  statut: 'en_attente' | 'confirmee' | 'livree'
  articles: Article[]
  comprovante_url: string | null
  mode_livraison: string
  frais_livraison: number
  paiement_statut: 'en_attente' | 'payee'
  locale: string
  created_at: string
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: '#D27D56',
  confirmee:  '#4A5D4E',
  livree:     '#93A27D',
}
const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirmee:  'Confirmée',
  livree:     'Livrée',
}

export default async function PageDetailCommande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!data) notFound()
  const c = data as Commande

  return (
    <div className="max-w-2xl">
      {/* Retour intelligent */}
      <div className="mb-5">
        <BoutonRetour label="← Retour" />
      </div>

      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
            {c.prenom} {c.nom}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: STATUT_COLORS[c.statut] ?? '#ccc' }}>
          {STATUT_LABELS[c.statut] ?? c.statut}
        </span>
      </div>

      {/* Contact */}
      <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--couleur-texte-doux)' }}>Contact</p>
        <div className="flex flex-col gap-1.5 text-sm" style={{ color: 'var(--couleur-texte)' }}>
          <p>📧 <a href={`mailto:${c.email}`} className="underline">{c.email}</a></p>
          <p>📞 <a href={`tel:${c.telephone}`} className="underline">{c.telephone}</a></p>
          <p>📍 {c.adresse}</p>
          <p className="mt-1">
            {c.mode_livraison === 'retrait' ? '🏡 Retrait à la ferme' : `🛵 Livraison (+R$ ${(c.frais_livraison ?? 0).toFixed(2)})`}
          </p>
        </div>
      </div>

      {/* Articles éditables */}
      <EditionCommande
        id={c.id}
        articles={c.articles ?? []}
        frais_livraison={c.frais_livraison ?? 0}
        mode_livraison={c.mode_livraison}
      />

      {/* Statut livraison */}
      <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--couleur-texte-doux)' }}>Statut livraison</p>
        <BoutonsStatut id={c.id} statut={c.statut} />
      </div>


      {/* Actions */}
      <div className="flex flex-col gap-3">
        {c.comprovante_url && <ComprovanteViewer url={c.comprovante_url} />}
        <BoutonLienPaiement id={c.id} telephone={c.telephone} locale={c.locale} />
      </div>
    </div>
  )
}
