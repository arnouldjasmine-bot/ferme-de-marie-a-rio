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
  // affichage = adresse déjà enregistrée, utilisable telle quelle ; edition = formulaire CEP
  const [mode, setMode] = useState<'affichage' | 'edition'>(value ? 'affichage' : 'edition')
  const initialiseRef = useRef(false)

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

  // Une adresse déjà enregistrée (profil, ou chargée après coup) est valide telle quelle :
  // pas besoin de la retaper à chaque commande.
  useEffect(() => {
    if (initialiseRef.current || !value) return
    initialiseRef.current = true
    setMode('affichage')
    onChange(value, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function modifier() {
    initialiseRef.current = true // ne plus laisser l'effet ci-dessus reprendre la main
    setMode('edition')
    onChange('', false)
  }

  // Recherche ViaCEP dès que 8 chiffres sont saisis
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
            ? 'CEP não encontrado. Preencha o endereço manualmente.'
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
          ? 'Erro ao buscar o CEP. Preencha o endereço manualmente.'
          : 'Erreur lors de la recherche do CEP. Renseignez l\'adresse manuellement.')
      })
      .finally(() => { if (!annule) setRecherche(false) })

    return () => { annule = true }
  }, [cep, pt])

  // Recompose et remonte l'adresse complète au formulaire parent
  useEffect(() => {
    if (mode !== 'edition') return
    if (!cep && !logradouro && !numero) return // rien saisi : ne pas écraser la valeur d'origine
    const cepOk = cep.replace(/\D/g, '').length === 8
    const valide = cepOk && logradouro.trim().length > 0 && numero.trim().length > 0
    const complementPart = complemento.trim() ? ` - ${complemento.trim()}` : ''
    const adresse = `${logradouro}, ${numero}${complementPart}, ${bairro} - ${cidade}/${uf}, CEP ${cep}`
    onChange(adresse, valide)
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

  const afficherDetails = logradouro || erreurCep

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
          {label}
        </label>
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
            {pt ? 'Buscando o endereço…' : 'Recherche de l\'adresse…'}
          </p>
        )}
        {erreurCep && (
          <p className="text-xs mt-1" style={{ color: 'var(--couleur-erreur)' }}>{erreurCep}</p>
        )}
      </div>

      {afficherDetails && (
        <>
          <input
            type="text"
            value={logradouro}
            onChange={e => setLogradouro(e.target.value)}
            placeholder={pt ? 'Rua' : 'Rue'}
            required
            className={champClasse}
            style={champStyle}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              placeholder={pt ? 'Número' : 'Numéro'}
              required
              className={champClasse}
              style={champStyle}
            />
            <input
              type="text"
              value={complemento}
              onChange={e => setComplemento(e.target.value)}
              placeholder={pt ? 'Complemento (opcional)' : 'Complément (optionnel)'}
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
        </>
      )}
    </div>
  )
}
