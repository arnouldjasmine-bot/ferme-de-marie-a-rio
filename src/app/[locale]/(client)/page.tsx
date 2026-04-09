import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import EtoilesDisplay from '@/components/client/EtoilesDisplay'
import type { Produit } from '@/types'

type Props = { params: Promise<{ locale: string }> }
type PageContent = Record<string, { valeur_fr: string; valeur_pt: string }>
type AvisAccueil = { id: string; note: number; commentaire: string | null; prenom: string; nom: string }

function getSaisonRio(mois: number) {
  if (mois === 12 || mois <= 3) return { fr: 'Été',       pt: 'Verão',    emoji: '☀️', couleur: 'var(--terracotta)' }
  if (mois <= 6)                return { fr: 'Automne',   pt: 'Outono',   emoji: '🍂', couleur: 'var(--vert-olive)' }
  if (mois <= 9)                return { fr: 'Hiver',     pt: 'Inverno',  emoji: '🌿', couleur: 'var(--vert-sauge-fonce)' }
  return                               { fr: 'Printemps', pt: 'Primavera',emoji: '🌸', couleur: 'var(--vieux-rose)' }
}

export const dynamic = 'force-dynamic'

export default async function PageAccueil({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('accueil')

  const supabase = createServiceClient()
  const [{ data: produitsData }, { data: pageData }, { data: avisRaw }] = await Promise.all([
    supabase
      .from('products')
      .select('id, nom, prix, unite, stock, image_url, categorie, actif')
      .eq('actif', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('page_content')
      .select('cle, valeur_fr, valeur_pt'),
    supabase
      .from('avis')
      .select('id, user_id, note, commentaire')
      .eq('approuve', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const avisBase = (avisRaw ?? []) as { id: string; user_id: string; note: number; commentaire: string | null }[]
  const avisUserIds = [...new Set(avisBase.map(a => a.user_id).filter(Boolean))]
  const avisProfilesMap: Record<string, { prenom: string; nom: string }> = {}
  if (avisUserIds.length > 0) {
    const { data: avisProfiles } = await supabase
      .from('profiles')
      .select('id, prenom, nom')
      .in('id', avisUserIds)
    for (const p of (avisProfiles ?? [])) avisProfilesMap[p.id] = p
  }
  const avisAccueil: AvisAccueil[] = avisBase.map(a => ({
    id: a.id,
    note: a.note,
    commentaire: a.commentaire,
    prenom: avisProfilesMap[a.user_id]?.prenom ?? '',
    nom: avisProfilesMap[a.user_id]?.nom ?? '',
  }))

  const produitsSaison: Produit[] = (produitsData ?? []) as Produit[]
  const saison = getSaisonRio(new Date().getMonth() + 1)

  const pc: PageContent = {}
  for (const row of pageData ?? []) {
    pc[row.cle] = { valeur_fr: row.valeur_fr, valeur_pt: row.valeur_pt }
  }

  const pt = locale === 'pt-BR'
  const sousTitre = pc.hero_sous_titre
    ? (pt ? pc.hero_sous_titre.valeur_pt : pc.hero_sous_titre.valeur_fr) || t('sousTitre')
    : t('sousTitre')
  const description = pc.description
    ? (pt ? pc.description.valeur_pt : pc.description.valeur_fr)
    : null
  const annonce = pc.annonce
    ? (pt ? pc.annonce.valeur_pt : pc.annonce.valeur_fr)
    : null

  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 'clamp(320px, 58svh, 520px)' }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-ferme.jpg')" }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(20,35,23,0.82) 0%, rgba(30,45,33,0.55) 60%, rgba(210,125,86,0.18) 100%)' }} />

        <div
          className="relative z-10 flex flex-col items-center justify-center text-center px-5"
          style={{ minHeight: 'clamp(320px, 58svh, 520px)', paddingTop: '2rem', paddingBottom: '4rem' }}
        >
          <div className="drop-shadow-xl mb-3">
            <Image
              src="/logo.png"
              alt="Ferme de Marie à Rio"
              width={300}
              height={200}
              className="object-contain brightness-0 invert"
              style={{ width: 'clamp(110px, 34vw, 190px)', height: 'auto' }}
              priority
            />
          </div>

          <p
            className="mb-5 text-white/85 max-w-xs"
            style={{ fontFamily: 'var(--font-dancing)', fontSize: 'clamp(1rem, 4vw, 1.3rem)', lineHeight: 1.5 }}
          >
            {sousTitre}
          </p>

          <Link
            href={`/${locale}/produits`}
            className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--terracotta)',
              color: '#fff',
              fontFamily: 'var(--font-dm-sans)',
              letterSpacing: '0.03em',
              boxShadow: '0 4px 24px rgba(193,95,55,0.40)',
            }}
          >
            {t('voirProduits')}
          </Link>
        </div>

        {/* Vague */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,48 L0,48 Z" fill="#F5F2E9"/>
          </svg>
        </div>
      </section>

      {/* ── Bandeau annonce ── */}
      <section className="py-2.5 text-center" style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}>
        <p className="text-white/90 tracking-wide" style={{ fontFamily: 'var(--font-dancing)', fontSize: '1.25rem' }}>
          {annonce || (pt ? 'uma propriedade responsável' : 'une propriété responsable')}
        </p>
      </section>

      {/* ── Description ── */}
      {description && (
        <section className="pt-5 pb-1 px-5 text-center max-w-xl mx-auto">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--couleur-texte-doux)' }}>
            {description}
          </p>
        </section>
      )}

      {/* ── Valeurs — scroll horizontal mobile ── */}
      <section className="pt-6 pb-2">
        <div className="px-5 mb-4">
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--terracotta)' }}>
            {pt ? 'Por que escolher' : 'Pourquoi nous choisir'}
          </p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
            {t('valeurs.titre')}
          </h2>
        </div>

        {/* Scroll horizontal sur mobile, grille sur desktop */}
        <div className="flex gap-3 overflow-x-auto pb-3 px-5 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
          {[
            { img: '/icone-frais.png', titre: t('valeurs.frais'), desc: t('valeurs.fraisDesc'), couleur: 'var(--vert-olive)' },
            { img: '/icone-circuit.png', titre: t('valeurs.local'), desc: t('valeurs.localDesc'), couleur: 'var(--terracotta)' },
            { img: '/icone-naturel.png', titre: t('valeurs.naturel'), desc: t('valeurs.naturelDesc'), couleur: 'var(--vieux-rose)' },
          ].map((item, i) => (
            <div
              key={i}
              className="shrink-0 rounded-2xl p-4 flex flex-col gap-3 md:shrink"
              style={{
                width: 'clamp(200px, 64vw, 260px)',
                backgroundColor: 'var(--couleur-fond-carte)',
                boxShadow: '0 2px 16px rgba(74,93,78,0.08)',
                borderTop: `3px solid ${item.couleur}`,
              }}
            >
              <Image src={item.img} alt={item.titre} width={44} height={44} className="object-contain" />
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
                  {item.titre}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--couleur-texte-doux)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Produits de saison — scroll horizontal ── */}
      {produitsSaison.length > 0 && (
        <section className="pt-6 pb-4" style={{ backgroundColor: 'var(--creme-fonce)' }}>
          <div className="px-5 mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: saison.couleur }}
                >
                  {saison.emoji} {pt ? saison.pt : saison.fr}
                </span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
                {pt ? 'Produtos frescos' : 'Produits frais'}
              </h2>
            </div>
            <Link
              href={`/${locale}/produits`}
              className="text-xs font-semibold shrink-0"
              style={{ color: 'var(--vert-sauge-fonce)' }}
            >
              {pt ? 'Ver tudo →' : 'Voir tout →'}
            </Link>
          </div>

          {/* Scroll horizontal */}
          <div className="flex gap-3 overflow-x-auto pb-2 px-5 scrollbar-hide">
            {produitsSaison.map(p => (
              <Link
                key={p.id}
                href={`/${locale}/produits/${p.id}`}
                className="shrink-0 rounded-2xl overflow-hidden flex flex-col"
                style={{
                  width: 'clamp(140px, 42vw, 180px)',
                  backgroundColor: 'var(--couleur-fond-carte)',
                  boxShadow: '0 2px 12px rgba(74,93,78,0.10)',
                }}
              >
                <div className="relative" style={{ aspectRatio: '1/1', backgroundColor: 'var(--couleur-accent)' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                  }
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-xs leading-tight mb-1" style={{ color: 'var(--couleur-texte)' }}>{p.nom}</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                    R$ {p.prix.toFixed(2)}
                    <span className="font-normal ml-0.5" style={{ color: 'var(--couleur-texte-doux)', fontSize: 10 }}>/ {p.unite}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Avis clients — scroll horizontal ── */}
      {avisAccueil.length > 0 && (
        <section className="pt-6 pb-4">
          <div className="px-5 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--terracotta)' }}>
                {pt ? 'O que dizem' : 'Ce que disent nos clients'}
              </p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
                {pt ? 'Avaliações' : 'Avis clients'}
              </h2>
            </div>
            <Link
              href={`/${locale}/avis`}
              className="text-xs font-semibold shrink-0"
              style={{ color: 'var(--vert-sauge-fonce)' }}
            >
              {pt ? 'Ver tudo →' : 'Voir tout →'}
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 px-5 scrollbar-hide">
            {avisAccueil.map(a => (
              <div
                key={a.id}
                className="shrink-0 rounded-2xl p-4 flex flex-col gap-2"
                style={{
                  width: 'clamp(220px, 72vw, 280px)',
                  backgroundColor: 'var(--couleur-fond-carte)',
                  boxShadow: '0 2px 12px rgba(74,93,78,0.08)',
                }}
              >
                <EtoilesDisplay note={a.note} taille={13} />
                {a.commentaire && (
                  <p className="text-xs leading-relaxed italic flex-1" style={{ color: 'var(--couleur-texte)' }}>
                    &ldquo;{a.commentaire}&rdquo;
                  </p>
                )}
                <p className="text-xs font-semibold mt-auto" style={{ color: 'var(--vert-sauge-fonce)' }}>
                  {a.prenom ? `${a.prenom}${a.nom ? ' ' + a.nom[0] + '.' : ''}` : 'Client'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA final ── */}
      <section
        className="mx-4 mb-6 rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, var(--vert-sauge-fonce) 0%, var(--vert-olive) 100%)',
        }}
      >
        <h2 className="text-lg font-bold mb-1.5 text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
          {pt ? 'Direto da fazenda para você' : 'Directement de la ferme à vous'}
        </h2>
        <p className="text-xs mb-4 text-white/70 max-w-xs mx-auto">
          {pt
            ? 'Produtos frescos colhidos com cuidado, entregues na sua porta.'
            : 'Des produits frais cueillis avec soin, livrés à votre porte.'}
        </p>
        <Link
          href={`/${locale}/produits`}
          className="inline-block px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95"
          style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)' }}
        >
          {t('voirProduits')}
        </Link>
      </section>

    </div>
  )
}
