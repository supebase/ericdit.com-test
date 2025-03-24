<template>
  <div class="max-w-sm mx-auto">
    <header class="sticky top-0 bg-neutral-900 z-50">
      <div class="container mx-auto py-4 flex justify-between items-center">
        <NuxtLink to="/">
          <CommonLogo />
        </NuxtLink>
        <div class="flex items-center gap-6">
          <div
            v-if="isAuthenticated"
            class="mt-3">
            <CommonBookmarkCounter />
          </div>

          <AuthStatus />
        </div>
      </div>
    </header>

    <main class="container mx-auto">
      <slot />
    </main>

    <footer class="container mx-auto py-4">
      <div class="text-center text-sm text-neutral-600 uppercase">
        &copy; 2001-{{ new Date().getFullYear() }} - Created by Eric
      </div>
    </footer>
  </div>
</template>

<script setup>
const { isAuthenticated } = useAuth();
</script>
