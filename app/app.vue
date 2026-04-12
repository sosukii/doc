<script setup lang="ts">
import { useCatalog } from '~/composables/useCatalog'

const route = useRoute()
const startupWarmupStarted = useState('startup-warmup-started', () => false)
const catalogViewportReady = useState('catalog-viewport-ready', () => false)
const { buildCatalogCacheKey, getCachedProductsPage, fetchProductsPage, prefetchProductImages } = useCatalog()

const staticRoutesToWarm = ['/contacts', '/services', '/brands', '/delivery', '/privacy', '/terms']

const normalizePath = (path: string) => {
  if (path !== '/' && path.endsWith('/')) {
    return path.slice(0, -1)
  }

  return path
}

const waitForInitialViewport = async () => {
  await nextTick()

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

const waitForIdleTime = async () => {
  if (typeof window === 'undefined') {
    return
  }

  if ('requestIdleCallback' in window) {
    await new Promise<void>((resolve) => {
      window.requestIdleCallback(() => resolve(), { timeout: 800 })
    })
    return
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 120)
  })
}

const waitForCurrentCatalogPage = async () => {
  const currentPath = normalizePath(route.path)

  if (currentPath !== '/products') {
    return
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (catalogViewportReady.value) {
      return
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 100)
    })
  }
}

const preloadStaticRoute = async (path: string) => {
  try {
    await preloadRouteComponents(path)
  } catch (error) {
    console.error(`Failed to preload static route ${path}`, error)
  }
}

const warmStartupData = async () => {
  if (startupWarmupStarted.value || import.meta.server) {
    return
  }

  startupWarmupStarted.value = true

  await waitForInitialViewport()
  await waitForCurrentCatalogPage()

  const firstCatalogPageKey = buildCatalogCacheKey(1, '', '')

  if (!getCachedProductsPage(firstCatalogPageKey)) {
    await waitForIdleTime()
    const firstCatalogPage = await fetchProductsPage(1, '', '')
    await prefetchProductImages(firstCatalogPage, 4, 'low')
  }

  const currentPath = normalizePath(route.path)

  for (const staticRoute of staticRoutesToWarm) {
    if (staticRoute === currentPath) {
      continue
    }

    await waitForIdleTime()
    await preloadStaticRoute(staticRoute)
  }
}

onMounted(() => {
  void warmStartupData()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
