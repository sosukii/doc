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
  catalogBrands: BrandOption[]
  categories: CategoryOption[]
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
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-heading font-bold">Фильтры</h2>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="text-sm text-secondary transition hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/40"
        @click="$emit('clearFilters')"
      >
        Сбросить
      </button>
    </div>

    <section aria-labelledby="catalog-search-title" class="space-y-3">
      <h3 id="catalog-search-title" class="text-sm font-semibold uppercase tracking-widest text-white/50">Поиск</h3>
      <AppInput
        :model-value="searchQuery"
        placeholder="Поиск товаров..."
        type="search"
        @update:model-value="$emit('update:searchQuery', String($event))"
      />
    </section>

    <section aria-labelledby="catalog-brand-title" class="space-y-3">
      <h3 id="catalog-brand-title" class="text-sm font-semibold uppercase tracking-widest text-white/50">Бренд</h3>
      <label
        v-for="brand in catalogBrands"
        :key="brand.slug"
        class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 transition hover:border-white/15"
      >
        <input
          :checked="selectedBrandSlugs.includes(brand.slug)"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-secondary focus:ring-secondary"
          @change="$emit('toggleBrand', brand.slug)"
        >
        <span class="flex flex-col">
          <span class="font-medium text-white/90">{{ brand.name }}</span>
          <span class="text-sm text-white/45">{{ brand.shortDescription }}</span>
        </span>
      </label>
    </section>

    <section aria-labelledby="catalog-category-title" class="space-y-3">
      <h3 id="catalog-category-title" class="text-sm font-semibold uppercase tracking-widest text-white/50">Категория</h3>
      <label
        v-for="category in categories"
        :key="category.slug"
        class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 transition hover:border-white/15"
      >
        <input
          :checked="selectedCategorySlugs.includes(category.slug)"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-secondary focus:ring-secondary"
          @change="$emit('toggleCategory', category.slug)"
        >
        <span class="text-sm text-white/80">{{ category.label }}</span>
      </label>
    </section>
  </div>
</template>
