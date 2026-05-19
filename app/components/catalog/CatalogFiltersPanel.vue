<script setup lang="ts">
import { ref, toRefs, computed, watch } from 'vue'

interface BrandOption {
  slug: string
  name: string
  shortDescription: string
}

interface CategoryOption {
  slug: string
  label: string
  count?: number
  icon?: string
}

interface Props {
  searchQuery: string
  selectedBrandSlugs: string[]
  selectedCategorySlugs: string[]
  catalogBrands: readonly BrandOption[]
  categories: readonly CategoryOption[]
  availableCount?: number
  hasActiveFilters?: boolean
  priceFrom?: number
  priceTo?: number
}

const props = withDefaults(defineProps<Props>(), {
  availableCount: 0,
  hasActiveFilters: false,
  priceFrom: 0,
  priceTo: 1500000
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:priceFrom': [value: number]
  'update:priceTo': [value: number]
  toggleBrand: [brandSlug: string]
  toggleCategory: [categorySlug: string]
  clearFilters: []
}>()

const {
  selectedBrandSlugs,
  selectedCategorySlugs,
  catalogBrands,
  categories,
  availableCount,
  hasActiveFilters,
  priceFrom: propPriceFrom,
  priceTo: propPriceTo
} = toRefs(props)

const PRICE_MIN = 0
const PRICE_MAX = 1500000

const clampPriceValue = (value: number) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? Math.max(PRICE_MIN, Math.min(numericValue, PRICE_MAX))
    : PRICE_MIN
}

const priceFromValue = computed({
  get: () => propPriceFrom.value,
  set: (value) => emit('update:priceFrom', clampPriceValue(value))
})

const priceToValue = computed({
  get: () => propPriceTo.value,
  set: (value) => emit('update:priceTo', clampPriceValue(value))
})
const isInStock = ref(true)
const categoriesExpanded = ref(false)
const isPriceRangeDragging = ref(false)

watch(priceFromValue, (newValue) => {
  const clampedValue = clampPriceValue(newValue)

  if (clampedValue !== newValue) {
    priceFromValue.value = clampedValue
    return
  }

  if (newValue > priceToValue.value) {
    priceFromValue.value = priceToValue.value
  }
})

watch(priceToValue, (newValue) => {
  const clampedValue = clampPriceValue(newValue)

  if (clampedValue !== newValue) {
    priceToValue.value = clampedValue
    return
  }

  if (newValue < priceFromValue.value) {
    priceToValue.value = priceFromValue.value
  }
})

const primaryCategories = computed(() => categories.value.slice(0, 5))
const additionalCategories = computed(() => categories.value.slice(5))

const hasMoreCategories = computed(() => {
  return categories.value.length > 5
})

const startPriceRangeDrag = () => {
  isPriceRangeDragging.value = true
}

const stopPriceRangeDrag = () => {
  isPriceRangeDragging.value = false
}

const pricePresets = [50000, 100000, 200000, 300000, 500000, 800000, 1000000, 1500000]

const getIcon = (category: CategoryOption) => {
  return category.icon || '📦'
}


const classes = {
  wrapper: 'filter-panel space-y-5 p-4 sm:space-y-6 sm:p-6',
  header: 'flex items-center justify-between gap-2',
  title: 'shrink-0 whitespace-nowrap text-lg font-heading font-bold tracking-tight filter-panel-heading sm:text-xl lg:text-lg xl:text-xl',
  resetButton: 'filter-panel-reset',
  section: 'space-y-4',
  sectionTitle: 'text-sm font-semibold tracking-tight filter-panel-heading',
  sectionList: 'space-y-2',
  categoryList: 'space-y-2',
  categoryRow: 'flex items-center gap-2 px-2 py-2 cursor-pointer transition filter-panel-category-row w-full',
  categoryRowActive: 'filter-panel-category-row-active',
  categoryIcon: 'text-base shrink-0',
  categoryLabel: 'text-sm filter-panel-heading',
  categoryCount: 'text-xs filter-panel-muted ml-auto',
  expandButton: 'w-full mt-2 px-3 py-2 text-sm font-semibold text-left transition filter-panel-expand-btn',
  brandRow: 'flex items-center justify-between gap-3 px-2.5 py-2.5 cursor-pointer transition filter-panel-brand-row',
  brandRowActive: 'filter-panel-brand-row-active',
  brandLabel: 'text-sm font-semibold filter-panel-heading',
  brandAction: 'hidden text-xs filter-panel-muted sm:inline',
  priceSection: 'space-y-3',
  priceInputs: 'grid grid-cols-1 gap-2.5',
  stockRow: 'flex items-center justify-between',
  stockCheckbox: 'flex items-center gap-3',
  stockCount: 'text-sm font-semibold filter-panel-heading',
}

