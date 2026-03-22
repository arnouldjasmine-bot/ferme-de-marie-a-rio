import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result: Record<string, unknown> = {}

  result.vapid_public_configured = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  result.vapid_private_configured = !!process.env.VAPID_PRIVATE_KEY
  result.vapid_public_preview = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.slice(0, 20) + '...'
    : 'MANQUANT'

  try {
    const supabase = createServiceClient()
    const { data, error, count } = await supabase
      .from('push_subscriptions')
      .select('endpoint, user_id, locale', { count: 'exact' })
      .limit(10)

    if (error) {
      result.table_error = error.message
      result.subscriptions_count = 'ERREUR'
    } else {
      result.subscriptions_count = count ?? data?.length ?? 0
      result.subscriptions = (data ?? []).map((s: { endpoint: string; user_id: string | null; locale: string }) => ({
        endpoint_preview: s.endpoint.slice(0, 60) + '...',
        user_id: s.user_id,
        locale: s.locale,
      }))
    }
  } catch (e) {
    result.table_exception = String(e)
  }

  return NextResponse.json(result, { status: 200 })
}
