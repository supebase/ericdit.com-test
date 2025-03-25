<template>
  <div class="flex flex-col min-h-screen max-w-md mx-auto px-6 sm:px-0">
    <header class="sticky top-0 bg-neutral-900 z-50">
      <div class="container mx-auto py-4 flex justify-between items-center">
        <Transition
          name="fade"
          mode="out-in">
          <div
            v-if="$route.path === '/'"
            key="logo">
            <CommonLogo />
          </div>
          <div
            v-else
            key="icon"
            @click="$router.push('/')"
            class="cursor-pointer">
            <CommonBack />
          </div>
        </Transition>
        <div class="flex items-center space-x-8">
          <CommonBookmarkCounter
            v-if="isAuthenticated"
            class="translate-y-1.5" />

          <AuthStatus />
        </div>
      </div>
    </header>

    <main class="container mx-auto flex-1">
      <slot />
    </main>

    <footer class="container mx-auto py-4 select-none">
      <div class="text-center text-sm text-neutral-600 uppercase">
        &copy; 2001-{{ new Date().getFullYear() }} - Created by Eric
      </div>
    </footer>
  </div>
</template>

<script setup>
const { isAuthenticated } = useAuth();
</script>
