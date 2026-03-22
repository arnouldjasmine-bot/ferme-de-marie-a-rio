import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const comprovante = formData.get('comprovante') as File | null

    if (!comprovante || comprovante.size === 0) {
      return NextResponse.json({ ok: false, error: 'Fichier manquant' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const ext = comprovante.name.split('.').pop() ?? 'png'
    const filename = `${id}-${Date.now()}.${ext}`
    const bytes = await comprovante.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('comprovantes')
      .upload(filename, bytes, { contentType: comprovante.type })

    if (uploadError || !uploadData) {
      throw new Error(uploadError?.message ?? 'Upload failed')
    }

    const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(filename)
    const publicUrl = urlData.publicUrl

    // Vérifier si commande MedRio → passer automatiquement en livrée
    const { data: orderData } = await supabase
      .from('orders')
      .select('is_medrio')
      .eq('id', id)
      .single()

    const updatePayload: Record<string, unknown> = {
      comprovante_url: publicUrl,
      paiement_statut: 'payee',
    }
    if (orderData?.is_medrio) {
      updatePayload.statut = 'livree'
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) throw new Error(updateError.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erreur payer:', err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
