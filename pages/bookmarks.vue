<template>
  <div>
    <div class="flex items-center my-6">
      <USeparator>
        <div class="text-neutral-600 text-base nums tabular-nums">我的收藏</div>
      </USeparator>
    </div>

    <div
      v-if="loading"
      class="flex justify-center items-center py-12">
      <UIcon
        name="svg-spinners:ring-resize"
        class="size-6 text-neutral-500" />
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
          :to="`/article/${bookmark.content_id.id}`"
          class="block mb-2">
          <h2 class="text-base font-medium">
            {{ bookmark.content_id.title }}
          </h2>
        </NuxtLink>

        <div class="text-sm text-neutral-500">{{ useDatetime(bookmark.date_created) }}收藏</div>
      </UCard>
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
