<template>
  <div class="flex items-center gap-4">
    <template v-if="isAuthenticated">
      <div class="flex items-center gap-2">
        <span class="text-sm">{{ user?.first_name }}</span>
        <NuxtLink
          to="/account"
          class="text-sm text-gray-600 hover:text-gray-900">
          账号
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <NuxtLink
        to="/login"
        class="text-sm text-blue-600 hover:text-blue-800">
        登录
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated } = useAuth();
</script>
