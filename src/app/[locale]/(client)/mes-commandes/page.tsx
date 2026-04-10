'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/client/AuthProvider'
import FormulaireAvis from '@/components/client/FormulaireAvis'
import EtoilesDisplay from '@/components/client/EtoilesDisplay'
import BoutonNotifications from '@/components/client/BoutonNotifications'

type Article = { nom: string; quantite: number; prix: number; unite?: string }
type Commande = {
  id: string
  prenom: string
  nom: string
  total: number
  statut: string
  articles: Article[]
  adresse: string
  created_at: string
  paiement_statut?: string | null
  comprovante_url?: string | null
  mode_livraison?: string
}
type AvisResume = { id: string; note: number; commentaire: string | null }

/** Commande livrée ET payée (ou comprovante envoyé) = finalisée → Passées */
function isFinalisee(c: Commande): boolean {
  return c.statut === 'livree' && (c.paiement_statut === 'payee' || !!c.comprovante_url)
}

function getStatutBadge(c: Commande, pt: boolean): { label: string; color: string; urgent?: boolean } {
  if (isFinalisee(c)) return { label: pt ? 'Finalizado ✅' : 'Finalisée ✅', color: '#4A5D4E' }

  const payee = c.paiement_statut === 'payee' || !!c.comprovante_url

  if (c.statut === 'livree') {
    if (!payee) return { label: pt ? '⚠️ Entregue — A pagar' : '⚠️ Livrée — À régler', color: '#c0392b', urgent: true }
  }
  if (c.statut === 'confirmee') {
    if (payee) return { label: pt ? 'Pago ✅ — Aguardando entrega' : 'Payée ✅ — En attente de livraison', color: '#4A5D4E' }
    return { label: pt ? 'Confirmado' : 'Confirmée', color: '#4A5D4E' }
  }
  if (c.statut === 'annulee') return { label: pt ? 'Cancelado' : 'Annulée', color: '#999' }
  return { label: pt ? 'Aguardando' : 'En attente', color: '#D27D56' }
}

