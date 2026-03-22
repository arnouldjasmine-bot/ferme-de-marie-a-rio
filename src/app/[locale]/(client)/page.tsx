import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

type Props = { params: Promise<{ locale: string }> }

export default async function PageAccueil({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('accueil')

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
        {/* Photo de fond */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-ferme.jpg')" }} />
        {/* Dégradé warm overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(46,61,49,0.72) 0%, rgba(210,125,86,0.35) 100%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
          {/* Logo principal blanc */}
          <div className="mb-4 drop-shadow-lg">
            <Image src="/logo.png" alt="Ferme de Marie à Rio" width={380} height={250} className="object-contain brightness-0 invert" priority />
          </div>
          <p
            className="mb-10 max-w-md text-white/90"
            style={{ fontFamily: 'var(--font-dancing)', fontSize: '1.6rem' }}
          >
            {t('sousTitre')}
          </p>
          <Link
            href={`/${locale}/produits`}
            className="px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)' }}
          >
            {t('voirProduits')}
          </Link>
        </div>

        {/* Vague en bas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#F5F2E9"/>
          </svg>
        </div>
      </section>

      {/* ── Bandeau "une propriedade responsável" ── */}
      <section className="py-3 text-center" style={{ backgroundColor: 'var(--vert-olive)' }}>
        <p className="text-white italic" style={{ fontFamily: 'var(--font-dancing)', fontSize: '1.5rem' }}>
          {locale === 'pt-BR' ? 'uma propriedade responsável' : 'une propriété responsable'}
        </p>
      </section>

      {/* ── Valeurs ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--terracotta)' }}>
            {locale === 'pt-BR' ? 'Por que escolher' : 'Pourquoi nous choisir'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
            {t('valeurs.titre')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Produits frais */}
          <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
            <div className="w-full h-1 absolute top-0 left-0 right-0 rounded-t-2xl" style={{ backgroundColor: 'var(--vert-olive)' }} />
            <div className="flex items-center justify-center mb-5 mt-2">
              <Image src="/icone-frais.png" alt="Produits frais" width={88} height={88} className="object-contain" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>{t('valeurs.frais')}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--couleur-texte-doux)' }}>{t('valeurs.fraisDesc')}</p>
          </div>

          {/* Circuit court */}
          <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
            <div className="w-full h-1 absolute top-0 left-0 right-0 rounded-t-2xl" style={{ backgroundColor: 'var(--terracotta)' }} />
            <div className="flex items-center justify-center mb-5 mt-2">
              <Image src="/icone-circuit.png" alt="Circuit court" width={88} height={88} className="object-contain" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>{t('valeurs.local')}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--couleur-texte-doux)' }}>{t('valeurs.localDesc')}</p>
          </div>

          {/* 100% naturel */}
          <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
            <div className="w-full h-1 absolute top-0 left-0 right-0 rounded-t-2xl" style={{ backgroundColor: 'var(--vieux-rose)' }} />
            <div className="flex items-center justify-center mb-5 mt-2">
              <Image src="/icone-naturel.png" alt="100% naturel" width={88} height={88} className="object-contain" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>{t('valeurs.naturel')}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--couleur-texte-doux)' }}>{t('valeurs.naturelDesc')}</p>
          </div>
        </div>
      </section>

      {/* ── CTA submark ── */}
      <section className="py-16 text-center" style={{ backgroundColor: 'var(--creme-fonce)' }}>
        <Image src="/logo-submark.png" alt="FM" width={80} height={80} className="mx-auto mb-6 object-contain" />
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-playfair)' }}>
          {locale === 'pt-BR' ? 'Direto da fazenda para você' : 'Directement de la ferme à vous'}
        </h2>
        <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: 'var(--couleur-texte-doux)' }}>
          {locale === 'pt-BR'
            ? 'Produtos frescos colhidos com cuidado, entregues na sua porta.'
            : 'Des produits frais cueillis avec soin, livrés à votre porte.'}
        </p>
        <Link
          href={`/${locale}/produits`}
          className="inline-block px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--vert-sauge)', color: '#fff', fontFamily: 'var(--font-dm-sans)' }}
        >
          {t('voirProduits')}
        </Link>
      </section>
    </div>
  )
}
