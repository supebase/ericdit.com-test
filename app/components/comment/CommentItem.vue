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
          </div>

          <CommonLikeButton
            :comment-id="comment.id"
            :icon-size="18" />
        </div>

        <div>{{ comment.comment }}</div>

        <div class="mt-1.5 flex justify-between items-center gap-4">
          <button
            @click="toggleReplyInput"
            class="text-sm text-neutral-500 nums tabular-nums cursor-pointer">
            {{ replyCount > 0 ? `回复（已有 ${replyCount} 人参与）` : "回复" }}
          </button>
          <button
            v-if="showReplyInput"
            @click="cancelReply"
            class="text-sm text-orange-500 cursor-pointer">
            取消回复
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showReplyInput"
      class="mt-5 ml-10">
      <CommentForm
        :placeholder="`回复：${comment.user_created.first_name}`"
        :is-submitting="isSubmitting"
        @submit="handleSubmit" />
    </div>

    <CommentReplyList
      ref="replyListRef"
      :comment-id="comment.id" />
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  comment: Comments.Item;
}>();

const emit = defineEmits<{
  (e: "reply", data: { commentId: string; content: string }): void;
  (e: "reply-start"): void;
  (e: "reply-end"): void;
}>();

const showReplyInput = ref(false);
const isSubmitting = ref(false);
const replyListRef = ref();

const refreshReplies = async () => {
  await replyListRef.value?.refresh();
};

const toggleReplyInput = () => {
  if (!showReplyInput.value) {
    emit("reply-start");
  }
  showReplyInput.value = !showReplyInput.value;
};

const cancelReply = () => {
  showReplyInput.value = false;
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
    showReplyInput.value = false;
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
  cancelReply();
});
</script>
