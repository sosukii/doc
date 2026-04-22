<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'

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

const route = useRoute()
const config = useRuntimeConfig()
const { waitForIdleTime } = useBackgroundPrefetchQueue()
const productSlug = computed(() => String(route.params.id || ''))
const apiBase = config.public.apiBase || 'https://doc-api-r2vu.onrender.com'
const fallbackImage = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="#1f2937"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="42">
      No image
    </text>
  </svg>
`)

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
  if (!product.value?.images?.length) {
    return [fallbackImage]
  }

  return product.value.images
})

const activeImage = ref(0)

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
  ogImage: () => galleryImages.value[0] || fallbackImage,
})
</script>

<template>
  <div v-if="product" class="py-12 lg:py-20">
    <div class="container mx-auto px-4">
      <div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div class="flex flex-col gap-6">
          <div class="glass-panel flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-white/5 bg-white/5 p-4">
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
          <div class="grid grid-cols-4 gap-4">
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
                :src="img"
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

        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-2">
            <div class="text-xs font-bold uppercase tracking-widest text-white/40">{{ product.category }}</div>
            <h1 class="text-4xl font-heading font-bold lg:text-5xl">{{ product.title }}</h1>
            <div class="mt-2 flex items-center gap-4">
              <span class="text-3xl font-bold text-secondary">${{ product.price }}</span>
              <span class="text-sm text-white/40">{{ product.availabilityStatus || 'Под заказ' }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <h2 class="text-lg font-heading font-semibold text-white/90">Описание</h2>
            <p class="leading-relaxed text-white/60">{{ product.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-6 rounded-2xl border border-white/5 bg-surface-container-low/30 p-6">
            <div class="flex flex-col gap-1">
              <span class="text-xs uppercase tracking-tighter text-white/40">Бренд</span>
              <span class="text-sm font-medium">{{ product.brand || 'Avent' }}</span>
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
          </div>

          <div class="mt-4 flex flex-col gap-4 sm:flex-row">
            <AppButton variant="primary" class="flex-grow py-4 text-lg">В корзину</AppButton>
            <AppButton variant="glass" class="px-10">Купить в один клик</AppButton>
          </div>
        </div>
      </div>

      <section class="mt-32" aria-labelledby="related-products-title">
        <h2 id="related-products-title" class="mb-12 text-3xl font-heading font-bold">Похожие товары</h2>
        <div
          v-if="relatedProducts.length"
          class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AppCard
            v-for="item in relatedProducts"
            :key="item._id"
            variant="medium"
            class="flex h-full flex-col group"
          >
            <div class="mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/5 p-4">
              <NuxtImg
                :src="item.images?.[0] || fallbackImage"
                :alt="item.title"
                width="600"
                height="600"
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 44vw, 92vw"
                class="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105"
                loading="lazy"
                fetchpriority="low"
              />
            </div>
            <div class="flex flex-grow flex-col gap-2">
              <h3 class="line-clamp-1 font-heading font-bold transition-colors group-hover:text-primary">{{ item.title }}</h3>
              <span class="font-bold text-secondary">${{ item.price }}</span>
            </div>
            <template #footer>
              <AppButton variant="primary" :to="`/products/${item.slug}`" class="w-full py-2 text-xs">Подробнее</AppButton>
            </template>
          </AppCard>
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
