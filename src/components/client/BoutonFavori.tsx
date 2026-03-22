'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from './AuthProvider'

interface Props {
  productId: string
  locale: string
}

export default function BoutonFavori({ productId, locale }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [estFavori, setEstFavori] = useState(false)
  const [loading, setLoading]     = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (!user) return
    verifier()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, productId])

  async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  async function verifier() {
    const token = await getToken()
    if (!token) return
    const res = await fetch('/api/favoris', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json() as Array<{ product_id: string }>
      setEstFavori(data.some(f => f.product_id === productId))
    }
  }

  async function toggle() {
    if (!user) {
      router.push(`/${locale}/compte/connexion`)
      return
    }
    const token = await getToken()
    if (!token) return
    setLoading(true)
    if (estFavori) {
      await fetch(`/api/favoris?product_id=${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEstFavori(false)
    } else {
      await fetch('/api/favoris', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      setEstFavori(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
      style={{
        backgroundColor: estFavori ? '#fde8f0' : 'rgba(255,255,255,0.9)',
        border: '1px solid var(--couleur-bordure)',
      }}
      title={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-label={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <span style={{ fontSize: 16, filter: estFavori ? 'none' : 'grayscale(1) opacity(0.5)' }}>❤️</span>
    </button>
  )
}
