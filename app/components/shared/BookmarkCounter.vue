<template>
  <div v-if="loading && bookmarksCount === null">
    <UIcon
      name="svg-spinners:ring-resize"
      class="size-6 text-neutral-500" />
  </div>
  <div
    v-else
    class="select-none">
    <UChip
      :show="bookmarksCount !== null && bookmarksCount > 0"
      :color="bookmarksCount ? 'warning' : 'neutral'"
      :ui="{ base: 'py-2 px-1.5 font-bold' }"
      :text="bookmarksCount ?? undefined">
      <NuxtLink to="/bookmarks">
        <UIcon
          name="hugeicons:all-bookmark"
          class="size-6"
          :class="bookmarksCount ? '' : 'text-neutral-500'" />
      </NuxtLink>
    </UChip>
  </div>
</template>

<script setup lang="ts">
const { getBookmarks, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const bookmarksCount = ref<number | null>(null);
const loading = ref(false);

const fetchBookmarksCount = async () => {
  try {
    loading.value = true;
    const bookmarks = await getBookmarks({
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value?.id },
      },
    });
    bookmarksCount.value = bookmarks.length;
  } catch (error) {
    console.error("Failed to fetch bookmarks count:", error);
  } finally {
    loading.value = false;
  }
};

let unsubscribe: (() => void) | null = null;

// 添加页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    fetchBookmarksCount();
  }
};

onMounted(async () => {
  document.addEventListener("visibilitychange", handleVisibilityChange);

  await fetchBookmarksCount();

  unsubscribe = await subscribeBookmarks(
    {
      fields: ["id"],
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

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
