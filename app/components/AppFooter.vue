<script setup lang="ts">
import { useCatalogNavigationWarmup } from '~/composables/useCatalogNavigationWarmup'

const { warmCatalogListing } = useCatalogNavigationWarmup()

const classes = {
  footer: [
    'bg-surface-container-lowest',
    'py-12',
    'lg:py-20',
    'border-t',
    'border-white/5',
  ],
  container: 'container mx-auto grid grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:px-8',
  section: 'flex flex-col gap-6',
  logo: [
    'flex',
    'items-center',
    'gap-2',
    'group',
  ],
  logoText: [
    'text-3xl',
    'font-heading',
    'font-bold',
    'gradient-text',
    'group-hover:scale-105',
    'transition-transform',
  ],
  description: 'text-white/60 text-sm leading-relaxed max-w-xs',
  sectionTitle: 'text-lg font-heading font-semibold text-white/90',
  nav: 'flex flex-col gap-3',
  navLink: [
    'text-sm',
    'text-white/60',
    'hover:text-secondary',
    'transition-colors',
  ],
  contactsText: 'flex flex-col gap-3 text-sm text-white/60',
  contactLink: [
    'hover:text-secondary',
    'transition-colors',
  ],
  bottomContainer: [
    'container',
    'mx-auto',
    'px-4',
    'sm:px-6',
    'xl:px-8',
    'pt-12',
    'mt-12',
    'border-t',
    'border-white/5',
    'flex',
    'flex-col',
    'sm:flex-row',
    'justify-between',
    'items-center',
    'gap-4',
    'text-xs',
    'text-white/40',
  ],
  socialLinks: 'flex gap-6',
  socialLink: 'hover:text-white transition-colors',
}
</script>

<template>
  <footer :class="classes.footer">
    <div :class="classes.container">
      <div :class="classes.section">
        <NuxtLink to="/" prefetch-on="interaction" :class="classes.logo">
          <span :class="classes.logoText">AVENT</span>
        </NuxtLink>
        <p :class="classes.description">
          Компания Avent — ваш партнер в создании уникальных атмосферных решений. Мы объединяем современные технологии и исключительный дизайн.
        </p>
      </div>

      <div :class="classes.section">
        <h3 :class="classes.sectionTitle">Навигация</h3>
        <nav :class="classes.nav">
          <NuxtLink
            to="/products"
            prefetch-on="interaction"
            :class="classes.navLink"
            @pointerenter="warmCatalogListing"
            @focus="warmCatalogListing"
            @mousedown="warmCatalogListing"
          >
            Каталог
          </NuxtLink>
          <NuxtLink to="/services" prefetch-on="interaction" :class="classes.navLink">Услуги</NuxtLink>
          <NuxtLink to="/brands" prefetch-on="interaction" :class="classes.navLink">Бренды</NuxtLink>
          <NuxtLink to="/delivery" prefetch-on="interaction" :class="classes.navLink">Доставка</NuxtLink>
        </nav>
      </div>

      <div :class="classes.section">
        <h3 :class="classes.sectionTitle">Информация</h3>
        <nav :class="classes.nav">
          <NuxtLink to="/contacts" prefetch-on="interaction" :class="classes.navLink">Контакты</NuxtLink>
          <NuxtLink to="/privacy" prefetch-on="interaction" :class="classes.navLink">Политика конфиденциальности</NuxtLink>
          <NuxtLink to="/terms" prefetch-on="interaction" :class="classes.navLink">Условия использования</NuxtLink>
        </nav>
      </div>

      <div :class="classes.section">
        <h3 :class="classes.sectionTitle">Контакты</h3>
        <div :class="classes.contactsText">
          <p>Москва, ул. Примерная, 123</p>
          <a href="tel:+74950000000" :class="classes.contactLink">+7 (495) 000-00-00</a>
          <a href="mailto:info@aventcompany.ru" :class="classes.contactLink">info@aventcompany.ru</a>
        </div>
      </div>
    </div>

    <div :class="classes.bottomContainer">
      <p>&copy; {{ new Date().getFullYear() }} Avent. Все права защищены.</p>
      <div :class="classes.socialLinks">
        <a href="#" :class="classes.socialLink">VK</a>
        <a href="#" :class="classes.socialLink">Telegram</a>
        <a href="#" :class="classes.socialLink">YouTube</a>
      </div>
    </div>
  </footer>
</template>
