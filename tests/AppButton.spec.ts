import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/ui/AppButton.vue'

vi.mock('@/composables/useCatalogNavigationWarmup', () => ({
  useCatalogNavigationWarmup: () => ({
    warmCatalogListing: vi.fn()
  })
}))

const mountAppButton = (options = {}) => mount(AppButton, {
  global: {
    stubs: {
      NuxtLink: {
        props: ['to'],
        template: '<a><slot /></a>'
      }
    }
  },
  ...options
})

describe('AppButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountAppButton({
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('renders correctly with glass variant', () => {
    const wrapper = mountAppButton({
      props: {
        variant: 'glass'
      },
      slots: {
        default: 'Glass Button'
      }
    })
    expect(wrapper.classes()).toContain('btn-glass')
  })

  it('shows loading spinner when loading prop is true', () => {
    const wrapper = mountAppButton({
      props: {
        loading: true
      }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
