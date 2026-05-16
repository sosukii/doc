<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useCompareStore } from '~/stores/compare'
import { formatPrice } from '~/utils/price'
import type { Product } from '~/composables/useCatalog'

const props = defineProps<{
  product: Product
  imageSrc: string
  categoryLabel: string
  brandLabel?: string
  imageLoaded: boolean
  eager: boolean
}>()

const emit = defineEmits<{
  imageLoad: [src: string]
}>()

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const compareStore = useCompareStore()

const isFavorite = computed(() => favoritesStore.isFavorite(props.product._id))
const isCompared = computed(() => compareStore.isInCompare(props.product._id))
const cartItem = computed(() => cartStore.items.find(item => item.product._id === props.product._id))
const isInCart = computed(() => Boolean(cartItem.value))

const toggleCart = () => {
  if (isInCart.value) {
    cartStore.removeFromCart(props.product._id)
    return
  }

  cartStore.addToCart(props.product)
}
</script>

<template>
  <article class="catalog-product-card group">
    <NuxtLink
      :to="`/products/${product.slug}`"
      class="catalog-product-card__preview"
      :aria-label="`Открыть товар ${product.title}`"
    >
      <div class="catalog-product-card__shine" aria-hidden="true" />
      <div
        class="catalog-product-card__image-placeholder"
        :class="{ 'is-loading': !imageLoaded }"
        aria-hidden="true"
      />
      <NuxtImg
        :src="imageSrc"
        :alt="product.title"
        width="600"
        height="600"
        sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
        decoding="async"
        class="catalog-product-card__image"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'low'"
        @load="emit('imageLoad', imageSrc)"
        @error="emit('imageLoad', imageSrc)"
      />
      <span class="catalog-product-card__price">{{ formatPrice(product.price) }}</span>
    </NuxtLink>

    <div class="catalog-product-card__content">
      <div>
        <p class="catalog-product-card__eyebrow">
          <span>{{ categoryLabel }}</span>
          <span v-if="brandLabel">{{ brandLabel }}</span>
        </p>
        <NuxtLink :to="`/products/${product.slug}`" class="catalog-product-card__title">
          {{ product.title }}
        </NuxtLink>
      </div>
      <p class="catalog-product-card__description">
        {{ product.description }}
      </p>
    </div>

    <div class="catalog-product-card__footer">
      <div class="catalog-product-card__actions" aria-label="Действия с товаром">
        <button
          type="button"
          :class="['catalog-action-button', 'catalog-action-button--like', { 'is-active': isFavorite }]"
          :aria-pressed="isFavorite"
          :aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
          @click="favoritesStore.toggleFavorite(product)"
        >
          <svg aria-hidden="true" class="catalog-action-button__icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <button
          type="button"
          :class="['catalog-action-button', 'catalog-action-button--compare', { 'is-active': isCompared }]"
          :aria-pressed="isCompared"
          :aria-label="isCompared ? 'Убрать из сравнения' : 'Добавить к сравнению'"
          @click="compareStore.toggleCompare(product)"
        >
          <svg aria-hidden="true" class="catalog-action-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21V9m5 12V3m5 18v-7" />
          </svg>
        </button>

        <button
          type="button"
          :class="['catalog-action-button', 'catalog-action-button--cart', { 'is-active': isInCart }]"
          :aria-pressed="isInCart"
          :aria-label="isInCart ? 'Убрать из корзины' : 'Добавить в корзину'"
          @click="toggleCart"
        >
          <svg aria-hidden="true" class="catalog-action-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h9.5l3-7H6.1M7 13l-1 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </button>
      </div>

      <AppButton variant="primary" :to="`/products/${product.slug}`" class="catalog-product-card__details">
        Подробнее
      </AppButton>
    </div>
  </article>
</template>

<style scoped>
.catalog-product-card {
  --card-like-bg: #ff5f8f;
  --card-compare-bg: #5d8dff;
  --card-cart-bg: linear-gradient(135deg, #a855f7, #ec4899);
  --card-icon-color: #ffffff;
  --card-inactive-bg: rgba(255, 255, 255, 0.74);
  --card-inactive-color: #687093;
  --card-inactive-border: rgba(152, 168, 220, 0.34);

  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  gap: 1.1rem;
  overflow: hidden;
  border: 1px solid rgba(var(--color-border-rgb), 0.18);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.28)),
    rgba(var(--color-surface-rgb), 0.48);
  box-shadow: 0 18px 44px rgba(93, 141, 255, 0.14), 0 28px 80px rgba(72, 96, 168, 0.13);
  padding: 1rem;
  backdrop-filter: blur(30px);
  transition: border-color 220ms ease, box-shadow 220ms ease;
}

[data-theme='dark'] .catalog-product-card {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04)),
    rgba(var(--color-surface-rgb), 0.62);
}

.catalog-product-card:hover {
  border-color: rgba(var(--color-primary-rgb), 0.28);
}

