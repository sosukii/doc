import { useCatalog } from '~/composables/useCatalog'

export const useCatalogNavigationWarmup = () => {
  const { fetchProductsPage, getCachedProductsPageByFilters } = useCatalog()
  const warmupStarted = useState('catalog-navigation-warmup-started', () => false)

  const warmCatalogListing = () => {
    if (import.meta.server || warmupStarted.value || getCachedProductsPageByFilters(1, '', '', [])) {
      return
    }

    warmupStarted.value = true

    void fetchProductsPage(1, '', '', [])
      .catch(() => {
        // Navigation warmup is best-effort.
      })
      .finally(() => {
        warmupStarted.value = false
      })
  }

  return {
    warmCatalogListing
  }
}
