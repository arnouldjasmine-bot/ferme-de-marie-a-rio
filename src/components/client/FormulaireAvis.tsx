'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from './AuthProvider'

interface Props {
  orderId: string
  locale: string
  onSoumis?: () => void
}

export default function FormulaireAvis({ orderId, locale, onSoumis }: Props) {
  const pt = locale === 'pt-BR'
  const { user } = useAuth()
  const [note, setNote]             = useState(0)
  const [hovered, setHovered]       = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading]       = useState(false)
  const [erreur, setErreur]         = useState('')
  const [succes, setSucces]         = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  if (!user) return null

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (note === 0) {
      setErreur(pt ? 'Selecione uma nota.' : 'Veuillez choisir une note.')
      return
    }
    setLoading(true)
    setErreur('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const res = await fetch('/api/avis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ order_id: orderId, note, commentaire, locale }),
    })

    const json = await res.json() as { ok: boolean; error?: string }
    if (!json.ok) {
      setErreur(json.error ?? (pt ? 'Erro ao enviar.' : 'Erreur lors de l\'envoi.'))
      setLoading(false)
      return
    }

    setSucces(true)
    setLoading(false)
    onSoumis?.()
  }

  if (succes) {
    return (
      <div className="py-4 text-center text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>
        {pt ? '✅ Avaliação enviada! Será publicada após moderação.' : '✅ Avis envoyé ! Il sera publié après modération.'}
      </div>
    )
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3 py-2">
      <p className="text-sm font-medium" style={{ color: 'var(--vert-sauge-fonce)' }}>
        {pt ? 'Deixar uma avaliação' : 'Laisser un avis'}
      </p>

      {/* Étoiles */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setNote(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={n <= (hovered || note) ? '#D27D56' : 'none'}
              stroke={n <= (hovered || note) ? '#D27D56' : '#ddd8cc'}
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Commentaire */}
      <textarea
        value={commentaire}
        onChange={e => setCommentaire(e.target.value)}
        placeholder={pt ? 'Seu comentário (opcional)...' : 'Votre commentaire (optionnel)...'}
        rows={3}
        className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
        style={{ borderColor: 'var(--couleur-bordure)' }}
      />

      {erreur && <p className="text-xs" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--vert-sauge)' }}
        >
          {loading ? '…' : (pt ? 'Enviar' : 'Envoyer')}
        </button>
        <button
          type="button"
          onClick={onSoumis}
          className="px-4 py-2 rounded-full text-sm border transition-opacity hover:opacity-80"
          style={{ color: 'var(--couleur-texte-doux)', borderColor: 'var(--couleur-bordure)' }}
        >
          {pt ? 'Cancelar' : 'Annuler'}
        </button>
      </div>
    </form>
  )
}
