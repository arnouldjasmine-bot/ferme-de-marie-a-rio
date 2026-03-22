'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePanier } from '@/lib/panier-context'
import AdresseAutocomplete from './AdresseAutocomplete'

type Etape = 'formulaire' | 'pix' | 'confirmation'
type Mode  = 'retrait' | 'livraison'

// ⚠️ À remplacer par la vraie clé PIX de la ferme
const PIX_CLE          = 'lafermedemarie@gmail.com'
const PIX_BENEFICIAIRE = 'Ferme de Marie à Rio'
const FRAIS_LIVRAISON  = 20
const MONTANT_MINIMUM  = 30   // s'applique uniquement en mode livraison

export default function FormulaireCommande({ locale }: { locale: string }) {
  const t    = useTranslations('commande')
  const tErr = useTranslations('erreurs')
  const { articles, totalPrix, viderPanier } = usePanier()
  const pt = locale === 'pt-BR'

  const [etape, setEtape]           = useState<Etape>('formulaire')
  const [mode, setMode]             = useState<Mode>('livraison')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState('')
  const [copie, setCopie]           = useState(false)
  const [comprovante, setComprovante]             = useState<File | null>(null)
  const [comprovantePreview, setComprovantePreview] = useState<string | null>(null)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', adresse: '' })

  const totalFinal = totalPrix + (mode === 'livraison' ? FRAIS_LIVRAISON : 0)

  function set(champ: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [champ]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const prenom    = (fd.get('prenom')    as string ?? form.prenom).trim()
    const nom       = (fd.get('nom')       as string ?? form.nom).trim()
    const email     = (fd.get('email')     as string ?? form.email).trim()
    const telephone = (fd.get('telephone') as string ?? form.telephone).trim()
    const adresse   = mode === 'livraison'
      ? (form.adresse || (fd.get('adresse') as string ?? '').trim())
      : pt ? 'Retirada na ferme' : 'Retrait à la ferme'

    if (!prenom || !nom || !email || !telephone) {
      setErreur(tErr('champsRequis'))
      return
    }
    if (mode === 'livraison' && adresse.length < 5) {
      setErreur(pt
        ? 'Por favor, informe seu endereço completo.'
        : 'Veuillez saisir votre adresse complète.')
      return
    }
    if (mode === 'livraison' && totalPrix < MONTANT_MINIMUM) {
      setErreur(pt
        ? `Pedido mínimo de R$ ${MONTANT_MINIMUM.toFixed(2)} para entrega.`
        : `Commande minimum de R$ ${MONTANT_MINIMUM.toFixed(2)} pour la livraison.`)
      return
    }
    setForm(prev => ({ ...prev, prenom, nom, email, telephone, adresse }))
    setEtape('pix')
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

  async function handleConfirmerPaiement() {
    if (!comprovante) return
    setChargement(true)
    try {
      const data = new FormData()
      data.append('prenom', form.prenom)
      data.append('nom', form.nom)
      data.append('email', form.email)
      data.append('telephone', form.telephone)
      data.append('adresse', form.adresse)
      data.append('total', totalFinal.toString())
      data.append('mode_livraison', mode)
      data.append('frais_livraison', mode === 'livraison' ? FRAIS_LIVRAISON.toString() : '0')
      data.append('articles', JSON.stringify(articles.map(a => ({
        id: a.produit.id,
        nom: a.produit.nom,
        quantite: a.quantite,
        prix: a.produit.prix,
      }))))
      data.append('comprovante', comprovante)
      data.append('locale', locale)
      await fetch('/api/commandes', { method: 'POST', body: data })
    } catch (err) {
      console.error(err)
    }
    viderPanier()
    setEtape('confirmation')
    setChargement(false)
  }

  function copierCle() {
    navigator.clipboard.writeText(PIX_CLE)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  if (articles.length === 0 && etape === 'formulaire') {
    return (
      <div className="text-center py-16">
        <p className="mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt ? 'Seu carrinho está vazio.' : 'Votre panier est vide.'}
        </p>
        <Link
          href={`/${locale}/produits`}
          className="inline-block px-6 py-3 rounded-full text-white font-medium"
          style={{ backgroundColor: 'var(--vert-sauge)' }}
        >
          {pt ? 'Ver produtos' : 'Voir les produits'}
        </Link>
      </div>
    )
  }

  if (etape === 'confirmation') {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#eef3ee' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20 L17 27 L30 13" stroke="#4A5D4E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {t('confirmation.titre')}
        </h2>
        <p className="mb-2 max-w-sm mx-auto" style={{ color: 'var(--couleur-texte-doux)' }}>
          {t('confirmation.message')}
        </p>
        <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt
            ? 'O horário de retirada/entrega (segunda-feira) será confirmado pelo WhatsApp.'
            : 'L\'horaire de retrait/livraison (lundi) sera confirmé par WhatsApp.'}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-block px-8 py-3 rounded-full text-white font-semibold"
          style={{ backgroundColor: 'var(--vert-sauge)' }}
        >
          {t('confirmation.retour')}
        </Link>
      </div>
    )
  }

  if (etape === 'pix') {
    return (
      <div className="flex flex-col gap-5">
        {/* En-tête PIX */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)', color: '#fff' }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#32BCAD"/>
              <path d="M7 14 L11.5 9.5 L14 12 L19 7 L21 9 L14 16 L11.5 13.5 Z" fill="white"/>
              <path d="M7 19 L11 15 L14 18 L19 13 L21 15 L14 22 L11 19 Z" fill="white" opacity="0.7"/>
            </svg>
            <span className="text-xl font-bold tracking-wide">PIX</span>
          </div>
          <p className="text-white/70 text-sm">{t('pix.titre')}</p>
          <div className="mt-4">
            <p className="text-white/60 text-xs uppercase tracking-widest">{t('pix.montant')}</p>
            {mode === 'livraison' && (
              <div className="mt-1 text-white/60 text-xs">
                <span>{pt ? 'Produtos' : 'Produits'} R$ {totalPrix.toFixed(2)}</span>
                <span className="mx-2">+</span>
                <span>{pt ? 'Entrega' : 'Livraison'} R$ {FRAIS_LIVRAISON.toFixed(2)}</span>
              </div>
            )}
            <p className="text-4xl font-bold mt-1">R$ {totalFinal.toFixed(2)}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="rounded-2xl p-6 flex flex-col items-center gap-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--couleur-texte-doux)' }}>
            {t('pix.instruction')}
          </p>

          <div className="border-4 rounded-xl p-3" style={{ borderColor: 'var(--vert-sauge-fonce)' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="#2E3D31" strokeWidth="6"/>
              <rect x="22" y="22" width="26" height="26" rx="2" fill="#2E3D31"/>
              <rect x="100" y="10" width="50" height="50" rx="4" fill="none" stroke="#2E3D31" strokeWidth="6"/>
              <rect x="112" y="22" width="26" height="26" rx="2" fill="#2E3D31"/>
              <rect x="10" y="100" width="50" height="50" rx="4" fill="none" stroke="#2E3D31" strokeWidth="6"/>
              <rect x="22" y="112" width="26" height="26" rx="2" fill="#2E3D31"/>
              <rect x="72" y="10" width="8" height="8" fill="#2E3D31"/>
              <rect x="84" y="10" width="8" height="8" fill="#2E3D31"/>
              <rect x="72" y="22" width="8" height="8" fill="#2E3D31"/>
              <rect x="84" y="30" width="8" height="8" fill="#2E3D31"/>
              <rect x="10" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="22" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="10" y="84" width="8" height="8" fill="#2E3D31"/>
              <rect x="72" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="84" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="100" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="112" y="84" width="8" height="8" fill="#2E3D31"/>
              <rect x="72" y="84" width="8" height="8" fill="#2E3D31"/>
              <rect x="72" y="100" width="8" height="8" fill="#2E3D31"/>
              <rect x="84" y="112" width="8" height="8" fill="#2E3D31"/>
              <rect x="100" y="100" width="8" height="8" fill="#2E3D31"/>
              <rect x="112" y="100" width="8" height="8" fill="#2E3D31"/>
              <rect x="124" y="112" width="8" height="8" fill="#2E3D31"/>
              <rect x="136" y="84" width="8" height="8" fill="#2E3D31"/>
              <rect x="136" y="100" width="8" height="8" fill="#2E3D31"/>
              <rect x="136" y="112" width="8" height="8" fill="#2E3D31"/>
              <rect x="124" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="34" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="34" y="84" width="8" height="8" fill="#2E3D31"/>
              <rect x="46" y="72" width="8" height="8" fill="#2E3D31"/>
              <rect x="46" y="84" width="8" height="8" fill="#2E3D31"/>
              <rect x="22" y="136" width="8" height="8" fill="#2E3D31"/>
              <rect x="34" y="124" width="8" height="8" fill="#2E3D31"/>
              <rect x="46" y="136" width="8" height="8" fill="#2E3D31"/>
              <rect x="58" y="124" width="8" height="8" fill="#2E3D31"/>
            </svg>
          </div>

          <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#f0f4f0' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--vert-sauge-fonce)' }}>
              {t('pix.cle')}
            </p>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-sm font-mono break-all" style={{ color: 'var(--vert-sauge-fonce)' }}>
                {PIX_CLE}
              </span>
              <button
                onClick={copierCle}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                style={{ backgroundColor: copie ? 'var(--vert-olive)' : 'var(--vert-sauge)' }}
              >
                {copie ? t('pix.copie') : t('pix.copier')}
              </button>
            </div>
          </div>

          <div className="w-full text-sm flex justify-between" style={{ color: 'var(--couleur-texte-doux)' }}>
            <span>{t('pix.beneficiaire')}</span>
            <span className="font-semibold" style={{ color: 'var(--vert-sauge-fonce)' }}>{PIX_BENEFICIAIRE}</span>
          </div>
        </div>

        <div className="rounded-xl p-4 text-sm text-center" style={{ backgroundColor: '#fdf8f0', border: '1px solid #f0e8d0' }}>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>ℹ️ {t('pix.info')}</p>
        </div>

        {/* Upload comprovante */}
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
            {pt ? '📎 Comprovante de pagamento' : '📎 Preuve de paiement (comprovante)'}
          </p>
          <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>
            {pt
              ? 'Anexe a captura de tela ou PDF do comprovante PIX.'
              : 'Joignez la capture d\'écran ou le PDF de votre comprovante PIX.'}
          </p>

          {!comprovante ? (
            <label
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:opacity-80"
              style={{ borderColor: 'var(--vert-olive)', backgroundColor: '#f4f7f4' }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4 L16 22M8 14 L16 6 L24 14" stroke="#4A5D4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 26 L28 26" stroke="#93A27D" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--vert-sauge-fonce)' }}>
                {pt ? 'Selecionar arquivo' : 'Choisir un fichier'}
              </span>
              <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>JPG, PNG ou PDF</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleComprovanteChange}
              />
            </label>
          ) : (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--couleur-bordure)' }}>
              {comprovantePreview ? (
                <img src={comprovantePreview} alt="comprovante" className="w-full max-h-48 object-contain bg-white" />
              ) : (
                <div className="flex items-center gap-3 p-4" style={{ backgroundColor: '#f4f7f4' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="2" width="20" height="26" rx="2" fill="#D27D56" opacity="0.2" stroke="#D27D56" strokeWidth="1.5"/>
                    <path d="M20 2 L28 10" stroke="#D27D56" strokeWidth="1.5"/>
                    <rect x="20" y="2" width="8" height="8" rx="1" fill="#D27D56" opacity="0.3"/>
                    <text x="7" y="22" fontSize="6" fill="#D27D56" fontWeight="bold">PDF</text>
                  </svg>
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--couleur-texte)' }}>{comprovante.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#eef3ee' }}>
                <span className="text-xs" style={{ color: 'var(--vert-sauge-fonce)' }}>
                  ✓ {(comprovante.size / 1024).toFixed(0)} Ko
                </span>
                <button
                  onClick={() => { setComprovante(null); setComprovantePreview(null) }}
                  className="text-xs underline"
                  style={{ color: 'var(--couleur-texte-doux)' }}
                >
                  {pt ? 'Remover' : 'Supprimer'}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleConfirmerPaiement}
          disabled={chargement || !comprovante}
          className="w-full py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
        >
          {chargement ? t('pix.attente') : t('pix.confirmer')}
        </button>

        <button
          onClick={() => setEtape('formulaire')}
          className="text-sm text-center underline"
          style={{ color: 'var(--couleur-texte-doux)' }}
        >
          {pt ? '← Voltar' : '← Retour'}
        </button>
      </div>
    )
  }

  const champs = [
    { id: 'prenom', label: t('prenom'), type: 'text', autocomplete: 'given-name' },
    { id: 'nom', label: t('nom'), type: 'text', autocomplete: 'family-name' },
    { id: 'email', label: t('email'), type: 'email', autocomplete: 'email' },
    { id: 'telephone', label: t('telephone'), type: 'tel', autocomplete: 'tel' },
  ] as const

  return (
    <div className="flex flex-col gap-6">
      {/* Choix retrait / livraison */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {pt ? 'Como quer receber?' : 'Mode de réception'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(['retrait', 'livraison'] as Mode[]).map(m => {
            const actif = mode === m
            const emoji = m === 'retrait' ? '🏡' : '🛵'
            const titre = m === 'retrait'
              ? (pt ? 'Retirada' : 'Retrait')
              : (pt ? 'Entrega' : 'Livraison')
            const sous = m === 'retrait'
              ? (pt ? 'Você vem buscar' : 'Vous venez chercher')
              : (pt ? '+R$ 20 · Entrega na segunda' : '+R$ 20 · Livraison lundi')
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="rounded-xl p-4 text-left transition-all border-2"
                style={{
                  borderColor: actif ? 'var(--vert-sauge-fonce)' : 'var(--couleur-bordure)',
                  backgroundColor: actif ? '#eef3ee' : 'transparent',
                }}
              >
                <p className="text-2xl mb-1">{emoji}</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>{titre}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>{sous}</p>
              </button>
            )
          })}
        </div>
        {mode === 'retrait' && (
          <p className="text-xs mt-3 px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            📱 {pt
              ? 'O horário de retirada será combinado pelo WhatsApp após o pagamento.'
              : 'L\'horaire de retrait sera défini par WhatsApp après le paiement.'}
          </p>
        )}
        {mode === 'livraison' && (
          <p className="text-xs mt-3 px-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            📱 {pt
              ? 'O horário de entrega (segunda-feira) será confirmado pelo WhatsApp.'
              : 'L\'horaire de livraison (lundi) sera confirmé par WhatsApp.'}
          </p>
        )}
      </div>

      {/* Récap panier */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {pt ? 'Resumo do pedido' : 'Récapitulatif'}
        </h2>
        {articles.map(a => (
          <div key={a.produit.id} className="flex justify-between text-sm py-1">
            <span style={{ color: 'var(--couleur-texte)' }}>{a.produit.nom} × {a.quantite}</span>
            <span className="font-medium" style={{ color: 'var(--couleur-texte)' }}>R$ {(a.produit.prix * a.quantite).toFixed(2)}</span>
          </div>
        ))}
        {mode === 'livraison' && (
          <div className="flex justify-between text-sm py-1">
            <span style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Taxa de entrega' : 'Frais de livraison'}
            </span>
            <span style={{ color: 'var(--couleur-texte-doux)' }}>R$ {FRAIS_LIVRAISON.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold mt-3 pt-3" style={{ borderTop: '1px solid var(--couleur-bordure)' }}>
          <span style={{ color: 'var(--couleur-texte)' }}>{t('total')}</span>
          <span style={{ color: 'var(--vert-sauge-fonce)' }}>R$ {totalFinal.toFixed(2)}</span>
        </div>
        {mode === 'livraison' && totalPrix < MONTANT_MINIMUM && (
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--terracotta)' }}>
            {pt
              ? `Adicione R$ ${(MONTANT_MINIMUM - totalPrix).toFixed(2)} para atingir o mínimo de entrega (R$ ${MONTANT_MINIMUM}).`
              : `Ajoutez R$ ${(MONTANT_MINIMUM - totalPrix).toFixed(2)} pour atteindre le minimum de livraison (R$ ${MONTANT_MINIMUM}).`}
          </p>
        )}
      </div>

      {/* Formulaire coordonnées */}
      <form onSubmit={handleSubmit} className="rounded-2xl p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {t('coordonnees')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {champs.map(({ id, label, type, autocomplete }) => (
            <div key={id} className={id === 'email' || id === 'telephone' ? 'col-span-1' : ''}>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>{label}</label>
              <input
                type={type}
                name={id}
                autoComplete={autocomplete}
                value={form[id]}
                onChange={set(id)}
                required
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--couleur-bordure)', '--tw-ring-color': 'var(--vert-sauge)' } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        {mode === 'livraison' && (
          <AdresseAutocomplete
            value={form.adresse}
            label={t('adresse')}
            locale={locale}
            onChange={(adresse, valide) => {
              setForm(prev => ({ ...prev, adresse }))
            }}
          />
        )}

        {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

        <button
          type="submit"
          disabled={mode === 'livraison' && totalPrix < MONTANT_MINIMUM}
          className="w-full py-3.5 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-dm-sans)' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#32BCAD"/>
            <path d="M5 11 L9 7 L11 9.5 L15 5 L17 7 L11 13 L9 10.5 Z" fill="white"/>
            <path d="M5 16 L9 12 L11 14.5 L15 10 L17 12 L11 18 L9 15.5 Z" fill="white" opacity="0.7"/>
          </svg>
          {t('payer')}
        </button>
      </form>
    </div>
  )
}
