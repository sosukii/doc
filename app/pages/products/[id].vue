<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'

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

const { data: relatedData } = await useFetch<ProductsResponse>('/api/products', {
  baseURL: apiBase,
  query: relatedQuery,
  default: () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 1
  })
})

const relatedProducts = computed(() => {
  if (!product.value) return []

  return (relatedData.value?.items ?? [])
    .filter(item => item.slug !== product.value?.slug)
    .slice(0, 4)
})

const galleryImages = computed(() => {
  if (!product.value?.images?.length) return [fallbackImage]
  return product.value.images
})

const activeImage = ref(0)

watch(productSlug, () => {
  activeImage.value = 0
})

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

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
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <!-- Image Gallery -->
        <div class="flex flex-col gap-6">
          <div class="aspect-square bg-white/5 rounded-3xl overflow-hidden glass-panel border-white/5 p-4 flex items-center justify-center">
            <NuxtImg
              :src="galleryImages[activeImage] || fallbackImage"
              :alt="product.title"
              class="max-w-full max-h-full object-contain transition-all duration-500 hover:scale-105"
            />
          </div>
          <div class="grid grid-cols-4 gap-4">
            <button
              v-for="(img, index) in galleryImages"
              :key="index"
              @click="activeImage = index"
              class="aspect-square rounded-xl overflow-hidden border transition-all flex items-center justify-center bg-[#0f0f1a]"
              :class="activeImage === index
                ? 'border-primary'
                : 'border-white/10 opacity-50 hover:opacity-100'"
            >
              <NuxtImg
                :src="img"
                :alt="product.title"
                class="max-w-[80%] max-h-[80%] object-contain"
              />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-2">
            <div class="text-xs font-bold text-white/40 uppercase tracking-widest">{{ product.category }}</div>
            <h1 class="text-4xl lg:text-5xl font-heading font-bold">{{ product.title }}</h1>
            <div class="flex items-center gap-4 mt-2">
              <span class="text-secondary font-bold text-3xl">${{ product.price }}</span>
              <span class="text-sm text-white/40">{{ product.availabilityStatus || 'Под заказ' }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-white/90">Описание</h3>
            <p class="text-white/60 leading-relaxed">{{ product.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-6 p-6 bg-surface-container-low/30 rounded-2xl border border-white/5">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-white/40 uppercase tracking-tighter">Бренд</span>
              <span class="text-sm font-medium">{{ product.brand || 'Avent' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-white/40 uppercase tracking-tighter">Гарантия</span>
              <span class="text-sm font-medium">{{ product.warrantyInformation || 'По запросу' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-white/40 uppercase tracking-tighter">Доставка</span>
              <span class="text-sm font-medium">{{ product.shippingInformation || 'Уточняется' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-white/40 uppercase tracking-tighter">Наличие</span>
              <span class="text-sm font-medium" :class="product.availabilityStatus === 'В наличии' ? 'text-green-400' : 'text-orange-400'">
                {{ product.availabilityStatus || 'Под заказ' }}
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 mt-4">
            <AppButton variant="primary" class="flex-grow py-4 text-lg">В корзину</AppButton>
            <AppButton variant="glass" class="px-10">Купить в один клик</AppButton>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="mt-32">
        <h2 class="text-3xl font-heading font-bold mb-12">Похожие товары</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AppCard
            v-for="item in relatedProducts"
            :key="item._id"
            variant="medium"
            class="flex flex-col h-full group"
          >
            <div class="aspect-square mb-6 overflow-hidden rounded-xl bg-white/5 p-4 flex items-center justify-center">
              <NuxtImg :src="item.images?.[0] || fallbackImage" :alt="item.title" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-all duration-500" />
            </div>
            <div class="flex-grow flex flex-col gap-2">
              <h3 class="font-heading font-bold line-clamp-1 group-hover:text-primary transition-colors">{{ item.title }}</h3>
              <span class="text-secondary font-bold">${{ item.price }}</span>
            </div>
            <template #footer>
              <AppButton variant="primary" :to="`/products/${item.slug}`" class="w-full text-xs py-2">Подробнее</AppButton>
            </template>
          </AppCard>
        </div>
        <p v-if="!relatedProducts.length" class="text-white/40 text-sm">
          Похожие товары пока не добавлены.
        </p>
      </div>
    </div>
  </div>
</template>