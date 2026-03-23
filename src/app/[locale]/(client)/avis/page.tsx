import { createServiceClient } from '@/lib/supabase/service'
import EtoilesDisplay from '@/components/client/EtoilesDisplay'

type Props = { params: Promise<{ locale: string }> }

type Avis = {
  id: string
  user_id: string
  note: number
  commentaire: string | null
  locale: string
  created_at: string
  prenom?: string
  nom?: string
}

export const dynamic = 'force-dynamic'

export default async function PageAvis({ params }: Props) {
  const { locale } = await params
  const pt = locale === 'pt-BR'

  let avis: Avis[] = []

  try {
    const supabase = createServiceClient()
    const { data: avisRaw, error: avisError } = await supabase
      .from('avis')
      .select('id, user_id, note, commentaire, locale, created_at')
      .eq('approuve', true)
      .order('created_at', { ascending: false })

    if (avisError) throw avisError

    const avisBase = (avisRaw ?? []) as Avis[]

    // Récupérer les prénoms en une requête séparée
    const userIds = [...new Set(avisBase.map(a => a.user_id).filter(Boolean))]
    const profilesMap: Record<string, { prenom: string; nom: string }> = {}
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, prenom, nom')
        .in('id', userIds)
      for (const p of (profilesData ?? [])) profilesMap[p.id] = p
    }

    avis = avisBase.map(a => ({
      ...a,
      prenom: profilesMap[a.user_id]?.prenom ?? '',
      nom: profilesMap[a.user_id]?.nom ?? '',
    }))
  } catch (err) {
    console.error('[avis] Erreur chargement:', err)
    // Page s'affiche vide plutôt que crasher
  }

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
                  {a.prenom ? `${a.prenom}${a.nom ? ' ' + a.nom[0] + '.' : ''}` : 'Client'}
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
