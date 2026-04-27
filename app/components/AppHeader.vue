<script setup lang="ts">
import AppButton from './ui/AppButton.vue'
import { useCatalogNavigationWarmup } from '~/composables/useCatalogNavigationWarmup'

const isMenuOpen = ref(false)
const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value
const { warmCatalogListing } = useCatalogNavigationWarmup()

const navLinks = [
  { name: 'Каталог', to: '/products' },
  { name: 'Услуги', to: '/services' },
  { name: 'Бренды', to: '/brands' },
  { name: 'Доставка', to: '/delivery' },
  { name: 'Контакты', to: '/contacts' }
]
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all bg-background/30 backdrop-blur-md border-b border-white/5">
    <div class="container mx-auto px-4 h-20 flex items-center justify-between">
      <NuxtLink to="/" prefetch-on="interaction" class="flex items-center gap-2 group focus:outline-none">
        <span class="text-2xl font-heading font-bold gradient-text group-hover:scale-105 transition-transform">AVENT</span>
      </NuxtLink>

      <nav class="hidden lg:flex items-center gap-8">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          prefetch-on="interaction"
          class="text-sm font-medium text-white/70 hover:text-white transition-colors focus:outline-none focus:text-white"
          @pointerenter="link.to === '/products' ? warmCatalogListing() : undefined"
          @focus="link.to === '/products' ? warmCatalogListing() : undefined"
          @mousedown="link.to === '/products' ? warmCatalogListing() : undefined"
        >
          {{ link.name }}
        </NuxtLink>
      </nav>

      <div class="hidden lg:flex items-center gap-6">
        <a href="tel:+74950000000" class="text-sm font-medium hover:text-secondary transition-colors">+7 (495) 000-00-00</a>
        <AppButton variant="primary">Заказать звонок</AppButton>
      </div>

      <button
        class="lg:hidden text-white p-2 focus:outline-none"
        aria-label="Toggle navigation menu"
        @click="toggleMenu"
      >
        <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="lg:hidden absolute top-20 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-white/10 p-4">
        <nav class="flex flex-col gap-4 mb-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            prefetch-on="interaction"
            class="text-lg font-medium text-white/70 py-2 border-b border-white/5"
            @pointerenter="link.to === '/products' ? warmCatalogListing() : undefined"
            @focus="link.to === '/products' ? warmCatalogListing() : undefined"
            @mousedown="link.to === '/products' ? warmCatalogListing() : undefined"
            @click="isMenuOpen = false"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>
        <div class="flex flex-col gap-4">
          <a href="tel:+74950000000" class="text-lg font-medium">+7 (495) 000-00-00</a>
          <AppButton variant="primary">Заказать звонок</AppButton>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
