<template>
  <div class="reply-item pl-4 mt-2">
    <div class="reply-header flex items-center gap-2">
      <span class="font-medium">{{ reply.user_created.first_name }}</span>
      <time class="text-sm text-gray-500">{{ useDatetime(reply.date_created) }}</time>
      <CommonLikeButton :comment-id="reply.id" />
    </div>

    <div class="reply-content my-2">
      {{ reply.comment }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

defineProps<{
  reply: Comments.Item;
}>();
</script>
