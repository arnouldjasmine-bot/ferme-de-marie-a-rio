import { createServiceClient } from '@/lib/supabase/service'
import FormulaireProduit from '@/components/admin/FormulaireProduit'
import { notFound } from 'next/navigation'
import type { Produit } from '@/types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function PageDetailProduit({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="pb-8">
      <FormulaireProduit produit={data as Produit} />
    </div>
  )
}
