import { getTranslations } from 'next-intl/server'
import FormulaireCommande from '@/components/client/FormulaireCommande'

type Props = { params: Promise<{ locale: string }> }

export default async function PageCommande({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('commande')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
        {t('titre')}
      </h1>
      <FormulaireCommande locale={locale} />
    </div>
  )
}
