<template>
  <div class="flex flex-col">
    <div class="flex">
      <div class="mr-3">
        <UChip
          inset
          position="bottom-right"
          :color="usersStatus[reply.user_created.id] ? 'primary' : 'neutral'">
          <UAvatar
            :src="useAssets(reply.user_created.avatar || '')"
            :alt="!reply.user_created.avatar ? reply.user_created.first_name : undefined"
            size="sm"
            class="uppercase" />
        </UChip>
      </div>

      <div class="flex-1">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3 nums tabular-nums">
            <div class="font-medium">{{ reply.user_created.first_name }}</div>
            <div class="text-sm text-neutral-500">{{ useDateFormatter(reply.date_created) }}</div>
            <div class="text-sm text-neutral-500">&bull;</div>
            <div class="text-sm text-neutral-500">
              {{ reply.user_created.location }}
            </div>
          </div>

          <SharedLikeButton
            :comment-id="reply.id"
            :icon-size="18" />
        </div>
      </div>
    </div>
    <div class="ml-10">{{ reply.comment }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  reply: Comments.Item;
}>();

const { usersStatus, subscribeUserStatus } = usePresence();

onMounted(async () => {
  await subscribeUserStatus(props.reply.user_created.id);
});
</script>
