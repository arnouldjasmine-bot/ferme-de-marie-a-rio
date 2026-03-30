/**
 * Normalise un numéro de téléphone pour l'URL wa.me
 * wa.me attend : indicatif pays + numéro, sans + ni espaces ni tirets
 *
 * Règles :
 * - Si le numéro contient déjà un indicatif pays (commence par + ou 00) → on l'utilise tel quel
 * - Sinon → on ajoute l'indicatif brésilien 55 (client sans indicatif = numéro local brésilien)
 *
 * Exemples :
 *   "+33 6 72 39 53 84"  → "33672395384"   (français, déjà un indicatif)
 *   "+55 21 97166 6858"  → "5521971666858"  (brésilien avec +55)
 *   "21971666858"        → "5521971666858"  (brésilien sans indicatif → on ajoute 55)
 *   "0033672395384"      → "33672395384"    (format 00 international)
 */
export function normaliserTelWhatsApp(tel: string): string {
  const original = tel.trim()

  // Cas 1 : commence par + → indicatif pays présent, on retire juste le + et les séparateurs
  if (original.startsWith('+')) {
    return original.replace(/\D/g, '')
  }

  // Cas 2 : commence par 00 → format international sans +
  if (original.startsWith('00')) {
    return original.replace(/\D/g, '').slice(2)
  }

  // Cas 3 : numéro sans indicatif → présume brésilien, ajoute 55
  const digits = original.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}
