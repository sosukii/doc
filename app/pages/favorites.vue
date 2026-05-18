<template>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:py-10 xl:px-8">
    <h1 class="sr-only">Избранное</h1>

    <div v-if="favoritesStore.items.length === 0" class="mt-12 text-center">
      <div class="mx-auto max-w-md">
        <svg class="mx-auto h-24 w-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 class="mt-4 text-2xl font-heading font-bold text-white/60">Избранное пусто</h2>
        <p class="mt-2 text-white/40">Добавьте товары в избранное</p>
        <AppButton variant="primary" to="/products" class="mt-6">
          Перейти в каталог
        </AppButton>
      </div>
    </div>

    <div v-else class="mt-8 sm:mt-12">
      <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <div
          v-for="product in favoritesStore.items"
          :key="product._id"
          class="group relative min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-white/5 transition-all hover:bg-white/10"
        >
          <div class="aspect-square overflow-hidden bg-white/5">
            <NuxtImg
              :src="product.images?.[0] || '/placeholder.jpg'"
              :alt="product.title"
              width="300"
              height="300"
              sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
              class="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
            <button
              class="absolute left-4 top-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              @click="favoritesStore.toggleFavorite(product)"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div class="p-4 sm:p-5">
            <div class="flex gap-2 text-xs text-white/60">
              <span>{{ product.category }}</span>
              <span v-if="product.brand">{{ product.brand }}</span>
            </div>
            <h2 class="line-clamp-1 text-lg font-heading font-bold transition-colors group-hover:text-primary">
              {{ product.title }}
            </h2>
            <p class="mt-2 text-sm font-bold text-primary">{{ formatPrice(product.price) }}</p>
            <AppButton variant="primary" :to="`/products/${product.slug}`" class="mt-4 w-full">
              Подробнее
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import { useFavoritesStore } from '~/stores/favorites'
import { formatPrice } from '~/utils/price'

const favoritesStore = useFavoritesStore()

useHead({
  title: 'Избранное - AVENT'
})
</script>
