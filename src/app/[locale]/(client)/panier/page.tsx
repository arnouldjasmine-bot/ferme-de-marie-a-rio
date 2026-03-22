import { getTranslations } from 'next-intl/server'
import PanierClient from '@/components/client/PanierClient'

type Props = { params: Promise<{ locale: string }> }

export default async function PagePanier({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('panier')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
        {t('titre')}
      </h1>
      <PanierClient locale={locale} />
    </div>
  )
}
