<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'
import { useCatalog } from '~/composables/useCatalog'
import { useCatalogMetadata } from '~/composables/useCatalogMetadata'

const route = useRoute()
const router = useRouter()
const {
  perPage,
  getCachedProductsPageByFilters,
  defaultProductsResponse,
  buildCatalogCacheKey,
  fetchProductsPage,
  prefetchCatalogPage,
  prefetchProductImages
} = useCatalog()
const {
  catalogBrands,
  catalogCategories,
  normalizeBrandSlug,
  normalizeCategorySlug,
  getBrandLabel,
  getCategoryLabel,
  findBrandByValue
} = useCatalogMetadata()
const { enqueue, remove } = useBackgroundPrefetchQueue()

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

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedBrandSlugs = ref<string[]>([])
const selectedCategorySlugs = ref<string[]>([])
const catalogViewportReady = useState('catalog-viewport-ready', () => false)
const loadedProductImages = ref<Record<string, true>>({})
const lastBackgroundPrefetchKey = ref('')
const catalogLoadError = ref('')
const clientRecoveryAttempted = ref(false)
const firstRenderSettled = ref(false)
const lastResolvedData = ref(defaultProductsResponse())
const displayedData = ref(defaultProductsResponse())
const isRouteFetching = ref(false)
const filtersHydrated = ref(false)
const routeFetchReady = ref(false)
const isFilterDrawerOpen = ref(false)
const shouldShowSkeleton = ref(false)
const filtersDrawerId = 'catalog-filters-drawer'
const filterDrawerTitleId = 'catalog-filters-title'

let activeRouteFetchId = 0

let searchDebounceTimeout: ReturnType<typeof setTimeout> | null = null

const parseQueryList = (value: string | string[] | undefined, normalizer: (value: string) => string) => {
  const values = Array.isArray(value) ? value : value ? value.split(',') : []
  return [...new Set(values.map(normalizer).filter(Boolean))].sort()
}

const updateFiltersFromRoute = () => {
  const routeSearch = typeof route.query.search === 'string' ? route.query.search : ''
  selectedBrandSlugs.value = parseQueryList(route.query.brand, normalizeBrandSlug)
  selectedCategorySlugs.value = parseQueryList(route.query.category, normalizeCategorySlug)
  searchQuery.value = routeSearch
  debouncedSearchQuery.value = routeSearch
  filtersHydrated.value = true
}

updateFiltersFromRoute()

const currentPage = computed(() => Math.max(1, Number(route.query.page) || 1))
const currentCategorySlug = computed(() => selectedCategorySlugs.value[0] || '')
const normalizedFilters = computed(() => ({
  search: debouncedSearchQuery.value.trim(),
  category: currentCategorySlug.value,
  brands: [...selectedBrandSlugs.value].sort()
}))

const requestKey = computed(() => buildCatalogCacheKey(
  currentPage.value,
  normalizedFilters.value.search,
  normalizedFilters.value.category,
  normalizedFilters.value.brands
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

watch(
  () => [route.query.brand, route.query.category, route.query.search],
  () => {
    updateFiltersFromRoute()
  }
)

const getTargetCachedResponse = () => getCachedProductsPageByFilters(
  currentPage.value,
  normalizedFilters.value.search,
  normalizedFilters.value.category,
  normalizedFilters.value.brands
)

const applyTargetCachedResponse = () => {
  const cachedResponse = getTargetCachedResponse()

  if (!cachedResponse) {
    return false
  }

  data.value = cachedResponse
  displayedData.value = cachedResponse
  lastResolvedData.value = cachedResponse
  shouldShowSkeleton.value = false
  isRouteFetching.value = false
  catalogLoadError.value = ''
  return true
}

const closeFilterDrawer = () => {
  isFilterDrawerOpen.value = false
}

const openFilterDrawer = () => {
  isFilterDrawerOpen.value = true
}

watch(isFilterDrawerOpen, (isOpen) => {
  if (import.meta.server) {
    return
  }

  document.body.style.overflow = isOpen ? 'hidden' : ''
})

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFilterDrawerOpen.value) {
    closeFilterDrawer()
  }
}

