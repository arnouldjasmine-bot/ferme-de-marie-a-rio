export default function PageLogin() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--couleur-accent)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{
          backgroundColor: 'var(--couleur-fond-carte)',
          boxShadow: 'var(--ombre-modale)'
        }}
      >
        <a
          href="/fr"
          className="flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--couleur-texte-doux)' }}
        >
          ← Retour au site
        </a>

        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}
        >
          Ferme de Marie à Rio
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>
          Espace administrateur
        </p>

        <form action="/api/auth/login" method="POST" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border rounded-lg px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border rounded-lg px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--couleur-bordure)', borderRadius: 'var(--rayon-bordure)' }}
            />
          </div>
          <button
            type="submit"
            className="mt-2 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--couleur-primaire)', borderRadius: 'var(--rayon-bordure)' }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
