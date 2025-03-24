<template>
  <div class="reply-item pl-4 mt-2">
    <div class="reply-header flex items-center gap-2">
      <UChip
        inset
        position="bottom-right"
        :color="usersStatus[reply.user_created.id] ? 'primary' : 'neutral'">
        <UAvatar :src="useAssets(reply.user_created.avatar || '')" />
      </UChip>
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

const props = defineProps<{
  reply: Comments.Item;
}>();

const { usersStatus, subscribeUserStatus } = useUserStatus();

onMounted(async () => {
  await subscribeUserStatus(props.reply.user_created.id);
});
</script>
