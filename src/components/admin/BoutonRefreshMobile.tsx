'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BoutonRefreshMobile() {
  const router = useRouter()
  const [spin, setSpin] = useState(false)

  function refresh() {
    setSpin(true)
    router.refresh()
    setTimeout(() => setSpin(false), 1000)
  }

  return (
    <button
      onClick={refresh}
      className="md:hidden fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-opacity hover:opacity-90"
      style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
      aria-label="Actualiser"
    >
      <span style={{ display: 'inline-block', transition: 'transform 0.6s', transform: spin ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        ↻
      </span>
    </button>
  )
}
