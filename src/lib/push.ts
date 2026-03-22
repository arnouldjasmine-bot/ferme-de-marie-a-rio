import webpush from 'web-push'

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

export interface PushSubscriptionRecord {
  endpoint: string
  p256dh: string
  auth_key: string
}

function initVapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) {
    throw new Error('VAPID keys not configured — add NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to Vercel env vars')
  }
  webpush.setVapidDetails(
    'mailto:contato@lafermedemarieario.com.br',
    pub,
    priv,
  )
}

export async function sendPush(
  sub: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<'ok' | 'expired'> {
  initVapid()
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth_key,
        },
      },
      JSON.stringify(payload),
    )
    return 'ok'
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    if (status === 410 || status === 404) return 'expired'
    console.error('Push send error:', err)
    return 'expired'
  }
}
