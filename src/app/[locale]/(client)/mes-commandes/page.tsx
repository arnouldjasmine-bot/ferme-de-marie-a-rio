'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

const STATUT_LABELS: Record<string, { fr: string; pt: string; color: string }> = {
  en_attente: { fr: 'En attente', pt: 'Aguardando', color: '#D27D56' },
  confirmee:  { fr: 'Confirmée',  pt: 'Confirmado', color: '#4A5D4E' },
  livree:     { fr: 'Livrée',     pt: 'Entregue',   color: '#93A27D' },
}

type Article = { nom: string; quantite: number; prix: number }
type Commande = {
  id: string
  prenom: string
  nom: string
  total: number
  statut: string
  articles: Article[]
  adresse: string
  created_at: string
}

export default function PageMesCommandes() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'

  const [email, setEmail] = useState('')
  const [commandes, setCommandes] = useState<Commande[] | null>(null)
  const [chargement, setChargement] = useState(false)

  async function chercher(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setChargement(true)
    const res = await fetch(`/api/mes-commandes?email=${encodeURIComponent(email.trim())}`)
    setCommandes(await res.json())
    setChargement(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
        {pt ? 'Meus pedidos' : 'Mes commandes'}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
        {pt ? 'Informe seu e-mail para ver seus pedidos.' : 'Entrez votre email pour retrouver vos commandes.'}
      </p>

      <form onSubmit={chercher} className="flex gap-3 mb-8">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={pt ? 'seu@email.com' : 'votre@email.com'}
          required
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--couleur-bordure)' }}
        />
        <button
          type="submit"
          disabled={chargement}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
        >
          {chargement ? '…' : (pt ? 'Buscar' : 'Chercher')}
        </button>
      </form>

      {commandes !== null && commandes.length === 0 && (
        <p className="text-center py-8" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Nenhum pedido encontrado.' : 'Aucune commande trouvée.'}
        </p>
      )}

      {commandes && commandes.length > 0 && (
        <div className="flex flex-col gap-4">
          {commandes.map(c => {
            const statut = STATUT_LABELS[c.statut]
            return (
              <div key={c.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
                {/* En-tête */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>{c.prenom} {c.nom}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
                      {new Date(c.created_at).toLocaleDateString(pt ? 'pt-BR' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: statut?.color ?? '#ccc' }}>
                      {pt ? statut?.pt : statut?.fr}
                    </span>
                    <span className="font-bold text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>R$ {c.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Articles */}
                <div className="px-4 py-3">
                  {(c.articles ?? []).map((a, i) => (
                    <p key={i} className="text-sm py-0.5" style={{ color: 'var(--couleur-texte)' }}>
                      {a.nom} × {a.quantite} — R$ {(a.prix * a.quantite).toFixed(2)}
                    </p>
                  ))}
                  <p className="text-xs mt-2" style={{ color: 'var(--couleur-texte-doux)' }}>
                    📍 {c.adresse}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
