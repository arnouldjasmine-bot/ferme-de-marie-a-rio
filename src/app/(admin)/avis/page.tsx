import { createServiceClient } from '@/lib/supabase/service'
import EtoilesDisplay from '@/components/client/EtoilesDisplay'
import BoutonsAvis from '@/components/admin/BoutonsAvis'
import BoutonRefresh from '@/components/admin/BoutonRefresh'

type AvisProfile = { prenom: string; nom: string }

type Avis = {
  id: string
  note: number
  commentaire: string | null
  approuve: boolean
  locale: string
  created_at: string
  profiles: AvisProfile | AvisProfile[] | null
}

export const dynamic = 'force-dynamic'

export default async function PageAdminAvis() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('avis')
    .select('id, note, commentaire, approuve, locale, created_at, profiles(prenom, nom)')
    .order('created_at', { ascending: false })

  const avis: Avis[] = (data ?? []) as unknown as Avis[]
  const enAttente = avis.filter(a => !a.approuve)
  const approuves = avis.filter(a => a.approuve)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Avis clients ({avis.length})
        </h1>
        <BoutonRefresh />
      </div>

      {/* En attente */}
      {enAttente.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--couleur-attention)' }}>
            En attente de modération ({enAttente.length})
          </h2>
          <div className="flex flex-col gap-3">
            {enAttente.map(a => (
              <AvisCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* Approuvés */}
      <section>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--couleur-succes)' }}>
          Publiés ({approuves.length})
        </h2>
        {approuves.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Aucun avis approuvé.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {approuves.map(a => (
              <AvisCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function AvisCard({ a }: { a: Avis }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'var(--couleur-fond-carte)',
        boxShadow: 'var(--ombre-carte)',
        opacity: a.approuve ? 1 : 0.8,
        borderLeft: a.approuve ? '3px solid var(--couleur-succes)' : '3px solid var(--couleur-attention)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-semibold text-sm" style={{ color: 'var(--couleur-texte)' }}>
              {(() => {
                const p = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
                return p ? `${p.prenom} ${p.nom}` : '?'
              })()}
            </span>
            <EtoilesDisplay note={a.note} taille={13} />
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: a.locale === 'pt-BR' ? '#e8f0e8' : '#f0e8f0', color: 'var(--couleur-texte-doux)' }}>
              {a.locale === 'pt-BR' ? '🇧🇷' : '🇫🇷'}
            </span>
          </div>
          {a.commentaire && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--couleur-texte)' }}>{a.commentaire}</p>
          )}
          <p className="text-xs mt-1.5" style={{ color: 'var(--couleur-texte-doux)' }}>
            {new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <BoutonsAvis
          avisId={a.id}
          approuve={a.approuve}
          onAction={() => { /* revalidation via router.refresh() côté client */ }}
        />
      </div>
    </div>
  )
}
