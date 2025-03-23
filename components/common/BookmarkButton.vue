<template>
  <div class="bookmark-button inline-flex items-center">
    <button
      @click="handleBookmark"
      :disabled="!isAuthenticated || isProcessing"
      class="text-sm flex items-center gap-1 text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'text-blue-600': isBookmarked }">
      <UIcon :name="isBookmarked ? 'hugeicons:bookmark-check-02' : 'hugeicons:bookmark-02'" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  contentId: string;
}>();

const { isAuthenticated } = useAuth();
const { getBookmarks, createBookmark, deleteBookmark, subscribeBookmarks } = useBookmarks();

const isBookmarked = ref(false);
const currentBookmarkId = ref<string | null>(null);
const isProcessing = ref(false);

// 获取当前内容的收藏状态
const fetchBookmarkStatus = async () => {
  try {
    const bookmarks = await getBookmarks({
      fields: ["id", "user_created.id"],
      filter: {
        content_id: { _eq: props.contentId },
      },
    });

    const currentUserId = useAuth().user.value?.id;
    const userBookmark = bookmarks.find((bookmark) => bookmark.user_created?.id === currentUserId);

    // 重置状态
    isBookmarked.value = false;
    currentBookmarkId.value = null;

    // 如果找到用户的收藏记录，更新状态
    if (userBookmark) {
      isBookmarked.value = true;
      currentBookmarkId.value = userBookmark.id;
    }
  } catch (error) {
    console.error("Failed to fetch bookmark status:", error);
  }
};

// 处理收藏/取消收藏
const handleBookmarkAction = async () => {
  if (!isAuthenticated.value || isProcessing.value) return;

  try {
    isProcessing.value = true;
    if (isBookmarked.value && currentBookmarkId.value) {
      await deleteBookmark(currentBookmarkId.value);
      isBookmarked.value = false;
      currentBookmarkId.value = null;
    } else {
      const newBookmark = await createBookmark({
        content_id: props.contentId,
      });
      isBookmarked.value = true;
      currentBookmarkId.value = newBookmark.id;
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
  } finally {
    isProcessing.value = false;
  }
};

// 使用防抖包装处理函数
const handleBookmark = useDebounceFn(handleBookmarkAction, 500);

onMounted(async () => {
  subscribeBookmarks(
    {
      fields: ["id", "user_created.id"],
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarkStatus();
      }
    }
  );

  await fetchBookmarkStatus();
});
</script>
