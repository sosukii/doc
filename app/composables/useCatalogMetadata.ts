const catalogCategories = [
  { slug: 'air-conditioners', label: 'Кондиционеры', count: 1243, icon: '❄️', status: 'active', aliases: ['conditioners', 'air-conditioners', 'air conditioners', 'кондиционеры'] },
  { slug: 'ventilation', label: 'Вентиляция', icon: '💨', status: 'future', aliases: ['ventilation', 'вентиляция'] },
  { slug: 'heaters', label: 'Нагреватели', icon: '🔥', status: 'future', aliases: ['heaters', 'нагреватели'] },
  { slug: 'coolers', label: 'Охладители', icon: '🧊', status: 'future', aliases: ['coolers', 'охладители'] },
  { slug: 'heat-pumps', label: 'Тепловые насосы', icon: '♨️', status: 'future', aliases: ['heat-pumps', 'heat pumps', 'тепловые насосы'] },
  { slug: 'humidifiers', label: 'Увлажнители', icon: '💧', status: 'future', aliases: ['humidifiers', 'увлажнители'] },
  { slug: 'chillers-fancoils', label: 'Чиллеры, фанкойлы', icon: '🧊', status: 'future', aliases: ['chillers-fancoils', 'chillers, fancoils', 'чиллеры, фанкойлы', 'fan coils', 'fancoils'] },
  { slug: 'silencers', label: 'Шумоглушители', icon: '🔇', status: 'future', aliases: ['silencers', 'шумоглушители'] },
  { slug: 'parts-accessories', label: 'Запчасти и аксессуары', icon: '🧩', status: 'future', aliases: ['parts-accessories', 'parts and accessories', 'запчасти и аксессуары'] }
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
