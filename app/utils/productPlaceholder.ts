import type { Product } from '~/composables/useCatalog'

const defaultPlaceholder = '/placeholders/default.svg'

const daikinPlaceholders = [
  '/placeholders/daikin/daikin-01.webp',
  '/placeholders/daikin/daikin-02.webp',
  '/placeholders/daikin/daikin-03.webp',
  '/placeholders/daikin/daikin-04.webp',
  '/placeholders/daikin/daikin-05.webp',
]

function normalize(value?: string): string {
  return String(value || '')
    .toLowerCase()
    .replaceAll('ё', 'е')
}

function hashString(value: string): number {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

function isDaikinProduct(product: Product): boolean {
  const text = normalize([
    product.title,
    product.slug,
    product.brand,
  ].filter(Boolean).join(' '))

  return text.includes('daikin') || text.includes('дайкин')
}

export function isUsableProductImageSrc(imageSrc?: string): imageSrc is string {
  const normalizedSrc = String(imageSrc || '').trim()

  if (!normalizedSrc || ['null', 'undefined', 'none', 'n/a'].includes(normalizedSrc.toLowerCase())) {
    return false
  }

  return !/^\/?\d+\.jpe?g$/i.test(normalizedSrc)
}

export function getProductPlaceholderSrc(product: Product): string {
  if (!isDaikinProduct(product)) {
    return defaultPlaceholder
  }

  const stableKey = String(product.slug || product._id || product.title || 'daikin')
  const index = hashString(stableKey) % daikinPlaceholders.length

  return daikinPlaceholders[index] || defaultPlaceholder
}

export function getProductImageSrc(product: Product, imageSrc?: string): string {
  if (isUsableProductImageSrc(imageSrc)) {
    return imageSrc.trim()
  }

  return getProductPlaceholderSrc(product)
}

export function getProductImageSources(product: Product): string[] {
  const validImages = (product.images || []).filter(isUsableProductImageSrc)
  return validImages.length ? validImages : [getProductPlaceholderSrc(product)]
}
