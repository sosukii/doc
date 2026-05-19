<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'
import { useCatalogMetadata } from '~/composables/useCatalogMetadata'
import { useCartStore } from '~/stores/cart'
import { formatPriceRub } from '~/utils/price'
import { optimizeProductCardImageUrl, optimizeProductDetailImageUrl } from '~/utils/cloudinaryImages'
import { getProductImageSources, getProductImageSrc, getProductPlaceholderSrc } from '~/utils/productPlaceholder'

interface Product {
  _id: string
  title: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  isPublished: boolean
  brand?: string
  properties?: Record<string, unknown> | Array<Record<string, unknown>>
  characteristics?: Record<string, unknown> | Array<Record<string, unknown>>
  attributes?: Record<string, unknown> | Array<Record<string, unknown>>
  specs?: Record<string, unknown> | Array<Record<string, unknown>>
  warrantyInformation?: string
  shippingInformation?: string
  availabilityStatus?: string
  createdAt?: string
  updatedAt?: string
}

interface ProductsResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ProductSpec {
  key: string
  label: string
  value: string
}

interface ProductSpecGroup {
  key: string
  specs: ProductSpec[]
}

const route = useRoute()
const config = useRuntimeConfig()
const cartStore = useCartStore()
const { waitForIdleTime } = useBackgroundPrefetchQueue()
const { getBrandLabel, getCategoryLabel } = useCatalogMetadata()
const productSlug = computed(() => String(route.params.id || ''))
const apiBase = config.public.apiBase || 'https://doc-api-r2vu.onrender.com'
const failedRelatedImages = ref<Record<string, true>>({})

const { data: product, error } = await useFetch<Product>(`/api/products/${productSlug.value}`, {
  baseURL: apiBase,
  key: `product:${productSlug.value}`
})

const relatedQuery = computed(() => {
  if (!product.value?.category) {
    return null
  }

  return {
    category: product.value.category,
    page: 1,
    limit: 4
  }
})

const {
  data: relatedData,
  execute: loadRelatedProducts,
  pending: pendingRelatedProducts
} = await useAsyncData(
  () => `related-products:${product.value?.category || 'empty'}`,
  () => $fetch<ProductsResponse>('/api/products', {
    baseURL: apiBase,
    query: relatedQuery.value || undefined
  }),
  {
    server: false,
    immediate: false,
    default: () => ({
      items: [],
      total: 0,
      page: 1,
      limit: 4,
      totalPages: 1
    })
  }
)

const relatedProducts = computed(() => {
  if (!product.value) {
    return []
  }

  return (relatedData.value?.items ?? [])
    .filter((item) => item.slug !== product.value?.slug)
    .slice(0, 4)
})

const galleryImages = computed(() => {
  if (!product.value) {
    return []
  }

  return getProductImageSources(product.value).map(optimizeProductDetailImageUrl)
})

const galleryThumbnailImages = computed(() => {
  if (!product.value) {
    return []
  }

  return getProductImageSources(product.value).map(optimizeProductCardImageUrl)
})

const productFallbackImage = computed(() => product.value ? getProductPlaceholderSrc(product.value) : '/placeholders/default.svg')

const productDescription = computed(() => {
  const description = product.value?.description?.replace(/\s+/g, ' ').trim()
  return description || ''
})

const relatedProductImage = (relatedProduct: Product) => {
  if (failedRelatedImages.value[relatedProduct._id]) {
    return getProductPlaceholderSrc(relatedProduct)
  }

  return optimizeProductCardImageUrl(getProductImageSrc(relatedProduct, relatedProduct.images?.[0]))
}

const markRelatedImageFailed = (relatedProduct: Product) => {
  failedRelatedImages.value = {
    ...failedRelatedImages.value,
    [relatedProduct._id]: true
  }
}

const activeImage = ref(0)

const isInCart = computed(() => product.value ? cartStore.items.some(item => item.product._id === product.value?._id) : false)

const toggleCart = () => {
  if (!product.value) {
    return
  }

  if (isInCart.value) {
    cartStore.removeFromCart(product.value._id)
    return
  }

  cartStore.addToCart(product.value)
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)