.catalog-product-card__preview {
  position: relative;
  display: flex;
  aspect-ratio: 1 / 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(152, 168, 220, 0.2);
  border-radius: 18px;
  background: #ffffff;
  padding: clamp(1.25rem, 5vw, 2rem);
}

.catalog-product-card__shine {
  position: absolute;
  inset: 14%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.42), transparent 72%);
  filter: blur(10px);
}

.catalog-product-card__image-placeholder {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 1;
  transition: background 220ms ease, opacity 220ms ease;
}

.catalog-product-card__image-placeholder.is-loading {
  animation: product-image-bg-pulse 1.8s ease-in-out infinite;
}

.catalog-product-card__image-placeholder {
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(235, 249, 255, 0.36)) border-box;
}

.catalog-product-card__image {
  position: absolute;
  z-index: 1;
  width: calc(100% - clamp(2.5rem, 10vw, 4rem));
  height: calc(100% - clamp(2.5rem, 10vw, 4rem));
  max-width: 19rem;
  max-height: 82%;
  object-fit: contain;
  transition: transform 450ms ease;
}

.catalog-product-card:hover .catalog-product-card__image {
  transform: scale(1.04);
}

@keyframes product-image-bg-pulse {
  0%, 100% {
    opacity: 0.86;
  }

  50% {
    opacity: 1;
  }
}

.catalog-product-card__price {
  position: absolute;
  z-index: 3;
  top: 1rem;
  right: 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 28px rgba(82, 96, 168, 0.16);
  color: #28305f;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
  padding: 0.6rem 0.8rem;
  white-space: nowrap;
  backdrop-filter: blur(16px);
}

.catalog-product-card__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.75rem;
}

.catalog-product-card__eyebrow {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.4rem 0.65rem;
  color: rgba(var(--color-text-rgb), 0.46);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1.4;
  text-transform: uppercase;
}

.catalog-product-card__title {
  display: -webkit-box;
  margin-top: 0.4rem;
  overflow: hidden;
  color: var(--color-text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.2;
  transition: color 180ms ease;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.catalog-product-card:hover .catalog-product-card__title,
.catalog-product-card__title:hover {
  color: rgba(var(--color-primary-rgb), 0.78);
}

.catalog-product-card__description {
  display: -webkit-box;
  min-height: 3.75rem;
  overflow: hidden;
  color: rgba(var(--color-text-rgb), 0.66);
  font-size: 0.9rem;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.catalog-product-card__footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.catalog-product-card__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.catalog-action-button {
  position: relative;
  display: inline-flex;
  min-width: 0;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-inactive-border);
  border-radius: 14px;
  background: var(--card-inactive-bg);
  color: var(--card-inactive-color);
  cursor: pointer;
  isolation: isolate;
  opacity: 1;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    color 180ms ease,
    border-color 180ms ease;
}

.catalog-action-button::after {
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  display: grid;
  width: 1.05rem;
  height: 1.05rem;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: #77abff;
  box-shadow: 0 8px 18px rgba(119, 171, 255, 0.28);
  color: #ffffff;
  content: '✓';
  font-size: 0.58rem;
  font-weight: 900;
  opacity: 0;
  transform: scale(0.72);
  transition: opacity 180ms ease, transform 180ms ease;
}

.catalog-action-button:hover {
  box-shadow: 0 10px 24px rgba(95, 99, 220, 0.18);
}

.catalog-action-button:active {
  transform: translateY(1px) scale(0.97);
}

.catalog-action-button.is-active {
  border-color: rgba(255, 255, 255, 0.64);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.34),
    0 12px 28px rgba(95, 99, 220, 0.2);
  color: var(--card-icon-color);
}

.catalog-action-button.is-active::after {
  opacity: 1;
  transform: scale(1);
}

.catalog-action-button--like.is-active {
  background: var(--card-like-bg);
}

.catalog-action-button--compare.is-active {
  background: var(--card-compare-bg);
}

.catalog-action-button--cart.is-active {
  background: var(--card-cart-bg);
}

.catalog-action-button__icon {
  width: 1.25rem;
  height: 1.25rem;
}

.catalog-action-button:focus-visible {
  outline: 3px solid rgba(126, 104, 255, 0.35);
  outline-offset: 3px;
}

.catalog-product-card__details {
  width: 100%;
  transition: background 220ms ease, box-shadow 220ms ease, color 220ms ease, transform 220ms ease;
}

.catalog-product-card:hover .catalog-product-card__details {
  background: linear-gradient(135deg, #5d45ff, #8d7dff);
  box-shadow:
    0 18px 44px rgba(var(--color-primary-rgb), 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.24) inset;
}

.catalog-product-card__details:hover {
  transform: none;
}

@media (max-width: 420px) {
  .catalog-product-card {
    border-radius: 20px;
    padding: 0.8rem;
  }

  .catalog-product-card__price {
    font-size: 0.68rem;
  }
}
</style>
