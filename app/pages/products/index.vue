<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppInput from '~/components/ui/AppInput.vue'

interface Product {
  id: number
  title: string
  description: string
  price: number
  thumbnail: string
  category: string
  rating: number
}

const products = ref<Product[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')
const searchQuery = ref('')
const limit = 12
const skip = ref(0)
const hasMore = ref(true)
const loading = ref(false)

// Fetch initial data
const { data: initialData } = await useFetch<{ products: Product[] }>('https://dummyjson.com/products?limit=12')
if (initialData.value) {
  products.value = initialData.value.products
  skip.value = 12
}

const { data: categoryData } = await useFetch<string[]>('https://dummyjson.com/products/categories')
if (categoryData.value) {
  categories.value = categoryData.value
}

const fetchMore = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  
  let url = `https://dummyjson.com/products?limit=${limit}&skip=${skip.value}`
  if (selectedCategory.value) {
    url = `https://dummyjson.com/products/category/${selectedCategory.value}?limit=${limit}&skip=${skip.value}`
  }

  const { data } = await useFetch<{ products: Product[] }>(url)
  if (data.value && data.value.products.length > 0) {
    products.value.push(...data.value.products)
    skip.value += limit
    if (data.value.products.length < limit) hasMore.value = false
  } else {
    hasMore.value = false
  }
  loading.value = false
}

const handleFilter = async () => {
  skip.value = 0
  hasMore.value = true
  products.value = []
  await fetchMore()
}

// Intersection Observer for infinite scroll
const observerTarget = ref(null)
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchMore()
    }
  }, { threshold: 0.1 })

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

useSeoMeta({
  title: 'Каталог продукции - Avent',
  description: 'Широкий выбор современных технологических решений и аксессуаров в каталоге Avent.'
})
</script>

<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <div class="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h1 class="text-4xl lg:text-6xl font-heading font-bold mb-4">Каталог</h1>
          <p class="text-white/60">Откройте для себя наш ассортимент прецизионных решений.</p>
        </div>

        <div class="flex flex-wrap gap-4 w-full lg:w-auto">
          <div class="flex-1 lg:w-64">
            <AppInput
              v-model="searchQuery"
              placeholder="Поиск товаров..."
              type="search"
            />
          </div>
          <select
            v-model="selectedCategory"
            @change="handleFilter"
            class="input-field bg-surface-container-lowest border-none rounded-lg px-4 py-2 text-white/70 focus:ring-2 focus:ring-secondary/50 h-full min-h-[42px] appearance-none cursor-pointer"
          >
            <option value="">Все категории</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
              <!-- {{ cat.charAt(0).toUpperCase() + cat.slice(1) }} -->
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AppCard
          v-for="product in products"
          :key="product.id"
          class="flex flex-col group h-full"
          variant="medium"
        >
          <div class="relative aspect-square mb-6 overflow-hidden rounded-xl bg-white/5">
            <NuxtImg
              :src="product.thumbnail"
              :alt="product.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute top-4 right-4 glass-panel px-3 py-1 text-xs font-bold text-secondary">
              ${{ product.price }}
            </div>
          </div>
          
          <div class="flex-grow flex flex-col gap-2">
            <div class="text-xs text-white/40 uppercase tracking-widest">{{ product.category }}</div>
            <h3 class="text-lg font-heading font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {{ product.title }}
            </h3>
            <p class="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <template #footer>
            <AppButton variant="primary" :to="`/products/${product.id}`" class="w-full">
              Подробнее
            </AppButton>
          </template>
        </AppCard>
      </div>

      <div ref="observerTarget" class="py-12 flex justify-center">
        <div v-if="loading" class="animate-spin text-secondary">
          <svg class="h-8 w-8" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p v-else-if="!hasMore" class="text-white/40 text-sm">Вы просмотрели все товары.</p>
      </div>
    </div>
  </div>
</template>
