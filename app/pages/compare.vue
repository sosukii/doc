<template>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:py-10 xl:px-8">
    <div class="mt-6 flex flex-col gap-4 sm:mt-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="sr-only">Сравнение товаров</h1>
        <p v-if="compareStore.items.length" class="mt-2 text-sm text-white/50">
          {{ compareStore.items.length }} {{ productCountLabel }} в списке сравнения
        </p>
      </div>

      <div
        v-if="compareStore.items.length"
        class="inline-grid w-full grid-cols-2 rounded-xl border border-white/10 bg-white/[0.04] p-1 sm:w-auto"
        aria-label="Режим отображения характеристик"
      >
        <button
          v-for="option in comparisonViewOptions"
          :key="option.value"
          type="button"
          class="min-h-10 rounded-lg px-3 text-sm font-medium transition-colors sm:px-4"
          :class="comparisonViewMode === option.value
            ? 'bg-primary text-white shadow-lg shadow-primary/15'
            : 'text-white/60 hover:bg-white/10 hover:text-white'"
          @click="comparisonViewMode = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

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

    <div v-else class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:mt-10">
      <div class="relative overflow-x-auto overscroll-x-contain">
      <table class="w-full min-w-[720px] table-fixed border-collapse sm:min-w-[820px] lg:min-w-[900px]">
        <colgroup>
          <col class="w-[160px] sm:w-[190px] lg:w-[220px]">
          <col
            v-for="product in compareStore.items"
            :key="`col-${product._id}`"
            class="w-[210px] sm:w-[240px] lg:w-[260px]"
          >
        </colgroup>
        <thead>
          <tr class="border-b border-white/10">
            <th class="sticky left-0 z-30 border-r border-white/10 bg-[rgba(var(--color-surface-rgb),0.92)] p-4 text-left align-top text-sm font-medium text-white/60 shadow-[12px_0_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <span class="whitespace-nowrap break-normal">Характеристика</span>
            </th>
            <th
              v-for="product in compareStore.items"
              :key="product._id"
              class="p-3 text-center align-top sm:p-4"
            >
              <div class="relative flex min-h-[220px] flex-col items-center justify-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 pt-10 sm:min-h-[240px] sm:gap-4 sm:p-4 sm:pt-11">
                <button
                  type="button"
                  aria-label="Убрать из сравнения"
                  class="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                  @click="compareStore.removeFromCompare(product._id)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <NuxtImg
                  :src="product.images?.[0] || '/placeholder.jpg'"
                  :alt="product.title"
                  width="150"
                  height="150"
                  class="h-28 w-28 rounded-lg object-contain sm:h-32 sm:w-32"
                />
                <h3 class="line-clamp-3 text-sm font-bold leading-snug">{{ product.title }}</h3>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visibleComparisonRows"
            :key="row.key"
            class="border-b border-white/5 last:border-b-0"
          >
            <th scope="row" class="sticky left-0 z-20 border-r border-white/10 bg-[rgba(var(--color-surface-rgb),0.88)] p-4 text-left align-middle text-sm font-medium text-white/80 shadow-[12px_0_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <span class="block whitespace-normal break-normal leading-snug">{{ row.label }}</span>
            </th>
            <td
              v-for="product in compareStore.items"
              :key="`${row.key}-${product._id}`"
              class="p-4 text-center align-middle text-sm leading-relaxed"
            >
              <span
                v-if="row.key === 'availability'"
                :class="row.value(product) === 'В наличии' ? 'text-green-400' : 'text-orange-400'"
              >
                {{ row.value(product) }}
              </span>
              <span v-else :class="row.strong ? 'font-bold' : ''">
                {{ row.value(product) }}
              </span>
            </td>
          </tr>

          <tr v-if="visibleComparisonRows.length === 0" class="border-b border-white/5">
            <td :colspan="compareStore.items.length + 1" class="p-8 text-center text-sm text-white/50">
              Отличающихся характеристик нет
            </td>
          </tr>

          <tr>
            <th scope="row" class="sticky left-0 z-20 border-r border-white/10 bg-[rgba(var(--color-surface-rgb),0.88)] p-4 text-left align-middle text-sm font-medium text-white/80 shadow-[12px_0_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">Действия</th>
            <td v-for="product in compareStore.items" :key="`actions-${product._id}`" class="p-4 text-center">
              <div class="flex flex-col gap-2">
                <AppButton variant="primary" :to="`/products/${product.slug}`" class="w-full px-3 py-2 text-sm">
                  Подробнее
                </AppButton>
                <AppButton
                  variant="secondary"
                  class="w-full px-3 py-2 text-sm"
                  @click="handleCompareProductAction(product)"
                >
                  {{ isPriceAvailable(product.price) ? 'В корзину' : 'Получить цену' }}
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
import { computed, ref } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import { useCompareStore } from '~/stores/compare'
import { useCartStore } from '~/stores/cart'
import { formatPrice, isPriceAvailable } from '~/utils/price'
import type { Product } from '~/composables/useCatalog'

const compareStore = useCompareStore()
const cartStore = useCartStore()
const { openPriceRequest } = usePriceRequest()

type ComparisonViewMode = 'all' | 'different'
type ProductProperties = Record<string, unknown>

