<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="rounded-lg shadow p-6">
        <!-- 用户基本信息 -->
        <div class="flex items-center gap-4 mb-8">
          <div class="w-14 h-14 rounded-full flex items-center justify-center">
            <UAvatar :src="useAssets(user?.avatar || '')" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ user?.first_name }}</h1>
            <p class="text-neutral-600">{{ user?.email }}</p>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="p-4 rounded border bg-neutral-800">
            <div
              v-if="isStatsLoading"
              class="animate-pulse bg-neutral-600 h-8 w-16 mb-2"></div>
            <div
              v-else
              class="text-2xl font-bold">
              {{ commentsCount }}
            </div>
            <div class="text-neutral-600">评论数</div>
          </div>
          <div class="p-4 rounded border bg-neutral-800">
            <div
              v-if="isStatsLoading"
              class="animate-pulse bg-neutral-600 h-8 w-16 mb-2"></div>
            <div
              v-else
              class="text-2xl font-bold">
              {{ likesCount }}
            </div>
            <div class="text-neutral-600">点赞数</div>
          </div>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="loadUserStats"
          class="mb-4 w-full bg-neutral-100 text-neutral-700 py-2 px-4 rounded hover:bg-neutral-200 transition-colors"
          :disabled="isStatsLoading">
          {{ isStatsLoading ? "加载中..." : "刷新数据" }}
        </button>

        <!-- 退出按钮 -->
        <button
          @click="handleLogout"
          class="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          :disabled="isLoading">
          {{ isLoading ? "退出中..." : "退出登录" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
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
    router.push("/login");
  } catch (error) {
    console.error("Failed to logout:", error);
    toast.add({
      title: "退出失败",
      description: "请稍后重试",
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
