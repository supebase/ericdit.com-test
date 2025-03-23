<template>
  <div>
    <header class="border-b border-b-neutral-600">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink
          to="/"
          class="text-xl font-bold">
          首页
        </NuxtLink>
        <div>
          <div v-if="isAuthenticated">
            <UChip
              inset
              size="3xl"
              :text="bookmarksCount">
              <NuxtLink to="/bookmarks">
                <UIcon
                  name="hugeicons:all-bookmark"
                  class="size-6" />
              </NuxtLink>
            </UChip>
          </div>

          <AuthStatus />
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { getBookmarks, subscribeBookmarks } = useBookmarks();
const { isAuthenticated, user } = useAuth();
const bookmarksCount = ref(0);

// 获取收藏数量
const fetchBookmarksCount = async () => {
  if (!isAuthenticated.value) {
    bookmarksCount.value = 0;
    return;
  }

  try {
    const bookmarks = await getBookmarks({
      filter: {
        user_created: { _eq: user.value?.id },
      },
    });
    bookmarksCount.value = bookmarks.length;
  } catch (error) {
    console.error("Failed to fetch bookmarks count:", error);
  }
};

// 监听用户登录状态变化
watch(isAuthenticated, () => {
  fetchBookmarksCount();
});

onMounted(async () => {
  // 初始获取收藏数量
  await fetchBookmarksCount();

  // 订阅收藏变化
  subscribeBookmarks(
    {
      filter: {
        user_created: { _eq: user.value?.id },
      },
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarksCount();
      }
    }
  );
});
</script>
