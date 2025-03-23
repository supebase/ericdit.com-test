<template>
  <div class="container">
    <div
      v-if="status === 'pending' && !content"
      class="loading flex items-center justify-center py-8">
      <span class="loading-indicator">加载中...</span>
    </div>
    <div
      v-else-if="error"
      class="error bg-red-50 text-red-500 p-4 rounded">
      {{ error.message || "加载失败，请稍后重试" }}
    </div>
    <ContentDetails
      v-else-if="content"
      :content="content" />

    <!-- 添加评论列表组件 -->
    <CommentList
      v-if="content"
      :content-id="content.id"
      :allow-comments="content.allow_comments" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { getContent } = useContents();

const CONTENT_FIELDS = ["id", "title", "body", "allow_comments", "date_created"] as const;

const {
  data: content,
  status,
  error,
} = await useLazyAsyncData(`content-${route.params.id}`, () =>
  getContent(route.params.id as string, {
    fields: [...CONTENT_FIELDS],
  })
);
</script>
