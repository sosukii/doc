<script setup lang="ts">
import AppInput from '~/components/ui/AppInput.vue'

interface BrandOption {
  slug: string
  name: string
  shortDescription: string
}

interface CategoryOption {
  slug: string
  label: string
}

interface Props {
  searchQuery: string
  selectedBrandSlugs: string[]
  selectedCategorySlugs: string[]
  catalogBrands: readonly BrandOption[]
  categories: readonly CategoryOption[]
  hasActiveFilters?: boolean
}

withDefaults(defineProps<Props>(), {
  hasActiveFilters: false
})

defineEmits<{
  'update:searchQuery': [value: string]
  toggleBrand: [brandSlug: string]
  toggleCategory: [categorySlug: string]
  clearFilters: []
}>()

const classes = {
  wrapper: 'space-y-6',
  header: 'flex items-center justify-between',
  title: 'text-lg font-heading font-bold',
  resetButton: [
    'text-sm',
    'text-secondary',
    'transition',
    'hover:text-white',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-secondary/40',
  ],
  section: 'space-y-3',
  sectionTitle: 'text-sm font-semibold uppercase tracking-widest text-white/50',
  label: [
    'flex',
    'cursor-pointer',
    'items-start',
    'gap-3',
    'rounded-xl',
    'border',
    'border-white/5',
    'bg-white/5',
    'px-3',
    'py-3',
    'transition',
    'hover:border-white/15',
  ],
  checkbox: [
    'mt-1',
    'h-4',
    'w-4',
    'rounded',
    'border-white/20',
    'bg-transparent',
    'text-secondary',
    'focus:ring-secondary',
  ],
  brandInfo: 'flex flex-col',
  brandName: 'font-medium text-white/90',
  brandDescription: 'text-sm text-white/45',
  categoryLabel: 'text-sm text-white/80',
}
</script>

<template>
  <div :class="classes.wrapper">
    <div :class="classes.header">
      <h2 :class="classes.title">Фильтры</h2>
      <button
        v-if="hasActiveFilters"
        type="button"
        :class="classes.resetButton"
        @click="$emit('clearFilters')"
      >
        Сбросить
      </button>
    </div>

    <section aria-labelledby="catalog-search-title" :class="classes.section">
      <h3 id="catalog-search-title" :class="classes.sectionTitle">Поиск</h3>
      <AppInput
        :model-value="searchQuery"
        placeholder="Поиск товаров..."
        type="search"
        @update:model-value="$emit('update:searchQuery', String($event))"
      />
    </section>

    <section aria-labelledby="catalog-brand-title" :class="classes.section">
      <h3 id="catalog-brand-title" :class="classes.sectionTitle">Бренд</h3>
      <label
        v-for="brand in catalogBrands"
        :key="brand.slug"
        :class="classes.label"
      >
        <input
          :checked="selectedBrandSlugs.includes(brand.slug)"
          type="checkbox"
          :class="classes.checkbox"
          @change="$emit('toggleBrand', brand.slug)"
        >
        <span :class="classes.brandInfo">
          <span :class="classes.brandName">{{ brand.name }}</span>
          <span :class="classes.brandDescription">{{ brand.shortDescription }}</span>
        </span>
      </label>
    </section>

    <section aria-labelledby="catalog-category-title" :class="classes.section">
      <h3 id="catalog-category-title" :class="classes.sectionTitle">Категория</h3>
      <label
        v-for="category in categories"
        :key="category.slug"
        :class="classes.label"
      >
        <input
          :checked="selectedCategorySlugs.includes(category.slug)"
          type="checkbox"
          :class="classes.checkbox"
          @change="$emit('toggleCategory', category.slug)"
        >
        <span :class="classes.categoryLabel">{{ category.label }}</span>
      </label>
    </section>
  </div>
</template>
