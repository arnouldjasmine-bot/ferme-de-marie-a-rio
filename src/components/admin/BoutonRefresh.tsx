'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BoutonRefresh() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function refresh() {
    setLoading(true)
    router.refresh()
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      title="Actualiser"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-opacity hover:opacity-70 disabled:opacity-40"
      style={{ color: 'var(--couleur-texte-doux)', borderColor: 'var(--couleur-bordure)' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
        <path d="M21 2v6h-6M3 22v-6h6M21 13a9 9 0 01-15.66 6.16M3 11a9 9 0 0115.66-6.16"/>
      </svg>
      Actualiser
    </button>
  )
}
