import { getTranslations } from 'next-intl/server'
import CatalogueProduits from '@/components/client/CatalogueProduits'
import type { Produit } from '@/types'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export default async function PageProduits({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('produits')

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('actif', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false })
  const produits: Produit[] = data ?? []

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