watch(requestKey, () => {
  catalogViewportReady.value = false
  catalogLoadError.value = ''
  clientRecoveryAttempted.value = false
  remove(/^catalog:(neighbor|current-page-images):/)

  if (import.meta.server) {
    return
  }

  if (applyTargetCachedResponse()) {
    return
  }

  shouldShowSkeleton.value = true
  displayedData.value = {
    ...defaultProductsResponse(),
    page: currentPage.value,
    limit: perPage,
    totalPages: lastResolvedData.value.totalPages || 1
  }
})

const initialAsyncDataKey = computed(() => `catalog:${requestKey.value}`)

const { data, pending, error } = await useAsyncData(
  initialAsyncDataKey,
  () => fetchProductsPage(
    currentPage.value,
    normalizedFilters.value.search,
    normalizedFilters.value.category,
    normalizedFilters.value.brands
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
          normalizedFilters.value.category,
          normalizedFilters.value.brands
        )
    }
  }
)

watch(
  data,
  (nextData) => {
    if (!nextData) {
      return
    }

    displayedData.value = nextData
    shouldShowSkeleton.value = false

    if (nextData.items.length || !nextData.total) {
      lastResolvedData.value = nextData
    }
  },
  { immediate: true }
)

const products = computed(() => displayedData.value.items ?? [])
const totalPages = computed(() => displayedData.value.totalPages || 1)
const visibleProducts = computed(() => products.value.slice(0, viewportImageCount))
const activeBrand = computed(() => selectedBrandSlugs.value.length === 1 ? findBrandByValue(selectedBrandSlugs.value[0]) : null)
const hasActiveFilters = computed(() => Boolean(selectedBrandSlugs.value.length || selectedCategorySlugs.value.length))

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
  })))

useHead(() => ({
  link: criticalImageLinks.value
}))

const categories = computed(() =>
  catalogCategories
    .map((category) => ({
      slug: category.slug,
      label: getCategoryLabel(category.slug)
    }))
)

const allVisibleImagesReady = computed(() => {
  if (!visibleProducts.value.length) {
    return true
  }

  return visibleProducts.value.every((product) => loadedProductImages.value[resolveProductImage(product.images?.[0])])
})

const currentPageFullyReady = computed(() => !pending.value && !isRouteFetching.value && allVisibleImagesReady.value)
const canStartBackgroundPrefetch = computed(() => !pending.value && !isRouteFetching.value && firstRenderSettled.value && Boolean(products.value.length))
const isCatalogLoading = computed(() => pending.value || isRouteFetching.value || shouldShowSkeleton.value)

const markProductImageLoaded = (imageSrc: string) => {
  if (!imageSrc || loadedProductImages.value[imageSrc]) {
    return
  }

  loadedProductImages.value = {
    ...loadedProductImages.value,
    [imageSrc]: true
  }
}

const updateCatalogQuery = async () => {
  if (!filtersHydrated.value) {
    return
  }

  const nextQuery: Record<string, string> = {}

  if (selectedBrandSlugs.value.length) {
    nextQuery.brand = [...selectedBrandSlugs.value].sort().join(',')
  }

  if (selectedCategorySlugs.value.length) {
    nextQuery.category = selectedCategorySlugs.value[0]
  }

  if (debouncedSearchQuery.value.trim()) {
    nextQuery.search = debouncedSearchQuery.value.trim()
  }

  await router.replace({ query: nextQuery })
}

const toggleBrand = (brandSlug: string) => {
  const nextBrands = selectedBrandSlugs.value.includes(brandSlug)
    ? selectedBrandSlugs.value.filter((slug) => slug !== brandSlug)
    : [...selectedBrandSlugs.value, brandSlug]

  selectedBrandSlugs.value = [...new Set(nextBrands)].sort()
  catalogLoadError.value = ''
  void updateCatalogQuery()
}

const toggleCategory = (categorySlug: string) => {
  selectedCategorySlugs.value = selectedCategorySlugs.value.includes(categorySlug)
    ? []
    : [categorySlug]

  catalogLoadError.value = ''
  void updateCatalogQuery()
}

