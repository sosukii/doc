<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'
import { useCatalogMetadata } from '~/composables/useCatalogMetadata'
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

const route = useRoute()
const config = useRuntimeConfig()
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

const isPlainRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)

const getPropertyKeyFromItem = (item: Record<string, unknown>) => {
  const key = item.key ?? item.name ?? item.title ?? item.label
  return typeof key === 'string' && key.trim() ? key.trim() : ''
}

const normalizePropertyKey = (key: string) => key
  .toLocaleLowerCase('ru-RU')
  .replace(/ё/g, 'е')
  .replace(/м2/g, 'м²')
  .replace(/[.,:;()]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const normalizeProperties = (targetProduct: Product) => {
  if (!targetProduct.properties) {
    return {}
  }

  if (Array.isArray(targetProduct.properties)) {
    return targetProduct.properties.reduce<Record<string, unknown>>((properties, item) => {
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

  return targetProduct.properties
}

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
    key: 'inverter',
    label: 'Инвертор',
    aliases: ['Инвертор']
  },
  {
    key: 'cooling-capacity',
    label: 'Охлаждение, мощность (кВт)',
    aliases: ['Производительность, охлаждение, квт', 'Производительность охлаждение кВт']
  },
  {
    key: 'heating-capacity',
    label: 'Нагрев, мощность (кВт)',
    aliases: ['Производительность, нагрев, квт', 'Производительность нагрев кВт']
  },
  {
    key: 'cooling-consumption',
    label: 'Потребляемая мощность в режиме охлаждения (кВт)',
    aliases: ['Потребляемая мощность в режиме охлаждения, кВт']
  },
  {
    key: 'heating-consumption',
    label: 'Потребляемая мощность в режиме обогрева (кВт)',
    aliases: ['Потребляемая мощность в режиме обогрева, кВт']
  },
  {
    key: 'room-area',
    label: 'Максимальная рекомендуемая площадь помещения (м²)',
    aliases: ['Максимальная рекомендуемая площадь помещения, м2', 'Максимальная рекомендуемая площадь помещения, м²']
  }
] satisfies Array<{ key: string, label: string, aliases: string[] }>

const productSpecs = computed<ProductSpec[]>(() => {
  if (!product.value) {
    return []
  }

  const normalizedProperties = Object.entries(normalizeProperties(product.value)).reduce<Record<string, unknown>>((properties, [key, value]) => {
    properties[normalizePropertyKey(key)] = value
    return properties
  }, {})

  return productSpecDefinitions
    .map((spec) => {
      const matchedValue = spec.aliases
        .map(alias => normalizedProperties[normalizePropertyKey(alias)])
        .find(value => value !== undefined && value !== null)
      const formattedValue = formatSpecValue(matchedValue)

      return {
        key: spec.key,
        label: spec.label,
        value: formattedValue
      }
    })
    .filter(spec => isUsableSpecValue(spec.value))
})

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
  description: () => product.value?.description || 'Описание товара Avent',
  ogTitle: () => product.value ? `${product.value.title} - Avent` : 'Товар - Avent',
  ogDescription: () => product.value?.description || 'Описание товара Avent',
  ogImage: () => galleryImages.value[0] || (product.value ? getProductPlaceholderSrc(product.value) : '/placeholders/default.svg'),
})
</script>

