<template>
  <div class="flex items-center gap-4">
    <template v-if="isAuthenticated">
      <div class="flex items-center gap-2">
        <span class="text-sm">{{ user?.first_name }}</span>
        <button
          @click="handleLogout"
          class="text-sm text-gray-600 hover:text-gray-900"
          :disabled="isLoading">
          退出
        </button>
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
const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();
const isLoading = ref(false);

const handleLogout = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    await logout();
    router.push("/login");
  } catch (error) {
    console.error("Failed to logout:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
