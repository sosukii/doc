<template>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:py-10 xl:px-8">
    <h1 class="mt-6 text-3xl font-heading font-bold sm:mt-8 sm:text-4xl">Сравнение товаров</h1>

    <div v-if="compareStore.items.length === 0" class="mt-12 text-center">
      <div class="mx-auto max-w-md">
        <svg class="mx-auto h-24 w-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 class="mt-4 text-2xl font-heading font-bold text-white/60">Нет товаров для сравнения</h2>
        <p class="mt-2 text-white/40">Добавьте товары для сравнения характеристик</p>
        <AppButton variant="primary" to="/products" class="mt-6">
          Перейти в каталог
        </AppButton>
      </div>
    </div>

    <div v-else class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:mt-12">
      <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] border-collapse md:min-w-[800px]">
        <thead>
          <tr class="border-b border-white/10">
            <th class="p-4 text-left text-sm font-medium text-white/60">Характеристика</th>
            <th
              v-for="product in compareStore.items"
              :key="product._id"
              class="p-4 text-center min-w-[200px]"
            >
              <div class="space-y-4">
                <NuxtImg
                  :src="product.images?.[0] || '/placeholder.jpg'"
                  :alt="product.title"
                  width="150"
                  height="150"
                  class="mx-auto h-28 w-28 rounded-lg object-cover sm:h-32 sm:w-32"
                />
                <h3 class="text-sm font-bold">{{ product.title }}</h3>
                <button
                  aria-label="Убрать из сравнения"
                  class="text-red-400 hover:text-red-300 transition-colors"
                  @click="compareStore.removeFromCompare(product._id)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Название</td>
            <td v-for="product in compareStore.items" :key="`title-${product._id}`" class="p-4 text-center">
              {{ product.title }}
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Цена</td>
            <td v-for="product in compareStore.items" :key="`price-${product._id}`" class="p-4 text-center font-bold">
              {{ formatPrice(product.price) }}
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Бренд</td>
            <td v-for="product in compareStore.items" :key="`brand-${product._id}`" class="p-4 text-center">
              {{ product.brand || '—' }}
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Категория</td>
            <td v-for="product in compareStore.items" :key="`category-${product._id}`" class="p-4 text-center">
              {{ product.category }}
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Артикул</td>
            <td v-for="product in compareStore.items" :key="`article-${product._id}`" class="p-4 text-center">
              {{ product._id }}
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Наличие</td>
            <td v-for="product in compareStore.items" :key="`availability-${product._id}`" class="p-4 text-center">
              <span :class="product.availabilityStatus === 'В наличии' ? 'text-green-400' : 'text-orange-400'">
                {{ product.availabilityStatus || 'Под заказ' }}
              </span>
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Гарантия</td>
            <td v-for="product in compareStore.items" :key="`warranty-${product._id}`" class="p-4 text-center">
              {{ product.warrantyInformation || 'По запросу' }}
            </td>
          </tr>
          <tr class="border-b border-white/5">
            <td class="p-4 font-medium text-white/80">Доставка</td>
            <td v-for="product in compareStore.items" :key="`shipping-${product._id}`" class="p-4 text-center">
              {{ product.shippingInformation || 'Уточняется' }}
            </td>
          </tr>
          <tr>
            <td class="p-4 font-medium text-white/80">Действия</td>
            <td v-for="product in compareStore.items" :key="`actions-${product._id}`" class="p-4 text-center">
              <div class="flex flex-col gap-2">
                <AppButton variant="primary" :to="`/products/${product.slug}`" size="sm">
                  Подробнее
                </AppButton>
                <AppButton
                  size="sm"
                  variant="secondary"
                  @click="cartStore.addToCart(product)"
                >
                  В корзину
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import { useCompareStore } from '~/stores/compare'
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/price'

const compareStore = useCompareStore()
const cartStore = useCartStore()

// Set page meta
useHead({
  title: 'Сравнение - AVENT'
})
</script>
