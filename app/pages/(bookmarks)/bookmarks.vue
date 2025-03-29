<template>
  <div class="select-none">
    <div class="flex items-center my-6">
      <USeparator>
        <div class="text-neutral-600 text-base nums tabular-nums">我的收藏</div>
      </USeparator>
    </div>

    <div
      v-if="loading"
      class="fixed inset-0 flex justify-center items-center">
      <UIcon
        name="svg-spinners:ring-resize"
        class="size-7 text-primary-500" />
    </div>

    <div
      v-else-if="bookmarks.length === 0"
      class="flex flex-col items-center justify-center py-12 space-y-4">
      <UIcon
        name="hugeicons:bookmark-off-02"
        class="text-4xl text-neutral-600" />
      <p class="text-neutral-600 text-sm">暂无收藏内容</p>
    </div>

    <div
      v-else
      class="space-y-6">
      <UCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id">
        <NuxtLink
          :to="{ name: 'article-id', params: { id: bookmark.content_id.id } }"
          class="block mb-2">
          <h2 class="text-base font-medium">
            {{ bookmark.content_id.title }}
          </h2>
        </NuxtLink>

        <div class="flex items-center justify-between">
          <div class="text-sm text-neutral-500">
            {{ useDateFormatter(bookmark.date_created) }}收藏
          </div>
          <UButton
            icon="hugeicons:bookmark-minus-02"
            color="error"
            variant="link"
            size="xs"
            class="cursor-pointer size-5"
            :loading="bookmark.isDeleting"
            :disabled="bookmark.isDeleting"
            @click="removeBookmark(bookmark)" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookmarks } from "~/types";

definePageMeta({
  middleware: ["auth"],
});

const { getBookmarks, deleteBookmark, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const bookmarks = ref<Bookmarks.Item[]>([]);
const bookmarksCount = ref(0);
const loading = ref(true);

const fetchBookmarks = async () => {
  loading.value = true;
  try {
    const response = await getBookmarks({
      fields: ["id", "content_id.*", "date_created"],
      sort: ["-date_created"],
      filter: {
        user_created: { _eq: user.value!.id },
      },
    });
    bookmarks.value = response;
    bookmarksCount.value = response.length;
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
  } finally {
    loading.value = false;
  }
};

const removeBookmark = async (bookmark: Bookmarks.Item) => {
  bookmark.isDeleting = true;
  try {
    await deleteBookmark(bookmark.id);
    // 立即从本地列表中移除
    bookmarks.value = bookmarks.value.filter((b) => b.id !== bookmark.id);
    bookmarksCount.value = bookmarks.value.length;
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
    bookmark.isDeleting = false;
  }
};

// 添加用户变化的监听
watch(
  () => user.value?.id,
  (newUserId) => {
    if (newUserId) {
      fetchBookmarks();
    } else {
      bookmarks.value = [];
      bookmarksCount.value = 0;
    }
  },
  { immediate: true }
);

let unsubscribe: (() => void) | null = null;

// 添加页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    fetchBookmarks();
  }
};

onMounted(async () => {
  document.addEventListener("visibilitychange", handleVisibilityChange);

  if (user.value?.id) {
    try {
      unsubscribe = await subscribeBookmarks(
        {
          fields: ["id", "content_id.*", "date_created"],
          filter: {
            user_created: { _eq: user.value.id },
          },
        },
        async (event) => {
          if (["create", "delete"].includes(event.event)) {
            await fetchBookmarks();
          }
        }
      );
    } catch (error) {
      console.error("Failed to subscribe to bookmarks:", error);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
