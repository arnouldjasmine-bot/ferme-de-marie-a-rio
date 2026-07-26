import { createServiceClient } from '@/lib/supabase/service'
import ListePreparation from '@/components/admin/ListePreparation'

type ArticleBrut = { id?: string; nom: string; prix: number; quantite: number; unite?: string }
type Produit = { id: string; nom: string; categorie: string | null; unite: string | null }
type Categorie = { value: string; label_fr: string; emoji: string; ordre: number }

export type DetailClient = { client: string; quantite: number }
export type LignePreparation = { nom: string; quantite: number; unite: string; details: DetailClient[] }
export type GroupePreparation = { value: string; label: string; emoji: string; lignes: LignePreparation[] }

export const dynamic = 'force-dynamic'

async function getDonnees() {
  const supabase = createServiceClient()

  const [{ data: commandes }, { data: produits }, { data: categories }] = await Promise.all([
    supabase.from('orders').select('id, articles, prenom, nom').eq('statut', 'confirmee'),
    supabase.from('products').select('id, nom, categorie, unite'),
    supabase.from('categories').select('value, label_fr, emoji, ordre').order('ordre'),
  ])

  const produitParId = new Map<string, Produit>((produits ?? []).map((p: Produit) => [p.id, p]))

  // Agréger les quantités par produit (clé = id produit si connu, sinon nom normalisé)
  const parCle = new Map<string, LignePreparation & { categorie: string | null }>()

  for (const commande of commandes ?? []) {
    const nomClient = `${commande.prenom ?? ''} ${commande.nom ?? ''}`.trim() || 'Client'
    const articles: ArticleBrut[] = commande.articles ?? []
    for (const article of articles) {
      const produit = article.id ? produitParId.get(article.id) : undefined
      const cle = article.id ?? article.nom.trim().toLowerCase()
      let ligne = parCle.get(cle)
      if (!ligne) {
        ligne = {
          nom: produit?.nom ?? article.nom,
          quantite: 0,
          unite: produit?.unite ?? article.unite ?? '',
          categorie: produit?.categorie ?? null,
          details: [],
        }
        parCle.set(cle, ligne)
      }
      ligne.quantite += article.quantite
      const detailExistant = ligne.details.find(d => d.client === nomClient)
      if (detailExistant) detailExistant.quantite += article.quantite
      else ligne.details.push({ client: nomClient, quantite: article.quantite })
    }
  }

  // Grouper par catégorie
  const parCategorie = new Map<string, LignePreparation[]>()
  for (const { categorie, ...ligne } of parCle.values()) {
    const cle = categorie ?? '__sans_categorie__'
    if (!parCategorie.has(cle)) parCategorie.set(cle, [])
    parCategorie.get(cle)!.push(ligne)
  }

  const categoriesTriees: Categorie[] = [...(categories ?? [])].sort((a, b) => a.ordre - b.ordre)
  const groupes: GroupePreparation[] = []

  for (const cat of categoriesTriees) {
    const lignes = parCategorie.get(cat.value)
    if (!lignes?.length) continue
    groupes.push({
      value: cat.value,
      label: cat.label_fr.trim(),
      emoji: cat.emoji,
      lignes: lignes.sort((a, b) => a.nom.localeCompare(b.nom)),
    })
  }

  const sansCategorie = parCategorie.get('__sans_categorie__')
  if (sansCategorie?.length) {
    groupes.push({
      value: '__sans_categorie__',
      label: 'Sans catégorie',
      emoji: '📦',
      lignes: sansCategorie.sort((a, b) => a.nom.localeCompare(b.nom)),
    })
  }

  return { groupes, nbCommandes: (commandes ?? []).length }
}

export default async function PagePreparation() {
  const { groupes, nbCommandes } = await getDonnees()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Liste de préparation
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--couleur-texte-doux)' }}>
          Basée sur {nbCommandes} commande{nbCommandes > 1 ? 's' : ''} confirmée{nbCommandes > 1 ? 's' : ''} (MedRio incluses)
        </p>
      </div>

      {groupes.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Aucune commande confirmée à préparer pour le moment.</p>
        </div>
      ) : (
        <ListePreparation groupes={groupes} />
      )}
    </div>
  )
}
