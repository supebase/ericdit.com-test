<template>
  <article class="py-3">
    <NuxtLink :to="`/article/${content.id}`">
      <h2 class="title">{{ content.title }}</h2>
    </NuxtLink>
    <div class="body">{{ content.body }}</div>
    <time
      class="date"
      :datetime="content.date_created">
      {{ useDatetime(content.date_created) }}
    </time>
    <span>{{ useReadingTime(content.body) }}</span>
  </article>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

defineProps<{
  content: Contents.Item;
}>();
</script>