interface ComparisonRow {
  key: string
  label: string
  strong?: boolean
  value: (product: Product) => string
}

const comparisonViewMode = ref<ComparisonViewMode>('all')
const comparisonViewOptions: Array<{ label: string, value: ComparisonViewMode }> = [
  { label: 'Все характеристики', value: 'all' },
  { label: 'Только отличия', value: 'different' }
]

const handleCompareProductAction = (product: Product) => {
  if (!isPriceAvailable(product.price)) {
    openPriceRequest(product)
    return
  }

  cartStore.addToCart(product)
}

const productCountLabel = computed(() => {
  const count = compareStore.items.length
  const lastTwoDigits = count % 100
  const lastDigit = count % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'товаров'
  }

  if (lastDigit === 1) {
    return 'товар'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара'
  }

  return 'товаров'
})

const isPlainRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)

const getPropertyKeyFromItem = (item: Record<string, unknown>) => {
  const key = item.key ?? item.name ?? item.title ?? item.label
  return typeof key === 'string' && key.trim() ? key.trim() : ''
}

const normalizeProperties = (product: Product): ProductProperties => {
  if (!product.properties) {
    return {}
  }

  if (Array.isArray(product.properties)) {
    return product.properties.reduce<ProductProperties>((properties, item) => {
      if (!isPlainRecord(item)) {
        return properties
      }

      const key = getPropertyKeyFromItem(item)

      if (!key) {
        return properties
      }

      properties[key] = Object.prototype.hasOwnProperty.call(item, 'value') ? item.value : item
      return properties
    }, {})
  }

  return product.properties
}

const getPropertyDisplayLabel = (key: string) => {
  for (const product of compareStore.items) {
    const property = normalizeProperties(product)[key]

    if (isPlainRecord(property)) {
      const label = property.label ?? property.title ?? property.name

      if (typeof label === 'string' && label.trim()) {
        return label.trim()
      }
    }
  }

  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const unwrapPropertyValue = (value: unknown): unknown => {
  if (!isPlainRecord(value)) {
    return value
  }

  if (Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value
  }

  return value
}

const formatComparisonValue = (value: unknown): string => {
  const unwrappedValue = unwrapPropertyValue(value)

  if (unwrappedValue === null || unwrappedValue === undefined || unwrappedValue === '') {
    return '—'
  }

  if (typeof unwrappedValue === 'boolean') {
    return unwrappedValue ? 'Да' : 'Нет'
  }

  if (Array.isArray(unwrappedValue)) {
    const values = unwrappedValue.map(formatComparisonValue).filter(item => item !== '—')
    return values.length ? values.join(', ') : '—'
  }

  if (isPlainRecord(unwrappedValue)) {
    const values = Object.entries(unwrappedValue)
      .filter(([key]) => !['key', 'name', 'title', 'label'].includes(key))
      .map(([key, item]) => `${getPropertyDisplayLabel(key)}: ${formatComparisonValue(item)}`)
      .filter(item => !item.endsWith(': —'))

    return values.length ? values.join('; ') : '—'
  }

  return String(unwrappedValue)
}

const normalizeComparableValue = (value: string) => value.trim().toLocaleLowerCase('ru-RU')

const isDifferentRow = (row: ComparisonRow) => {
  const values = compareStore.items.map(product => normalizeComparableValue(row.value(product)))
  return new Set(values).size > 1
}

const baseComparisonRows = computed<ComparisonRow[]>(() => [
  {
    key: 'title',
    label: 'Название',
    value: product => product.title
  },
  {
    key: 'price',
    label: 'Цена',
    strong: true,
    value: product => formatPrice(product.price)
  },
  {
    key: 'brand',
    label: 'Бренд',
    value: product => product.brand || '—'
  },
  {
    key: 'category',
    label: 'Категория',
    value: product => product.category || '—'
  },
  {
    key: 'article',
    label: 'Артикул',
    value: product => product._id
  },
  {
    key: 'availability',
    label: 'Наличие',
    value: product => product.availabilityStatus || 'Под заказ'
  },
  {
    key: 'warranty',
    label: 'Гарантия',
    value: product => product.warrantyInformation || 'По запросу'
  },
  {
    key: 'shipping',
    label: 'Доставка',
    value: product => product.shippingInformation || 'Уточняется'
  }
])

const propertyComparisonRows = computed<ComparisonRow[]>(() => {
  const propertyKeys = new Set<string>()

  compareStore.items.forEach((product) => {
    Object.keys(normalizeProperties(product)).forEach(key => propertyKeys.add(key))
  })

  return Array.from(propertyKeys)
    .map(key => ({
      key: `property-${key}`,
      label: getPropertyDisplayLabel(key),
      value: (product: Product) => formatComparisonValue(normalizeProperties(product)[key])
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'ru'))
})

const comparisonRows = computed(() => [
  ...baseComparisonRows.value,
  ...propertyComparisonRows.value
])

const visibleComparisonRows = computed(() => {
  if (comparisonViewMode.value === 'all') {
    return comparisonRows.value
  }

  return comparisonRows.value.filter(isDifferentRow)
})

useHead({
  title: 'Сравнение - AVENT'
})
</script>
