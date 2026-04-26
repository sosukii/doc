interface Product {
  _id: string
  title: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  brand?: string
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

interface CachedProductsPage {
  response: ProductsResponse
  expiresAt: number
  updatedAt: number
}

const CATALOG_PER_PAGE = 12
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000
const CATALOG_SESSION_STORAGE_KEY = 'avent:catalog-cache:v1'
const CATALOG_MAX_CACHE_ENTRIES = 12

const defaultProductsResponse = (): ProductsResponse => ({
  items: [],
  total: 0,
  page: 1,
  limit: CATALOG_PER_PAGE,
  totalPages: 1
})

const buildProductsQuery = (page: number, search: string, category: string, brands: string[]) => ({
  page,
  limit: CATALOG_PER_PAGE,
  search: search || undefined,
  category: category || undefined,
  brand: brands.length ? brands.join(',') : undefined
})

const buildCatalogCacheKey = (page: number, search: string, category: string, brands: string[] = []) => JSON.stringify({
  page,
  limit: CATALOG_PER_PAGE,
  search: search || '',
  category: category || '',
  brands: [...brands].sort()
})

const normalizeCatalogFilters = (search = '', category = '', brands: string[] = []) => ({
  search: search.trim(),
  category: category.trim(),
  brands: [...new Set(brands.map(brand => brand.trim()).filter(Boolean))].sort()
})

export const useCatalog = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'https://doc-api-r2vu.onrender.com'
  const productsCache = useState<Record<string, CachedProductsPage>>('catalog-products-cache', () => ({}))
  const pendingRequests = useState<Record<string, Promise<ProductsResponse>>>('catalog-products-pending', () => ({}))
  const hydratedFromSession = useState('catalog-products-cache-hydrated', () => false)
  const persistenceStarted = useState('catalog-products-cache-persistence-started', () => false)
  const prefetchedImages = useState<Record<string, true>>('catalog-prefetched-images', () => ({}))

  const pruneExpiredCacheEntries = () => {
    const now = Date.now()
    const nextEntries = Object.fromEntries(
      Object.entries(productsCache.value).filter(([, entry]) => entry.expiresAt > now)
    )

    if (Object.keys(nextEntries).length !== Object.keys(productsCache.value).length) {
      productsCache.value = nextEntries
    }
  }

  const hydrateCacheFromSession = () => {
    if (import.meta.server || hydratedFromSession.value) {
      return
    }

    hydratedFromSession.value = true

    try {
      const rawCache = window.sessionStorage.getItem(CATALOG_SESSION_STORAGE_KEY)

      if (!rawCache) {
        return
      }

      const parsedCache = JSON.parse(rawCache) as Record<string, CachedProductsPage>
      const now = Date.now()

      productsCache.value = Object.fromEntries(
        Object.entries(parsedCache).filter(([, entry]) => entry.expiresAt > now)
      )
    } catch (error) {
      console.error('Failed to restore catalog cache from session storage', error)
    }
  }

  const startCachePersistence = () => {
    if (import.meta.server || persistenceStarted.value) {
      return
    }

    persistenceStarted.value = true

    watch(productsCache, (cacheEntries) => {
      try {
        window.sessionStorage.setItem(CATALOG_SESSION_STORAGE_KEY, JSON.stringify(cacheEntries))
      } catch (error) {
        console.error('Failed to persist catalog cache to session storage', error)
      }
    }, { deep: true })
  }

  const getCachedProductsPage = (cacheKey: string) => {
    const cachedEntry = productsCache.value[cacheKey]

    if (!cachedEntry) {
      return null
    }

    if (cachedEntry.expiresAt <= Date.now()) {
      const { [cacheKey]: _expiredEntry, ...restEntries } = productsCache.value
      productsCache.value = restEntries
      return null
    }

    return cachedEntry.response
  }

  const setCachedProductsPage = (cacheKey: string, response: ProductsResponse) => {
    const nextEntries = {
      ...productsCache.value,
      [cacheKey]: {
        response,
        updatedAt: Date.now(),
        expiresAt: Date.now() + CATALOG_CACHE_TTL_MS
      }
    }

    const sortedEntries = Object.entries(nextEntries)
      .sort(([, leftEntry], [, rightEntry]) => rightEntry.updatedAt - leftEntry.updatedAt)
      .slice(0, CATALOG_MAX_CACHE_ENTRIES)

    productsCache.value = Object.fromEntries(sortedEntries)
  }

  const getCachedCatalogResponses = () => {
    pruneExpiredCacheEntries()
    return Object.values(productsCache.value).map(entry => entry.response)
  }

  const preloadImage = async (src: string, priority: 'high' | 'low' = 'low') => {
    if (import.meta.server || !src || prefetchedImages.value[src]) {
      return
    }

    prefetchedImages.value = {
      ...prefetchedImages.value,
      [src]: true
    }

    await new Promise<void>((resolve) => {
      const image = new Image()

      if ('fetchPriority' in image) {
        ;(image as HTMLImageElement & { fetchPriority?: 'high' | 'low' }).fetchPriority = priority
      }

      image.decoding = 'async'
      image.loading = priority === 'high' ? 'eager' : 'lazy'
      image.onload = () => resolve()
      image.onerror = () => resolve()
      image.src = src
    })
  }

  const prefetchProductImages = async (response: ProductsResponse, maxImages = 4, priority: 'high' | 'low' = 'low') => {
    if (import.meta.server) {
      return
    }

    const uniqueImages = response.items
      .slice(0, maxImages)
      .map(product => product.images?.[0])
      .filter((image): image is string => Boolean(image))

    await Promise.all(uniqueImages.map(image => preloadImage(image, priority)))
  }

  hydrateCacheFromSession()
  startCachePersistence()
  pruneExpiredCacheEntries()

  const getCachedProductsPageByFilters = (page: number, search = '', category = '', brands: string[] = []) => {
    const filters = normalizeCatalogFilters(search, category, brands)
    const cacheKey = buildCatalogCacheKey(page, filters.search, filters.category, filters.brands)
    return getCachedProductsPage(cacheKey)
  }

  const fetchProductsPage = async (
    page: number,
    search = '',
    category = '',
    brands: string[] = [],
    options: {
      signal?: AbortSignal
      useCache?: boolean
    } = {}
  ) => {
    const filters = normalizeCatalogFilters(search, category, brands)
    const useCache = options.useCache ?? true
    const cacheKey = buildCatalogCacheKey(page, filters.search, filters.category, filters.brands)
    const cachedResponse = getCachedProductsPage(cacheKey)

    if (useCache && cachedResponse) {
      return cachedResponse
    }

    if (pendingRequests.value[cacheKey]) {
      return pendingRequests.value[cacheKey]
    }

    const request = $fetch<ProductsResponse>('/api/products', {
      baseURL: apiBase,
      query: buildProductsQuery(page, filters.search, filters.category, filters.brands),
      signal: options.signal
    })
      .then((response) => {
        setCachedProductsPage(cacheKey, response)
        return response
      })
      .catch((error) => {
        console.error('API error', error)
        const staleResponse = getCachedProductsPage(cacheKey)

        if (staleResponse) {
          return staleResponse
        }

        throw error
      })
      .finally(() => {
        const { [cacheKey]: _completedRequest, ...restPendingRequests } = pendingRequests.value
        pendingRequests.value = restPendingRequests
      })

    pendingRequests.value = {
      ...pendingRequests.value,
      [cacheKey]: request
    }

    return request
  }

  const prefetchCatalogPage = async (
    page: number,
    search = '',
    category = '',
    brands: string[] = [],
    options: {
      imageCount?: number
      imagePriority?: 'high' | 'low'
      useCache?: boolean
      signal?: AbortSignal
    } = {}
  ) => {
    const filters = normalizeCatalogFilters(search, category, brands)
    const response = await fetchProductsPage(page, filters.search, filters.category, filters.brands, {
      useCache: options.useCache,
      signal: options.signal
    })

    await prefetchProductImages(
      response,
      options.imageCount ?? 4,
      options.imagePriority ?? 'low'
    )

    return response
  }

  return {
    perPage: CATALOG_PER_PAGE,
    cacheTtlMs: CATALOG_CACHE_TTL_MS,
    productsCache,
    pendingRequests,
    defaultProductsResponse,
    buildCatalogCacheKey,
    normalizeCatalogFilters,
    getCachedProductsPage,
    getCachedProductsPageByFilters,
    getCachedCatalogResponses,
    fetchProductsPage,
    prefetchCatalogPage,
    prefetchProductImages
  }
}

export type { Product, ProductsResponse }
