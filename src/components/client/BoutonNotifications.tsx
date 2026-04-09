'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from './AuthProvider'

interface Props {
  locale: string
}

function isCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

export default function BoutonNotifications({ locale }: Props) {
  const { user } = useAuth()
  const [actif, setActif]       = useState(false)
  const [loading, setLoading]   = useState(false)
  const [supporte, setSupporte] = useState(false)
  const [erreur, setErreur]     = useState('')
  const pt = locale === 'pt-BR'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (isCapacitorApp()) {
      // Dans l'app Capacitor : les notifications sont gérées nativement par CapacitorPushInit
      // On vérifie juste si la permission a déjà été accordée
      import('@capacitor/push-notifications').then(({ PushNotifications }) => {
        PushNotifications.checkPermissions().then(perm => {
          setActif(perm.receive === 'granted')
          setSupporte(true)
        }).catch(() => setSupporte(false))
      }).catch(() => setSupporte(false))
    } else {
      // Web : vérifier support ServiceWorker + PushManager
      setSupporte(
        typeof window !== 'undefined' &&
        'PushManager' in window &&
        'serviceWorker' in navigator
      )
    }
  }, [])

  useEffect(() => {
    if (isCapacitorApp() || !supporte || !user) return
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => setActif(!!sub))
    })
  }, [supporte, user])

  if (!user) return null

  // ── Mode Capacitor (app native) ──────────────────────────────────────────
  if (isCapacitorApp()) {
    if (!supporte) return null

    async function activerNatif() {
      setLoading(true)
      setErreur('')
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        const perm = await PushNotifications.requestPermissions()
        if (perm.receive === 'granted') {
          await PushNotifications.register()
          setActif(true)
        } else {
          setErreur(pt ? 'Permissão recusada.' : 'Permission refusée.')
        }
      } catch (e) {
        setErreur(pt ? 'Erro ao ativar.' : 'Erreur lors de l\'activation.')
        console.error(e)
      }
      setLoading(false)
    }

    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={actif ? undefined : activerNatif}
          disabled={loading || actif}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all"
          style={{
            backgroundColor: actif ? '#eef3ee' : 'transparent',
            color: 'var(--vert-sauge-fonce)',
            borderColor: 'var(--couleur-bordure)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '…' : actif ? '🔔' : '🔕'}
          <span>
            {actif
              ? (pt ? 'Notificações ativas' : 'Notifications actives')
              : (pt ? 'Ativar notificações' : 'Activer les notifications')}
          </span>
        </button>
        {erreur && <p className="text-xs px-1" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}
      </div>
    )
  }

  // ── Mode développement ───────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    return (
      <p className="text-xs px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
        🛠️ Notifications désactivées en développement local.
      </p>
    )
  }

  // ── Mode web (navigateur) ─────────────────────────────────────────────────
  if (!supporte) {
    return (
      <p className="text-xs px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
        {pt
          ? '📵 Instale o app para receber notificações.'
          : '📵 Installez l\'app pour recevoir les notifications.'}
      </p>
    )
  }

  async function abonner() {
    setLoading(true)
    setErreur('')
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setErreur('Clé VAPID manquante.'); setLoading(false); return }

      let reg = await navigator.serviceWorker.getRegistration('/')
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (!reg.active) {
          await Promise.race([
            new Promise<void>(resolve => {
              const worker = reg!.installing ?? reg!.waiting
              if (!worker) { resolve(); return }
              worker.addEventListener('statechange', function() {
                if (worker.state === 'activated') resolve()
              })
            }),
            new Promise<void>(resolve => setTimeout(resolve, 15000)),
          ])
        }
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setLoading(false); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidKey).buffer as ArrayBuffer,
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
      setErreur(`Erreur: ${err instanceof Error ? err.message : String(err)}`)
    }
    setLoading(false)
  }

  async function desabonner() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setActif(false)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={actif ? desabonner : abonner}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all"
        style={{
          backgroundColor: actif ? '#eef3ee' : 'transparent',
          color: 'var(--vert-sauge-fonce)',
          borderColor: 'var(--couleur-bordure)',
        }}
      >
        {loading ? '…' : actif ? '🔔' : '🔕'}
        <span>
          {actif
            ? (pt ? 'Notificações ativas' : 'Notifications actives')
            : (pt ? 'Ativar notificações' : 'Activer les notifications')}
        </span>
      </button>
      {erreur && <p className="text-xs px-1" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}
    </div>
  )
}

function base64UrlToUint8Array(base64UrlString: string): Uint8Array {
  const str = base64UrlString.trim().replace(/[^A-Za-z0-9-_]/g, '').replace(/-/g, '+').replace(/_/g, '/')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const lookup = new Uint8Array(256)
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i
  const len = str.replace(/=/g, '').length
  const bufLen = Math.floor((len * 3) / 4)
  const buf = new Uint8Array(bufLen)
  let i = 0, p = 0
  const slen = str.length
  while (i < slen) {
    const a = lookup[str.charCodeAt(i++)] ?? 0
    const b = lookup[str.charCodeAt(i++)] ?? 0
    const c = i < slen ? (lookup[str.charCodeAt(i++)] ?? 0) : 0
    const d = i < slen ? (lookup[str.charCodeAt(i++)] ?? 0) : 0
    if (p < bufLen) buf[p++] = (a << 2) | (b >> 4)
    if (p < bufLen) buf[p++] = ((b & 15) << 4) | (c >> 2)
    if (p < bufLen) buf[p++] = ((c & 3) << 6) | d
  }
  return buf
}
