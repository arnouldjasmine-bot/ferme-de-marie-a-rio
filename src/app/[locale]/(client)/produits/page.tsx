import { getTranslations } from 'next-intl/server'
import CatalogueProduits from '@/components/client/CatalogueProduits'
import type { Produit } from '@/types'

// Données de démo bilingues — remplacées par Supabase une fois connecté
// nom / nomPt : la locale choisit la bonne version
const PRODUITS_DEMO: (Produit & { nomPt: string; descriptionPt: string })[] = [
  { id: '1', nom: 'Tomates cerises',      nomPt: 'Tomates cereja',       description: 'Tomates cerises fraîches de la ferme', descriptionPt: 'Tomates cereja frescas da fazenda', prix: 8.50,  unite: '500g',     stock: 20, categorie: 'legumes',          image_url: null, actif: true, created_at: '' },
  { id: '2', nom: 'Laitue',               nomPt: 'Alface',               description: 'Laitue croquante cueillie le matin',   descriptionPt: 'Alface crocante colhida de manhã',   prix: 5.00,  unite: 'pièce',    stock: 12, categorie: 'legumes',          image_url: null, actif: true, created_at: '' },
  { id: '3', nom: 'Mangues',              nomPt: 'Mangas',               description: 'Mangues mûres à point',                descriptionPt: 'Mangas maduras no ponto',            prix: 15.00, unite: 'kg',       stock: 10, categorie: 'fruits',           image_url: null, actif: true, created_at: '' },
  { id: '4', nom: 'Bananes',              nomPt: 'Bananas',              description: 'Bananes bio de la ferme',              descriptionPt: 'Bananas orgânicas da fazenda',       prix: 6.00,  unite: 'kg',       stock: 25, categorie: 'fruits',           image_url: null, actif: true, created_at: '' },
  { id: '5', nom: 'Confiture de fraise',  nomPt: 'Geleia de morango',    description: 'Confiture maison sans conservateur',   descriptionPt: 'Geleia artesanal sem conservante',  prix: 12.00, unite: 'pot 300g', stock: 15, categorie: 'confiture',        image_url: null, actif: true, created_at: '' },
  { id: '6', nom: 'Confiture de mangue', nomPt: 'Geleia de manga',      description: 'Recette traditionnelle',               descriptionPt: 'Receita tradicional',               prix: 12.00, unite: 'pot 300g', stock: 8,  categorie: 'confiture',        image_url: null, actif: true, created_at: '' },
  { id: '7', nom: 'Fromage frais',        nomPt: 'Queijo fresco',        description: 'Fromage de vache artisanal',           descriptionPt: 'Queijo de vaca artesanal',          prix: 10.00, unite: 'unité',    stock: 6,  categorie: 'produits_laitiers', image_url: null, actif: true, created_at: '' },
  { id: '8', nom: 'Yaourt nature',        nomPt: 'Iogurte natural',      description: 'Yaourt ferme, sans additif',           descriptionPt: 'Iogurte caseiro, sem aditivos',     prix: 7.50,  unite: 'pot 200ml', stock: 20, categorie: 'produits_laitiers', image_url: null, actif: true, created_at: '' },
]

type Props = { params: Promise<{ locale: string }> }

export default async function PageProduits({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('produits')

  // On adapte les champs texte selon la locale
  const produits: Produit[] = PRODUITS_DEMO.map(p => ({
    ...p,
    nom: locale === 'pt-BR' ? p.nomPt : p.nom,
    description: locale === 'pt-BR' ? p.descriptionPt : p.description,
  }))

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond flou semi-transparent */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg-produits.jpg')",
          filter: 'blur(8px) brightness(0.8)',
          transform: 'scale(1.08)',
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(245, 242, 233, 0.80)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--terracotta)' }}>
          {locale === 'pt-BR' ? 'Da fazenda para você' : 'De la ferme à vous'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {t('titre')}
        </h1>
      </div>
      <CatalogueProduits produits={produits} locale={locale} />
    </div>
    </div>
  )
}