const clearFilters = () => {
  selectedBrandSlugs.value = []
  selectedCategorySlugs.value = []
  catalogLoadError.value = ''
  void updateCatalogQuery()
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
      normalizedFilters.value.brands,
      { useCache: false }
    )

    data.value = freshResponse
    displayedData.value = freshResponse
    lastResolvedData.value = freshResponse
    shouldShowSkeleton.value = false
    catalogLoadError.value = freshResponse.items.length ? '' : 'Не удалось получить товары из API. Проверь доступность бэкенда.'
  } catch {
    catalogLoadError.value = 'Не удалось получить товары из API. Проверь доступность бэкенда.'
  }
}

const fetchRoutePage = async () => {
  if (import.meta.server) {
    return
  }

  const requestId = ++activeRouteFetchId
  const page = currentPage.value
  const { search, category, brands } = normalizedFilters.value

  isRouteFetching.value = true

  try {
    const response = await fetchProductsPage(
      page,
      search,
      category,
      brands
    )

    if (requestId !== activeRouteFetchId) {
      return
    }

    data.value = response
    displayedData.value = response
    lastResolvedData.value = response
    shouldShowSkeleton.value = false
    catalogLoadError.value = ''
  } catch {
    if (requestId !== activeRouteFetchId) {
      return
    }

    shouldShowSkeleton.value = false
    displayedData.value = lastResolvedData.value
    catalogLoadError.value = 'Не удалось получить товары из API. Проверь доступность бэкенда.'
  } finally {
    if (requestId === activeRouteFetchId) {
      isRouteFetching.value = false
    }
  }
}

