import { useCatalog } from '~/composables/useCatalog'

export const useCatalogNavigationWarmup = () => {
  const { getCachedProductsPageByFilters, prefetchCatalogPage } = useCatalog()
  const warmupStarted = useState('catalog-navigation-warmup-started', () => false)

  const warmCatalogListing = () => {
    if (import.meta.server || warmupStarted.value || getCachedProductsPageByFilters(1, '', '', [])) {
      return
    }

    warmupStarted.value = true

    void prefetchCatalogPage(1, '', '', [], {
      imageCount: 8,
      imagePriority: 'high'
    }).finally(() => {
      warmupStarted.value = false
    })
  }

  return {
    warmCatalogListing
  }
}
