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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AppCard
          v-for="brand in brands"
          :key="brand.id"
          class="flex flex-col gap-6"
          variant="low"
        >
          <div class="text-5xl mb-4">{{ brand.logo }}</div>
          <h3 class="text-2xl font-heading font-bold text-white/90">{{ brand.name }}</h3>
          <p class="text-white/60 leading-relaxed flex-grow">{{ brand.description }}</p>
        </AppCard>
      </div>

      <!-- Trust Indicator -->
      <div class="mt-32 p-12 lg:p-24 bg-surface-container-high/20 rounded-3xl border border-white/5 text-center">
        <h2 class="text-3xl font-heading font-bold mb-8 italic">«Мы выбираем только лучшее для создания безупречного пространства»</h2>
        <p class="text-white/40 uppercase tracking-widest text-sm font-bold">— Наша философия</p>
      </div>
    </div>
  </div>
</template>
