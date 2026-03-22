'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from './AuthProvider'

interface Props {
  locale: string
}

export default function BoutonNotifications({ locale }: Props) {
  const { user } = useAuth()
  const [actif, setActif]         = useState(false)
  const [loading, setLoading]     = useState(false)
  const [supporte, setSupporte]   = useState(false)
  const pt = locale === 'pt-BR'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    setSupporte(typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator)
  }, [])

  // Vérifier si déjà abonné
  useEffect(() => {
    if (!supporte || !user) return
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setActif(!!sub)
      })
    })
  }, [supporte, user])

  if (!user || !supporte) return null

  async function abonner() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setLoading(false)
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      const json = sub.toJSON()
      const { data: { session } } = await supabase.auth.getSession()

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: (json.keys as Record<string, string>)?.p256dh ?? '',
          auth_key: (json.keys as Record<string, string>)?.auth ?? '',
          locale,
        }),
      })

      setActif(true)
    } catch (err) {
      console.error('Erreur abonnement push:', err)
    }
    setLoading(false)
  }

  async function desabonner() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      setActif(false)
    } catch (err) {
      console.error('Erreur désabonnement push:', err)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={actif ? desabonner : abonner}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all hover:opacity-80 disabled:opacity-50"
      style={{
        backgroundColor: actif ? '#eef3ee' : 'transparent',
        color: 'var(--vert-sauge-fonce)',
        borderColor: 'var(--couleur-bordure)',
      }}
    >
      {actif ? '🔔' : '🔕'}
      <span>
        {actif
          ? (pt ? 'Notificações ativas' : 'Notifications actives')
          : (pt ? 'Ativar notificações' : 'Activer les notifications')}
      </span>
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
