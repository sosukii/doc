<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'
import { useCatalog } from '~/composables/useCatalog'
import { useCatalogMetadata } from '~/composables/useCatalogMetadata'
import { getProductImageSrc, isUsableProductImageSrc } from '~/utils/productPlaceholder'

const route = useRoute()
const router = useRouter()
const {
  perPage,
  getCachedProductsPageByFilters,
  defaultProductsResponse,
  buildCatalogCacheKey,
  fetchProductsPage,
  prefetchCatalogPage
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
const { enqueue, remove, waitForIdleTime } = useBackgroundPrefetchQueue()

const backgroundImagePrefetchCount = 4
const priorityImageCount = ref(2)

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedBrandSlugs = ref<string[]>([])
const selectedCategorySlugs = ref<string[]>([])
const priceFrom = ref(0)
const priceTo = ref(1500000)
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

const parseQueryList = (value: unknown, normalizer: (value: string) => string) => {
  const values = Array.isArray(value)
    ? value.map(String)
    : value == null
      ? []
      : String(value).split(',')

  return [...new Set(values.map(normalizer).filter(Boolean))].sort()
}

const updateFiltersFromRoute = () => {
  const routeSearch = typeof route.query.search === 'string' ? route.query.search : ''
  const parsedPriceFrom = typeof route.query.priceFrom === 'string' ? Number(route.query.priceFrom) || 0 : 0
  const parsedPriceTo = typeof route.query.priceTo === 'string' ? Number(route.query.priceTo) || 1500000 : 1500000

  selectedBrandSlugs.value = parseQueryList(route.query.brand, normalizeBrandSlug)
  selectedCategorySlugs.value = parseQueryList(route.query.category, normalizeCategorySlug)
  priceFrom.value = Math.max(0, Math.min(parsedPriceFrom, parsedPriceTo, 1500000))
  priceTo.value = Math.max(priceFrom.value, Math.min(parsedPriceTo, 1500000))
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
  brands: [...selectedBrandSlugs.value].sort(),
  priceFrom: priceFrom.value,
  priceTo: priceTo.value
}))

const requestKey = computed(() => buildCatalogCacheKey(
  currentPage.value,
  normalizedFilters.value.search,
  normalizedFilters.value.category,
  normalizedFilters.value.brands,
  normalizedFilters.value.priceFrom,
  normalizedFilters.value.priceTo
))

const updatePriorityImageCount = () => {
  if (import.meta.server) {
    return
  }

  priorityImageCount.value = window.matchMedia('(min-width: 1024px)').matches ? 4 : 2
}

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
  () => [route.query.brand, route.query.category, route.query.search, route.query.priceFrom, route.query.priceTo],
  () => {
    updateFiltersFromRoute()
  }
)

const getTargetCachedResponse = () => getCachedProductsPageByFilters(
  currentPage.value,
  normalizedFilters.value.search,
  normalizedFilters.value.category,
  normalizedFilters.value.brands,
  normalizedFilters.value.priceFrom,
  normalizedFilters.value.priceTo
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
  remove(/^catalog:neighbor:/)

  if (import.meta.server) {
    return
  }

  if (applyTargetCachedResponse()) {
    return
  }

  shouldShowSkeleton.value = true

  if (!displayedData.value.items.length) {
    displayedData.value = {
      ...defaultProductsResponse(),
      page: currentPage.value,
      limit: perPage,
      totalPages: lastResolvedData.value.totalPages || 1
    }
  }
})

const initialAsyncDataKey = computed(() => `catalog:${requestKey.value}`)

