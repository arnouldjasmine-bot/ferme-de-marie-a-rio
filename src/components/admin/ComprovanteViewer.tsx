'use client'

import { useState } from 'react'

export default function ComprovanteViewer({ url }: { url: string }) {
  const [ouvert, setOuvert] = useState(false)
  const isPdf = url.toLowerCase().endsWith('.pdf')

  return (
    <>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--couleur-bordure)' }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: '#eef3ee' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm">✅</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--vert-sauge-fonce)' }}>
              Comprovante reçu
            </span>
          </div>
          <button
            onClick={() => setOuvert(!ouvert)}
            className="text-xs font-medium px-3 py-1 rounded-full transition-all"
            style={{ backgroundColor: 'var(--vert-sauge)', color: '#fff' }}
          >
            {ouvert ? 'Masquer' : 'Voir'}
          </button>
        </div>

        {ouvert && (
          <div className="p-3 bg-white">
            {isPdf ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="3" width="30" height="39" rx="3" fill="#D27D56" opacity="0.2" stroke="#D27D56" strokeWidth="2"/>
                  <path d="M30 3 L42 15" stroke="#D27D56" strokeWidth="2"/>
                  <rect x="30" y="3" width="12" height="12" rx="2" fill="#D27D56" opacity="0.3"/>
                  <text x="11" y="34" fontSize="10" fill="#D27D56" fontWeight="bold">PDF</text>
                </svg>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium px-4 py-2 rounded-full text-white"
                  style={{ backgroundColor: 'var(--terracotta)' }}
                >
                  Ouvrir le PDF
                </a>
              </div>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt="Comprovante de paiement"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}