</script>

<template>
  <div :class="classes.wrapper">
    <div :class="classes.header">
      <h2 :class="classes.title">Фильтры</h2>
      <button
        type="button"
        :class="classes.resetButton"
        :disabled="!hasActiveFilters"
        @click="$emit('clearFilters')"
      >
        Сбросить
      </button>
    </div>

    <section aria-labelledby="catalog-brand-title" :class="classes.section">
      <h3 id="catalog-brand-title" :class="classes.sectionTitle">Бренд</h3>
      <div :class="classes.sectionList">
        <button
          v-for="brand in catalogBrands"
          :key="brand.slug"
          type="button"
          :class="[
            classes.brandRow,
            selectedBrandSlugs.includes(brand.slug) && classes.brandRowActive
          ]"
          :aria-pressed="selectedBrandSlugs.includes(brand.slug)"
          @click="$emit('toggleBrand', brand.slug)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-[#3b1364]">
              {{ brand.name.slice(0, 2).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <div :class="classes.brandLabel">{{ brand.name }}</div>
            </div>
          </div>
          <span :class="classes.brandAction">{{ selectedBrandSlugs.includes(brand.slug) ? 'Выбрано' : 'Выбрать' }}</span>
        </button>
      </div>
    </section>

    <section aria-labelledby="catalog-category-title" :class="classes.section">
      <h3 id="catalog-category-title" :class="classes.sectionTitle">Категории</h3>
      <div :class="classes.categoryList">
        <button
          v-for="category in primaryCategories"
          :key="category.slug"
          type="button"
          :class="[
            classes.categoryRow,
            selectedCategorySlugs.includes(category.slug) && classes.categoryRowActive
          ]"
          :aria-pressed="selectedCategorySlugs.includes(category.slug)"
          @click="$emit('toggleCategory', category.slug)"
        >
          <span :class="classes.categoryIcon">{{ getIcon(category) }}</span>
          <span :class="classes.categoryLabel">{{ category.label }}</span>
          <span :class="classes.categoryCount">{{ category.count ?? 0 }}</span>
        </button>
        <TransitionGroup
          v-if="hasMoreCategories"
          name="filter-category-reveal"
          tag="div"
          class="filter-panel-category-extra"
        >
          <button
            v-for="category in categoriesExpanded ? additionalCategories : []"
            :key="category.slug"
            type="button"
            :class="[
              classes.categoryRow,
              selectedCategorySlugs.includes(category.slug) && classes.categoryRowActive
            ]"
            :aria-pressed="selectedCategorySlugs.includes(category.slug)"
            @click="$emit('toggleCategory', category.slug)"
          >
            <span :class="classes.categoryIcon">{{ getIcon(category) }}</span>
            <span :class="classes.categoryLabel">{{ category.label }}</span>
            <span :class="classes.categoryCount">{{ category.count ?? 0 }}</span>
          </button>
        </TransitionGroup>
      </div>
      <button
        v-if="hasMoreCategories"
        type="button"
        :class="classes.expandButton"
        @click="categoriesExpanded = !categoriesExpanded"
      >
        {{ categoriesExpanded ? 'Скрыть ▴' : 'Показать ещё ▾' }}
      </button>
    </section>

    <section aria-labelledby="catalog-price-title" :class="classes.section">
      <h3 id="catalog-price-title" :class="classes.sectionTitle">Цена</h3>
      <div :class="classes.priceSection">
        <div
          class="range-slider-container"
          :class="{ 'is-dragging': isPriceRangeDragging }"
        >
          <input
            v-model.number="priceFromValue"
            type="range"
            min="0"
            max="1500000"
            step="1000"
            class="range-slider range-slider-from"
            aria-label="Минимальная цена"
            @pointerdown="startPriceRangeDrag"
            @pointerup="stopPriceRangeDrag"
            @pointercancel="stopPriceRangeDrag"
            @blur="stopPriceRangeDrag"
          >
          <input
            v-model.number="priceToValue"
            type="range"
            min="0"
            max="1500000"
            step="1000"
            class="range-slider range-slider-to"
            aria-label="Максимальная цена"
            @pointerdown="startPriceRangeDrag"
            @pointerup="stopPriceRangeDrag"
            @pointercancel="stopPriceRangeDrag"
            @blur="stopPriceRangeDrag"
          >
          <div class="range-track">
            <div
              class="range-fill"
              :style="{
                left: (priceFromValue / 1500000) * 100 + '%',
                right: 100 - (priceToValue / 1500000) * 100 + '%'
              }"
            />
          </div>
        </div>

        <div :class="classes.priceInputs">
          <div class="filter-panel-input-group">
            <span class="filter-panel-input-label">от</span>
            <input
              v-model.number="priceFromValue"
              type="number"
              class="filter-panel-price-input filter-panel-price-input-left"
              min="0"
              max="1500000"
            >
          </div>
          <div class="filter-panel-input-group filter-panel-dropdown-group">
            <span class="filter-panel-input-label">до</span>
            <input
              v-model.number="priceToValue"
              type="number"
              class="filter-panel-price-input filter-panel-price-input-right"
              min="0"
              max="1500000"
            >
            <span class="filter-panel-currency">₽</span>
            <span class="filter-panel-dropdown-icon">▾</span>
            <div class="filter-panel-dropdown-menu">
              <button
                v-for="preset in pricePresets"
                :key="preset"
                type="button"
                class="filter-panel-dropdown-item"
                @click="priceToValue = preset"
              >
                {{ preset.toLocaleString('ru-RU') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="catalog-stock-title" :class="classes.section">
      <h3 id="catalog-stock-title" :class="classes.sectionTitle">Наличие</h3>
      <div :class="classes.stockRow">
        <label :class="classes.stockCheckbox">
          <input
            v-model="isInStock"
            type="checkbox"
            class="sr-only"
          >
          <span class="filter-switch">
            <span class="track" aria-hidden="true" />
          </span>
          <span class="text-sm filter-panel-heading">В наличии</span>
        </label>
        <span :class="classes.stockCount">{{ availableCount.toLocaleString('ru-RU') }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.filter-panel {
  background: var(--color-surface);
  border: 1px solid rgba(var(--color-border-rgb), 0.18);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
  border-radius: 1.75rem;
}

.filter-panel-heading {
  color: var(--color-text);
}

.filter-panel-reset {
  flex-shrink: 0;
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-border-rgb), 0.18);
  background: rgba(var(--color-text-rgb), 0.06);
  border-radius: 9999px;
  min-height: 2.25rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.875rem;
  line-height: 1;
  white-space: nowrap;
  transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
}

.filter-panel-reset:hover {
  background: rgba(var(--color-text-rgb), 0.1);
}

.filter-panel-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .filter-panel {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .filter-panel-reset {
    padding-left: 0.7rem;
    padding-right: 0.7rem;
    font-size: 0.8125rem;
  }
}

.filter-panel-muted {
  color: rgba(var(--color-text-rgb), 0.55);
}

.filter-panel-brand-row {
  border: 1px solid transparent;
  border-radius: 1rem;
  background: transparent;
  min-height: 3.45rem;
  outline: none;
  transition:
    background-color 190ms ease-out,
    border-color 190ms ease-out,
    box-shadow 190ms ease-out,
    color 190ms ease-out;
}

.filter-panel-category-row {
  background: transparent;
  border: none;
}

.filter-panel-brand-row:hover,
.filter-panel-brand-row:focus-visible {
  border-color: rgba(var(--color-border-rgb), 0.18);
  background: rgba(var(--color-text-rgb), 0.055);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.filter-panel-brand-row:focus-visible {
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.08),
    0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
}

.filter-panel-category-row:hover {
  background: transparent;
}

.filter-panel-brand-row-active {
  border-color: rgba(var(--color-primary-rgb), 0.2);
  background: rgba(var(--color-primary-rgb), 0.075);
  color: var(--color-primary);
}

.filter-panel-category-row-active {
  background: transparent;
  color: var(--color-primary);
}

.filter-panel-expand-btn {
  background: transparent;
  border: none;
  color: var(--color-text);
  padding-left: 0;
  padding-right: 0;
  justify-content: flex-start;
  text-align: left;
}

.filter-panel-expand-btn:hover {
  background: rgba(var(--color-text-rgb), 0.04);
}

.filter-panel-category-extra {
  display: grid;
  gap: 0.5rem;
  overflow: hidden;
}

.filter-category-reveal-enter-active,
.filter-category-reveal-leave-active {
  transition:
    opacity 190ms ease-out,
    transform 190ms ease-out,
    max-height 220ms ease-out,
    margin 220ms ease-out;
}

.filter-category-reveal-enter-from,
.filter-category-reveal-leave-to {
  max-height: 0;
  margin-top: -0.35rem;
  opacity: 0;
  transform: translateY(-0.25rem);
}

.filter-category-reveal-enter-to,
.filter-category-reveal-leave-from {
  max-height: 3rem;
  opacity: 1;
  transform: translateY(0);
}

/* Dual range slider */
.range-slider-container {
  position: relative;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.range-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 0.5rem;
  border: 1px solid rgba(var(--color-border-rgb), 0.16);
  background: rgba(var(--color-text-rgb), 0.08);
  border-radius: 0.5rem;
  transform: translateY(-50%);
  pointer-events: none;
  overflow: hidden;
}

.range-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: 0.5rem;
  box-shadow: 0 0 18px rgba(var(--color-primary-rgb), 0.22);
  transition: left 180ms ease-out, right 180ms ease-out;
}

