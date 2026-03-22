import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:contato@lafermedemarieario.com.br',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

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

export async function sendPush(
  sub: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<void> {
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
}
