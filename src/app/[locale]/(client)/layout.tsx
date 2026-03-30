import NavClient from '@/components/client/NavClient'
import BottomNavClient from '@/components/client/BottomNavClient'
import AuthProvider from '@/components/client/AuthProvider'

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export default async function ClientLayout({ children, params }: Props) {
  const { locale } = await params

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <NavClient />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4" style={{ backgroundColor: 'var(--vert-sauge-fonce)', color: '#fff' }}>
          <div className="max-w-5xl mx-auto px-4 flex flex-row items-center justify-between gap-2">
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-playfair)' }}>La Ferme de Marie à Rio</p>
              <p className="text-xs opacity-50 mt-0.5">Rio de Janeiro, Brésil</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <a href={`/${locale}/mes-commandes`} className="text-xs opacity-60 hover:opacity-90 transition-opacity underline">
                Suivre ma commande
              </a>
              <p className="text-xs opacity-30">© {new Date().getFullYear()} La Ferme de Marie</p>
            </div>
            <a href="/login" className="text-xs opacity-30 hover:opacity-60 transition-opacity">
              Espace admin
            </a>
          </div>
        </footer>
        <BottomNavClient />
      </div>
    </AuthProvider>
  )
}
