import { defineStore } from 'pinia'
import type { Product } from '~/composables/useCatalog'

export const useCompareStore = defineStore('compare', {
  state: () => ({
    items: [] as Product[]
  }),
  getters: {
    isInCompare: (state) => (productId: string) => state.items.some((item: Product) => item._id === productId)
  },
  actions: {
    toggleCompare(product: Product) {
      const index = this.items.findIndex((item: Product) => item._id === product._id)
      if (index > -1) {
        this.items.splice(index, 1)
      } else {
        this.items.push(product)
      }
    },
    removeFromCompare(productId: string) {
      this.items = this.items.filter((item: Product) => item._id !== productId)
    },
    clearCompare() {
      this.items = []
    }
  }
})