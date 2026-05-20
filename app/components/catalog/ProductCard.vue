<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useCompareStore } from '~/stores/compare'
import { formatPrice, isPriceAvailable } from '~/utils/price'
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
const hasProductPrice = computed(() => isPriceAvailable(props.product.price))
const { openPriceRequest } = usePriceRequest()

const toggleCart = () => {
  if (!hasProductPrice.value) {
    openPriceRequest(props.product)
    return
  }

  if (isInCart.value) {
    cartStore.removeFromCart(props.product._id)
    return
  }

  cartStore.addToCart(props.product)
}

const openProductFromCard = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof HTMLElement) || target.closest('a, button')) {
    return
  }

  void navigateTo(`/products/${props.product.slug}`)
}
</script>

<template>
  <article class="catalog-product-card group" @click="openProductFromCard">
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
          @click.stop="favoritesStore.toggleFavorite(product)"
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
          @click.stop="compareStore.toggleCompare(product)"
        >
          <svg aria-hidden="true" class="catalog-action-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21V9m5 12V3m5 18v-7" />
          </svg>
        </button>

        <button
          type="button"
          :class="['catalog-action-button', 'catalog-action-button--cart', { 'is-active': isInCart }]"
          :aria-pressed="hasProductPrice ? isInCart : false"
          :aria-label="hasProductPrice ? (isInCart ? 'Убрать из корзины' : 'Добавить в корзину') : 'Получить цену'"
          @click.stop="toggleCart"
        >
          <svg aria-hidden="true" class="catalog-action-button__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h9.5l3-7H6.1M7 13l-1 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </button>
      </div>

      <AppButton v-if="hasProductPrice" variant="primary" :to="`/products/${product.slug}`" class="catalog-product-card__details">
        Подробнее
      </AppButton>
      <AppButton
        v-else
        variant="primary"
        class="catalog-product-card__details"
        aria-label="Получить цену товара"
        @click.stop="openPriceRequest(product)"
      >
        Получить цену
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
  gap: 0.95rem;
  overflow: hidden;
  border: 1px solid rgba(var(--color-border-rgb), 0.16);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.34)),
    rgba(var(--color-surface-rgb), 0.5);
  box-shadow: 0 16px 36px rgba(93, 141, 255, 0.12), 0 24px 64px rgba(72, 96, 168, 0.1);
  cursor: pointer;
  padding: 0.9rem;
  backdrop-filter: blur(30px);
  transition: border-color 220ms ease-out, box-shadow 220ms ease-out, transform 220ms ease-out;
}

[data-theme='dark'] .catalog-product-card {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04)),
    rgba(var(--color-surface-rgb), 0.62);
}

.catalog-product-card:hover {
  border-color: rgba(var(--color-primary-rgb), 0.24);
  box-shadow: 0 18px 42px rgba(93, 141, 255, 0.13), 0 24px 66px rgba(72, 96, 168, 0.11);
  transform: translateY(-1px);
}

.catalog-product-card__preview {
  position: relative;
  display: flex;
  aspect-ratio: 16 / 11;
  min-height: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(152, 168, 220, 0.14);
  border-radius: 22px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.95), rgba(246, 248, 255, 0.88) 48%, rgba(236, 242, 255, 0.72)),
    rgba(255, 255, 255, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 10px 30px rgba(122, 139, 199, 0.08);
  padding: clamp(0.8rem, 2.2vw, 1.15rem);
}

.catalog-product-card__shine {
  position: absolute;
  inset: 10%;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.08) 60%, transparent 78%);
  filter: blur(16px);
  opacity: 0.9;
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
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 255, 0.76)) padding-box,
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(223, 233, 255, 0.34)) border-box;
}

.catalog-product-card__image {
  position: relative;
  z-index: 1;
  object-fit: contain;
  border-radius: 18px;
  filter:
    drop-shadow(0 10px 24px rgba(116, 131, 187, 0.12))
    saturate(1.03)
    brightness(1.01);
  transition:
    transform 220ms ease-out,
    filter 220ms ease-out;
}

.catalog-product-card:hover .catalog-product-card__image {
  transform: scale(1.015);
  filter:
    drop-shadow(0 14px 30px rgba(116, 131, 187, 0.15))
    saturate(1.035)
    brightness(1.02);
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
  gap: 0.65rem;
}

.catalog-product-card__eyebrow {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.35rem 0.55rem;
  color: rgba(var(--color-text-rgb), 0.44);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  line-height: 1.35;
  text-transform: uppercase;
}

.catalog-product-card__title {
  display: -webkit-box;
  margin-top: 0.32rem;
  overflow: hidden;
  color: var(--color-text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(0.98rem, 1.5vw, 1.06rem);
  font-weight: 800;
  line-height: 1.18;
  text-decoration-color: transparent;
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: color 220ms ease-out, text-decoration-color 220ms ease-out;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.catalog-product-card:hover .catalog-product-card__title,
.catalog-product-card__title:hover {
  color: rgba(var(--color-text-rgb), 0.92);
  text-decoration-color: rgba(var(--color-primary-rgb), 0.36);
}

.catalog-product-card__description {
  display: -webkit-box;
  min-height: 2.9rem;
  overflow: hidden;
  color: rgba(var(--color-text-rgb), 0.62);
  font-size: 0.86rem;
  line-height: 1.48;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.catalog-product-card__footer {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.catalog-product-card__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
}

.catalog-action-button {
  position: relative;
  display: inline-flex;
  min-width: 0;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-inactive-border);
  border-radius: 13px;
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
  width: 1.15rem;
  height: 1.15rem;
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

  .catalog-product-card__preview {
    aspect-ratio: 16 / 10.5;
    border-radius: 18px;
    padding: 0.7rem;
  }

  .catalog-product-card__image {
    border-radius: 14px;
  }

  .catalog-product-card__description {
    min-height: 0;
  }
}

@media (hover: none) {
  .catalog-product-card:hover {
    transform: none;
  }

  .catalog-product-card:hover .catalog-product-card__image {
    transform: none;
  }
}
</style>