.range-slider-container.is-dragging .range-fill {
  transition: none;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  z-index: 5;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 3px solid var(--range-thumb-color, var(--color-primary));
  background: #ffffff;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.14),
    0 0 0 4px rgba(var(--color-primary-rgb), 0.08);
  cursor: pointer;
  pointer-events: all;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}

.range-slider::-webkit-slider-thumb:hover {
  box-shadow:
    0 7px 18px rgba(0, 0, 0, 0.18),
    0 0 0 6px rgba(var(--color-primary-rgb), 0.12);
  transform: scale(1.03);
}

.range-slider::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 3px solid var(--range-thumb-color, var(--color-primary));
  background: #ffffff;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.14),
    0 0 0 4px rgba(var(--color-primary-rgb), 0.08);
  cursor: pointer;
  pointer-events: all;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}

.range-slider::-moz-range-thumb:hover {
  box-shadow:
    0 7px 18px rgba(0, 0, 0, 0.18),
    0 0 0 6px rgba(var(--color-primary-rgb), 0.12);
  transform: scale(1.03);
}

.range-slider-from {
  z-index: 4;
}

.range-slider-to {
  z-index: 3;
}

.range-slider-from::-webkit-slider-thumb {
  --range-thumb-color: var(--color-primary);
}

.range-slider-to::-webkit-slider-thumb {
  --range-thumb-color: var(--color-accent);
}

