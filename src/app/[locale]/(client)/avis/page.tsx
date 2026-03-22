import { createServiceClient } from '@/lib/supabase/service'
import EtoilesDisplay from '@/components/client/EtoilesDisplay'

type Props = { params: Promise<{ locale: string }> }

type AvisProfile = { prenom: string; nom: string }

type Avis = {
  id: string
  note: number
  commentaire: string | null
  locale: string
  created_at: string
  profiles: AvisProfile | AvisProfile[] | null
}

export const dynamic = 'force-dynamic'

export default async function PageAvis({ params }: Props) {
  const { locale } = await params
  const pt = locale === 'pt-BR'

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('avis')
    .select('id, note, commentaire, locale, created_at, profiles(prenom, nom)')
    .eq('approuve', true)
    .order('created_at', { ascending: false })

  const avis: Avis[] = (data ?? []) as unknown as Avis[]

  const moyenneNote = avis.length > 0
    ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
    : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--police-titre, Georgia)' }}>
        {pt ? 'Avaliações dos clientes' : 'Avis de nos clients'}
      </h1>

      {avis.length > 0 && (
        <div className="flex items-center gap-3 mb-8">
          <EtoilesDisplay note={Math.round(moyenneNote)} taille={20} />
          <span className="text-lg font-bold" style={{ color: 'var(--vert-sauge-fonce)' }}>
            {moyenneNote.toFixed(1)}
          </span>
          <span className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>
            ({avis.length} {pt ? 'avaliações' : 'avis'})
          </span>
        </div>
      )}

      {avis.length === 0 && (
        <p className="py-8 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Nenhuma avaliação ainda.' : 'Aucun avis pour le moment.'}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {avis.map(a => (
          <div key={a.id} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>
                  {(() => {
                    const p = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
                    return p ? `${p.prenom} ${p.nom ? p.nom[0] + '.' : ''}` : 'Client'
                  })()}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
                  {new Date(a.created_at).toLocaleDateString(pt ? 'pt-BR' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <EtoilesDisplay note={a.note} taille={14} />
            </div>
            {a.commentaire && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--couleur-texte)' }}>
                {a.commentaire}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