<template>
  <div v-if="product" class="py-8 sm:py-12 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:gap-12 xl:gap-20">
        <div class="flex flex-col gap-6">
          <div class="glass-panel flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-white/5 bg-white/5 p-3 sm:p-4">
            <NuxtImg
              :src="galleryImages[activeImage] || fallbackImage"
              :alt="product.title"
              width="900"
              height="900"
              sizes="(min-width: 1024px) 46vw, 92vw"
              class="max-h-full max-w-full object-contain transition-all duration-500 hover:scale-105"
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
                :src="galleryThumbnailImages[index] || fallbackImage"
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
            <h1 class="text-3xl font-heading font-bold sm:text-4xl lg:text-5xl">{{ product.title }}</h1>
            <div class="mt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <span class="text-2xl font-bold text-secondary sm:text-3xl">{{ formatPriceRub(product.price) }}</span>
            </div>
          </div>

          <div v-if="productSpecs.length" class="rounded-2xl border border-white/5 bg-surface-container-low/30 p-4 sm:p-5">
            <dl class="divide-y divide-white/10">
              <div
                v-for="spec in productSpecs"
                :key="spec.key"
                class="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,0.7fr)] sm:gap-4"
              >
                <dt class="text-sm leading-snug text-white/55">{{ spec.label }}</dt>
                <dd class="text-sm font-semibold leading-snug text-white/90 sm:text-right">{{ spec.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <section class="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] lg:gap-8" aria-labelledby="product-description-title">
        <div class="rounded-3xl border border-white/5 bg-surface-container-low/30 p-5 sm:p-7">
          <h2 id="product-description-title" class="text-xl font-heading font-semibold text-white/90 sm:text-2xl">Описание</h2>
          <p class="mt-4 leading-relaxed text-white/60">{{ product.description }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 rounded-3xl border border-white/5 bg-surface-container-low/30 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-1">
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
            <AppButton variant="primary" class="flex-grow py-4 text-lg">В корзину</AppButton>
            <AppButton variant="glass" class="px-10">Купить в один клик</AppButton>
          </div>
        </div>
      </section>

      <section class="mt-16 sm:mt-20 lg:mt-24" aria-labelledby="related-products-title">
        <h2 id="related-products-title" class="mb-5 text-xl font-heading font-bold sm:mb-6 sm:text-2xl">Похожие товары</h2>
        <div
          v-if="relatedProducts.length"
          class="related-products-grid"
        >
          <NuxtLink
            v-for="item in relatedProducts"
            :key="item._id"
            :to="`/products/${item.slug}`"
            class="related-product-card group"
            prefetch-on="interaction"
          >
            <div class="related-product-card__media">
              <NuxtImg
                :src="relatedProductImage(item)"
                :alt="item.title"
                width="240"
                height="240"
                sizes="(min-width: 1280px) 120px, (min-width: 640px) 22vw, 34vw"
                class="related-product-card__image"
                loading="lazy"
                fetchpriority="low"
                @error="markRelatedImageFailed(item)"
              />
            </div>
            <div class="related-product-card__content">
              <h3 class="related-product-card__title">{{ item.title }}</h3>
              <span class="related-product-card__price">{{ formatPriceRub(item.price) }}</span>
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
.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
  gap: clamp(0.75rem, 1.4vw, 1rem);
}

@media (min-width: 1280px) {
  .related-products-grid {
    grid-template-columns: repeat(4, minmax(0, 11.5rem));
  }
}

.related-product-card {
  display: grid;
  grid-template-columns: 4.9rem minmax(0, 1fr);
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(var(--color-border-rgb), 0.12);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.42), rgba(var(--color-surface-rgb), 0.2)),
    rgba(var(--color-surface-rgb), 0.2);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 0.65rem;
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
  border-radius: 14px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.72), rgba(var(--color-surface-rgb), 0.16)),
    rgba(255, 255, 255, 0.05);
  padding: 0.45rem;
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
  gap: 0.35rem;
}

.related-product-card__title {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(var(--color-text-rgb), 0.88);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.22;
  text-decoration-color: transparent;
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: color 220ms ease-out, text-decoration-color 220ms ease-out;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.related-product-card:hover .related-product-card__title {
  color: rgba(var(--color-text-rgb), 0.96);
  text-decoration-color: rgba(var(--color-primary-rgb), 0.34);
}

.related-product-card__price {
  color: var(--color-primary-soft);
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .related-products-grid {
    grid-template-columns: 1fr;
  }

  .related-product-card {
    grid-template-columns: 4.5rem minmax(0, 1fr);
  }
}

@media (hover: none) {
  .related-product-card:hover .related-product-card__image {
    transform: none;
  }
}
</style>