const { data, pending, error } = await useAsyncData(
  initialAsyncDataKey,
  () => fetchProductsPage(
    currentPage.value,
    normalizedFilters.value.search,
    normalizedFilters.value.category,
    normalizedFilters.value.brands,
    normalizedFilters.value.priceFrom,
    normalizedFilters.value.priceTo
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
          normalizedFilters.value.brands,
          normalizedFilters.value.priceFrom,
          normalizedFilters.value.priceTo
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
const activeBrand = computed(() => selectedBrandSlugs.value.length === 1 ? findBrandByValue(selectedBrandSlugs.value[0]) : null)
const hasActiveFilters = computed(() => Boolean(
  selectedBrandSlugs.value.length ||
  selectedCategorySlugs.value.length ||
  debouncedSearchQuery.value.trim() ||
  priceFrom.value > 0 ||
  priceTo.value < 1500000
))

const resolveProductImage = (product: Product): string => {
  const image = product.images?.[0]

  if (isUsableProductImageSrc(image)) {
    return optimizeProductCardImageUrl(image)
  }

  return getProductImageSrc(product)
}

const criticalImageLinks = computed(() => products.value
  .slice(0, priorityImageCount.value)
  .map((product) => resolveProductImage(product))
  .filter((href): href is string => Boolean(href))
  .map((href) => ({
    rel: 'preload' as const,
    as: 'image' as const,
    href,
    fetchPriority: 'high' as const,
  })))

useHead(() => ({
  link: criticalImageLinks.value
}))

const categories = computed(() =>
  catalogCategories
    .map((category) => ({
      slug: category.slug,
      label: getCategoryLabel(category.slug),
      count: category.count,
      icon: category.icon
    }))
)

const availableCount = computed(() => displayedData.value.total || 0)

const currentPageFullyReady = computed(() => !pending.value && !isRouteFetching.value)
const canStartBackgroundPrefetch = computed(() => !pending.value && !isRouteFetching.value && firstRenderSettled.value && Boolean(products.value.length))
const isCatalogLoading = computed(() => pending.value || isRouteFetching.value || shouldShowSkeleton.value)
const isCatalogOverlayVisible = computed(() => isCatalogLoading.value && products.value.length > 0)

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
    const category = selectedCategorySlugs.value[0]
    if (category) {
      nextQuery.category = category
    }
  }

  if (debouncedSearchQuery.value.trim()) {
    nextQuery.search = debouncedSearchQuery.value.trim()
  }

  if (priceFrom.value > 0) {
    nextQuery.priceFrom = String(priceFrom.value)
  }

  if (priceTo.value < 1500000) {
    nextQuery.priceTo = String(priceTo.value)
  }

  await router.replace({ query: nextQuery })
}

watch([priceFrom, priceTo], () => {
  if (!filtersHydrated.value) {
    return
  }

  catalogLoadError.value = ''
  void updateCatalogQuery()
})

