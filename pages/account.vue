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
            <p class="text-gray-600">{{ user?.email }}</p>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="p-4 rounded">
            <div>
              <UIcon
                name="line-md:loading-loop"
                class="text-2xl"
                v-if="loading" />
              <div
                class="text-2xl font-bold"
                v-else>
                {{ commentsCount }}
              </div>
            </div>
            <div class="text-gray-600">评论数</div>
          </div>
          <div class="p-4 rounded">
            <UIcon
              name="line-md:loading-loop"
              class="text-2xl"
              v-if="loading" />
            <div
              class="text-2xl font-bold"
              v-else>
              {{ likesCount }}
            </div>
            <div class="text-gray-600">点赞数</div>
          </div>
        </div>

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

const { $directus, $content } = useNuxtApp();
const router = useRouter();
const { user, logout } = useAuth();
const { getLikes } = useLikes();

const isLoading = ref(false);
const commentsCount = ref(0);
const likesCount = ref(0);

// 退出登录
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

const loading = ref(false);

// 获取用户统计数据
const fetchUserStats = async () => {
  if (!user.value?.id) return;

  try {
    loading.value = true;
    // 获取用户评论数
    const comments = await $directus.request(
      $content.readItems("comments", {
        fields: ["id"],
        filter: {
          user_created: { _eq: user.value.id },
        },
      })
    );
    commentsCount.value = comments.length;

    // 获取用户点赞数
    const likes = await getLikes({
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value.id },
      },
    });
    likesCount.value = likes.length;
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取统计数据
onMounted(fetchUserStats);
</script>
