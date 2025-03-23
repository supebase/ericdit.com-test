<template>
  <article class="py-3">
    <h1 class="text-2xl font-bold mb-4">{{ content.title }}</h1>
    <div class="flex items-center space-x-4 text-sm text-gray-500 mb-6">
      <time :datetime="content.date_created">
        {{ useDatetime(content.date_created) }}
      </time>
      <span>{{ useReadingTime(content.body) }}</span>
    </div>
    <div class="prose dark:prose-invert max-w-none">
      {{ content.body }}
    </div>

    <CommonBookmarkButton :content-id="content.id" />

    <CommonLikeButton :content-id="content.id" />
  </article>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

defineProps<{
  content: Contents.Item;
}>();
</script>
