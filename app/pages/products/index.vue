<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'
import { useCatalog } from '~/composables/useCatalog'

const route = useRoute()
const router = useRouter()
const {
  perPage,
  getCachedCatalogResponses,
  getCachedProductsPageByFilters,
  defaultProductsResponse,
  buildCatalogCacheKey,
  fetchProductsPage,
  prefetchCatalogPage,
  prefetchProductImages
} = useCatalog()
const { enqueue, remove } = useBackgroundPrefetchQueue()

const selectedCategory = ref('')
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const catalogViewportReady = useState('catalog-viewport-ready', () => false)
const loadedProductImages = ref<Record<string, true>>({})
const lastBackgroundPrefetchKey = ref('')
const catalogLoadError = ref('')
const clientRecoveryAttempted = ref(false)
const firstRenderSettled = ref(false)
const lastResolvedData = ref(defaultProductsResponse())
const isRouteFetching = ref(false)

const viewportImageCount = 8
const fullPageImageCount = perPage
const fallbackImage = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#111827"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="30">
      No image
    </text>
  </svg>
`)

let searchDebounceTimeout: ReturnType<typeof setTimeout> | null = null

const currentPage = computed(() => Math.max(1, Number(route.query.page) || 1))
const normalizedFilters = computed(() => ({
  search: debouncedSearchQuery.value.trim(),
  category: selectedCategory.value.trim()
}))

const requestKey = computed(() => buildCatalogCacheKey(
  currentPage.value,
  normalizedFilters.value.search,
  normalizedFilters.value.category
))

watch(searchQuery, (value) => {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout)
  }

  searchDebounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, 250)
})

onBeforeUnmount(() => {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout)
  }
})

watch([debouncedSearchQuery, selectedCategory], () => {
  const nextQuery = { ...route.query }

  delete nextQuery.page
  catalogLoadError.value = ''
  clientRecoveryAttempted.value = false
  void router.replace({ query: nextQuery })
})

watch(requestKey, () => {
  catalogViewportReady.value = false
  catalogLoadError.value = ''
  clientRecoveryAttempted.value = false
  remove(/^catalog:(neighbor|current-page-images):/)
})

const initialAsyncDataKey = computed(() => `catalog:${requestKey.value}`)

const { data, pending, error } = await useAsyncData(
  initialAsyncDataKey,
  () => fetchProductsPage(
    currentPage.value,
    normalizedFilters.value.search,
    normalizedFilters.value.category
  ),
  {
    server: true,
    lazy: false,
    deep: false,
    dedupe: 'defer',
    default: defaultProductsResponse,
    getCachedData(_key, nuxtApp) {
      const payloadKey = `catalog:${requestKey.value}`

      return nuxtApp.payload.data[payloadKey]
        || nuxtApp.static.data[payloadKey]
        || getCachedProductsPageByFilters(
          currentPage.value,
          normalizedFilters.value.search,
          normalizedFilters.value.category
        )
    }
  }
)

watch(
  data,
  (nextData) => {
    if (!nextData || (!nextData.items.length && !nextData.total)) {
      return
    }

    lastResolvedData.value = nextData
    loadedProductImages.value = {}
  },
  { immediate: true }
)

const displayedData = computed(() => {
  if ((pending.value || isRouteFetching.value) && lastResolvedData.value.items.length) {
    return lastResolvedData.value
  }

  return data.value ?? lastResolvedData.value
})

const products = computed(() => displayedData.value.items ?? [])
const totalPages = computed(() => displayedData.value.totalPages || 1)
const visibleProducts = computed(() => products.value.slice(0, viewportImageCount))

const resolveProductImage = (image?: string) => image || fallbackImage

const criticalImageLinks = computed(() => products.value
  .slice(0, viewportImageCount)
  .map((product) => resolveProductImage(product.images?.[0]))
  .filter(Boolean)
  .map((href) => ({
    rel: 'preload',
    as: 'image',
    href,
    fetchpriority: 'high',
    crossorigin: ''
  })))

useHead(() => ({
  link: criticalImageLinks.value
}))

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
    .sort((left, right) => left.localeCompare(right))
    .map((category) => ({
      slug: category,
      name: category
    }))
})

const allVisibleImagesReady = computed(() => {
  if (!visibleProducts.value.length) {
    return true
  }

  return visibleProducts.value.every((product) => loadedProductImages.value[resolveProductImage(product.images?.[0])])
})

const currentPageFullyReady = computed(() => !pending.value && !isRouteFetching.value && allVisibleImagesReady.value)
const canStartBackgroundPrefetch = computed(() => !pending.value && !isRouteFetching.value && firstRenderSettled.value && Boolean(products.value.length))

const markProductImageLoaded = (imageSrc: string) => {
  if (!imageSrc || loadedProductImages.value[imageSrc]) {
    return
  }

  loadedProductImages.value = {
    ...loadedProductImages.value,
    [imageSrc]: true
  }
}

const recoverCatalogDataOnClient = async () => {
  if (import.meta.server || clientRecoveryAttempted.value || products.value.length) {
    return
  }

  clientRecoveryAttempted.value = true

  try {
    const freshResponse = await fetchProductsPage(
      currentPage.value,
      normalizedFilters.value.search,
      normalizedFilters.value.category,
      { useCache: false }
    )

    data.value = freshResponse
    lastResolvedData.value = freshResponse

    catalogLoadError.value = products.value.length
      ? ''
      : 'Не удалось получить товары из API. Проверь доступность бэкенда.'
  } catch {
    catalogLoadError.value = 'Не удалось получить товары из API. Проверь доступность бэкенда.'
  }
}

const fetchRoutePage = async () => {
  if (import.meta.server) {
    return
  }

  isRouteFetching.value = true

  try {
    const response = await fetchProductsPage(
      currentPage.value,
      normalizedFilters.value.search,
      normalizedFilters.value.category
    )

    data.value = response
    lastResolvedData.value = response
    catalogLoadError.value = ''
  } catch {
    catalogLoadError.value = 'Не удалось получить товары из API. Проверь доступность бэкенда.'
  } finally {
    isRouteFetching.value = false
  }
}

const enqueueNeighborPrefetch = (page: number) => {
  if (page < 1 || page > totalPages.value) {
    return
  }

  const targetCacheKey = buildCatalogCacheKey(
    page,
    normalizedFilters.value.search,
    normalizedFilters.value.category
  )

  enqueue({
    key: `catalog:neighbor:${targetCacheKey}`,
    run: async () => {
      await prefetchCatalogPage(
        page,
        normalizedFilters.value.search,
        normalizedFilters.value.category,
        {
          imageCount: fullPageImageCount,
          imagePriority: 'low'
        }
      )
    }
  })
}

const scheduleNeighborPrefetch = () => {
  if (!canStartBackgroundPrefetch.value || lastBackgroundPrefetchKey.value === requestKey.value) {
    return
  }

  lastBackgroundPrefetchKey.value = requestKey.value

  enqueue({
    key: `catalog:current-page-images:${requestKey.value}`,
    run: async () => {
      await prefetchProductImages(displayedData.value, fullPageImageCount, 'low')
    }
  })

  enqueueNeighborPrefetch(currentPage.value + 1)

  if (currentPage.value > 1) {
    enqueueNeighborPrefetch(currentPage.value - 1)
  }
}

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

  catalogLoadError.value = ''
  void router.push({ query: nextQuery })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  requestKey,
  (_nextKey, _prevKey) => {
    if (import.meta.server) {
      return
    }

    void fetchRoutePage()
  }
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
        total: displayedData.value.total ?? currentProducts.length,
        page: currentPage.value,
        limit: displayedData.value.limit ?? currentProducts.length,
        totalPages: totalPages.value
      },
      viewportImageCount,
      'high'
    )
  },
  { immediate: true }
)

watch(
  canStartBackgroundPrefetch,
  (isReady) => {
    if (!isReady) {
      return
    }

    scheduleNeighborPrefetch()
  },
  { immediate: true }
)

watch(
  currentPageFullyReady,
  (isReady) => {
    if (!isReady) {
      return
    }

    catalogViewportReady.value = true
  },
  { immediate: true }
)

watch(error, (currentError) => {
  if (currentError) {
    catalogLoadError.value = 'Не удалось получить товары из API. Проверь доступность бэкенда.'
    return
  }

  if (products.value.length) {
    catalogLoadError.value = ''
  }
})

onMounted(() => {
  requestAnimationFrame(() => {
    firstRenderSettled.value = true
  })

  if (!products.value.length) {
    void recoverCatalogDataOnClient()
  }
})

useSeoMeta({
  title: 'Каталог продукции - Avent',
  description: 'Широкий выбор современных технологических решений и аксессуаров в каталоге Avent.'
})
</script>

<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <div class="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="mb-4 text-4xl font-heading font-bold lg:text-6xl">Каталог</h1>
          <p class="text-white/60">Откройте для себя наш ассортимент прецизионных решений.</p>
        </div>
        <div class="flex w-full flex-wrap gap-4 lg:w-auto">
          <div class="flex-1 lg:w-64">
            <AppInput
              v-model="searchQuery"
              placeholder="Поиск товаров..."
              type="search"
            />
          </div>
          <select
            v-model="selectedCategory"
            class="input-field h-full min-h-[42px] cursor-pointer appearance-none border-none bg-surface-container-lowest px-4 py-2 text-white/70"
          >
            <option value="">Все категории</option>
            <option
              v-for="cat in categories"
              :key="cat.slug"
              :value="cat.slug"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="products.length"
        class="grid grid-cols-1 gap-8 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        :class="(pending || isRouteFetching) ? 'opacity-85' : 'opacity-100'"
      >
        <AppCard
          v-for="(product, index) in products"
          :key="product._id"
          class="flex h-full flex-col group"
          variant="medium"
        >
          <div class="relative mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/5 p-4">
            <div
              class="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-opacity duration-300"
              :class="loadedProductImages[resolveProductImage(product.images?.[0])] ? 'opacity-0' : 'opacity-100 animate-pulse'"
              aria-hidden="true"
            />
            <NuxtImg
              :src="resolveProductImage(product.images?.[0])"
              :alt="product.title"
              width="600"
              height="600"
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 44vw, 92vw"
              class="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105"
              :class="loadedProductImages[resolveProductImage(product.images?.[0])] ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'"
              :loading="index < viewportImageCount ? 'eager' : 'lazy'"
              :fetchpriority="index < viewportImageCount ? 'high' : 'low'"
              @load="markProductImageLoaded(resolveProductImage(product.images?.[0]))"
              @error="markProductImageLoaded(resolveProductImage(product.images?.[0]))"
            />
            <div class="absolute right-4 top-4 glass-panel px-3 py-1 text-xs font-bold text-secondary">
              ${{ product.price }}
            </div>
          </div>
          <div class="flex flex-grow flex-col gap-2">
            <div class="text-xs uppercase tracking-widest text-white/40">{{ product.category }}</div>
            <h2 class="line-clamp-1 text-lg font-heading font-bold transition-colors group-hover:text-primary">
              {{ product.title }}
            </h2>
            <p class="text-[11px] font-mono text-white/35">
              ID: {{ product._id }}
            </p>
            <p class="line-clamp-2 text-sm leading-relaxed text-white/60">
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
        v-if="totalPages > 1"
        class="mt-12"
        :page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />

      <div v-if="(pending || isRouteFetching) && !lastResolvedData.items.length" class="flex flex-col items-center justify-center gap-4 py-12">
        <div class="animate-spin text-secondary">
          <svg class="h-8 w-8" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p class="text-sm text-white/50">Загружаем товары...</p>
      </div>

      <div v-else-if="error || catalogLoadError" class="py-12 text-center">
        <p class="text-sm text-white/40">
          {{ catalogLoadError || 'Не удалось получить товары из API. Проверь доступность бэкенда.' }}
        </p>
        <div class="mt-4">
          <AppButton variant="glass" @click="recoverCatalogDataOnClient">
            Повторить загрузку
          </AppButton>
        </div>
      </div>

      <div v-else-if="!pending && !products.length" class="py-12 text-center">
        <p class="text-sm text-white/40">
          Товары не найдены.
        </p>
      </div>
    </div>
  </div>
</template>
