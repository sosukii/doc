import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '../components/ui/AppInput.vue'

describe('AppInput', () => {
  it('renders correctly with label', () => {
    const wrapper = mount(AppInput, {
      props: {
        label: 'Email',
        name: 'email'
      }
    })
    expect(wrapper.find('label').text()).toBe('Email')
    expect(wrapper.find('input').attributes('id')).toBe('email')
  })

  it('updates modelValue on input', async () => {
    const wrapper = mount(AppInput, {
      props: {
        modelValue: ''
      }
    })
    const input = wrapper.find('input')
    await input.setValue('test@example.com')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test@example.com'])
  })

  it('shows error message when provided', () => {
    const wrapper = mount(AppInput, {
      props: {
        error: 'Invalid email'
      }
    })
    expect(wrapper.find('span').text()).toBe('Invalid email')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })
})
