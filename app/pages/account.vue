<template>
  <div class="container mx-auto py-8">
    <div class="rounded-lg shadow py-6">
      <div class="flex items-center gap-4 mb-8">
        <div class="flex items-center justify-center">
          <UAvatar
            :src="useAssets(user?.avatar || '')"
            size="3xl" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ user?.first_name }}</h1>
          <p class="text-neutral-500">{{ user?.email }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="p-4 rounded-lg bg-neutral-800">
          <div class="text-2xl font-bold text-center nums">
            {{ commentsCount }}
          </div>
          <div class="text-neutral-500 text-center">评论数</div>
        </div>
        <div class="p-4 rounded-lg bg-neutral-800">
          <div class="text-2xl font-bold text-center nums">
            {{ likesCount }}
          </div>
          <div class="text-neutral-500 text-center">点赞数</div>
        </div>
      </div>

      <UButton
        @click="handleLogout"
        size="xl"
        color="error"
        block
        :disabled="isLoading"
        :loading="isLoading">
        {{ isLoading ? "正在处理" : "退出登录" }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { user, logout } = useAuth();
const { commentsCount, likesCount, fetchStats } = useUserStats();
const toast = useToast();

const isLoading = ref(false);
const isStatsLoading = ref(false);

// 统一处理获取用户统计数据
const loadUserStats = async () => {
  if (!user.value?.id || isStatsLoading.value) return;

  try {
    isStatsLoading.value = true;
    await fetchStats(user.value.id);
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    toast.add({
      title: "获取数据失败",
      description: "请稍后重试",
      color: "error",
    });
  } finally {
    isStatsLoading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    await logout();
    navigateTo("/");
  } catch (error) {
    toast.add({
      title: "退出失败",
      description: "退出时发生错误，请稍后重试。",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

// 监听用户ID变化
watch(
  () => user.value?.id,
  (newId) => {
    if (newId) {
      loadUserStats();
    }
  }
);

// 页面激活时获取最新数据
onActivated(() => {
  loadUserStats();
});

// 页面加载时获取统计数据
onMounted(() => {
  loadUserStats();
});
</script>
