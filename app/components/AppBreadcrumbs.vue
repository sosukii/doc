<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(p => p)
  const crumbs = [{ name: 'Главная', to: '/' }]

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    // Basic mapping for human-readable names
    let name = segment.charAt(0).toUpperCase() + segment.slice(1)
    if (segment === 'products') name = 'Каталог'
    if (segment === 'services') name = 'Услуги'
    if (segment === 'brands') name = 'Бренды'
    if (segment === 'delivery') name = 'Доставка'
    if (segment === 'contacts') name = 'Контакты'

    crumbs.push({ name, to: currentPath })
  })

  return crumbs
})
</script>

<template>
  <nav aria-label="Breadcrumb" class="py-4">
    <ol class="flex items-center gap-2 text-xs font-medium text-white/50">
      <li v-for="(crumb, index) in breadcrumbs" :key="crumb.to" class="flex items-center gap-2">
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.to"
          class="hover:text-white transition-colors focus:outline-none focus:text-white"
        >
          {{ crumb.name }}
        </NuxtLink>
        <span v-else class="text-secondary font-bold">{{ crumb.name }}</span>
        
        <svg
          v-if="index < breadcrumbs.length - 1"
          class="w-3 h-3 text-white/20"
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