const enqueueNeighborPrefetch = (page: number) => {
  if (page < 1 || page > totalPages.value) {
    return
  }

  const targetCacheKey = buildCatalogCacheKey(
    page,
    normalizedFilters.value.search,
    normalizedFilters.value.category,
    normalizedFilters.value.brands
  )

  enqueue({
    key: `catalog:neighbor:${targetCacheKey}`,
    run: async () => {
      await prefetchCatalogPage(
        page,
        normalizedFilters.value.search,
        normalizedFilters.value.category,
        normalizedFilters.value.brands,
        {
          imageCount: viewportImageCount,
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

  const nextQuery = {
    ...route.query,
    page: page > 1 ? String(page) : undefined
  }

  if (page <= 1) {
    delete nextQuery.page
  }

  catalogLoadError.value = ''
  void router.push({ query: nextQuery })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.fullPath,
  (nextPath, previousPath) => {
    if (import.meta.server || !routeFetchReady.value || nextPath === previousPath) {
      return
    }

    closeFilterDrawer()

    if (applyTargetCachedResponse()) {
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
  routeFetchReady.value = true
  window.addEventListener('keydown', handleEscapeKey)

  requestAnimationFrame(() => {
    firstRenderSettled.value = true
  })

  if (!products.value.length) {
    void fetchRoutePage().finally(() => {
      if (!products.value.length) {
        void recoverCatalogDataOnClient()
      }
    })
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEscapeKey)
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
      <div class="mb-12">
        <h1 class="mb-4 text-4xl font-heading font-bold lg:text-6xl">Каталог</h1>
        <p class="text-white/60">Откройте для себя наш ассортимент прецизионных решений.</p>
      </div>

      <div class="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside class="hidden space-y-6 lg:block">
          <AppCard variant="low" class="sticky top-28">
            <CatalogFiltersPanel
              :search-query="searchQuery"
              :selected-brand-slugs="selectedBrandSlugs"
              :selected-category-slugs="selectedCategorySlugs"
              :catalog-brands="catalogBrands"
              :categories="categories"
              :has-active-filters="hasActiveFilters"
              @update:search-query="searchQuery = $event"
              @toggle-brand="toggleBrand"
              @toggle-category="toggleCategory"
              @clear-filters="clearFilters"
            />
          </AppCard>
        </aside>

        <div class="space-y-8">
          <div class="lg:hidden">
            <AppButton
              variant="glass"
              class="w-full justify-between rounded-2xl px-5 py-4 text-left"
              aria-label="Открыть фильтры"
              :aria-expanded="isFilterDrawerOpen"
              :aria-controls="filtersDrawerId"
              @click="openFilterDrawer"
            >
              <span>Фильтры</span>
              <span class="text-sm text-white/55">{{ hasActiveFilters ? 'Есть выбранные параметры' : 'Бренд, категория, поиск' }}</span>
            </AppButton>
          </div>

          <AppCard
            v-if="activeBrand"
            variant="low"
            class="border border-white/5 bg-surface-container-low/30"
          >
            <div class="space-y-4">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-white/40">Бренд</p>
                <h2 class="mt-2 text-3xl font-heading font-bold">{{ activeBrand.name }}</h2>
              </div>
              <ul class="space-y-2 text-white/70">
                <li v-for="line in activeBrand.catalogDescription" :key="line">{{ line }}</li>
              </ul>
            </div>
          </AppCard>

          <div class="flex flex-wrap items-center gap-3">
            <span
              v-for="brandSlug in selectedBrandSlugs"
              :key="brandSlug"
              class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
            >
              {{ getBrandLabel(brandSlug) }}
            </span>
            <span
              v-for="categorySlug in selectedCategorySlugs"
              :key="categorySlug"
              class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
            >
              {{ getCategoryLabel(categorySlug) }}
            </span>
          </div>

          <div
            v-if="products.length"
            class="grid grid-cols-1 gap-8 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3"
            :class="isRouteFetching ? 'opacity-90' : 'opacity-100'"
          >
            <AppCard
              v-for="(product, index) in products"
              :key="product._id"
              class="flex h-full flex-col group"
              variant="medium"
            >
              <div class="relative mb-6 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/6 bg-white/[0.04] p-4">
                <div
                  class="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] transition-opacity duration-300"
                  :class="loadedProductImages[resolveProductImage(product.images?.[0])] ? 'opacity-0' : 'opacity-100 animate-pulse'"
                  aria-hidden="true"
                />
                <NuxtImg
                  :src="resolveProductImage(product.images?.[0])"
                  :alt="product.title"
                  width="600"
                  height="600"
                  sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
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
                <div class="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-white/40">
                  <span>{{ getCategoryLabel(product.category) }}</span>
                  <span v-if="product.brand">{{ getBrandLabel(product.brand) }}</span>
                </div>
                <h2 class="line-clamp-1 text-lg font-heading font-bold transition-colors group-hover:text-primary">
                  {{ product.title }}
                </h2>
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
            :page="currentPage"
            :total-pages="totalPages"
            @change="handlePageChange"
          />

          <div v-if="isCatalogLoading && !products.length" class="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            <CatalogProductCardSkeleton
              v-for="placeholderIndex in perPage"
              :key="`placeholder-${placeholderIndex}`"
            />
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
              Товары по выбранным фильтрам не найдены.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isFilterDrawerOpen"
          class="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          @click="closeFilterDrawer"
        />
      </transition>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div
          v-if="isFilterDrawerOpen"
          :id="filtersDrawerId"
          class="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-hidden rounded-t-[32px] border border-white/10 bg-[#08111f]/98 shadow-[0_-24px_80px_rgba(0,0,0,0.45)] lg:hidden"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="filterDrawerTitleId"
        >
          <div class="mx-auto mt-3 h-1.5 w-14 rounded-full bg-white/20" aria-hidden="true" />
          <div class="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <h2 :id="filterDrawerTitleId" class="text-xl font-heading font-bold">Фильтры</h2>
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/40"
              aria-label="Закрыть фильтры"
              @click="closeFilterDrawer"
            >
              ×
            </button>
          </div>
          <div class="max-h-[calc(86vh-88px)] overflow-y-auto px-5 py-5">
            <CatalogFiltersPanel
              :search-query="searchQuery"
              :selected-brand-slugs="selectedBrandSlugs"
              :selected-category-slugs="selectedCategorySlugs"
              :catalog-brands="catalogBrands"
              :categories="categories"
              :has-active-filters="hasActiveFilters"
              @update:search-query="searchQuery = $event"
              @toggle-brand="toggleBrand"
              @toggle-category="toggleCategory"
              @clear-filters="clearFilters"
            />
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>
