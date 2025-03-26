<template>
  <div>
    <div class="flex">
      <div class="mr-3">
        <UChip
          inset
          position="bottom-right"
          :color="userStatus ? 'primary' : 'neutral'">
          <UAvatar
            size="sm"
            :src="useAssets(comment.user_created.avatar || '')" />
        </UChip>
      </div>

      <div class="flex-1">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="font-medium">{{ comment.user_created.first_name }}</div>
            <div class="text-sm text-neutral-500">{{ useDatetime(comment.date_created) }}</div>
            <div class="text-sm text-neutral-500">&bull;</div>
            <div class="text-sm text-neutral-500">
              {{ comment.user_created.location }}
            </div>
          </div>

          <CommonLikeButton
            :comment-id="comment.id"
            :icon-size="18" />
        </div>

        <div
          class="my-1 cursor-pointer"
          @click="toggleReplyInput">
          {{ comment.comment }}
        </div>

        <div class="flex justify-between items-center space-y-4">
          <button
            @click="toggleReplyInput"
            class="text-sm text-neutral-500 nums tabular-nums cursor-pointer">
            {{ replyCount > 0 ? `${replyCount} 条回复` : "回复" }}
          </button>
          <UIcon
            v-if="isReplying"
            @click="cancelReply"
            name="hugeicons:cancel-circle-half-dot"
            class="size-5 text-neutral-500 cursor-pointer mb-2" />
        </div>
      </div>
    </div>

    <div
      class="ml-10 transform transition-all duration-500 ease-in-out"
      :class="
        isReplying
          ? 'translate-y-0 opacity-100 max-h-[500px]'
          : '-translate-y-4 opacity-0 max-h-0 overflow-hidden'
      ">
      <div class="animate-in slide-in-from-right duration-500">
        <CommentForm
          :placeholder="`回复：${comment.user_created.first_name}`"
          :is-submitting="isSubmitting"
          @submit="handleSubmit" />
      </div>
    </div>

    <CommentReplyList
      ref="replyListRef"
      :comment-id="comment.id" />
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";
const { isAuthenticated } = useAuth();

const props = defineProps<{
  comment: Comments.Item;
  isReplying: boolean;
}>();

const emit = defineEmits<{
  (e: "reply", data: { commentId: string; content: string }): void;
  (e: "reply-start"): void;
  (e: "reply-end"): void;
}>();

const isSubmitting = ref(false);
const replyListRef = ref();

const refreshReplies = async () => {
  await replyListRef.value?.refresh();
};

const toggleReplyInput = () => {
  if (!isAuthenticated.value) return;

  if (!props.isReplying) {
    emit("reply-start");
  } else {
    emit("reply-end");
  }
};

const cancelReply = () => {
  emit("reply-end");
};

const handleSubmit = async (content: string) => {
  try {
    isSubmitting.value = true;
    emit("reply", {
      commentId: props.comment.id,
      content: content.trim(),
    });
  } finally {
    isSubmitting.value = false;
    emit("reply-end");
  }
};

const replyCount = computed(() => replyListRef.value?.repliesCount || 0);

defineExpose({
  refreshReplies,
  comment: props.comment,
});

const { checkUserStatus, subscribeUserStatus, cleanup, usersStatus } = useUserStatus() as {
  checkUserStatus: (userId: string) => Promise<boolean>;
  subscribeUserStatus: (userId: string) => Promise<void>;
  cleanup: () => void;
  usersStatus: Ref<Record<string, boolean>>;
};
const userStatus = ref(false);

onMounted(async () => {
  userStatus.value = await checkUserStatus(props.comment.user_created.id);

  if (import.meta.client) {
    await subscribeUserStatus(props.comment.user_created.id);

    watch(
      () => usersStatus.value[props.comment.user_created.id],
      (newStatus) => {
        userStatus.value = newStatus ?? false;
      }
    );
  }
});

onUnmounted(() => {
  cleanup();
});

onDeactivated(() => {
  emit("reply-end");
});
</script>
