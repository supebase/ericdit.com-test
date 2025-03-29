<template>
  <div class="container mx-auto py-8 select-none">
    <div class="rounded-lg shadow py-6">
      <div class="flex items-center gap-4 mb-8">
        <ProfileAvatarUpload />
        <div class="w-full">
          <div class="text-2xl font-bold">{{ user?.first_name }}</div>
          <div class="text-neutral-500 flex justify-between items-center">
            <div>{{ user?.email }}</div>
            <div class="text-sm text-neutral-500 flex items-center space-x-2">
              <UIcon
                v-if="user?.location"
                name="hugeicons:location-04"
                class="size-4" />
              <div>{{ user?.location }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="p-4 rounded-lg bg-neutral-950/40">
          <div class="text-2xl font-bold text-center nums tabular-nums">
            <div class="flex justify-center">
              <div
                v-for="(digit, index) in displayCommentsDigits"
                :key="index"
                class="number-column">
                <div
                  class="number-scroll"
                  :style="{ transform: `translateY(${digit * -10}%)` }">
                  <div
                    v-for="n in 10"
                    :key="n"
                    class="number-cell">
                    {{ n - 1 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-neutral-500 text-sm text-center">评论数</div>
        </div>
        <div class="p-4 rounded-lg bg-neutral-950/40">
          <div class="text-2xl font-bold text-center nums tabular-nums">
            <div class="flex justify-center">
              <div
                v-for="(digit, index) in displayLikesDigits"
                :key="index"
                class="number-column">
                <div
                  class="number-scroll"
                  :style="{ transform: `translateY(${digit * -10}%)` }">
                  <div
                    v-for="n in 10"
                    :key="n"
                    class="number-cell">
                    {{ n - 1 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-neutral-500 text-sm text-center">点赞数</div>
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
const { commentsCount, likesCount, fetchStats } = useUserMetrics();
const toast = useToast();

const isLoading = ref(false);
const isStatsLoading = ref(false);
const isFirstLoad = ref(true);

// 将数字转换为数字数组
const displayCommentsDigits = computed(() => {
  return String(commentsCount.value).padStart(1, "0").split("").map(Number);
});

const displayLikesDigits = computed(() => {
  return String(likesCount.value).padStart(1, "0").split("").map(Number);
});

const loadUserStats = async () => {
  if (!user.value?.id || isStatsLoading.value) return;

  try {
    isStatsLoading.value = true;
    await fetchStats(user.value.id);
  } catch (error) {
    toast.add({
      title: "获取数据失败",
      description: "请稍后重试",
      color: "error",
    });
  } finally {
    isStatsLoading.value = false;
    isFirstLoad.value = false;
  }
};

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

onActivated(() => {
  loadUserStats();
});

onMounted(() => {
  loadUserStats();
});
</script>

<style scoped>
.number-column {
  display: inline-block;
  height: 2rem;
  overflow: hidden;
  position: relative;
}

.number-scroll {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.number-cell {
  height: 2rem;
  width: 1rem;
  text-align: center;
  line-height: 2rem;
}
</style>
