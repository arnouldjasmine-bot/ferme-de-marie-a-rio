export default function PageDashboard() {
  return (
    <div>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
      >
        Tableau de bord
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Commandes aujourd\'hui', valeur: '—' },
          { label: 'CA cette semaine', valeur: '—' },
          { label: 'Produits actifs', valeur: '—' },
          { label: 'Stock faible', valeur: '—' }
        ].map(({ label, valeur }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{
              backgroundColor: 'var(--couleur-fond-carte)',
              boxShadow: 'var(--ombre-carte)',
              borderRadius: 'var(--rayon-bordure-grand)'
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>{valeur}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
