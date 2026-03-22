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
  // true = Maps chargé avec autocomplete, false = fallback texte libre
  const [mapsCharge, setMapsCharge] = useState(false)

  useEffect(() => {
    const init = () => {
      if (!inputRef.current || !window.google?.maps?.places) return

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'br' },
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
          onChange(inputRef.current?.value ?? '', false)
        }
      })

      setMapsCharge(true)
    }

    if (window.google?.maps?.places) {
      init()
    } else {
      // Attendre max 5s, sinon fallback texte libre
      let elapsed = 0
      const interval = setInterval(() => {
        elapsed += 200
        if (window.google?.maps?.places) {
          clearInterval(interval)
          init()
        } else if (elapsed >= 5000) {
          clearInterval(interval)
          // Fallback : accepte le texte libre, considéré valide dès 5 caractères
          setMapsCharge(false)
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (mapsCharge) {
      // Avec Maps : invalider si l'utilisateur modifie après sélection
      if (valide) setValide(false)
      onChange(val, false)
    } else {
      // Sans Maps : accepter le texte libre (valide si >= 5 caractères)
      const ok = val.length >= 5
      setValide(ok)
      onChange(val, ok)
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
      {mapsCharge && !valide && value.length > 3 && (
        <p className="text-xs mt-1" style={{ color: 'var(--terracotta)' }}>
          {locale === 'pt-BR'
            ? 'Selecione um endereço na lista de sugestões.'
            : 'Sélectionnez une adresse dans les suggestions.'}
        </p>
      )}
    </div>
  )
}
