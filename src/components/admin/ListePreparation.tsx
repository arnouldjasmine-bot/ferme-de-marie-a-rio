'use client'

import { useState } from 'react'
import type { GroupePreparation } from '@/app/(admin)/commandes/preparation/page'

export default function ListePreparation({ groupes }: { groupes: GroupePreparation[] }) {
  const [coches, setCoches] = useState<Set<string>>(new Set())

  function basculer(cle: string) {
    setCoches(prev => {
      const suivant = new Set(prev)
      if (suivant.has(cle)) suivant.delete(cle)
      else suivant.add(cle)
      return suivant
    })
  }

  const totalLignes = groupes.reduce((s, g) => s + g.lignes.length, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>
          {coches.size}/{totalLignes} préparé{coches.size > 1 ? 's' : ''}
        </p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
        >
          🖨️ Imprimer
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {groupes.map(groupe => (
          <div
            key={groupe.value}
            className="rounded-xl overflow-hidden print:shadow-none print:border print:border-gray-300"
            style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
          >
            <div
              className="px-4 py-2.5 font-bold text-sm flex items-center gap-2"
              style={{ backgroundColor: 'var(--admin-sidebar)', color: 'var(--admin-sidebar-texte)' }}
            >
              <span>{groupe.emoji}</span>
              <span>{groupe.label}</span>
              <span className="opacity-60 font-normal">({groupe.lignes.length})</span>
            </div>
            <div>
              {groupe.lignes.map(ligne => {
                const cle = groupe.value + '|' + ligne.nom
                const coche = coches.has(cle)
                const detail = ligne.details
                  .slice()
                  .sort((a, b) => a.client.localeCompare(b.client))
                  .map(d => `${d.client} (${d.quantite})`)
                  .join(', ')
                return (
                  <label
                    key={cle}
                    className="flex items-start gap-3 px-4 py-2.5 cursor-pointer select-none"
                    style={{ borderTop: '1px solid var(--couleur-bordure)' }}
                  >
                    <input
                      type="checkbox"
                      checked={coche}
                      onChange={() => basculer(cle)}
                      className="w-4 h-4 shrink-0 mt-0.5 print:hidden"
                    />
                    <span className="print:inline hidden">☐</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className="text-sm"
                          style={{
                            color: coche ? 'var(--couleur-texte-doux)' : 'var(--couleur-texte)',
                            textDecoration: coche ? 'line-through' : 'none',
                          }}
                        >
                          {ligne.nom}
                        </span>
                        <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                          × {ligne.quantite}{ligne.unite ? ` (${ligne.unite})` : ''}
                        </span>
                      </div>
                      {detail && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>
                          {detail}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