.range-slider-from::-moz-range-thumb {
  --range-thumb-color: var(--color-primary);
}

.range-slider-to::-moz-range-thumb {
  --range-thumb-color: var(--color-accent);
}

.range-slider:focus-visible {
  outline: none;
}

.range-slider:focus-visible::-webkit-slider-thumb {
  box-shadow:
    0 7px 18px rgba(0, 0, 0, 0.18),
    0 0 0 7px rgba(var(--color-primary-rgb), 0.18);
}

.range-slider:focus-visible::-moz-range-thumb {
  box-shadow:
    0 7px 18px rgba(0, 0, 0, 0.18),
    0 0 0 7px rgba(var(--color-primary-rgb), 0.18);
}

/* Price inputs */
.filter-panel-input-group {
  position: relative;
}

.filter-panel-input-label {
  position: absolute;
  left: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(var(--color-text-rgb), 0.55);
  font-size: 0.75rem;
  font-weight: 600;
  pointer-events: none;
  text-transform: none;
}

.filter-panel-price-input {
  width: 100%;
  border: 1px solid rgba(var(--color-border-rgb), 0.18);
  border-radius: 0.75rem;
  background: rgba(var(--color-text-rgb), 0.04);
  color: var(--color-text);
  font-size: 0.875rem;
  min-height: 2.5rem;
  transition: border-color 200ms ease, background 200ms ease;
}

.filter-panel-price-input-left {
  padding-left: 1.7rem;
  padding-right: 0.9rem;
}

.filter-panel-price-input-right {
  padding-left: 1.5rem;
  padding-right: 3rem;
}

.filter-panel-price-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(var(--color-text-rgb), 0.06);
}

.filter-panel-price-input::-webkit-inner-spin-button,
.filter-panel-price-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.filter-panel-price-input {
  appearance: textfield;
  -moz-appearance: textfield;
}

.filter-panel-currency {
  position: absolute;
  right: 1.3rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(var(--color-text-rgb), 0.55);
  pointer-events: none;
  font-size: 0.875rem;
}

.filter-panel-dropdown-icon {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(var(--color-text-rgb), 0.55);
  pointer-events: none;
  font-size: 0.9rem;
}

.filter-panel-dropdown-group {
  position: relative;
}

.filter-panel-dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--color-surface);
  border: 1px solid rgba(var(--color-border-rgb), 0.18);
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 10;
  max-height: 16rem;
  overflow-y: auto;
}

.filter-panel-dropdown-group:focus-within .filter-panel-dropdown-menu {
  display: block;
}

.filter-panel-price-input:focus-within ~ .filter-panel-dropdown-menu {
  display: block;
}

.filter-panel-input-group:focus-within .filter-panel-dropdown-menu {
  display: block;
}

.filter-panel-dropdown-item {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  text-align: right;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.filter-panel-dropdown-item:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
}

.filter-panel-dropdown-item:first-child {
  border-radius: 0.625rem 0.625rem 0 0;
}

.filter-panel-dropdown-item:last-child {
  border-radius: 0 0 0.625rem 0.625rem;
}
</style>
