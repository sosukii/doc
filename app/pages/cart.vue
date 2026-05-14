<template>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:py-10 xl:px-8">
    <h1 class="mt-6 text-3xl font-heading font-bold sm:mt-8 sm:text-4xl">Корзина</h1>

    <div v-if="cartStore.items.length === 0" class="mt-12 text-center">
      <div class="mx-auto max-w-md">
        <svg class="mx-auto h-24 w-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 class="mt-4 text-2xl font-heading font-bold text-white/60">Корзина пуста</h2>
        <p class="mt-2 text-white/40">Добавьте товары для оформления заказа</p>
        <AppButton variant="primary" to="/products" class="mt-6">
          Перейти в каталог
        </AppButton>
      </div>
    </div>

    <div v-else class="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="lg:col-span-2">
        <div class="space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.product._id"
            class="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:p-4"
          >
            <div class="h-28 w-full overflow-hidden rounded-xl bg-white/5 sm:h-24 sm:w-24">
              <NuxtImg
                :src="item.product.images?.[0] || '/placeholder.jpg'"
                :alt="item.product.title"
                width="100"
                height="100"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <h3 class="font-heading font-bold">{{ item.product.title }}</h3>
              <p class="mt-1 text-sm text-white/60">{{ item.product.description }}</p>
              <div class="mt-3 grid gap-3 sm:flex sm:items-center sm:justify-between">
                <span class="font-bold text-primary">{{ formatPrice(item.product.price) }}</span>
                <div class="flex items-center gap-2">
                  <button
                    class="h-9 w-9 rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                    @click="cartStore.decreaseQuantity(item.product._id)"
                  >
                    −
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button
                    class="h-9 w-9 rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                    @click="cartStore.increaseQuantity(item.product._id)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              class="justify-self-end text-red-400 transition-colors hover:text-red-300 sm:self-start"
              @click="cartStore.removeFromCart(item.product._id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 lg:sticky lg:top-28 lg:self-start">
        <h2 class="text-xl font-heading font-bold">Итого</h2>
        <div class="mt-6 space-y-2">
          <div class="flex justify-between text-white/60">
            <span>Товаров:</span>
            <span>{{ cartStore.totalItems }}</span>
          </div>
          <div class="flex justify-between text-white/60">
            <span>Стоимость:</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div class="border-t border-white/10 pt-4 flex justify-between font-bold">
            <span>Всего:</span>
            <span class="text-primary">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
        </div>
        <AppButton variant="primary" class="mt-6 w-full">
          Оформить заказ
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/price'

const cartStore = useCartStore()

useHead({
  title: 'Корзина - AVENT'
})
</script>
