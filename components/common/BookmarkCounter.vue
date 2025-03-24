<template>
  <UChip
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
</template>

<script setup lang="ts">
const { getBookmarks, subscribeBookmarks } = useBookmarks();
const { user } = useAuth();
const bookmarksCount = ref(0);

const fetchBookmarksCount = async () => {
  try {
    const bookmarks = await getBookmarks({
      fields: ["id"],
      filter: {
        user_created: { _eq: user.value?.id },
      },
    });
    bookmarksCount.value = bookmarks.length;
  } catch (error) {
    console.error("Failed to fetch bookmarks count:", error);
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
