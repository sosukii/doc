<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppInput from '~/components/ui/AppInput.vue'
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
const isRouteFetching = ref(false)
const filtersHydrated = ref(false)

let searchDebounceTimeout: ReturnType<typeof setTimeout> | null = null

const parseQueryList = (value: string | string[] | undefined, normalizer: (value: string) => string) => {
  const values = Array.isArray(value) ? value : value ? value.split(',') : []
  return [...new Set(values.map(normalizer).filter(Boolean))].sort()
}

const updateFiltersFromRoute = () => {
  selectedBrandSlugs.value = parseQueryList(route.query.brand, normalizeBrandSlug)
  selectedCategorySlugs.value = parseQueryList(route.query.category, normalizeCategorySlug)
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
  () => [route.query.brand, route.query.category],
  () => {
    updateFiltersFromRoute()
  }
)

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
    if (!nextData || (!nextData.items.length && !nextData.total)) {
      return
    }

    lastResolvedData.value = nextData
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
    // crossorigin: ''
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
    .sort((left, right) => left.label.localeCompare(right.label))
)

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
    lastResolvedData.value = freshResponse
    catalogLoadError.value = freshResponse.items.length ? '' : 'Не удалось получить товары из API. Проверь доступность бэкенда.'
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
      normalizedFilters.value.category,
      normalizedFilters.value.brands
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
  () => {
    if (import.meta.server) {
      return
    }

    void fetchRoutePage()
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
      <div class="mb-12">
        <h1 class="mb-4 text-4xl font-heading font-bold lg:text-6xl">Каталог</h1>
        <p class="text-white/60">Откройте для себя наш ассортимент прецизионных решений.</p>
      </div>

      <div class="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside class="space-y-6">
          <AppCard variant="low" class="sticky top-28">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-heading font-bold">Фильтры</h2>
                <button
                  v-if="hasActiveFilters"
                  type="button"
                  class="text-sm text-secondary transition hover:text-white"
                  @click="clearFilters"
                >
                  Сбросить
                </button>
              </div>

              <section aria-labelledby="catalog-search-title" class="space-y-3">
                <h3 id="catalog-search-title" class="text-sm font-semibold uppercase tracking-widest text-white/50">Поиск</h3>
                <AppInput
                  v-model="searchQuery"
                  placeholder="Поиск товаров..."
                  type="search"
                />
              </section>

              <section aria-labelledby="catalog-brand-title" class="space-y-3">
                <h3 id="catalog-brand-title" class="text-sm font-semibold uppercase tracking-widest text-white/50">Бренд</h3>
                <label
                  v-for="brand in catalogBrands"
                  :key="brand.slug"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 transition hover:border-white/15"
                >
                  <input
                    :checked="selectedBrandSlugs.includes(brand.slug)"
                    type="checkbox"
                    class="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-secondary focus:ring-secondary"
                    @change="toggleBrand(brand.slug)"
                  >
                  <span class="flex flex-col">
                    <span class="font-medium text-white/90">{{ brand.name }}</span>
                    <span class="text-sm text-white/45">{{ brand.shortDescription }}</span>
                  </span>
                </label>
              </section>

              <section aria-labelledby="catalog-category-title" class="space-y-3">
                <h3 id="catalog-category-title" class="text-sm font-semibold uppercase tracking-widest text-white/50">Категория</h3>
                <label
                  v-for="category in categories"
                  :key="category.slug"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 transition hover:border-white/15"
                >
                  <input
                    :checked="selectedCategorySlugs.includes(category.slug)"
                    type="checkbox"
                    class="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-secondary focus:ring-secondary"
                    @change="toggleCategory(category.slug)"
                  >
                  <span class="text-sm text-white/80">{{ category.label }}</span>
                </label>
              </section>
            </div>
          </AppCard>
        </aside>

        <div class="space-y-8">
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

          <div v-if="(pending || isRouteFetching) && !lastResolvedData.items.length" class="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="placeholderIndex in perPage"
              :key="`placeholder-${placeholderIndex}`"
              class="glass-panel h-[430px] animate-pulse rounded-2xl border border-white/5 bg-white/5"
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
  </div>
</template>
