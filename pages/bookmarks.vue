<template>
  <div class="bookmarks-page">
    <div class="flex items-center gap-2 mb-8">
      <UIcon
        name="heroicons:bookmark"
        class="text-xl" />
      <h1 class="text-xl font-bold">我的收藏 ({{ bookmarksCount }})</h1>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-8">
      <UIcon
        name="line-md:loading-loop"
        class="text-2xl" />
    </div>

    <div
      v-else-if="bookmarks.length === 0"
      class="text-center py-8 text-neutral-500">
      暂无收藏内容
    </div>

    <div
      v-else
      class="space-y-4">
      <div
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="border-b pb-4">
        <!-- 这里根据你的内容类型来展示具体内容 -->
        <NuxtLink
          :to="`/article/${bookmark.content_id.id}`"
          class="hover:text-blue-600 transition-colors">
          {{ bookmark.content_id.title }}
        </NuxtLink>

        <div>{{ useDatetime(bookmark.date_created) }}收藏</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { getBookmarks, subscribeBookmarks } = useBookmarks();
const bookmarks = ref<any[]>([]);
const bookmarksCount = ref(0);
const loading = ref(true);

const fetchBookmarks = async () => {
  try {
    const response = await getBookmarks({
      fields: ["id", "content_id.*", "date_created"],
      sort: ["-date_created"],
    });
    bookmarks.value = response;
    bookmarksCount.value = response.length;
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  subscribeBookmarks(
    {
      fields: ["id", "content_id.*", "date_created"],
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchBookmarks();
      }
    }
  );

  await fetchBookmarks();
});
</script>
