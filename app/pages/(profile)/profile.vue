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
        <div class="p-4 rounded-lg bg-neutral-800">
          <div class="text-2xl font-bold text-center nums tabular-nums">
            <div class="number-wrapper">
              <span
                :class="{
                  'number-animate-up': shouldAnimateComments === 'up',
                  'number-animate-down': shouldAnimateComments === 'down',
                }"
                :data-old="prevCommentsCount"
                :data-new="commentsCount"
                >{{ commentsCount }}</span
              >
            </div>
          </div>
          <div class="text-neutral-500 text-center">评论数</div>
        </div>
        <div class="p-4 rounded-lg bg-neutral-800">
          <div class="text-2xl font-bold text-center nums tabular-nums">
            <div class="number-wrapper">
              <span
                :class="{
                  'number-animate-up': shouldAnimateLikes === 'up',
                  'number-animate-down': shouldAnimateLikes === 'down',
                }"
                :data-old="prevLikesCount"
                :data-new="likesCount"
                >{{ likesCount }}</span
              >
            </div>
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
const { commentsCount, likesCount, fetchStats } = useUserMetrics();
const toast = useToast();

const isLoading = ref(false);
const isStatsLoading = ref(false);
const shouldAnimateComments = ref<"up" | "down" | false>(false);
const shouldAnimateLikes = ref<"up" | "down" | false>(false);
const isFirstLoad = ref(true);
const prevCommentsCount = ref(0);
const prevLikesCount = ref(0);

const loadUserStats = async () => {
  if (!user.value?.id || isStatsLoading.value) return;

  try {
    isStatsLoading.value = true;
    prevCommentsCount.value = commentsCount.value;
    prevLikesCount.value = likesCount.value;

    await fetchStats(user.value.id);

    if (!isFirstLoad.value) {
      if (prevCommentsCount.value !== commentsCount.value) {
        shouldAnimateComments.value = commentsCount.value > prevCommentsCount.value ? "up" : "down";
        setTimeout(() => {
          shouldAnimateComments.value = false;
        }, 500);
      }
      if (prevLikesCount.value !== likesCount.value) {
        shouldAnimateLikes.value = likesCount.value > prevLikesCount.value ? "up" : "down";
        setTimeout(() => {
          shouldAnimateLikes.value = false;
        }, 500);
      }
    }
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

// watch(
//   () => user.value?.id,
//   (newId) => {
//     if (newId) {
//       isFirstLoad.value = true;
//       loadUserStats();
//     }
//   }
// );

onActivated(() => {
  loadUserStats();
});

onMounted(() => {
  loadUserStats();
});
</script>

<style scoped>
.number-wrapper {
  position: relative;
  height: 2rem;
  overflow: hidden;
  display: inline-block;
  min-width: 1.5rem;
}

.number-animate-up,
.number-animate-down {
  position: relative;
  display: inline-block;
  visibility: hidden;
}

.number-animate-up::before,
.number-animate-down::before,
.number-animate-up::after,
.number-animate-down::after {
  visibility: visible;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}

.number-animate-up::before {
  content: attr(data-old);
  transform-origin: 50% 100%;
  animation: moveUpOut 0.3s ease-in-out forwards;
}

.number-animate-up::after {
  content: attr(data-new);
  transform-origin: 50% 0%;
  animation: moveUpIn 0.3s ease-in-out forwards;
}

.number-animate-down::before {
  content: attr(data-old);
  transform-origin: 50% 0%;
  animation: moveDownOut 0.3s ease-in-out forwards;
}

.number-animate-down::after {
  content: attr(data-new);
  transform-origin: 50% 100%;
  animation: moveDownIn 0.3s ease-in-out forwards;
}

@keyframes moveUpOut {
  0% {
    transform: translateY(0) rotateX(0);
  }
  100% {
    transform: translateY(-50%) rotateX(-90deg);
  }
}

@keyframes moveUpIn {
  0% {
    transform: translateY(50%) rotateX(90deg);
  }
  100% {
    transform: translateY(0) rotateX(0);
  }
}

@keyframes moveDownOut {
  0% {
    transform: translateY(0) rotateX(0);
  }
  100% {
    transform: translateY(50%) rotateX(90deg);
  }
}

@keyframes moveDownIn {
  0% {
    transform: translateY(-50%) rotateX(-90deg);
  }
  100% {
    transform: translateY(0) rotateX(0);
  }
}
</style>
