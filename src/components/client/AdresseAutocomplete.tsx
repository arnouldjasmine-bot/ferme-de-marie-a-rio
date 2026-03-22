'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (adresse: string, valide: boolean) => void
  label: string
  locale: string
}

export default function AdresseAutocomplete({ value, onChange, label, locale }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [valide, setValide] = useState(false)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    // Attendre que l'API Google Maps soit chargée
    const init = () => {
      if (!inputRef.current || !window.google?.maps?.places) return

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'br' }, // Brésil uniquement
        fields: ['formatted_address', 'geometry'],
        types: ['address'],
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace()
        if (place.formatted_address && place.geometry) {
          setValide(true)
          onChange(place.formatted_address, true)
        } else {
          setValide(false)
          onChange('', false)
        }
      })

      setChargement(false)
    }

    if (window.google?.maps?.places) {
      init()
    } else {
      // Attendre le chargement du script
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval)
          init()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Si l'utilisateur modifie manuellement après sélection, invalider
    if (valide) {
      setValide(false)
      onChange(e.target.value, false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--couleur-texte)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          onChange={handleInput}
          placeholder={locale === 'pt-BR' ? 'Digite seu endereço…' : 'Tapez votre adresse…'}
          required
          className="w-full border rounded-xl px-3 py-2 text-sm outline-none pr-8"
          style={{
            borderColor: valide ? 'var(--vert-olive)' : 'var(--couleur-bordure)',
            boxShadow: valide ? '0 0 0 2px rgba(147,162,125,0.25)' : 'none',
          }}
        />
        {valide && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base">✓</span>
        )}
      </div>
      {!valide && value.length > 3 && (
        <p className="text-xs mt-1" style={{ color: 'var(--terracotta)' }}>
          {locale === 'pt-BR'
            ? 'Selecione um endereço na lista de sugestões.'
            : 'Sélectionnez une adresse dans les suggestions.'}
        </p>
      )}
    </div>
  )
}
