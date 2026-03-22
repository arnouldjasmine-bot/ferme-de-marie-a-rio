import { createServiceClient } from '@/lib/supabase/service'
import PagePaiementContent from './PagePaiementContent'

type Article = { nom: string; quantite: number; prix: number }
type Order = {
  id: string
  prenom: string
  nom: string
  total: number
  articles: Article[]
  mode_livraison: string
  frais_livraison: number
  comprovante_url: string | null
  locale: string
}

export default async function PagePayer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('orders')
    .select('id, prenom, nom, total, articles, mode_livraison, frais_livraison, comprovante_url, locale')
    .eq('id', id)
    .single()

  const order = data as Order | null

  if (!order) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--couleur-fond)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            background: 'var(--couleur-fond-carte)',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '0 auto',
            boxShadow: 'var(--ombre-carte)',
          }}
        >
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</p>
          <p style={{ color: 'var(--vert-sauge-fonce)', fontWeight: 600, fontSize: '1.1rem' }}>
            Lien invalide ou commande introuvable
          </p>
        </div>
      </main>
    )
  }

  if (order.comprovante_url) {
    const pt = order.locale === 'pt-BR'
    return (
      <main style={{ minHeight: '100vh', background: 'var(--couleur-fond)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            background: 'var(--couleur-fond-carte)',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '0 auto',
            boxShadow: 'var(--ombre-carte)',
          }}
        >
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</p>
          <p style={{ color: 'var(--vert-sauge-fonce)', fontWeight: 600, fontSize: '1.1rem' }}>
            {pt ? 'Pagamento já recebido, obrigado!' : 'Paiement déjà reçu, merci !'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--couleur-fond)', padding: '2rem 1rem' }}>
      <PagePaiementContent order={order} />
    </main>
  )
}
