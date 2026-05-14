<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

const theme = useState<'dark' | 'light'>('theme-mode', () => 'dark')

const backgrounds = {
  dark: {
    desktop: new URL('../assets/images/backgrounds/dark-desktop.png', import.meta.url).href,
    tablet: new URL('../assets/images/backgrounds/dark-tablet.png', import.meta.url).href,
    mobile: new URL('../assets/images/backgrounds/dark-mobile.png', import.meta.url).href,
  },
  light: {
    desktop: new URL('../assets/images/backgrounds/light-desktop.png', import.meta.url).href,
    tablet: new URL('../assets/images/backgrounds/light-tablet.png', import.meta.url).href,
    mobile: new URL('../assets/images/backgrounds/light-mobile.png', import.meta.url).href,
  },
}

const getSizeKey = (width: number) => {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

const updateBackground = () => {
  if (!import.meta.client) {
    return
  }

  const size = getSizeKey(window.innerWidth)
  const mode = theme.value
  const imageUrl = backgrounds[mode][size]

  document.documentElement.style.setProperty('--page-bg-image', `url('${imageUrl}')`)
  document.documentElement.style.setProperty('--page-bg-position', size === 'mobile' ? 'center top' : 'center center')
  document.documentElement.style.setProperty('--page-bg-attachment', size === 'mobile' ? 'scroll' : 'fixed')
}

const resizeHandler = () => updateBackground()

const stopWatch = watch(theme, (value) => {
  if (!import.meta.client) {
    return
  }

  document.documentElement.dataset.theme = value
  window.localStorage.setItem('theme', value)
  updateBackground()
})

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  const persistedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const initialTheme = persistedTheme || (prefersDark ? 'dark' : 'light')

  theme.value = initialTheme
  document.documentElement.dataset.theme = initialTheme
  updateBackground()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  stopWatch()
})
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
    <AppHeader />

    <main :class="['flex-grow min-w-0', $route.path !== '/' && 'pt-24 sm:pt-[7rem]']">
      <div class="container mx-auto px-4">
        <AppBreadcrumbs v-if="$route.path !== '/'" />
      </div>
      <slot />
    </main>

    <AppFooter />

    <!-- Ambient Glow Backgrounds -->
    <div class="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[500px] lg:h-[500px] bg-primary/20 rounded-full blur-[60px] sm:blur-[100px] lg:blur-[120px] pointer-events-none -z-10 animate-pulse"/>
    <div class="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-secondary/10 rounded-full blur-[80px] sm:blur-[120px] lg:blur-[150px] pointer-events-none -z-10"/>
  </div>
</template>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity 0.5s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>
