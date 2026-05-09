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

const classes = {
  header: [
    'fixed',
    'top-0',
    'left-0',
    'right-0',
    'z-50',
    'transition-all',
    'bg-background/30',
    'backdrop-blur-md',
    'border-b',
    'border-white/5',
  ],
  container: 'container mx-auto px-4 h-20 flex items-center justify-between',
  logo: [
    'flex',
    'items-center',
    'gap-2',
    'group',
    'focus:outline-none',
  ],
  logoText: [
    'text-2xl',
    'font-heading',
    'font-bold',
    'gradient-text',
    'group-hover:scale-105',
    'transition-transform',
  ],
  nav: 'hidden lg:flex items-center gap-8',
  navLink: [
    'text-sm',
    'font-medium',
    'text-white/70',
    'hover:text-white',
    'transition-colors',
    'focus:outline-none',
    'focus:text-white',
  ],
  desktopActions: 'hidden lg:flex items-center gap-6',
  phone: 'text-sm font-medium hover:text-secondary transition-colors',
  mobileMenu: [
    'lg:hidden',
    'text-white',
    'p-2',
    'focus:outline-none',
  ],
  mobileMenuPanel: [
    'lg:hidden',
    'absolute',
    'top-20',
    'left-0',
    'right-0',
    'bg-background/95',
    'backdrop-blur-lg',
    'border-b',
    'border-white/10',
    'p-4',
  ],
  mobileNav: 'flex flex-col gap-4 mb-6',
  mobileNavLink: [
    'text-lg',
    'font-medium',
    'text-white/70',
    'py-2',
    'border-b',
    'border-white/5',
  ],
  mobileActions: 'flex flex-col gap-4',
  mobilePhone: 'text-lg font-medium',
}
</script>

<template>
  <header :class="classes.header">
    <div :class="classes.container">
      <NuxtLink to="/" prefetch-on="interaction" :class="classes.logo">
        <span :class="classes.logoText">AVENT</span>
      </NuxtLink>

      <nav :class="classes.nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          prefetch-on="interaction"
          :class="classes.navLink"
          @pointerenter="link.to === '/products' ? warmCatalogListing() : undefined"
          @focus="link.to === '/products' ? warmCatalogListing() : undefined"
          @mousedown="link.to === '/products' ? warmCatalogListing() : undefined"
        >
          {{ link.name }}
        </NuxtLink>
      </nav>

      <div :class="classes.desktopActions">
        <a href="tel:+74950000000" :class="classes.phone">+7 (495) 000-00-00</a>
        <AppButton variant="primary">Заказать звонок</AppButton>
      </div>

      <button
        :class="classes.mobileMenu"
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
      <div v-if="isMenuOpen" :class="classes.mobileMenuPanel">
        <nav :class="classes.mobileNav">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            prefetch-on="interaction"
            :class="classes.mobileNavLink"
            @pointerenter="link.to === '/products' ? warmCatalogListing() : undefined"
            @focus="link.to === '/products' ? warmCatalogListing() : undefined"
            @mousedown="link.to === '/products' ? warmCatalogListing() : undefined"
            @click="isMenuOpen = false"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>
        <div :class="classes.mobileActions">
          <a href="tel:+74950000000" :class="classes.mobilePhone">+7 (495) 000-00-00</a>
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