const getPropertyKeyFromItem = (item: Record<string, unknown>) => {
  const key = item.key ?? item.name ?? item.title ?? item.label ?? item.property ?? item.attribute ?? item.code
  return typeof key === 'string' && key.trim() ? key.trim() : ''
}

const normalizePropertyKey = (key: string) => key
  .toLocaleLowerCase('ru-RU')
  .replace(/ё/g, 'е')
  .replace(/м2/g, 'м²')
  .replace(/[.,:;()]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const normalizeSpecSource = (source?: Record<string, unknown> | Array<Record<string, unknown>>) => {
  if (!source) {
    return {}
  }

  if (Array.isArray(source)) {
    return source.reduce<Record<string, unknown>>((properties, item) => {
      if (!isPlainRecord(item)) {
        return properties
      }

      const key = getPropertyKeyFromItem(item)

      if (!key) {
        return properties
      }

      properties[key] = Object.prototype.hasOwnProperty.call(item, 'value') ? item.value : item
      return properties
    }, {})
  }

  return source
}

const normalizeProperties = (targetProduct: Product) => {
  const specSources = [
    targetProduct.properties,
    targetProduct.characteristics,
    targetProduct.attributes,
    targetProduct.specs
  ]

  return specSources.reduce<Record<string, unknown>>((properties, source) => ({
    ...properties,
    ...normalizeSpecSource(source)
  }), {})
}

const getNormalizedProperties = (targetProduct: Product) => Object.entries(normalizeProperties(targetProduct)).reduce<Record<string, unknown>>((properties, [key, value]) => {
  properties[normalizePropertyKey(key)] = value
  return properties
}, {})

const unwrapPropertyValue = (value: unknown): unknown => {
  if (!isPlainRecord(value)) {
    return value
  }

  if (Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value
  }

  return value
}

const formatSpecValue = (value: unknown): string => {
  const unwrappedValue = unwrapPropertyValue(value)

  if (unwrappedValue === null || unwrappedValue === undefined) {
    return ''
  }

  if (typeof unwrappedValue === 'boolean') {
    return unwrappedValue ? 'Да' : 'Нет'
  }

  if (Array.isArray(unwrappedValue)) {
    return unwrappedValue.map(formatSpecValue).filter(Boolean).join(', ')
  }

  if (isPlainRecord(unwrappedValue)) {
    return Object.entries(unwrappedValue)
      .filter(([key]) => !['key', 'name', 'title', 'label'].includes(key))
      .map(([, item]) => formatSpecValue(item))
      .filter(Boolean)
      .join(', ')
  }

  return String(unwrappedValue).replace(/\s+/g, ' ').trim()
}

const isUsableSpecValue = (value: string) => {
  const normalizedValue = value.trim().toLocaleLowerCase('ru-RU')
  return Boolean(normalizedValue)
    && !['-', '—', 'нет', 'n/a', 'na', 'null', 'undefined'].includes(normalizedValue)
}

const productSpecDefinitions = [
  {
    key: 'warranty',
    label: 'Гарантия',
    aliases: ['Гарантия', 'Warranty']
  },
  {
    key: 'inverter',
    label: 'Инвертор',
    aliases: ['Инвертор (плавная регулировка мощности)', 'Инвертор']
  },
  {
    key: 'indoor-units',
    label: 'Количество подключаемых внутренних блоков',
    aliases: [
      'Кол-во внутр. блоков',
      'Количество внутренних блоков',
      'Количество подключаемых внутренних блоков'
    ]
  },
  {
    key: 'cooling-capacity',
    label: 'Охлаждение, мощность (кВт)',
    aliases: [
      'Производительность по холоду',
      'Производительность, охлаждение, квт',
      'Производительность охлаждение кВт',
      'Холодопроизводительность',
      'Холодопроизводительность, кВт',
      'Мощность охлаждения',
      'Мощность охлаждения, кВт',
      'Охлаждение',
      'Cooling capacity'
    ]
  },
  {
    key: 'heating-capacity',
    label: 'Нагрев, мощность (кВт)',
    aliases: [
      'Производительность по теплу',
      'Производительность, нагрев, квт',
      'Производительность нагрев кВт',
      'Теплопроизводительность',
      'Теплопроизводительность, кВт',
      'Мощность нагрева',
      'Мощность нагрева, кВт',
      'Мощность обогрева',
      'Мощность обогрева, кВт',
      'Нагрев',
      'Heating capacity'
    ]
  },
  {
    key: 'cooling-consumption',
    label: 'Потребляемая мощность в режиме охлаждения (кВт)',
    aliases: [
      'Потребляемая мощность на охлаждение',
      'Потребляемая мощность в режиме охлаждения, кВт'
    ]
  },
  {
    key: 'heating-consumption',
    label: 'Потребляемая мощность в режиме обогрева (кВт)',
    aliases: [
      'Потребляемая мощность на обогрев',
      'Потребляемая мощность в режиме обогрева, кВт'
    ]
  },
  {
    key: 'room-area',
    label: 'Максимальная рекомендуемая площадь помещения (м2)',
    aliases: [
      'Площадь',
      'Максимальная рекомендуемая площадь помещения, м2',
      'Максимальная рекомендуемая площадь помещения, м²'
    ]
  },
  {
    key: 'conditioner-type',
    label: 'Тип кондиционера',
    aliases: ['Тип кондиционера']
  }
] satisfies Array<{ key: string, label: string, aliases: string[] }>

const findSpecValue = (targetProduct: Product, aliases: string[]) => {
  const normalizedProperties = getNormalizedProperties(targetProduct)
  const matchedValue = aliases
    .map(alias => normalizedProperties[normalizePropertyKey(alias)])
    .find(value => value !== undefined && value !== null)
  const formattedValue = formatSpecValue(matchedValue)

  return isUsableSpecValue(formattedValue) ? formattedValue : ''
}

const findProductSpecValue = (targetProduct: Product, spec: typeof productSpecDefinitions[number]) => {
  const propertyValue = findSpecValue(targetProduct, spec.aliases)

  if (propertyValue || spec.key !== 'warranty') {
    return propertyValue
  }

  const warrantyValue = formatSpecValue(targetProduct.warrantyInformation)
  return isUsableSpecValue(warrantyValue) ? warrantyValue : ''
}

const getProductSpec = (targetProduct: Product, spec: typeof productSpecDefinitions[number]): ProductSpec | null => {
  const value = findProductSpecValue(targetProduct, spec)

  return value
    ? {
        key: spec.key,
        label: spec.label,
        value
      }
    : null
}

const productSpecs = computed<ProductSpec[]>(() => {
  if (!product.value) {
    return []
  }

  return productSpecDefinitions
    .map(spec => getProductSpec(product.value as Product, spec))
    .filter((spec): spec is ProductSpec => Boolean(spec))
})

const groupedProductSpecs = computed<ProductSpecGroup[]>(() => {
  const specByKey = Object.fromEntries(productSpecs.value.map(spec => [spec.key, spec]))
  const groups: ProductSpecGroup[] = []
  const usedKeys = new Set<string>()

  const addPair = (key: string, specKeys: string[]) => {
    const specs = specKeys.map(specKey => specByKey[specKey]).filter((spec): spec is ProductSpec => Boolean(spec))

    if (specs.length === specKeys.length) {
      groups.push({ key, specs })
      specKeys.forEach(specKey => usedKeys.add(specKey))
    }
  }

  addPair('capacity', ['cooling-capacity', 'heating-capacity'])
  addPair('consumption', ['cooling-consumption', 'heating-consumption'])

  productSpecs.value
    .filter(spec => !usedKeys.has(spec.key))
    .forEach(spec => groups.push({ key: spec.key, specs: [spec] }))

  return groups
})

const relatedSpecDefinitions = {
  cooling: productSpecDefinitions.find(spec => spec.key === 'cooling-capacity'),
  heating: productSpecDefinitions.find(spec => spec.key === 'heating-capacity')
} as const

const relatedProductPowerSpecs = (relatedProduct: Product) => ({
  cooling: relatedSpecDefinitions.cooling ? findSpecValue(relatedProduct, relatedSpecDefinitions.cooling.aliases) : '',
  heating: relatedSpecDefinitions.heating ? findSpecValue(relatedProduct, relatedSpecDefinitions.heating.aliases) : ''
})

const relatedProductCards = computed(() => relatedProducts.value.map((relatedProduct) => ({
  product: relatedProduct,
  power: relatedProductPowerSpecs(relatedProduct)
})))

watch(productSlug, () => {
  activeImage.value = 0
})

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

useHead(() => ({
  link: galleryImages.value.slice(0, 1).map((href) => ({
    rel: 'preload',
    as: 'image',
    href,
    fetchpriority: 'high',
    crossorigin: ''
  }))
}))

onMounted(async () => {
  if (!relatedQuery.value) {
    return
  }

  await waitForIdleTime()
  await loadRelatedProducts()
})

useSeoMeta({
  title: () => product.value ? `${product.value.title} - Avent` : 'Товар - Avent',
  description: () => productDescription.value || 'Описание товара Avent',
  ogTitle: () => product.value ? `${product.value.title} - Avent` : 'Товар - Avent',
  ogDescription: () => productDescription.value || 'Описание товара Avent',
  ogImage: () => galleryImages.value[0] || productFallbackImage.value,
})
</script>

<template>
  <div v-if="product" class="py-8 sm:py-12 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:gap-12 xl:gap-20">
        <div class="flex flex-col gap-6">
          <div class="glass-panel flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-white/5 bg-white/5 p-3 sm:p-4">
            <NuxtImg
              :src="galleryImages[activeImage] || productFallbackImage"
              :alt="product.title"
              width="900"
              height="900"
              sizes="(min-width: 1024px) 46vw, 92vw"
              class="max-h-full max-w-full object-contain transition-transform duration-200 ease-out hover:scale-[1.015]"
              loading="eager"
              fetchpriority="high"
            />
          </div>
          <div class="grid grid-cols-4 gap-2 sm:gap-4">
            <button
              v-for="(img, index) in galleryImages"
              :key="index"
              class="flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-[#0f0f1a] transition-all"
              :class="activeImage === index
                ? 'border-primary'
                : 'border-white/10 opacity-50 hover:opacity-100'"
              @click="activeImage = index"
            >
              <NuxtImg
                :src="galleryThumbnailImages[index] || productFallbackImage"
                :alt="product.title"
                width="200"
                height="200"
                sizes="(min-width: 1024px) 10vw, 20vw"
                class="max-h-[80%] max-w-[80%] object-contain"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'low'"
              />
            </button>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-6 lg:gap-8">
          <div class="flex flex-col gap-2">
            <div class="text-xs font-bold uppercase tracking-widest text-white/40">{{ getCategoryLabel(product.category) }}</div>
            <h1 class="text-3xl font-heading font-bold sm:text-4xl lg:text-3xl">{{ product.title }}</h1>
            <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span class="text-2xl font-bold text-secondary sm:text-3xl">{{ formatPriceRub(product.price) }}</span>
              <AppButton
                variant="primary"
                class="w-full px-6 py-3 text-sm sm:w-auto"
                :aria-label="isInCart ? 'Убрать товар из корзины' : 'Добавить товар в корзину'"
                @click="toggleCart"
              >
                {{ isInCart ? 'В корзине' : 'В корзину' }}
              </AppButton>
            </div>
          </div>

          <div v-if="groupedProductSpecs.length" class="rounded-2xl border border-white/5 bg-surface-container-low/30 p-4 sm:p-5">
            <dl class="product-spec-list">
              <div
                v-for="group in groupedProductSpecs"
                :key="group.key"
                class="product-spec-group"
                :class="{ 'product-spec-group--paired': group.specs.length > 1 }"
              >
                <div
                  v-for="spec in group.specs"
                  :key="spec.key"
                  class="product-spec-row"
                >
                  <dt class="product-spec-label">{{ spec.label }}</dt>
                  <dd class="product-spec-value">{{ spec.value }}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <section
        class="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] lg:gap-8"
        :aria-labelledby="productDescription ? 'product-description-title' : undefined"
      >
        <div v-if="productDescription" class="rounded-3xl border border-white/5 bg-surface-container-low/30 p-5 sm:p-7">
          <h2 id="product-description-title" class="text-xl font-heading font-semibold text-white/90 sm:text-2xl">Описание</h2>
          <p class="mt-4 max-w-4xl leading-relaxed text-white/60">{{ productDescription }}</p>
        </div>

        <div
          class="grid grid-cols-1 self-start gap-4 rounded-3xl border border-white/5 bg-surface-container-low/30 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-1"
          :class="{ 'lg:max-w-md': !productDescription }"
        >
          <div class="flex flex-col gap-1">
            <span class="text-xs uppercase tracking-tighter text-white/40">Бренд</span>
            <span class="text-sm font-medium">{{ product.brand ? getBrandLabel(product.brand) : 'Avent' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs uppercase tracking-tighter text-white/40">Гарантия</span>
            <span class="text-sm font-medium">{{ product.warrantyInformation || 'По запросу' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs uppercase tracking-tighter text-white/40">Доставка</span>
            <span class="text-sm font-medium">{{ product.shippingInformation || 'Уточняется' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs uppercase tracking-tighter text-white/40">Наличие</span>
            <span
              class="text-sm font-medium"
              :class="product.availabilityStatus === 'В наличии' ? 'text-green-400' : 'text-orange-400'"
            >
              {{ product.availabilityStatus || 'Под заказ' }}
            </span>
          </div>
          <div class="mt-2 flex flex-col gap-3 sm:col-span-2 sm:flex-row lg:col-span-1 lg:flex-col">
            <AppButton variant="glass" class="px-10">Купить в один клик</AppButton>
          </div>
        </div>
      </section>

      <section class="mt-16 sm:mt-20 lg:mt-24" aria-labelledby="related-products-title">
        <h2 id="related-products-title" class="mb-5 text-xl font-heading font-bold sm:mb-6 sm:text-2xl">Похожие товары</h2>
        <div
          v-if="relatedProductCards.length"
          class="related-products-grid"
        >
          <NuxtLink
            v-for="item in relatedProductCards"
            :key="item.product._id"
            :to="`/products/${item.product.slug}`"
            class="related-product-card group"
            prefetch-on="interaction"
          >
            <div class="related-product-card__media">
              <NuxtImg
                :src="relatedProductImage(item.product)"
                :alt="item.product.title"
                width="240"
                height="240"
                sizes="(min-width: 1280px) 120px, (min-width: 640px) 22vw, 34vw"
                class="related-product-card__image"
                loading="lazy"
                fetchpriority="low"
                @error="markRelatedImageFailed(item.product)"
              />
            </div>
            <div class="related-product-card__content">
              <h3 class="related-product-card__title">{{ item.product.title }}</h3>
              <div
                v-if="item.power.cooling || item.power.heating"
                class="related-product-card__specs"
              >
                <span v-if="item.power.cooling">Холод: {{ item.power.cooling }}</span>
                <span v-if="item.power.heating">Тепло: {{ item.power.heating }}</span>
              </div>
              <span class="related-product-card__price">{{ formatPriceRub(item.product.price) }}</span>
            </div>
          </NuxtLink>
        </div>
        <p v-else-if="pendingRelatedProducts" class="text-sm text-white/40">
          Подбираем похожие товары...
        </p>
        <p v-else class="text-sm text-white/40">
          Похожие товары пока не добавлены.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.product-spec-list {
  display: grid;
  gap: 0.75rem;
}

.product-spec-group {
  display: grid;
  gap: 0.35rem;
}

.product-spec-group:last-child {
  padding-bottom: 0;
}

.product-spec-group--paired {
  border: 1px solid rgba(var(--color-border-rgb), 0.12);
  border-radius: 16px;
  background: rgba(var(--color-text-rgb), 0.035);
  padding: 0.75rem;
}

.product-spec-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(6.5rem, 38%);
  align-items: baseline;
  gap: 1rem;
  padding: 0.45rem 0 0.6rem;
}

.product-spec-row::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(var(--color-border-rgb), 0.06), rgba(var(--color-border-rgb), 0.2), rgba(var(--color-border-rgb), 0.06));
  content: '';
}

.product-spec-group:last-child .product-spec-row:last-child::after,
.product-spec-group--paired .product-spec-row:last-child::after {
  opacity: 0;
}

.product-spec-label {
  min-width: 0;
  color: rgba(var(--color-text-rgb), 0.55);
  font-size: 0.86rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.product-spec-value {
  min-width: 0;
  color: rgba(var(--color-text-rgb), 0.92);
  font-size: 0.92rem;
  font-weight: 750;
  line-height: 1.35;
  text-align: right;
  overflow-wrap: anywhere;
}

@media (max-width: 520px) {
  .product-spec-row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }

  .product-spec-value {
    text-align: left;
  }
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr));
  gap: clamp(0.9rem, 1.6vw, 1.25rem);
}

@media (min-width: 1280px) {
  .related-products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.related-product-card {
  display: grid;
  grid-template-columns: minmax(7.5rem, 10rem) minmax(0, 1fr);
  min-width: 0;
  align-items: stretch;
  gap: clamp(0.8rem, 1.7vw, 1.2rem);
  border: 1px solid rgba(var(--color-border-rgb), 0.12);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.42), rgba(var(--color-surface-rgb), 0.2)),
    rgba(var(--color-surface-rgb), 0.2);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: clamp(0.75rem, 1.4vw, 1rem);
  text-decoration: none;
  transition: border-color 220ms ease-out, box-shadow 220ms ease-out, background 220ms ease-out;
}

.related-product-card:hover {
  border-color: rgba(var(--color-primary-rgb), 0.22);
  background:
    linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.48), rgba(var(--color-surface-rgb), 0.24)),
    rgba(var(--color-surface-rgb), 0.24);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.1);
}

