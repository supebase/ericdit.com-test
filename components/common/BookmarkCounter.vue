<template>
  <div v-if="loading && !bookmarksCount">
    <UIcon
      name="svg-spinners:ring-resize"
      class="size-6 text-neutral-500" />
  </div>
  <div v-else>
    <UChip
      :show="bookmarksCount > 0"
      :color="bookmarksCount ? 'warning' : 'neutral'"
      :ui="{ base: 'py-2 px-1.5 font-bold' }"
      :text="bookmarksCount">
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
const bookmarksCount = ref(0);
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

onMounted(async () => {
  await fetchBookmarksCount();

  subscribeBookmarks(
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
</script>
