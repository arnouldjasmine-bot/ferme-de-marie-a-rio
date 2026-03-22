export default function PageAdminStatistiques() {
  return (
    <div>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
      >
        Statistiques
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          'Chiffre d\'affaires hebdomadaire',
          'Chiffre d\'affaires mensuel',
          'Commandes par période',
          'Produits les plus vendus'
        ].map(label => (
          <div
            key={label}
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
          >
            <h2 className="font-semibold mb-4" style={{ color: 'var(--couleur-primaire-fonce)' }}>{label}</h2>
            <p style={{ color: 'var(--couleur-texte-doux)' }}>Données à charger...</p>
          </div>
        ))}
      </div>
    </div>
  )
}
