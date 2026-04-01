<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden animate-gradient-flow">
    <AppHeader />

    <main class="flex-grow pt-20">
      <div class="container mx-auto px-4">
        <AppBreadcrumbs v-if="$route.path !== '/'" />
      </div>
      <slot />
    </main>

    <AppFooter />

    <!-- Ambient Glow Backgrounds -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
  </div>
</template>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity 0.5s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>
