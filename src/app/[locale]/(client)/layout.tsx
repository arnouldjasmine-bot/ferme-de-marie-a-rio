import NavClient from '@/components/client/NavClient'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavClient />
      <main className="flex-1">
        {children}
      </main>
      <footer className="pt-10 pb-6" style={{ backgroundColor: 'var(--vert-sauge-fonce)', color: '#fff' }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>Ferme de Marie à Rio</p>
            <p className="text-sm opacity-60 mt-1">Rio de Janeiro, Brésil</p>
          </div>
          <p className="text-xs opacity-40">© {new Date().getFullYear()} Ferme de Marie à Rio</p>
          <a
            href="/login"
            className="text-xs opacity-25 hover:opacity-60 transition-opacity"
          >
            Espace admin
          </a>
        </div>
      </footer>
    </div>
  )
}
