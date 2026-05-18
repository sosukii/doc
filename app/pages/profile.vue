<template>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:py-10 xl:px-8">
    <h1 class="sr-only">Профиль</h1>

    <div class="mt-8 max-w-md mx-auto sm:mt-12">
      <AppCard variant="medium" class="p-5 sm:p-8">
        <h2 class="text-xl font-heading font-bold mb-6 sm:text-2xl">Вход в аккаунт</h2>

        <form
          class="space-y-6"
          @submit.prevent="handleLogin"
        >
          <div>
            <label for="email" class="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <AppInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-white/80 mb-2">
              Пароль
            </label>
            <AppInput
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <AppButton variant="primary" type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Вход...' : 'Войти' }}
          </AppButton>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-white/60">
            Нет аккаунта?
            <button
              class="text-primary hover:text-primary/80 transition-colors"
              @click="isRegister = !isRegister"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>

        <div v-if="isRegister" class="mt-6 pt-6 border-t border-white/10">
          <h3 class="text-xl font-heading font-bold mb-4">Регистрация</h3>
          <form
            class="space-y-6"
            @submit.prevent="handleRegister"
          >
            <div>
              <label for="reg-email" class="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <AppInput
                id="reg-email"
                v-model="registerForm.email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label for="reg-password" class="block text-sm font-medium text-white/80 mb-2">
                Пароль
              </label>
              <AppInput
                id="reg-password"
                v-model="registerForm.password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <AppButton variant="secondary" type="submit" class="w-full" :disabled="isLoading">
              {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </AppButton>
          </form>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppInput from '~/components/ui/AppInput.vue'

const form = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: ''
})

const isRegister = ref(false)
const isLoading = ref(false)

// Mock login/register functions
const handleLogin = async () => {
  isLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Login:', form)
  isLoading.value = false
  // In real app, handle authentication
}

const handleRegister = async () => {
  isLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Register:', registerForm)
  isLoading.value = false
  // In real app, handle registration
}

// Set page meta
useHead({
  title: 'Профиль - AVENT'
})
</script>
