const catalogCategories = [
  { slug: 'air-conditioners', label: 'Кондиционеры', count: 1243, icon: '❄️', aliases: ['conditioners', 'air-conditioners', 'air conditioners', 'кондиционеры'] },
  { slug: 'ventilation', label: 'Вентиляция', count: 632, icon: '💨', aliases: ['ventilation', 'вентиляция'] },
  { slug: 'heaters', label: 'Нагреватели', count: 814, icon: '🔥', aliases: ['heaters', 'нагреватели'] },
  { slug: 'coolers', label: 'Охладители', count: 421, icon: '🧊', aliases: ['coolers', 'охладители'] },
  { slug: 'heat-pumps', label: 'Тепловые насосы', count: 598, icon: '♨️', aliases: ['heat-pumps', 'heat pumps', 'тепловые насосы'] },
  { slug: 'humidifiers', label: 'Увлажнители', count: 290, icon: '💧', aliases: ['humidifiers', 'увлажнители'] },
  { slug: 'chillers-fancoils', label: 'Чиллеры, фанкойлы', count: 157, icon: '🧊', aliases: ['chillers-fancoils', 'chillers, fancoils', 'чиллеры, фанкойлы', 'fan coils', 'fancoils'] },
  { slug: 'silencers', label: 'Шумоглушители', count: 118, icon: '🔇', aliases: ['silencers', 'шумоглушители'] },
  { slug: 'parts-accessories', label: 'Запчасти и аксессуары', count: 232, icon: '🧩', aliases: ['parts-accessories', 'parts and accessories', 'запчасти и аксессуары'] }
] as const

const catalogBrands = [
  {
    slug: 'lessar',
    name: 'Lessar',
    aliases: ['lessar', 'лесар', 'lessar кондиционеры', 'лесар-кондиционеры'],
    shortDescription: 'климатическое оборудование для бытовых и коммерческих объектов.',
    catalogDescription: [
      'Бренд климатического оборудования.',
      'Используется для бытовых и коммерческих решений.',
      'Широкий ассортимент оборудования для вентиляции и кондиционирования.'
    ]
  },
  {
    slug: 'daikin',
    name: 'Daikin',
    aliases: ['daikin', 'дайкин', 'daikin кондиционеры', 'дайкин-кондиционеры'],
    shortDescription: 'японский бренд климатической техники с сильной репутацией в кондиционировании.',
    catalogDescription: [
      'Японский бренд.',
      'Сильная экспертиза в климатической технике.',
      'Известен энергоэффективными решениями и качеством оборудования.'
    ]
  }
] as const

const normalizeSlug = (value = '') => value.trim().toLowerCase()

const findCategoryByValue = (value = '') => {
  const normalizedValue = normalizeSlug(value)

  return catalogCategories.find((category) => category.aliases.some((alias: string) => normalizeSlug(alias) === normalizedValue))
}

const findBrandByValue = (value = '') => {
  const normalizedValue = normalizeSlug(value)

  return catalogBrands.find((brand) =>
    normalizeSlug(brand.slug) === normalizedValue ||
    normalizeSlug(brand.name) === normalizedValue ||
    brand.aliases.some((alias: string) => normalizeSlug(alias) === normalizedValue)
  )
}

const normalizeCategorySlug = (value = '') => findCategoryByValue(value)?.slug || normalizeSlug(value)
const normalizeBrandSlug = (value = '') => findBrandByValue(value)?.slug || normalizeSlug(value)
const getCategoryLabel = (value = '') => findCategoryByValue(value)?.label || value
const getBrandLabel = (value = '') => findBrandByValue(value)?.name || value

export const useCatalogMetadata = () => {
  return {
    catalogBrands,
    catalogCategories,
    normalizeBrandSlug,
    normalizeCategorySlug,
    getBrandLabel,
    getCategoryLabel,
    findBrandByValue,
    findCategoryByValue
  }
}
