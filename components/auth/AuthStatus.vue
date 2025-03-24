<template>
  <div class="flex items-center gap-4">
    <template v-if="isAuthenticated">
      <div class="flex items-center gap-2">
        <NuxtLink to="/account">
          <UAvatar
            :src="useAssets(user?.avatar || '')"
            size="lg" />
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <NuxtLink to="/login">
        <UAvatar
          icon="hugeicons:lock-key"
          size="lg" />
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
</script>
