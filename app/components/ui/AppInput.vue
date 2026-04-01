<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  label?: string
  error?: string
  name?: string
  ariaLabel?: string
  tabindex?: number
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  tabindex: 0
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="name" class="text-sm font-medium text-white/70">{{ label }}</label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :tabindex="tabindex"
      :aria-label="ariaLabel || label || placeholder"
      :aria-invalid="!!error"
      class="input-field w-full text-white placeholder-white/40 focus:outline-none"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <span v-if="error" class="text-xs text-red-400">{{ error }}</span>
  </div>
</template>
