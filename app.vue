<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { refreshUser } = useAuth();

// 页面加载时尝试恢复用户会话
onMounted(async () => {
  try {
    await refreshUser();
  } catch (error) {
    console.error("Failed to restore user session:", error);
  }
});
</script>
