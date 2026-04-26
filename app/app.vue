<script setup lang="ts">
import { useBackgroundPrefetchQueue } from '~/composables/useBackgroundPrefetchQueue'
import { useCatalog } from '~/composables/useCatalog'

const config = useRuntimeConfig()
const route = useRoute()
const startupWarmupStarted = useState('startup-warmup-started', () => false)
const catalogViewportReady = useState('catalog-viewport-ready', () => false)
const warmedStaticRoutes = useState<Record<string, true>>('warmed-static-routes', () => ({}))
const { getCachedProductsPageByFilters, prefetchCatalogPage } = useCatalog()
const { enqueue, hasCompleted, remove } = useBackgroundPrefetchQueue()

const staticRoutesToWarm = ['/contacts', '/services', '/brands', '/delivery', '/privacy', '/terms']
const apiOrigin = (() => {
  try {
    return new URL(config.public.apiBase || 'https://doc-api-r2vu.onrender.com').origin
  } catch {
    return 'https://doc-api-r2vu.onrender.com'
  }
})()

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
    warmedStaticRoutes.value = {
      ...warmedStaticRoutes.value,
      [path]: true
    }
  } catch {
    // Route component prefetch is best-effort.
  }
}

const warmStartupData = async () => {
  if (startupWarmupStarted.value || import.meta.server) {
    return
  }

  startupWarmupStarted.value = true

  await waitForInitialViewport()
  await waitForCurrentCatalogPage()

  const currentPath = normalizePath(route.path)

  remove(/^startup:/)

  if (currentPath !== '/products' && !getCachedProductsPageByFilters(1, '', '', [])) {
    enqueue({
      key: 'startup:catalog:page:1',
      run: async () => {
        await prefetchCatalogPage(1, '', '', [], {
          imageCount: 8,
          imagePriority: 'high'
        })
      }
    })
  }

  for (const staticRoute of staticRoutesToWarm) {
    if (staticRoute === currentPath || warmedStaticRoutes.value[staticRoute] || hasCompleted(`startup:route:${staticRoute}`)) {
      continue
    }

    enqueue({
      key: `startup:route:${staticRoute}`,
      run: () => preloadStaticRoute(staticRoute)
    })
  }
}

useHead({
  link: [
    { rel: 'preconnect', href: apiOrigin, crossorigin: '' },
    { rel: 'dns-prefetch', href: apiOrigin },
    { rel: 'preconnect', href: 'https://images.unsplash.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
    { rel: 'preconnect', href: 'https://res.cloudinary.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://res.cloudinary.com' }
  ]
})

onMounted(() => {
  void warmStartupData()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
