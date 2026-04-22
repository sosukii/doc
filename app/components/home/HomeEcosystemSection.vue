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
</script>

<template>
  <section class="bg-surface-container-low/20 py-24">
    <div class="container mx-auto px-4">
      <div class="mb-16 text-center">
        <h2 class="mb-6 text-4xl font-heading font-bold lg:text-5xl">Экосистема Avent</h2>
        <p class="mx-auto max-w-2xl text-white/60">
          Наши решения бесшовно интегрируются в вашу жизнь, создавая единое интеллектуальное пространство.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AppCard
          v-for="(item, index) in items"
          :key="item.title"
          class="group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden"
          :variant="index % 2 === 0 ? 'low' : 'medium'"
        >
          <NuxtImg
            :src="item.image"
            :alt="item.title"
            width="800"
            height="800"
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 44vw, 92vw"
            class="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity duration-500 group-hover:opacity-40"
            loading="lazy"
            fetchpriority="low"
          />
          <div class="relative z-10">
            <span class="mb-4 block text-4xl">{{ item.icon }}</span>
            <h3 class="mb-2 text-xl font-heading font-bold transition-colors group-hover:text-secondary">{{ item.title }}</h3>
            <p class="text-sm text-white/60">{{ item.description }}</p>
          </div>
        </AppCard>
      </div>
    </div>
  </section>
</template>
