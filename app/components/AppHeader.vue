<script setup lang="ts">
import { computed } from 'vue'
import AppButton from './ui/AppButton.vue'
import { useCatalogNavigationWarmup } from '~/composables/useCatalogNavigationWarmup'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useCompareStore } from '~/stores/compare'

const isMenuOpen = ref(false)
const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value
const { warmCatalogListing } = useCatalogNavigationWarmup()

const theme = useState<'dark' | 'light'>('theme-mode', () => 'dark')
const isDark = computed(() => theme.value === 'dark')

const toggleTheme = () => {
  theme.value = isDark.value ? 'light' : 'dark'
}

const cartStore = useCartStore()
const _favoritesStore = useFavoritesStore()
const _compareStore = useCompareStore()

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
    'top-3',
    'left-3',
    'right-3',
    'z-50',
    'transition-all',
    'rounded-[24px]',
    'shadow-[0_12px_80px_rgba(0,0,0,0.16)]',
    'sm:top-4',
    'sm:left-4',
    'sm:right-4',
    'sm:rounded-[32px]',
  ],
  inner: [
    'glass-panel',
    'mx-auto',
    'flex',
    'min-h-16',
    'items-center',
    'justify-between',
    'gap-4',
    'px-3',
    'py-3',
    'sm:px-6',
    'xl:h-20',
    'xl:py-0',
  ],
  logo: [
    'flex',
    'items-center',
    'gap-3',
    'group',
    'focus:outline-none',
  ],
  logoText: [
    'whitespace-nowrap',
    'text-xl',
    'font-heading',
    'font-bold',
    'gradient-text',
    'group-hover:scale-105',
    'transition-transform',
    'sm:text-2xl',
  ],
  nav: 'hidden xl:flex items-center gap-6 2xl:gap-8',
  navLink: [
    'whitespace-nowrap',
    'text-sm',
    'font-medium',
    'text-white/70',
    'hover:text-white',
    'transition-colors',
    'focus:outline-none',
    'focus:text-white',
  ],
  desktopActions: 'hidden xl:flex items-center gap-2 2xl:gap-4',
  compactActions: 'ml-auto hidden items-center gap-1 sm:flex xl:hidden',
  phone: 'whitespace-nowrap text-sm font-medium text-white/70 hover:text-white transition-colors',
  themeButton: [
    'theme-toggle',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-secondary/40',
  ],
  mobileMenu: [
    'xl:hidden',
    'text-white',
    'inline-flex',
    'h-11',
    'w-11',
    'items-center',
    'justify-center',
    'rounded-xl',
    'p-2',
    'transition-colors',
    'hover:bg-white/10',
    'focus:outline-none',
  ],
  mobileMenuPanel: [
    'xl:hidden',
    'absolute',
    'top-[calc(100%+0.75rem)]',
    'left-0',
    'right-0',
    'max-h-[calc(100vh-7rem)]',
    'overflow-y-auto',
    'rounded-[24px]',
    'bg-background/95',
    'backdrop-blur-xl',
    'border',
    'border-white/10',
    'p-4',
    'shadow-[0_24px_80px_rgba(0,0,0,0.24)]',
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
  mobilePhone: 'min-w-0 text-sm font-medium text-white/80 sm:text-base',
  iconButton: [
    'relative',
    'inline-flex',
    'h-11',
    'w-11',
    'shrink-0',
    'items-center',
    'justify-center',
    'p-2',
    'text-white/70',
    'hover:text-white',
    'hover:bg-white/10',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-secondary/40',
    'rounded-lg'
  ],
  badge: [
    'absolute',
    'top-0',
    'right-0',
    'bg-red-500',
    'text-white',
    'text-xs',
    'font-bold',
    'rounded-full',
    'w-5',
    'h-5',
    'flex',
    'items-center',
    'justify-center',
    'transform',
    'translate-x-1/2',
    '-translate-y-1/2'
  ]
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
        <NuxtLink to="/favorites" :class="classes.iconButton" aria-label="Избранное">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </NuxtLink>
        <NuxtLink to="/compare" :class="classes.iconButton" aria-label="Сравнение">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </NuxtLink>
        <NuxtLink to="/cart" :class="classes.iconButton" aria-label="Корзина">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5" />
          </svg>
          <span v-if="cartStore.totalItems > 0" :class="classes.badge">
            {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
          </span>
        </NuxtLink>
        <NuxtLink to="/profile" :class="classes.iconButton" aria-label="Профиль">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </NuxtLink>
        <button
          :aria-label="`Переключить тему на ${isDark ? 'светлую' : 'тёмную'}`"
          type="button"
          :class="classes.themeButton"
          @click="toggleTheme"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
        <a href="tel:+74950000000" :class="classes.phone">+7 (495) 000-00-00</a>
        <AppButton variant="primary" class="shrink-0 whitespace-nowrap">Заказать звонок</AppButton>
      </div>

      <div :class="classes.compactActions" aria-label="Быстрые действия">
        <NuxtLink to="/favorites" :class="classes.iconButton" aria-label="Избранное">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </NuxtLink>
        <NuxtLink to="/compare" :class="classes.iconButton" aria-label="Сравнение">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </NuxtLink>
        <NuxtLink to="/cart" :class="classes.iconButton" aria-label="Корзина">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5" />
          </svg>
          <span v-if="cartStore.totalItems > 0" :class="classes.badge">
            {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
          </span>
        </NuxtLink>
        <NuxtLink to="/profile" :class="classes.iconButton" aria-label="Профиль">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </NuxtLink>
        <button
          :aria-label="`Переключить тему на ${isDark ? 'светлую' : 'тёмную'}`"
          type="button"
          :class="classes.themeButton"
          @click="toggleTheme"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
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
          <div class="grid grid-cols-5 items-center gap-3 sm:grid-cols-[repeat(5,minmax(2.75rem,1fr))_auto]">
            <NuxtLink to="/favorites" :class="classes.iconButton" aria-label="Избранное">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </NuxtLink>
            <NuxtLink to="/compare" :class="classes.iconButton" aria-label="Сравнение">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </NuxtLink>
            <NuxtLink to="/cart" :class="classes.iconButton" aria-label="Корзина">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5" />
              </svg>
              <span v-if="cartStore.totalItems > 0" :class="classes.badge">
                {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
              </span>
            </NuxtLink>
            <NuxtLink to="/profile" :class="classes.iconButton" aria-label="Профиль">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </NuxtLink>
            <button
              :aria-label="`Переключить тему на ${isDark ? 'светлую' : 'тёмную'}`"
              type="button"
              :class="classes.themeButton"
              @click="toggleTheme"
            >
              <span v-if="isDark">☀️</span>
              <span v-else>🌙</span>
            </button>
            <a href="tel:+74950000000" :class="['col-span-5 mt-1 text-center sm:col-span-1 sm:mt-0 sm:text-right', classes.mobilePhone]">+7 (495) 000-00-00</a>
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
