<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(p => p)
  const crumbs = [{ name: 'Главная', to: '/' }]

  let currentPath = ''
  segments.forEach((segment) => {
    currentPath += `/${segment}`
    // Basic mapping for human-readable names
    let name = segment.charAt(0).toUpperCase() + segment.slice(1)
    if (segment === 'products') name = 'Каталог'
    if (segment === 'services') name = 'Услуги'
    if (segment === 'brands') name = 'Бренды'
    if (segment === 'delivery') name = 'Доставка'
    if (segment === 'contacts') name = 'Контакты'
    if (segment === 'cart') name = 'Корзина'
    if (segment === 'favorites') name = 'Избранное'
    if (segment === 'compare') name = 'Сравнение'
    if (segment === 'profile') name = 'Профиль'

    crumbs.push({ name, to: currentPath })
  })

  return crumbs
})

const classes = {
  nav: 'py-4',
  list: 'flex items-center gap-2 text-xs font-medium text-white/50',
  item: 'flex items-center gap-2',
  link: [
    'hover:text-white',
    'transition-colors',
    'focus:outline-none',
    'focus:text-white',
  ],
  currentPage: 'text-secondary font-bold',
  separator: 'w-3 h-3 text-white/20',
}
</script>

<template>
  <nav :class="classes.nav" aria-label="Хлебные крошки">
    <ol :class="classes.list">
      <li v-for="(crumb, index) in breadcrumbs" :key="crumb.to" :class="classes.item">
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.to"
          :class="classes.link"
        >
          {{ crumb.name }}
        </NuxtLink>
        <span v-else :class="classes.currentPage">{{ crumb.name }}</span>
        
        <svg
          v-if="index < breadcrumbs.length - 1"
          :class="classes.separator"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </li>
    </ol>
  </nav>
</template>
