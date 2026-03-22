'use client'

import { useState } from 'react'
import React from 'react'

type Article = { nom: string; quantite: number; prix: number }
type Order = {
  id: string
  prenom: string
  nom: string
  total: number
  articles: Article[]
  mode_livraison: string
  frais_livraison: number
  comprovante_url: string | null
  locale: string
}

const PIX_CLE          = 'lafermedemarie@gmail.com'
const PIX_BENEFICIAIRE = 'Ferme de Marie à Rio'

export default function PagePaiementContent({ order }: { order: Order }) {
  const pt = order.locale === 'pt-BR'
  const [copie, setCopie]                             = useState(false)
  const [comprovante, setComprovante]                 = useState<File | null>(null)
  const [comprovantePreview, setComprovantePreview]   = useState<string | null>(null)
  const [chargement, setChargement]                   = useState(false)
  const [succes, setSucces]                           = useState(false)
  const [erreur, setErreur]                           = useState('')

  function copierCle() {
    navigator.clipboard.writeText(PIX_CLE)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  function handleComprovanteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setComprovante(file)
    if (!file) { setComprovantePreview(null); return }
    if (file.type.startsWith('image/')) {
      setComprovantePreview(URL.createObjectURL(file))
    } else {
      setComprovantePreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!comprovante) return
    setChargement(true)
    setErreur('')
    try {
      const data = new FormData()
      data.append('comprovante', comprovante)
      const res = await fetch(`/api/commandes/${order.id}/payer`, { method: 'POST', body: data })
      if (!res.ok) throw new Error('Erreur serveur')
      setSucces(true)
    } catch {
      setErreur(pt
        ? 'Erro ao enviar. Tente novamente.'
        : 'Erreur lors de l\'envoi. Veuillez réessayer.')
    }
    setChargement(false)
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--couleur-fond-carte)',
    boxShadow: 'var(--ombre-carte)',
    borderRadius: '1rem',
    padding: '1.25rem',
    marginBottom: '1rem',
  }

  if (succes) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{
            width: '4rem', height: '4rem', borderRadius: '50%',
            backgroundColor: '#eef3ee', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 16 L13 21 L24 10" stroke="#4A5D4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ color: 'var(--vert-sauge-fonce)', fontWeight: 600, fontSize: '1.1rem' }}>
            {pt ? 'Obrigado! Seu pagamento foi recebido.' : 'Merci ! Votre paiement a bien été reçu.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{
        backgroundColor: 'var(--vert-sauge-fonce)',
        borderRadius: '1rem',
        padding: '1.5rem',
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#fff',
      }}>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7 }}>
          La Ferme de Marie à Rio
        </p>
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>
          {pt ? `Pagamento — ${order.prenom} ${order.nom}` : `Paiement — ${order.prenom} ${order.nom}`}
        </h1>
        <p style={{ margin: '0', fontSize: '2rem', fontWeight: 700 }}>R$ {order.total.toFixed(2)}</p>
      </div>

      {/* Récap commande */}
      <div style={cardStyle}>
        <p style={{ margin: '0 0 0.75rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Resumo do pedido' : 'Récapitulatif'}
        </p>
        {(order.articles ?? []).map((a, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0', color: 'var(--couleur-texte)' }}>
            <span>{a.nom} × {a.quantite}</span>
            <span>R$ {(a.prix * a.quantite).toFixed(2)}</span>
          </div>
        ))}
        {order.frais_livraison > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0', color: 'var(--couleur-texte-doux)' }}>
            <span>{pt ? 'Taxa de entrega' : 'Frais de livraison'}</span>
            <span>R$ {order.frais_livraison.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--couleur-bordure)', color: 'var(--vert-sauge-fonce)' }}>
          <span>{pt ? 'Total' : 'Total'}</span>
          <span>R$ {order.total.toFixed(2)}</span>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--couleur-texte-doux)' }}>
          {order.mode_livraison === 'retrait'
            ? (pt ? '🏡 Retirada na ferme' : '🏡 Retrait à la ferme')
            : (pt ? '🛵 Entrega' : '🛵 Livraison')}
        </div>
      </div>

      {/* Section PIX */}
      <div style={cardStyle}>
        <p style={{ margin: '0 0 0.75rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--couleur-texte-doux)' }}>
          PIX
        </p>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--couleur-texte-doux)' }}>
          {pt
            ? 'Faça o PIX para a chave abaixo no valor exato de R$ ' + order.total.toFixed(2) + '.'
            : 'Effectuez le virement PIX à la clé ci-dessous pour le montant exact de R$ ' + order.total.toFixed(2) + '.'}
        </p>

        <div style={{ backgroundColor: '#f0f4f0', borderRadius: '0.75rem', padding: '1rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--vert-sauge-fonce)' }}>
            {pt ? 'Chave PIX' : 'Clé PIX'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ flex: 1, fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--vert-sauge-fonce)' }}>
              {PIX_CLE}
            </span>
            <button
              onClick={copierCle}
              style={{
                flexShrink: 0,
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: copie ? 'var(--vert-olive)' : 'var(--vert-sauge)',
                transition: 'background-color 0.2s',
              }}
            >
              {copie ? (pt ? '✓ Copiado!' : '✓ Copié !') : (pt ? 'Copiar' : 'Copier')}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--couleur-texte-doux)' }}>
            <span>{pt ? 'Beneficiário' : 'Bénéficiaire'}</span>
            <span style={{ fontWeight: 600, color: 'var(--vert-sauge-fonce)' }}>{PIX_BENEFICIAIRE}</span>
          </div>
        </div>
      </div>

      {/* Upload comprovante */}
      <form onSubmit={handleSubmit}>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--vert-sauge-fonce)' }}>
            📎 {pt ? 'Comprovante de pagamento' : 'Preuve de paiement (comprovante)'}
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', color: 'var(--couleur-texte-doux)' }}>
            {pt
              ? 'Anexe a captura de tela ou PDF do comprovante PIX.'
              : 'Joignez la capture d\'écran ou le PDF de votre comprovante PIX.'}
          </p>

          {!comprovante ? (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', padding: '1.5rem', borderRadius: '0.75rem', cursor: 'pointer',
              border: '2px dashed var(--vert-olive)', backgroundColor: '#f4f7f4',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4 L16 22M8 14 L16 6 L24 14" stroke="#4A5D4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 26 L28 26" stroke="#93A27D" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--vert-sauge-fonce)' }}>
                {pt ? 'Selecionar arquivo' : 'Choisir un fichier'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--couleur-texte-doux)' }}>JPG, PNG ou PDF</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleComprovanteChange}
              />
            </label>
          ) : (
            <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--couleur-bordure)' }}>
              {comprovantePreview ? (
                <img src={comprovantePreview} alt="comprovante" style={{ width: '100%', maxHeight: '12rem', objectFit: 'contain', backgroundColor: '#fff' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f4f7f4' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="2" width="20" height="26" rx="2" fill="#D27D56" opacity="0.2" stroke="#D27D56" strokeWidth="1.5"/>
                    <path d="M20 2 L28 10" stroke="#D27D56" strokeWidth="1.5"/>
                    <rect x="20" y="2" width="8" height="8" rx="1" fill="#D27D56" opacity="0.3"/>
                    <text x="7" y="22" fontSize="6" fill="#D27D56" fontWeight="bold">PDF</text>
                  </svg>
                  <span style={{ fontSize: '0.875rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--couleur-texte)' }}>
                    {comprovante.name}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#eef3ee' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--vert-sauge-fonce)' }}>
                  ✓ {(comprovante.size / 1024).toFixed(0)} Ko
                </span>
                <button
                  type="button"
                  onClick={() => { setComprovante(null); setComprovantePreview(null) }}
                  style={{ fontSize: '0.75rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--couleur-texte-doux)' }}
                >
                  {pt ? 'Remover' : 'Supprimer'}
                </button>
              </div>
            </div>
          )}
        </div>

        {erreur && (
          <p style={{ fontSize: '0.875rem', color: 'var(--couleur-erreur)', marginBottom: '0.75rem' }}>{erreur}</p>
        )}

        <button
          type="submit"
          disabled={chargement || !comprovante}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: chargement || !comprovante ? 'not-allowed' : 'pointer',
            opacity: chargement || !comprovante ? 0.5 : 1,
            backgroundColor: 'var(--vert-sauge-fonce)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {chargement
            ? (pt ? 'Enviando...' : 'Envoi en cours...')
            : (pt ? 'Confirmar pagamento' : 'Confirmer le paiement')}
        </button>
      </form>
    </div>
  )
}
