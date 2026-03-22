import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES } from '@/types'
import type { Produit } from '@/types'
import BoutonAjouterProduit from '@/components/client/BoutonAjouterProduit'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; id: string }> }

const UNITES_PT: Record<string, string> = {
  'pièce': 'unidade', 'unité': 'unidade',
  'pot 300g': 'pote 300g', 'pot 200ml': 'pote 200ml',
  'pot 250g': 'pote 250g', 'pot 500g': 'pote 500g',
  'kg': 'kg', '500g': '500g', '250g': '250g', '1kg': '1kg',
}

export default async function PageProduit({ params }: Props) {
  const { locale, id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).eq('actif', true).single()
  if (!data) notFound()

  const produit = data as Produit
  const unite = locale === 'pt-BR' ? (UNITES_PT[produit.unite] ?? produit.unite) : produit.unite
  const categorie = locale === 'pt-BR'
    ? CATEGORIES.find(c => c.value === produit.categorie)?.labelPt
    : CATEGORIES.find(c => c.value === produit.categorie)?.labelFr

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Retour */}
      <Link href={`/${locale}/produits`} className="inline-flex items-center gap-1 text-sm mb-5 transition-opacity hover:opacity-70" style={{ color: 'var(--couleur-texte-doux)' }}>
        ← {locale === 'pt-BR' ? 'Voltar aos produtos' : 'Retour aux produits'}
      </Link>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ height: 280, backgroundColor: 'var(--couleur-accent)' }}>
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
        }
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-4">
        {categorie && (
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>
            {categorie}
          </span>
        )}

        <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {produit.nom}
        </h1>

        {produit.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--couleur-texte-doux)' }}>
            {produit.description}
          </p>
        )}

        {/* Prix + stock */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
              R$ {produit.prix.toFixed(2)}
            </p>
            <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>/ {unite}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: produit.stock <= 3 ? 'var(--couleur-attention)' : 'var(--couleur-succes)' }}>
              {produit.stock <= 3 && produit.stock > 0
                ? (locale === 'pt-BR' ? `⚠️ Últimas ${produit.stock} unidades` : `⚠️ Plus que ${produit.stock} en stock`)
                : (locale === 'pt-BR' ? `✓ ${produit.stock} em estoque` : `✓ ${produit.stock} en stock`)
              }
            </p>
          </div>
        </div>

        <BoutonAjouterProduit produit={produit} locale={locale} />
      </div>
    </div>
  )
}
