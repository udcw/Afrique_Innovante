export function getFlagUrl(countryCode: string | null | undefined, size?: number): string {
  if (!countryCode) return ''
  const code = countryCode.toUpperCase().slice(0, 2)
  // Utilisation d'un CDN libre et fiable (SVG)
  return `https://cdn.jsdelivr.net/npm/country-flag-icons@1.5.7/3x2/${code}.svg`
}