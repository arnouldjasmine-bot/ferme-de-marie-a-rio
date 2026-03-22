'use client'

import { useEffect, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'

// Centre : Barra da Tijuca / Recreio / Zona Sul — Rio de Janeiro
const CENTRE_RIO = { lat: -23.0096, lng: -43.3576 }

type Livraison = {
  id: string
  prenom: string
  nom: string
  adresse: string
  total: number
  statut: string
  createdAt: string
  lat: number
  lng: number
}

type Props = {
  livraisons: Livraison[]
  apiKey: string
}

const STATUT_COULEUR: Record<string, string> = {
  en_attente: '#D27D56',
  confirmee:  '#4A5D4E',
  livree:     '#93A27D',
}

export default function CarteLivraisons({ livraisons, apiKey }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  })

  const [selected, setSelected] = useState<Livraison | null>(null)

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl" style={{ backgroundColor: '#fdf8f0', border: '2px dashed #f0e8d0' }}>
        <div className="text-center p-8">
          <p className="text-2xl mb-3">🗺️</p>
          <p className="font-semibold mb-1" style={{ color: 'var(--vert-sauge-fonce)' }}>Erreur de chargement</p>
          <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Vérifiez votre clé API Google Maps.</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl" style={{ backgroundColor: '#f4f7f4' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: 'var(--vert-sauge)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement de la carte…</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '16px' }}
      center={CENTRE_RIO}
      zoom={12}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
        ],
      }}
    >
      {livraisons.map(l => (
        <Marker
          key={l.id}
          position={{ lat: l.lat, lng: l.lng }}
          onClick={() => setSelected(l)}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: STATUT_COULEUR[l.statut] ?? '#D27D56',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 1.5,
            scale: 1.8,
            anchor: { x: 12, y: 22 } as google.maps.Point,
          }}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ fontFamily: 'sans-serif', minWidth: '180px' }}>
            <p style={{ fontWeight: 700, color: '#2E3D31', marginBottom: 4 }}>
              {selected.prenom} {selected.nom}
            </p>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{selected.adresse}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 20,
                backgroundColor: STATUT_COULEUR[selected.statut] ?? '#D27D56',
                color: '#fff'
              }}>
                {selected.statut === 'en_attente' ? 'En attente'
                  : selected.statut === 'confirmee' ? 'Confirmée'
                  : 'Livrée'}
              </span>
              <span style={{ fontWeight: 700, color: '#2E3D31' }}>R$ {selected.total.toFixed(2)}</span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
