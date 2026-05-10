<script setup lang="ts">
import { computed } from 'vue'
import AppButton from './ui/AppButton.vue'
import { useCatalogNavigationWarmup } from '~/composables/useCatalogNavigationWarmup'

const isMenuOpen = ref(false)
const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value
const { warmCatalogListing } = useCatalogNavigationWarmup()

const theme = useState<'dark' | 'light'>('theme-mode', () => 'dark')
const isDark = computed(() => theme.value === 'dark')

const toggleTheme = () => {
  theme.value = isDark.value ? 'light' : 'dark'
}

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
    'top-4',
    'left-4',
    'right-4',
    'z-50',
    'transition-all',
    'rounded-[32px]',
    'shadow-[0_12px_80px_rgba(0,0,0,0.16)]',
  ],
  inner: [
    'glass-panel',
    'mx-auto',
    'flex',
    'h-20',
    'items-center',
    'justify-between',
    'gap-4',
    'px-4',
    'sm:px-6',
  ],
  logo: [
    'flex',
    'items-center',
    'gap-3',
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
  desktopActions: 'hidden lg:flex items-center gap-4',
  phone: 'text-sm font-medium text-white/70 hover:text-white transition-colors',
  themeButton: [
    'theme-toggle',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-secondary/40',
  ],
  mobileMenu: [
    'lg:hidden',
    'text-white',
    'p-2',
    'focus:outline-none',
  ],
  mobileMenuPanel: [
    'lg:hidden',
    'absolute',
    'top-24',
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
  mobilePhone: 'text-lg font-medium text-white/80',
}
</script>

<template>
  <header :class="classes.header">
    <div :class="classes.inner">
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
        <button
          type="button"
          :class="classes.themeButton"
          @click="toggleTheme"
          :aria-label="`Переключить тему на ${isDark ? 'светлую' : 'тёмную'}`"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
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
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              :class="classes.themeButton"
              @click="toggleTheme"
              :aria-label="`Переключить тему на ${isDark ? 'светлую' : 'тёмную'}`"
            >
              <span v-if="isDark">☀️</span>
              <span v-else>🌙</span>
            </button>
            <a href="tel:+74950000000" :class="classes.mobilePhone">+7 (495) 000-00-00</a>
          </div>
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
