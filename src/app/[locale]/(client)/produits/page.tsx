import { getTranslations } from 'next-intl/server'
import CatalogueProduits from '@/components/client/CatalogueProduits'
import type { Produit } from '@/types'
import { CATEGORIES } from '@/types'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export default async function PageProduits({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('produits')

  const supabase = createServiceClient()
  const [{ data }, { data: categoriesData }] = await Promise.all([
    supabase.from('products').select('*').eq('actif', true).gt('stock', 0).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('ordre'),
  ])
  const produits: Produit[] = data ?? []
  const categories = (categoriesData && categoriesData.length > 0)
    ? categoriesData
    : CATEGORIES.map((c, i) => ({ id: String(i), value: c.value, label_fr: c.labelFr, label_pt: c.labelPt, emoji: '' }))

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-4">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--terracotta)' }}>
          {locale === 'pt-BR' ? 'Da fazenda para você' : 'De la ferme à vous'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {t('titre')}
        </h1>
      </div>
      <CatalogueProduits produits={produits} locale={locale} categories={categories} />
    </div>
    </div>
  )
}