.related-product-card:focus-visible {
  outline: 3px solid rgba(var(--color-primary-rgb), 0.28);
  outline-offset: 3px;
}

.related-product-card__media {
  display: flex;
  aspect-ratio: 1;
  min-width: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(var(--color-border-rgb), 0.1);
  border-radius: 16px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.72), rgba(var(--color-surface-rgb), 0.16)),
    rgba(255, 255, 255, 0.05);
  padding: clamp(0.6rem, 1.4vw, 0.9rem);
}

.related-product-card__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.12));
  transition: transform 220ms ease-out, filter 220ms ease-out;
}

.related-product-card:hover .related-product-card__image {
  transform: scale(1.015);
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.14));
}

.related-product-card__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.55rem;
}

.related-product-card__title {
  color: rgba(var(--color-text-rgb), 0.88);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(0.95rem, 1.3vw, 1.08rem);
  font-weight: 750;
  line-height: 1.25;
  text-decoration-color: transparent;
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: color 220ms ease-out, text-decoration-color 220ms ease-out;
}

.related-product-card:hover .related-product-card__title {
  color: rgba(var(--color-text-rgb), 0.96);
  text-decoration-color: rgba(var(--color-primary-rgb), 0.34);
}

.related-product-card__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.65rem;
  color: rgba(var(--color-text-rgb), 0.62);
  font-size: 0.82rem;
  font-weight: 650;
  line-height: 1.35;
}

.related-product-card__price {
  margin-top: auto;
  color: var(--color-primary-soft);
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.2;
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .related-products-grid {
    grid-template-columns: 1fr;
  }

  .related-product-card {
    grid-template-columns: minmax(6.5rem, 7.5rem) minmax(0, 1fr);
  }
}

@media (hover: none) {
  .related-product-card:hover .related-product-card__image {
    transform: none;
  }
}
</style>
