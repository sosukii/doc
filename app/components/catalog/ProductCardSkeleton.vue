<template>
  <div
    class="glass-panel flex h-full flex-col rounded-2xl border border-white/5 bg-surface-container-medium/40 p-6 sm:p-8"
    aria-hidden="true"
  >
    <div class="relative mb-6 aspect-square overflow-hidden rounded-xl border border-white/6 bg-white/[0.04] p-4">
      <div class="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] animate-pulse" />
      <div class="absolute right-4 top-4 h-7 w-20 rounded-full border border-white/8 bg-white/10 animate-pulse" />
    </div>

    <div class="flex flex-grow flex-col gap-3">
      <div class="flex gap-2">
        <div class="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
        <div class="h-3 w-16 rounded-full bg-white/8 animate-pulse" />
      </div>

      <div class="h-6 w-4/5 rounded-full bg-white/12 animate-pulse" />
      <div class="space-y-2">
        <div class="h-4 w-full rounded-full bg-white/8 animate-pulse" />
        <div class="h-4 w-3/4 rounded-full bg-white/7 animate-pulse" />
      </div>
    </div>

    <div class="mt-6">
      <div class="h-11 w-full rounded-2xl border border-white/8 bg-white/10 animate-pulse" />
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  backdrop-filter: blur(32px);
}
</style>
