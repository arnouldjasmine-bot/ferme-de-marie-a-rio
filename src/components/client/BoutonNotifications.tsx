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
  const [erreur, setErreur]       = useState('')
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

  if (!user) return null

  // En développement local, le SW est désactivé — on ne peut pas tester les push
  if (process.env.NODE_ENV === 'development') {
    return (
      <p className="text-xs px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
        🛠️ Notifications désactivées en développement local. Tester sur le site de production (Chrome).
      </p>
    )
  }

  // Navigateur ne supporte pas les push (ex: iOS Safari sans PWA installé)
  if (!supporte) {
    return (
      <p className="text-xs px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
        {pt
          ? '📵 Notificações não disponíveis neste navegador. Instale o app na tela inicial para recebê-las.'
          : '📵 Notifications non disponibles sur ce navigateur. Installez l\'app sur l\'écran d\'accueil pour les recevoir.'}
      </p>
    )
  }

  async function abonner() {
    setLoading(true)
    setErreur('')
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setErreur(pt ? 'Notificações não configuradas.' : 'Notifications non configurées (clé VAPID manquante).')
        setLoading(false)
        return
      }

      // Récupérer ou enregistrer le SW — ne pas bloquer sur ready
      let reg = await navigator.serviceWorker.getRegistration('/')
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        // Attendre l'activation avec timeout 15s
        if (!reg.active) {
          await Promise.race([
            new Promise<void>(resolve => {
              const worker = reg!.installing ?? reg!.waiting
              if (!worker) { resolve(); return }
              worker.addEventListener('statechange', function onState() {
                if (worker.state === 'activated') { resolve() }
              })
              reg!.addEventListener('updatefound', () => resolve())
            }),
            new Promise<void>(resolve => setTimeout(resolve, 15000)),
          ])
        }
      }
      const permission = await Notification.requestPermission()
      if (permission === 'denied') {
        setErreur(pt ? 'Permissão recusada nas configurações do navegador.' : 'Permission refusée dans les paramètres du navigateur.')
        setLoading(false)
        return
      }
      if (permission !== 'granted') {
        setLoading(false)
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      const json = sub.toJSON()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/push/subscribe', {
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

      if (!res.ok) {
        setErreur(pt ? 'Erro ao salvar assinatura.' : 'Erreur lors de l\'enregistrement.')
        setLoading(false)
        return
      }

      setActif(true)
    } catch (err) {
      console.error('Erreur abonnement push:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setErreur(`Erreur: ${msg}`)
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
    <div className="flex flex-col gap-1">
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
        {loading ? '…' : (actif ? '🔔' : '🔕')}
        <span>
          {actif
            ? (pt ? 'Notificações ativas' : 'Notifications actives')
            : (pt ? 'Ativar notificações' : 'Activer les notifications')}
        </span>
      </button>
      {erreur && (
        <p className="text-xs px-1" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>
      )}
    </div>
  )
}


// Conversion base64url → Uint8Array sans atob (évite les problèmes d'encodage)
function base64UrlToUint8Array(base64UrlString: string): Uint8Array {
  const str = base64UrlString.trim().replace(/-/g, '+').replace(/_/g, '/')
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
