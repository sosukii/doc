import { defineStore } from 'pinia'
import type { Product } from '~/composables/useCatalog'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [] as Product[]
  }),
  getters: {
    isFavorite: (state) => (productId: string) => state.items.some((item: Product) => item._id === productId)
  },
  actions: {
    toggleFavorite(product: Product) {
      const index = this.items.findIndex((item: Product) => item._id === product._id)
      if (index > -1) {
        this.items.splice(index, 1)
      } else {
        this.items.push(product)
      }
    }
  }
})