watch(debouncedSearchQuery, () => {
  if (!filtersHydrated.value) {
    return
  }

  catalogLoadError.value = ''
  void updateCatalogQuery()
})

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
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  priceFrom.value = 0
  priceTo.value = 1500000
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
      normalizedFilters.value.priceFrom,
      normalizedFilters.value.priceTo,
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
      brands,
      normalizedFilters.value.priceFrom,
      normalizedFilters.value.priceTo
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
    normalizedFilters.value.brands,
    normalizedFilters.value.priceFrom,
    normalizedFilters.value.priceTo
  )

  enqueue({
    key: `catalog:neighbor:${targetCacheKey}`,
    run: async () => {
      await prefetchCatalogPage(
        page,
        normalizedFilters.value.search,
        normalizedFilters.value.category,
        normalizedFilters.value.brands,
        normalizedFilters.value.priceFrom,
        normalizedFilters.value.priceTo,
        {
          imageCount: backgroundImagePrefetchCount,
          imagePriority: 'low',
          imageConcurrency: 2
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
  updatePriorityImageCount()

  requestAnimationFrame(() => requestAnimationFrame(() => {
    void waitForIdleTime().then(() => {
      firstRenderSettled.value = true
    })
  }))

  if (applyTargetCachedResponse()) {
    return
  }

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
  <div class="py-8 sm:py-10 lg:py-12">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-10">
        <aside class="hidden space-y-6 lg:block">
          <CatalogFiltersPanel
            class="sticky top-28"
            :search-query="searchQuery"
            :selected-brand-slugs="selectedBrandSlugs"
            :selected-category-slugs="selectedCategorySlugs"
            :catalog-brands="catalogBrands"
            :categories="categories"
            :available-count="availableCount"
            :has-active-filters="hasActiveFilters"
            :price-from="priceFrom"
            :price-to="priceTo"
            @update:search-query="searchQuery = $event"
            @update:price-from="priceFrom = $event"
            @update:price-to="priceTo = $event"
            @toggle-brand="toggleBrand"
            @toggle-category="toggleCategory"
            @clear-filters="clearFilters"
          />
        </aside>

        <div class="min-w-0 space-y-6 lg:space-y-8">
          <header class="space-y-2">
            <h1 class="text-3xl font-heading font-bold sm:text-4xl">Каталог</h1>
            <p class="max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
              Подберите оборудование по категории, бренду и бюджету.
            </p>
          </header>

          <div class="lg:hidden">
            <AppButton
              variant="glass"
              class="w-full flex-col items-start justify-between gap-1 rounded-2xl px-5 py-4 text-left sm:flex-row sm:items-center"
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
                <h2 class="mt-2 text-2xl font-heading font-bold sm:text-3xl">{{ activeBrand.name }}</h2>
              </div>
              <ul class="space-y-2 text-white/70">
                <li v-for="line in activeBrand.catalogDescription" :key="line">{{ line }}</li>
              </ul>
            </div>
          </AppCard>

          <div v-show="selectedBrandSlugs.length > 0" class="flex flex-wrap items-center gap-3">
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

          <section class="catalog-results-shell" :aria-busy="isCatalogLoading">
            <div
              v-if="products.length"
              class="grid grid-cols-1 gap-4 transition-opacity duration-200 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 min-w-0"
              :class="isCatalogOverlayVisible ? 'opacity-75' : 'opacity-100'"
            >
              <CatalogProductCard
                v-for="(product, index) in products"
                :key="product._id"
                :product="product"
                :image-src="resolveProductImage(product)"
                :category-label="getCategoryLabel(product.category)"
                :brand-label="product.brand ? getBrandLabel(product.brand) : undefined"
                :image-loaded="Boolean(loadedProductImages[resolveProductImage(product)])"
                :eager="index < priorityImageCount"
                @image-load="markProductImageLoaded"
              />
            </div>

            <AppPagination
              v-if="totalPages > 1 && products.length"
              class="catalog-pagination"
              :page="currentPage"
              :total-pages="totalPages"
              @change="handlePageChange"
            />

            <div v-if="isCatalogLoading && !products.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 min-w-0">
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

            <transition name="catalog-results-overlay">
              <div v-if="isCatalogOverlayVisible" class="catalog-results-overlay" role="status" aria-live="polite">
                <div class="catalog-results-loader" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span class="catalog-results-overlay__text">Обновляем подборку...</span>
              </div>
            </transition>
          </section>
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
          class="fixed inset-x-0 bottom-0 z-50 max-h-[88svh] overflow-hidden rounded-t-[28px] border border-white/10 bg-[#08111f]/98 shadow-[0_-24px_80px_rgba(0,0,0,0.45)] sm:left-1/2 sm:max-w-xl sm:-translate-x-1/2 sm:rounded-t-[32px] lg:hidden"
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
          <div class="max-h-[calc(88svh-88px)] overflow-y-auto px-4 py-5 sm:px-5">
            <CatalogFiltersPanel
              :search-query="searchQuery"
              :selected-brand-slugs="selectedBrandSlugs"
              :selected-category-slugs="selectedCategorySlugs"
              :catalog-brands="catalogBrands"
              :categories="categories"
              :available-count="availableCount"
              :has-active-filters="hasActiveFilters"
              :price-from="priceFrom"
              :price-to="priceTo"
              @update:search-query="searchQuery = $event"
              @update:price-from="priceFrom = $event"
              @update:price-to="priceTo = $event"
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

<style scoped>
.catalog-results-shell {
  position: relative;
  min-height: clamp(24rem, 54vw, 48rem);
}

.catalog-pagination {
  margin-top: clamp(1.75rem, 4vw, 3.5rem);
}

.catalog-results-overlay {
  position: absolute;
  inset: -0.75rem;
  z-index: 20;
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  border: 1px solid rgba(var(--color-border-rgb), 0.16);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.62), rgba(var(--color-surface-rgb), 0.34)),
    rgba(var(--color-bg-rgb, 6, 19, 41), 0.18);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.14);
  backdrop-filter: blur(18px);
  pointer-events: all;
}

.catalog-results-overlay__text {
  color: rgba(var(--color-text-rgb), 0.72);
  font-size: 0.92rem;
  font-weight: 700;
}

.catalog-results-loader {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.catalog-results-loader span {
  display: block;
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-soft));
  box-shadow: 0 0 18px rgba(var(--color-primary-rgb), 0.34);
  animation: catalog-loader-pulse 900ms ease-in-out infinite;
}

.catalog-results-loader span:nth-child(2) {
  animation-delay: 120ms;
}

.catalog-results-loader span:nth-child(3) {
  animation-delay: 240ms;
}

.catalog-results-overlay-enter-active,
.catalog-results-overlay-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.catalog-results-overlay-enter-from,
.catalog-results-overlay-leave-to {
  opacity: 0;
  transform: scale(0.992);
}

@keyframes catalog-loader-pulse {
  0%, 100% {
    opacity: 0.38;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-0.16rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-results-loader span {
    animation: none;
  }
}
</style>
