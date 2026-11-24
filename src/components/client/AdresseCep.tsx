'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (adresse: string, valide: boolean) => void
  label: string
  locale: string
}

type ReponseViaCep = {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

function formaterCep(saisie: string) {
  const chiffres = saisie.replace(/\D/g, '').slice(0, 8)
  return chiffres.length > 5 ? `${chiffres.slice(0, 5)}-${chiffres.slice(5)}` : chiffres
}

const champClasse = 'w-full border rounded-xl px-3 py-2 text-sm outline-none'
const champStyle = { borderColor: 'var(--couleur-bordure)' }

export default function AdresseCep({ value, onChange, label, locale }: Props) {
  const pt = locale === 'pt-BR'
  // affichage = adresse d√©j√† enregistr√©e, utilisable telle quelle ; edition = formulaire CEP
  const [mode, setMode] = useState<'affichage' | 'edition'>(value ? 'affichage' : 'edition')
  const initialiseRef = useRef(false)
  // Valeur du dernier onChange √©mis par ce composant : permet de distinguer un
  // changement de `value` venant de l'ext√©rieur (profil charg√©) d'un changement
  // qui vient de notre propre recomposition (sinon la moindre frappe dans le CEP
  // repasserait aussit√¥t en mode "affichage" avec une adresse encore incompl√®te).
  const derniereValeurEmiseRef = useRef<string | null>(null)

  function emettre(adresse: string, valide: boolean) {
    derniereValeurEmiseRef.current = adresse
    onChange(adresse, valide)
  }

  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [recherche, setRecherche] = useState(false)
  const [erreurCep, setErreurCep] = useState('')
  const dernierCepRechercheRef = useRef('')

  // Une adresse d√©j√† enregistr√©e (profil, ou charg√©e apr√®s coup) est valide telle quelle :
  // pas besoin de la retaper √† chaque commande.
  useEffect(() => {
    if (initialiseRef.current || !value) return
    if (value === derniereValeurEmiseRef.current) return // vient de nous, pas du profil
    initialiseRef.current = true
    setMode('affichage')
    emettre(value, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function modifier() {
    initialiseRef.current = true // ne plus laisser l'effet ci-dessus reprendre la main
    setMode('edition')
    emettre('', false)
  }

  // Recherche ViaCEP d√®s que 8 chiffres sont saisis
  useEffect(() => {
    const chiffres = cep.replace(/\D/g, '')
    if (chiffres.length !== 8 || chiffres === dernierCepRechercheRef.current) return
    dernierCepRechercheRef.current = chiffres

    let annule = false
    setRecherche(true)
    setErreurCep('')

    fetch(`https://viacep.com.br/ws/${chiffres}/json/`)
      .then(res => res.json())
      .then((data: ReponseViaCep) => {
        if (annule) return
        if (data.erro) {
          setErreurCep(pt
            ? 'CEP n√£o encontrado. Preencha o endere√ßo manualmente.'
            : 'Code postal introuvable. Renseignez l\'adresse manuellement.')
          return
        }
        setLogradouro(data.logradouro ?? '')
        setBairro(data.bairro ?? '')
        setCidade(data.localidade ?? '')
        setUf(data.uf ?? '')
      })
      .catch(() => {
        if (!annule) setErreurCep(pt
          ? 'Erro ao buscar o CEP. Preencha o endere√ßo manualmente.'
          : 'Erreur lors de la recherche do CEP. Renseignez l\'adresse manuellement.')
      })
      .finally(() => { if (!annule) setRecherche(false) })

    return () => { annule = true }
  }, [cep, pt])

  // Recompose et remonte l'adresse compl√®te au formulaire parent
  useEffect(() => {
    if (mode !== 'edition') return
    if (!cep && !logradouro && !numero) return // rien saisi : ne pas √©craser la valeur d'origine
    // Le CEP aide √† pr√©-remplir et √† g√©ocoder, mais n'est pas obligatoire :
    // un client qui ne le conna√Æt pas doit pouvoir saisir son adresse √† la main.
    const chiffresCep = cep.replace(/\D/g, '').length
    const cepOk = chiffresCep === 0 || chiffresCep === 8
    const valide = cepOk && logradouro.trim().length > 0 && numero.trim().length > 0
    const complementPart = complemento.trim() ? ` - ${complemento.trim()}` : ''
    const villePart = [bairro.trim(), [cidade.trim(), uf.trim()].filter(Boolean).join('/')].filter(Boolean).join(' - ')
    const adresse = [
      `${logradouro.trim()}, ${numero.trim()}${complementPart}`,
      villePart,
      chiffresCep === 8 ? `CEP ${cep}` : '',
    ].filter(Boolean).join(', ')
    emettre(adresse, valide)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cep, logradouro, bairro, cidade, uf, numero, complemento])

  if (mode === 'affichage') {
    return (
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
          {label}
        </label>
        <div
          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
          style={{ border: '1px solid var(--couleur-bordure)' }}
        >
          <p className="text-sm" style={{ color: 'var(--couleur-texte)' }}>{value}</p>
          <button
            type="button"
            onClick={modifier}
            className="text-xs font-semibold shrink-0"
            style={{ color: 'var(--vert-sauge-fonce)' }}
          >
            {pt ? 'Alterar' : 'Modifier'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
          {label}
        </label>
        <p className="text-xs mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>
          {pt
            ? 'CEP (opcional ‚Äî preenche o endere√ßo automaticamente)'
            : 'CEP / code postal (optionnel ‚Äî remplit l\'adresse automatiquement)'}
        </p>
        <input
          type="text"
          inputMode="numeric"
          value={cep}
          onChange={e => setCep(formaterCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          className={champClasse}
          style={{ borderColor: erreurCep ? 'var(--couleur-erreur)' : 'var(--couleur-bordure)' }}
        />
        {recherche && (
          <p className="text-xs mt-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            {pt ? 'Buscando o endere√ßo‚Ä¶' : 'Recherche de l\'adresse‚Ä¶'}
          </p>
        )}
        {erreurCep && (
          <p className="text-xs mt-1" style={{ color: 'var(--couleur-erreur)' }}>{erreurCep}</p>
        )}
      </div>

          <input
            type="text"
            value={logradouro}
            onChange={e => setLogradouro(e.target.value)}
            placeholder={pt ? 'Rua' : 'Rue'}
            className={champClasse}
            style={champStyle}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              placeholder={pt ? 'N√∫mero' : 'Num√©ro'}
              className={champClasse}
              style={champStyle}
            />
            <input
              type="text"
              value={complemento}
              onChange={e => setComplemento(e.target.value)}
              placeholder={pt ? 'Complemento (opcional)' : 'Compl√©ment (optionnel)'}
              className={champClasse}
              style={champStyle}
            />
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: '2fr 2fr 1fr' }}>
            <input
              type="text"
              value={bairro}
              onChange={e => setBairro(e.target.value)}
              placeholder={pt ? 'Bairro' : 'Quartier'}
              className={champClasse}
              style={champStyle}
            />
            <input
              type="text"
              value={cidade}
              onChange={e => setCidade(e.target.value)}
              placeholder={pt ? 'Cidade' : 'Ville'}
              className={champClasse}
              style={champStyle}
            />
            <input
              type="text"
              value={uf}
              onChange={e => setUf(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="UF"
              className={champClasse}
              style={champStyle}
            />
          </div>
    </div>
  )
}
