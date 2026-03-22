'use client'

import { useRouter } from 'next/navigation'

export default function BoutonRetour({ label = '← Retour' }: { label?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
      style={{ color: 'var(--couleur-texte-doux)' }}
    >
      {label}
    </button>
  )
}
