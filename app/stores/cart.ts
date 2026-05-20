import { defineStore } from 'pinia'
import type { Product } from '~/composables/useCatalog'
import { getNumericPrice } from '~/utils/price'

export interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + getNumericPrice(item.product.price) * item.quantity, 0)
  },
  actions: {
    addToCart(product: Product) {
      const existing = this.items.find(item => item.product._id === product._id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ product, quantity: 1 })
      }
    },
    removeFromCart(productId: string) {
      this.items = this.items.filter(item => item.product._id !== productId)
    },
    increaseQuantity(productId: string) {
      const item = this.items.find(item => item.product._id === productId)
      if (item) {
        item.quantity++
      }
    },
    decreaseQuantity(productId: string) {
      const item = this.items.find(item => item.product._id === productId)
      if (item && item.quantity > 1) {
        item.quantity--
      } else {
        this.removeFromCart(productId)
      }
    },
    clearCart() {
      this.items = []
    }
  }
})
