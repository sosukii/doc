<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import { useCatalog } from '~/composables/useCatalog'

const route = useRoute()
const router = useRouter()
const {
  getCachedCatalogResponses,
  getCachedProductsPage,
  defaultProductsResponse,
  buildCatalogCacheKey,
  fetchProductsPage: getProductsPage,
  prefetchProductImages
} = useCatalog()

const selectedCategory = ref('')
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
const catalogViewportReady = useState('catalog-viewport-ready', () => false)

const isClientReady = ref(false)
const loadedProductImages = ref<Record<string, true>>({})
const lastBackgroundPrefetchKey = ref('')
const activePrefetchScenarioId = ref(0)
const visibleImageCount = 4

onMounted(() => {
  isClientReady.value = true
})

const requestKey = computed(() => {
  return buildCatalogCacheKey(
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
  const nextQuery = { ...route.query }

  delete nextQuery.page
  router.replace({ query: nextQuery })
  currentPage.value = 1
})

watch(requestKey, () => {
  loadedProductImages.value = {}
  catalogViewportReady.value = false
})

const { data, pending, refresh } = await useAsyncData(
  () => `catalog:${requestKey.value}`,
  () => getProductsPage(currentPage.value, debouncedSearchQuery.value, selectedCategory.value),
  {
    server: false,
    lazy: true,
    default: defaultProductsResponse,
    watch: [requestKey]
  }
)

const products = computed(() => data.value?.items ?? [])
const totalPages = computed(() => data.value?.totalPages || 1)
const visibleProducts = computed(() => products.value.slice(0, visibleImageCount))
const allVisibleImagesReady = computed(() => {
  if (!visibleProducts.value.length) {
    return true
  }

  return visibleProducts.value.every(product => loadedProductImages.value[product._id])
})

const currentPageFullyReady = computed(() => {
  return isClientReady.value && !pending.value && allVisibleImagesReady.value
})

const waitForIdleTime = async () => {
  if (typeof window === 'undefined') {
    return
  }

  if ('requestIdleCallback' in window) {
    await new Promise<void>((resolve) => {
      window.requestIdleCallback(() => resolve(), { timeout: 1000 })
    })
    return
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 120)
  })
}

const markProductImageLoaded = (productId: string) => {
  if (loadedProductImages.value[productId]) {
    return
  }

  loadedProductImages.value = {
    ...loadedProductImages.value,
    [productId]: true
  }
}

const prefetchCatalogPage = async (page: number, scenarioId: number) => {
  if (page < 1 || page > totalPages.value || scenarioId !== activePrefetchScenarioId.value) {
    return
  }

  const search = debouncedSearchQuery.value.trim()
  const category = selectedCategory.value
  const cacheKey = buildCatalogCacheKey(page, search, category)
  const cachedResponse = getCachedProductsPage(cacheKey)

  if (cachedResponse) {
    await prefetchProductImages(cachedResponse, visibleImageCount, 'low')
    return
  }

  try {
    await waitForIdleTime()

    if (scenarioId !== activePrefetchScenarioId.value) {
      return
    }

    const response = await getProductsPage(page, search, category)

    if (scenarioId !== activePrefetchScenarioId.value) {
      return
    }

    await prefetchProductImages(response, visibleImageCount, 'low')
  } catch {
    console.log('Prefetch failed for page', page)
  }
}

const startNeighborPrefetch = async () => {
  if (!currentPageFullyReady.value) {
    return
  }

  if (lastBackgroundPrefetchKey.value === requestKey.value) {
    return
  }

  lastBackgroundPrefetchKey.value = requestKey.value
  activePrefetchScenarioId.value += 1

  const scenarioId = activePrefetchScenarioId.value
  const nextPage = currentPage.value + 1
  const previousPage = currentPage.value - 1

  await prefetchCatalogPage(nextPage, scenarioId)

  if (scenarioId !== activePrefetchScenarioId.value) {
    return
  }

  if (previousPage >= 1) {
    await prefetchCatalogPage(previousPage, scenarioId)
  }
}

const categories = computed(() => {
  const uniqueCategories = new Set<string>()

  getCachedCatalogResponses().forEach((response) => {
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

  const nextQuery = { ...route.query }

  if (page > 1) {
    nextQuery.page = String(page)
  } else {
    delete nextQuery.page
  }

  router.push({ query: nextQuery })
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.query.page,
  (page) => {
    const normalizedPage = Math.max(1, Number(page) || 1)

    if (normalizedPage !== currentPage.value) {
      currentPage.value = normalizedPage
    }
  }
)

watch(
  () => getCachedProductsPage(requestKey.value),
  (cachedResponse) => {
    if (!cachedResponse) {
      return
    }

    if (data.value === cachedResponse) {
      return
    }

    data.value = cachedResponse
  }
)

watch(
  requestKey,
  () => {
    if (!getCachedProductsPage(requestKey.value)) {
      refresh()
    }
  }
)

watch(
  currentPageFullyReady,
  (isReady) => {
    if (!isReady) {
      return
    }

    catalogViewportReady.value = true
    void startNeighborPrefetch()
  },
  { immediate: true }
)

watch(
  products,
  async (currentProducts) => {
    if (!currentProducts.length) {
      return
    }

    await prefetchProductImages(
      {
        items: currentProducts,
        total: data.value?.total ?? currentProducts.length,
        page: currentPage.value,
        limit: data.value?.limit ?? currentProducts.length,
        totalPages: totalPages.value
      },
      visibleImageCount,
      'high'
    )
  },
  { immediate: true }
)

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
          v-for="(product, index) in products"
          :key="product._id"
          class="flex flex-col group h-full"
          variant="medium"
        >
          <div class="relative aspect-square mb-6 overflow-hidden rounded-xl bg-white/5 p-4 flex items-center justify-center">
            <NuxtImg
              :src="product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image'"
              :alt="product.title"
              class="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              :loading="index < visibleImageCount ? 'eager' : 'lazy'"
              :fetchpriority="index < visibleImageCount ? 'high' : 'low'"
              @load="markProductImageLoaded(product._id)"
              @error="markProductImageLoaded(product._id)"
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
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
