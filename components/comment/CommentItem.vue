<template>
  <div class="comment-item border-l-2 pl-4">
    <div class="comment-header flex items-center gap-2">
      <span class="font-medium">{{ comment.user_created.first_name }}</span>
      <time class="text-sm text-gray-500">{{ useDatetime(comment.date_created) }}</time>
      <CommonLikeButton :comment-id="comment.id" />
    </div>

    <div class="comment-content my-2">
      {{ comment.comment }}
    </div>

    <div class="comment-actions">
      <button
        @click="showReplyInput = !showReplyInput"
        class="text-sm text-blue-500">
        {{ replyCount > 0 ? `${replyCount} 条回复` : "回复" }}
      </button>
    </div>

    <div
      v-if="showReplyInput"
      class="reply-input mt-2">
      <textarea
        v-model="replyContent"
        class="w-full p-2 border rounded"
        rows="2"
        placeholder="写下你的回复..."></textarea>
      <button
        @click="submitReply"
        :disabled="!replyContent.trim()"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        提交回复
      </button>
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
}>();

const showReplyInput = ref(false);
const replyContent = ref("");
const replyListRef = ref();

const refreshReplies = async () => {
  await replyListRef.value?.refresh();
};

const submitReply = () => {
  if (!replyContent.value.trim()) return;

  emit("reply", {
    commentId: props.comment.id,
    content: replyContent.value,
  });

  replyContent.value = "";
  showReplyInput.value = false;
};

const replyCount = computed(() => replyListRef.value?.repliesCount || 0);

defineExpose({
  refreshReplies,
  comment: props.comment,
});
</script>
