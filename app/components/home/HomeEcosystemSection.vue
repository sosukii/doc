<script setup lang="ts">
import AppCard from '~/components/ui/AppCard.vue'

interface EcosystemItem {
  title: string
  description: string
  icon: string
  image: string
}

defineProps<{
  items: EcosystemItem[]
}>()

const classes = {
  section: 'bg-surface-container-low/20 py-24',
  container: 'container mx-auto px-4',
  header: 'mb-16 text-center',
  title: 'mb-6 text-4xl font-heading font-bold lg:text-5xl',
  subtitle: 'mx-auto max-w-2xl text-white/60',
  grid: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 min-w-0',
  card: [
    'group',
    'relative',
    'flex',
    'h-full',
    'min-h-[250px]',
    'sm:min-h-[300px]',
    'flex-col',
    'justify-end',
    'overflow-hidden',
  ],
  image: [
    'absolute',
    'inset-0',
    'h-full',
    'w-full',
    'object-cover',
    'opacity-20',
    'transition-opacity',
    'duration-500',
    'group-hover:opacity-40',
  ],
  content: 'relative z-10',
  icon: 'mb-4 block text-4xl',
  itemTitle: [
    'mb-2',
    'text-xl',
    'font-heading',
    'font-bold',
    'transition-colors',
    'group-hover:text-secondary',
  ],
  itemDescription: 'text-sm text-white/60',
}
</script>

<template>
  <section :class="classes.section">
    <div :class="classes.container">
      <div :class="classes.header">
        <h2 :class="classes.title">Экосистема Avent</h2>
        <p :class="classes.subtitle">
          Наши решения бесшовно интегрируются в вашу жизнь, создавая единое интеллектуальное пространство.
        </p>
      </div>

      <div :class="classes.grid">
        <AppCard
          v-for="(item, index) in items"
          :key="item.title"
          :class="classes.card"
          :variant="index % 2 === 0 ? 'low' : 'medium'"
        >
          <NuxtImg
            :src="item.image"
            :alt="item.title"
            width="800"
            height="800"
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 44vw, 92vw"
            :class="classes.image"
            loading="lazy"
            fetchpriority="low"
          />
          <div :class="classes.content">
            <span :class="classes.icon">{{ item.icon }}</span>
            <h3 :class="classes.itemTitle">{{ item.title }}</h3>
            <p :class="classes.itemDescription">{{ item.description }}</p>
          </div>
        </AppCard>
      </div>
    </div>
  </section>
</template>
