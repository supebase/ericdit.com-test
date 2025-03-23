<template>
  <div class="reply-item pl-4 mt-2">
    <div class="reply-header flex items-center gap-2">
      <UChip
        inset
        position="bottom-right"
        :color="userStatus ? 'primary' : 'neutral'">
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

const { checkUserStatus, subscribeUserStatus, cleanup } = useUserStatus();
const userStatus = ref(false);

onMounted(async () => {
  userStatus.value = await checkUserStatus(props.reply.user_created.id);

  if (import.meta.client) {
    subscribeUserStatus(props.reply.user_created.id, (status) => {
      userStatus.value = status;
    });
  }
});

onUnmounted(() => {
  cleanup();
});
</script>
