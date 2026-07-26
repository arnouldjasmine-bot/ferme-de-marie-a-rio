'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Centre : Barra da Tijuca / Recreio / Zona Sul — Rio de Janeiro
const CENTRE_RIO: [number, number] = [-23.0096, -43.3576]

type Livraison = {
  id: string
  prenom: string
  nom: string
  adresse: string
  total: number
  statut: string
  created_at: string
  lat: number
  lng: number
}

const STATUT_COULEUR: Record<string, string> = {
  en_attente: '#D27D56',
  confirmee:  '#4A5D4E',
  livree:     '#93A27D',
}

const STATUT_LABEL: Record<string, string> = {
  en_attente: 'En attente',
  confirmee:  'Confirmée',
  livree:     'Livrée',
}

function creerIcone(couleur: string) {
  return L.divIcon({
    html: `<svg width="26" height="32" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18c0-6.6-5.4-12-12-12z" fill="${couleur}" stroke="#fff" stroke-width="1.5"/>
    </svg>`,
    className: '',
    iconSize: [26, 32],
    iconAnchor: [13, 32],
    popupAnchor: [0, -28],
  })
}

export default function CarteLeaflet({ livraisons }: { livraisons: Livraison[] }) {
  const [icones] = useState(() => ({
    en_attente: creerIcone(STATUT_COULEUR.en_attente),
    confirmee: creerIcone(STATUT_COULEUR.confirmee),
    livree: creerIcone(STATUT_COULEUR.livree),
  }))

  return (
    <MapContainer
      center={CENTRE_RIO}
      zoom={12}
      style={{ width: '100%', height: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {livraisons.map(l => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={icones[l.statut as keyof typeof icones] ?? icones.en_attente}
        >
          <Popup>
            <div style={{ fontFamily: 'sans-serif', minWidth: '160px' }}>
              <p style={{ fontWeight: 700, color: '#2E3D31', marginBottom: 4 }}>
                {l.prenom} {l.nom}
              </p>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{l.adresse}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 20,
                  backgroundColor: STATUT_COULEUR[l.statut] ?? '#D27D56',
                  color: '#fff',
                }}>
                  {STATUT_LABEL[l.statut] ?? l.statut}
                </span>
                <span style={{ fontWeight: 700, color: '#2E3D31' }}>R$ {l.total.toFixed(2)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
