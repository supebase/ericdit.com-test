<template>
  <div class="container">
    <div
      v-if="isLoading && !contents"
      class="loading flex items-center justify-center py-8">
      <span class="loading-indicator">加载中...</span>
    </div>
    <div
      v-else-if="error"
      class="error bg-red-50 text-red-500 p-4 rounded">
      {{ error.message || "加载失败，请稍后重试" }}
    </div>
    <template v-else>
      <ContentItem
        v-for="content in contents"
        :key="content.id"
        :content="content" />
      <div v-if="contents?.length === 0">暂无内容</div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { getContents, subscribeContents } = useContents();

const CONTENT_FIELDS = ["id", "title", "body", "date_created"] as const;

const {
  data: contents,
  refresh,
  status,
  error,
} = await useLazyAsyncData(() =>
  getContents({
    fields: [...CONTENT_FIELDS],
    sort: ["-date_created"],
    filter: {
      status: { _eq: "published" },
    },
  })
);

const isLoading = computed(() => status.value === "pending");

onMounted(() => {
  subscribeContents(
    {
      fields: [...CONTENT_FIELDS],
    },
    async (event) => {
      if (["create", "update", "delete"].includes(event.event)) {
        await refresh();
      }
    }
  );
});
</script>