export default function PageMesCommandes() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const pt = locale === 'pt-BR'
  const { user, profile, loading, signOut } = useAuth()

  const [email, setEmail]         = useState('')
  const [commandes, setCommandes] = useState<Commande[] | null>(null)
  const [chargement, setChargement] = useState(false)
  const [onglet, setOnglet]       = useState<'en_cours' | 'passees'>('en_cours')
  const [avisOuvertId, setAvisOuvertId] = useState<string | null>(null)
  const [avisParCommande, setAvisParCommande] = useState<Record<string, AvisResume>>({})
  const [modifId, setModifId]     = useState<string | null>(null)
  const [modifArticles, setModifArticles] = useState<Article[]>([])
  const [modifEnvoi, setModifEnvoi] = useState(false)
  const [modifErreur, setModifErreur] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const chargerParAuth = useCallback(async () => {
    setChargement(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setChargement(false); return }

    const res = await fetch('/api/mes-commandes', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const data: Commande[] = await res.json()
    setCommandes(data)

    // Charger les avis existants pour ces commandes
    if (data.length > 0) {
      const orderIds = data.map(c => c.id)
      const { data: avisData } = await supabase
        .from('avis')
        .select('id, order_id, note, commentaire')
        .in('order_id', orderIds)
        .eq('user_id', session.user.id)
      if (avisData) {
        const map: Record<string, AvisResume> = {}
        for (const a of avisData) {
          map[a.order_id] = { id: a.id, note: a.note, commentaire: a.commentaire }
        }
        setAvisParCommande(map)
      }
    }
    setChargement(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (user) chargerParAuth() }, [user, chargerParAuth])

  async function chercher(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setChargement(true)
    const res = await fetch(`/api/mes-commandes?email=${encodeURIComponent(email.trim())}`)
    setCommandes(await res.json())
    setChargement(false)
  }

  const commandesEnCours = commandes?.filter(c => !isFinalisee(c)) ?? []
  const commandesPassees = commandes?.filter(c => isFinalisee(c)) ?? []
  const commandesAffichees = user
    ? (onglet === 'en_cours' ? commandesEnCours : commandesPassees)
    : (commandes ?? [])

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-6">

      {/* ── Carte profil ── */}
      {!loading && user && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: '0 2px 12px rgba(74,93,78,0.08)' }}
        >
          {/* Avatar initiales */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
          >
            {profile?.prenom?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
          </div>

          {/* Nom + email */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--vert-sauge-fonce)' }}>
              {profile?.prenom ? `${profile.prenom} ${profile.nom ?? ''}`.trim() : user.email}
            </p>
            {profile?.prenom && (
              <p className="text-xs truncate" style={{ color: 'var(--couleur-texte-doux)' }}>{user.email}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <BoutonNotifications locale={locale} />
            <a
              href={`/${locale}/compte/profil`}
              className="p-2 rounded-full transition-opacity"
              style={{ backgroundColor: 'var(--couleur-accent)' }}
              title={pt ? 'Editar perfil' : 'Modifier le profil'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </a>
            <button
              onClick={async () => { await signOut(); window.location.href = `/${locale}` }}
              className="p-2 rounded-full transition-opacity"
              style={{ backgroundColor: 'var(--couleur-accent)' }}
              title={pt ? 'Sair' : 'Déconnexion'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {pt ? 'Meus pedidos' : 'Mes commandes'}
        </h1>
        {user && commandes !== null && (
          <button
            onClick={chargerParAuth}
            disabled={chargement}
            className="p-2 rounded-full transition-opacity disabled:opacity-40"
            style={{ backgroundColor: 'var(--couleur-accent)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={chargement ? 'animate-spin' : ''}>
              <path d="M21 2v6h-6M3 22v-6h6M21 13a9 9 0 01-15.66 6.16M3 11a9 9 0 0115.66-6.16"/>
            </svg>
          </button>
        )}
      </div>

      {/* Pendant le chargement de l'auth */}
      {loading && (
        <div className="py-16 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>…</div>
      )}

      {/* Non connecté → formulaire email */}
      {!loading && !user && (
        <>
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
        </>
      )}

      {/* Onglets En cours / Passées (connecté) */}
      {user && commandes !== null && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setOnglet('en_cours')}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: onglet === 'en_cours' ? 'var(--vert-sauge-fonce)' : 'var(--couleur-bordure)',
              color: onglet === 'en_cours' ? '#fff' : 'var(--couleur-texte)',
            }}
          >
            {pt ? 'Em andamento' : 'En cours'}
            {commandesEnCours.length > 0 && (
              <span className="ml-2 bg-white/20 rounded-full px-1.5 text-xs">{commandesEnCours.length}</span>
            )}
          </button>
          <button
            onClick={() => setOnglet('passees')}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: onglet === 'passees' ? 'var(--vert-sauge-fonce)' : 'var(--couleur-bordure)',
              color: onglet === 'passees' ? '#fff' : 'var(--couleur-texte)',
            }}
          >
            {pt ? 'Passados' : 'Passées'}
            {commandesPassees.length > 0 && (
              <span className="ml-2 bg-white/20 rounded-full px-1.5 text-xs">{commandesPassees.length}</span>
            )}
          </button>
        </div>
      )}

      {chargement && (
        <div className="py-12 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>…</div>
      )}

      {!chargement && commandes !== null && commandesAffichees.length === 0 && (
        <p className="text-center py-8" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Nenhum pedido encontrado.' : 'Aucune commande trouvée.'}
        </p>
      )}

      {!chargement && commandesAffichees.length > 0 && (
        <div className="flex flex-col gap-4">
          {commandesAffichees.map(c => {
            const finalisee  = isFinalisee(c)
            const badge      = getStatutBadge(c, pt)
            const payee      = c.paiement_statut === 'payee' || !!c.comprovante_url
            const besoinPaiement = !payee && (c.statut === 'confirmee' || c.statut === 'livree')
            const avisExistant = avisParCommande[c.id]

            return (
              <div key={c.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)', borderLeft: badge.urgent ? '3px solid #c0392b' : undefined }}>

                {/* En-tête */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>{c.prenom} {c.nom}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
                      {new Date(c.created_at).toLocaleDateString(pt ? 'pt-BR' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: badge.color }}>
                      {badge.label}
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
                  <p className="text-xs mt-2" style={{ color: 'var(--couleur-texte-doux)' }}>📍 {c.adresse}</p>
                </div>

                {/* Modification inline (en_attente) */}
                {c.statut === 'en_attente' && user && (
                  modifId === c.id ? (
                    <div className="px-4 pb-4">
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--vert-sauge-fonce)' }}>
                        {pt ? 'Modificar pedido' : 'Modifier la commande'}
                      </p>
                      {modifArticles.map((a, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 py-1.5 text-sm border-b" style={{ borderColor: 'var(--couleur-bordure)' }}>
                          <span className="flex-1 truncate" style={{ color: 'var(--couleur-texte)' }}>{a.nom}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setModifArticles(prev => {
                                const next = [...prev]
                                next[i] = { ...next[i], quantite: Math.max(0, next[i].quantite - 1) }
                                return next
                              })}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base border"
                              style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--vert-sauge-fonce)' }}
                            >−</button>
                            <span className="w-5 text-center font-semibold" style={{ color: a.quantite === 0 ? '#c0392b' : 'var(--couleur-texte)' }}>
                              {a.quantite}
                            </span>
                            <button
                              type="button"
                              onClick={() => setModifArticles(prev => {
                                const next = [...prev]
                                next[i] = { ...next[i], quantite: next[i].quantite + 1 }
                                return next
                              })}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base border"
                              style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--vert-sauge-fonce)' }}
                            >+</button>
                            {a.quantite === 0 && (
                              <span className="text-xs ml-1" style={{ color: '#c0392b' }}>
                                {pt ? '(remover)' : '(retiré)'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {modifErreur && (
                        <p className="text-xs mt-2" style={{ color: '#c0392b' }}>{modifErreur}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          disabled={modifEnvoi}
                          onClick={async () => {
                            setModifErreur('')
                            const artFiltres = modifArticles.filter(a => a.quantite > 0)
                            if (artFiltres.length === 0) {
                              setModifErreur(pt ? 'Selecione ao menos um produto.' : 'Sélectionnez au moins un produit.')
                              return
                            }
                            setModifEnvoi(true)
                            const { data: { session } } = await supabase.auth.getSession()
                            const res = await fetch(`/api/mes-commandes/${c.id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${session?.access_token ?? ''}`,
                              },
                              body: JSON.stringify({ articles: modifArticles }),
                            })
                            const data = await res.json()
                            setModifEnvoi(false)
                            if (data.ok) {
                              setModifId(null)
                              chargerParAuth()
                            } else {
                              setModifErreur(data.error ?? (pt ? 'Erro ao salvar.' : 'Erreur lors de la sauvegarde.'))
                            }
                          }}
                          className="flex-1 py-2 rounded-full text-white text-sm font-semibold disabled:opacity-50"
                          style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
                        >
                          {modifEnvoi ? '…' : (pt ? 'Salvar' : 'Enregistrer')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setModifId(null); setModifErreur('') }}
                          className="px-4 py-2 rounded-full text-sm border"
                          style={{ color: 'var(--couleur-texte-doux)', borderColor: 'var(--couleur-bordure)' }}
                        >
                          {pt ? 'Cancelar' : 'Annuler'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setModifId(c.id)
                          setModifArticles(c.articles.map(a => ({ ...a })))
                          setModifErreur('')
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border transition-opacity hover:opacity-80"
                        style={{ color: 'var(--vert-sauge-fonce)', borderColor: 'var(--couleur-bordure)' }}
                      >
                        ✏️ {pt ? 'Modificar pedido' : 'Modifier la commande'}
                      </button>
                    </div>
                  )
                )}

                {/* Actions */}
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {/* Bouton paiement */}
                  {besoinPaiement && (
                    <a
                      href={`/payer/${c.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90 self-start"
                      style={{ backgroundColor: badge.urgent ? '#c0392b' : 'var(--terracotta)' }}
                    >
                      🔗 {pt ? 'Acessar pagamento' : 'Accéder au paiement'}
                    </a>
                  )}

                  {/* Avis — uniquement sur commandes finalisées */}
                  {finalisee && user && (
                    avisExistant ? (
                      /* Avis déjà soumis → afficher */
                      <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: 'var(--couleur-accent)' }}>
                        <EtoilesDisplay note={avisExistant.note} taille={13} />
                        {avisExistant.commentaire && (
                          <p className="text-xs italic flex-1" style={{ color: 'var(--couleur-texte-doux)' }}>"{avisExistant.commentaire}"</p>
                        )}
                        <span className="text-xs shrink-0" style={{ color: 'var(--couleur-texte-doux)' }}>
                          {pt ? '✅ Avaliação enviada' : '✅ Avis envoyé'}
                        </span>
                      </div>
                    ) : avisOuvertId === c.id ? (
                      <FormulaireAvis
                        orderId={c.id}
                        locale={locale}
                        onSoumis={() => {
                          setAvisOuvertId(null)
                          chargerParAuth()
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setAvisOuvertId(c.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:opacity-80 self-start"
                        style={{ color: 'var(--vert-sauge-fonce)', borderColor: 'var(--couleur-bordure)' }}
                      >
                        ⭐ {pt ? 'Deixar avaliação' : 'Laisser un avis'}
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
