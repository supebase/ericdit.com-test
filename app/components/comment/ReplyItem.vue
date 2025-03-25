<template>
  <div class="flex">
    <div class="mr-3">
      <UChip
        inset
        position="bottom-right"
        :color="usersStatus[reply.user_created.id] ? 'primary' : 'neutral'">
        <UAvatar
          size="sm"
          :src="useAssets(reply.user_created.avatar || '')" />
      </UChip>
    </div>

    <div class="flex-1">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="font-medium">{{ reply.user_created.first_name }}</div>
          <div class="text-sm text-neutral-500">{{ useDatetime(reply.date_created) }}</div>
        </div>

        <CommonLikeButton
          :comment-id="reply.id"
          :icon-size="18" />
      </div>

      <div>{{ reply.comment }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  reply: Comments.Item;
}>();

const { usersStatus, subscribeUserStatus } = useUserStatus() as {
  usersStatus: Record<string, boolean>;
  subscribeUserStatus: (userId: string) => Promise<void>;
};

onMounted(async () => {
  await subscribeUserStatus(props.reply.user_created.id);
});
</script>
