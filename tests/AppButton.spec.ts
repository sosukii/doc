import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/ui/AppButton.vue'

describe('AppButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('renders correctly with glass variant', () => {
    const wrapper = mount(AppButton, {
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
    const wrapper = mount(AppButton, {
      props: {
        loading: true
      }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
