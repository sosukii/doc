<script setup lang="ts">
import AppCard from '~/components/ui/AppCard.vue'

const brands = useBrands()

useSeoMeta({
  title: 'Бренды - Avent',
  description: 'Мы работаем с лучшими мировыми брендами интеллектуальных систем и аксессуаров.'
})
</script>

<template>
  <div class="py-12 lg:py-20">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mb-16">
        <h1 class="text-4xl lg:text-6xl font-heading font-bold mb-6">Бренды</h1>
        <p class="text-xl text-white/60 leading-relaxed">
          Компания Avent сотрудничает с лидерами рынка интеллектуальных систем для обеспечения максимальной надежности и комфорта наших клиентов.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <component
          :is="brand.slug ? 'NuxtLink' : 'div'"
          v-for="brand in brands"
          :key="brand.id"
          :to="brand.slug ? `/products?brand=${brand.slug}` : undefined"
          class="block"
        >
          <AppCard
            class="flex h-full flex-col gap-6"
            variant="low"
          >
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl font-heading font-bold text-white/90">
              {{ brand.logo }}
            </div>
            <h2 class="text-2xl font-heading font-bold text-white/90">{{ brand.name }}</h2>
            <p class="flex-grow leading-relaxed text-white/60">{{ brand.description }}</p>
            <p v-if="brand.slug" class="text-sm font-medium text-secondary">
              Открыть товары бренда
            </p>
          </AppCard>
        </component>
      </div>

      <!-- Trust Indicator -->
      <div class="mt-32 p-12 lg:p-24 bg-surface-container-high/20 rounded-3xl border border-white/5 text-center">
        <h2 class="text-3xl font-heading font-bold mb-8 italic">«Мы выбираем только лучшее для создания безупречного пространства»</h2>
        <p class="text-white/40 uppercase tracking-widest text-sm font-bold">— Наша философия</p>
      </div>
    </div>
  </div>
</template>
