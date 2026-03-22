'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePanier } from '@/lib/panier-context'
import { useAuth } from './AuthProvider'
import AdresseAutocomplete from './AdresseAutocomplete'

type Etape = 'formulaire' | 'confirmation'
type Mode  = 'retrait' | 'livraison'

const FRAIS_LIVRAISON = 20
const MONTANT_MINIMUM = 30   // s'applique uniquement en mode livraison

const PAYS = [
  { code: '+55', flag: '🇧🇷', label: 'BR', locale: 'pt-BR' },
  { code: '+33', flag: '🇫🇷', label: 'FR', locale: 'fr' },
  { code: '+351', flag: '🇵🇹', label: 'PT', locale: 'pt-BR' },
  { code: '+1',   flag: '🇺🇸', label: 'US', locale: 'fr' },
] as const
type Pays = typeof PAYS[number]

export default function FormulaireCommande({ locale }: { locale: string }) {
  const t    = useTranslations('commande')
  const tErr = useTranslations('erreurs')
  const { articles, totalPrix, viderPanier } = usePanier()
  const { user, profile } = useAuth()

  // Indicatif pays par défaut selon la langue du site
  const paysDefaut = locale === 'pt-BR' ? PAYS[0] : PAYS[1]
  const [paysSelectionne, setPaysSelectionne] = useState<Pays>(paysDefaut)
  // La locale de la commande = langue du site (URL), pas l'indicatif pays
  const pt = locale === 'pt-BR'

  const [etape, setEtape]           = useState<Etape>('formulaire')
  const [mode, setMode]             = useState<Mode>('livraison')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState('')
  const [adresseValide, setAdresseValide] = useState(false)
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  })

  // Préremplir avec le profil utilisateur
  useEffect(() => {
    if (profile) {
      let telLocal = ''
      if (profile.telephone) {
        // Extraire l'indicatif pays par correspondance exacte (ordre: +351 avant +1)
        const codesOrdonnes = ['+351', '+55', '+33', '+1']
        const codeMatch = codesOrdonnes.find(c => profile.telephone!.startsWith(c))
        if (codeMatch) {
          const pays = PAYS.find(p => p.code === codeMatch)
          if (pays) setPaysSelectionne(pays)
          telLocal = profile.telephone.slice(codeMatch.length).trim()
        } else {
          telLocal = profile.telephone
        }
      }
      setForm(prev => ({
        ...prev,
        prenom:    profile.prenom    || prev.prenom,
        nom:       profile.nom       || prev.nom,
        email:     user?.email       || prev.email,
        telephone: telLocal          || prev.telephone,
        adresse:   profile.adresse   || prev.adresse,
      }))
    } else if (user?.email) {
      setForm(prev => ({ ...prev, email: user.email ?? prev.email }))
    }
  }, [profile, user])

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
    if (mode === 'livraison' && !adresseValide) {
      setErreur(pt
        ? 'Por favor, selecione um endereço válido nas sugestões.'
        : 'Veuillez sélectionner une adresse valide dans les suggestions.')
      return
    }
    if (mode === 'livraison' && totalPrix < MONTANT_MINIMUM) {
      setErreur(pt
        ? `Pedido mínimo de R$ ${MONTANT_MINIMUM.toFixed(2)} para entrega.`
        : `Commande minimum de R$ ${MONTANT_MINIMUM.toFixed(2)} pour la livraison.`)
      return
    }

    setChargement(true)
    try {
      // Construire le numéro complet avec indicatif pays
      const telDigits = telephone.replace(/\D/g, '')
      const telephoneComplet = paysSelectionne.code + telDigits

      const data = new FormData()
      data.append('prenom', prenom)
      data.append('nom', nom)
      data.append('email', email)
      data.append('telephone', telephoneComplet)
      data.append('adresse', adresse)
      data.append('total', totalFinal.toString())
      data.append('mode_livraison', mode)
      data.append('frais_livraison', mode === 'livraison' ? FRAIS_LIVRAISON.toString() : '0')
      data.append('articles', JSON.stringify(articles.map(a => ({
        id: a.produit.id,
        nom: a.produit.nom,
        quantite: a.quantite,
        prix: a.produit.prix,
      }))))
      data.append('locale', locale)
      if (user?.id) {
        data.append('user_id', user.id)
      }
      await fetch('/api/commandes', { method: 'POST', body: data })
    } catch (err) {
      console.error(err)
    }
    viderPanier()
    setEtape('confirmation')
    setChargement(false)
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
        <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt
            ? 'Seu pedido foi registrado! Vamos te enviar o link de pagamento pelo WhatsApp assim que prepararmos seu pedido.'
            : 'Votre commande est bien enregistrée ! Nous vous enverrons le lien de paiement par WhatsApp une fois que nous aurons préparé votre commande.'}
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

  const champsBase = [
    { id: 'prenom', label: t('prenom'), type: 'text', autocomplete: 'given-name' },
    { id: 'nom', label: t('nom'), type: 'text', autocomplete: 'family-name' },
    { id: 'email', label: t('email'), type: 'email', autocomplete: 'email' },
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
          {champsBase.map(({ id, label, type, autocomplete }) => (
            <div key={id}>
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

          {/* Téléphone avec sélecteur d'indicatif pays */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
              {t('telephone')}
            </label>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--couleur-bordure)' }}>
              {/* Sélecteur pays */}
              <select
                value={paysSelectionne.code}
                onChange={e => {
                  const p = PAYS.find(p => p.code === e.target.value)
                  if (p) setPaysSelectionne(p)
                }}
                className="shrink-0 border-r px-2 py-2 text-sm bg-transparent outline-none focus:ring-2 cursor-pointer"
                style={{
                  borderColor: 'var(--couleur-bordure)',
                  color: 'var(--couleur-texte)',
                  '--tw-ring-color': 'var(--vert-sauge)',
                } as React.CSSProperties}
              >
                {PAYS.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.flag} {p.code}
                  </option>
                ))}
              </select>
              {/* Numéro local */}
              <input
                type="tel"
                name="telephone"
                autoComplete="tel-national"
                placeholder={paysSelectionne.code === '+55' ? '21 99999-9999' : '6 12 34 56 78'}
                value={form.telephone}
                onChange={set('telephone')}
                required
                className="flex-1 px-3 py-2 text-sm outline-none focus:ring-2 bg-transparent"
                style={{ '--tw-ring-color': 'var(--vert-sauge)' } as React.CSSProperties}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--couleur-texte-doux)' }}>
              {pt ? 'Selecione o código do seu país' : "Sélectionnez l'indicatif de votre pays"}
            </p>
          </div>
        </div>

        {mode === 'livraison' && (
          <AdresseAutocomplete
            value={form.adresse}
            label={t('adresse')}
            locale={locale}
            onChange={(adresse, valide) => {
              setForm(prev => ({ ...prev, adresse }))
              setAdresseValide(valide)
            }}
          />
        )}

        {erreur && <p className="text-sm" style={{ color: 'var(--couleur-erreur)' }}>{erreur}</p>}

        <button
          type="submit"
          disabled={chargement || (mode === 'livraison' && totalPrix < MONTANT_MINIMUM) || (mode === 'livraison' && !adresseValide && form.adresse.length > 3)}
          className="w-full py-3.5 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-dm-sans)' }}
        >
          {chargement
            ? (pt ? 'Enviando...' : 'Envoi en cours...')
            : (pt ? 'Enviar pedido' : 'Envoyer la commande')}
        </button>
      </form>
    </div>
  )
}
