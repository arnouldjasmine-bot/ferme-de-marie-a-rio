import { createServiceClient } from '@/lib/supabase/service'
import FormulaireCommandeMedRio from '@/components/admin/FormulaireCommandeMedRio'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PageNouvelleCommandeMedRio() {
  const supabase = createServiceClient()
  const { data: produits } = await supabase
    .from('products')
    .select('id, nom, prix, unite, stock')
    .eq('actif', true)
    .order('nom')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/medrio"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--couleur-texte-doux)' }}
        >
          ← Retour
        </Link>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
        >
          Nouvelle commande MedRio
        </h1>
      </div>

      <FormulaireCommandeMedRio produits={produits ?? []} />
    </div>
  )
}
