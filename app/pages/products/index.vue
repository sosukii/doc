<script setup lang="ts">
// import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppPagination from '~/components/ui/AppPagination.vue'

interface Product {
  _id: string
  title: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  isPublished: boolean
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
const router = useRouter()

const selectedCategory = ref('')
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
const perPage = 12

const isClientReady = ref(false)

onMounted(() => {
  isClientReady.value = true
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'https://doc-api-r2vu.onrender.com'

const productsCache = useState<Record<string, ProductsResponse>>('catalog-products-cache', () => ({}))

const defaultProductsResponse = (): ProductsResponse => ({
  items: [],
  total: 0,
  page: 1,
  limit: perPage,
  totalPages: 1
})

const buildProductsQuery = (page: number, search: string, category: string) => ({
  page,
  limit: perPage,
  search: search || undefined,
  category: category || undefined
})

const buildCacheKey = (page: number, search: string, category: string) => {
  return JSON.stringify({
    page,
    limit: perPage,
    search: search || '',
    category: category || ''
  })
}

const requestKey = computed(() => {
  return buildCacheKey(
    currentPage.value,
    debouncedSearchQuery.value.trim(),
    selectedCategory.value
  )
})

let searchDebounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (value) => {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout)
  }

  searchDebounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, 300)
})

onBeforeUnmount(() => {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout)
  }
})

watch([debouncedSearchQuery, selectedCategory], () => {
  currentPage.value = 1
})

watch(currentPage, (page) => {
  const nextQuery = { ...route.query }

  if (page > 1) {
    nextQuery.page = String(page)
  } else {
    delete nextQuery.page
  }

  router.replace({ query: nextQuery })
})

const fetchProductsPage = async (page: number, search: string, category: string, useCache = true) => {
  const normalizedSearch = search.trim()
  const cacheKey = buildCacheKey(page, normalizedSearch, category)

  if (useCache && productsCache.value[cacheKey]) {
    return productsCache.value[cacheKey]
  }

  try {
    const response = await $fetch<ProductsResponse>('/api/products', {
      baseURL: apiBase,
      query: buildProductsQuery(page, normalizedSearch, category)
    })

    productsCache.value[cacheKey] = response
    return response
  } catch(e) {
    console.error('API error', e)

    return productsCache.value[cacheKey] || defaultProductsResponse()
  }
}

const { data, pending } = await useAsyncData(
  () => `catalog:${requestKey.value}`,
  () => fetchProductsPage(currentPage.value, debouncedSearchQuery.value, selectedCategory.value),
  {
    server: false,
    lazy: true,
    default: defaultProductsResponse,
    watch: [requestKey]
  }
)

const products = computed(() => data.value?.items ?? [])
const totalPages = computed(() => data.value?.totalPages || 1)

const prefetchNextPage = async () => {
  if (pending.value) return
  if (currentPage.value >= totalPages.value) return

  const nextPage = currentPage.value + 1
  const search = debouncedSearchQuery.value
  const category = selectedCategory.value
  const nextKey = buildCacheKey(nextPage, search.trim(), category)

  if (productsCache.value[nextKey]) {
    return
  }

  try {
    await fetchProductsPage(nextPage, search, category)
  } catch {
    console.log('Prefetch failed for page', nextPage)
  }
}

watch(
  () => data.value,
  () => {
    prefetchNextPage()
  },
  { immediate: true }
)

const categories = computed(() => {
  const uniqueCategories = new Set<string>()

  Object.values(productsCache.value).forEach((response) => {
    response.items.forEach((product) => {
      if (product.category) {
        uniqueCategories.add(product.category)
      }
    })
  })

  products.value.forEach((product) => {
    if (product.category) {
      uniqueCategories.add(product.category)
    }
  })

  return Array.from(uniqueCategories)
    .sort((a, b) => a.localeCompare(b))
    .map(category => ({
      slug: category,
      name: category
    }))
})

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return
  }

  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useSeoMeta({
  title: 'Каталог продукции - Avent',
  description: 'Широкий выбор современных технологических решений и аксессуаров в каталоге Avent.'
})
</script>

<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <div class="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h1 class="text-4xl lg:text-6xl font-heading font-bold mb-4">Каталог</h1>
          <p class="text-white/60">Откройте для себя наш ассортимент прецизионных решений.</p>
        </div>
        <div class="flex flex-wrap gap-4 w-full lg:w-auto">
          <div class="flex-1 lg:w-64">
            <AppInput
              v-model="searchQuery"
              placeholder="Поиск товаров..."
              type="search"
            />
          </div>
          <select
            v-model="selectedCategory"
            class="input-field bg-surface-container-lowest border-none rounded-lg px-4 py-2 text-white/70 focus:ring-2 focus:ring-secondary/50 h-full min-h-[42px] appearance-none cursor-pointer"
          >
            <option value="">Все категории</option>
            <option
              v-for="cat in categories"
              :key="cat.slug"
              :value="cat.slug"
            >{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="isClientReady && !pending && products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AppCard
          v-for="product in products"
          :key="product._id"
          class="flex flex-col group h-full"
          variant="medium"
        >
          <div class="relative aspect-square mb-6 overflow-hidden rounded-xl bg-white/5 p-4 flex items-center justify-center">
            <NuxtImg
              :src="product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image'"
              :alt="product.title"
              class="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute top-4 right-4 glass-panel px-3 py-1 text-xs font-bold text-secondary">
              ${{ product.price }}
            </div>
          </div>
          <div class="flex-grow flex flex-col gap-2">
            <div class="text-xs text-white/40 uppercase tracking-widest">{{ product.category }}</div>
            <h3 class="text-lg font-heading font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {{ product.title }}
            </h3>
            <p class="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {{ product.description }}
            </p>
          </div>
          <template #footer>
            <AppButton variant="primary" :to="`/products/${product.slug}`" class="w-full">
              Подробнее
            </AppButton>
          </template>
        </AppCard>
      </div>

      <AppPagination
        v-if="isClientReady && !pending && totalPages > 1"
        class="mt-12"
        :page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />

      <div v-if="!isClientReady || pending" class="py-12 flex flex-col items-center justify-center gap-4">
        <div class="animate-spin text-secondary">
          <svg class="h-8 w-8" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-sm text-white/50">Загружаем товары...</p>
      </div>

      <div v-else-if="isClientReady && !products.length" class="py-12 text-center text-white/40 text-sm">
        Товары не найдены.
      </div>
    </div>
  </div>
</template>