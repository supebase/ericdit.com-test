<template>
  <div class="comments-section mt-8">
    <h3 class="text-xl font-semibold mb-4">
      评论
      <span class="text-gray-500 ml-2 text-base">{{ totalComments }}</span>
    </h3>

    <div
      class="comment-input mb-6"
      v-if="allowComments">
      <textarea
        v-model="newComment"
        class="w-full p-3 border rounded-lg"
        rows="3"
        :disabled="isSubmitting"
        :placeholder="isSubmitting ? '提交中...' : '写下你的评论...'" />
      <button
        @click="submitComment"
        :disabled="isSubmitting || !newComment.trim()"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSubmitting ? "提交中..." : "发表评论" }}
      </button>
    </div>

    <div
      v-else
      class="text-center text-gray-500 py-8">
      评论已关闭
    </div>

    <div
      v-if="error"
      class="text-center text-red-500 py-8">
      {{ error.message || "加载评论失败，请稍后重试" }}
    </div>

    <div
      v-else-if="isLoading && !comments"
      class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <template v-else>
      <div
        v-if="rootComments.length"
        class="comment-list space-y-4">
        <CommentItem
          v-for="comment in rootComments"
          :key="comment.id"
          :comment="comment"
          @reply="handleReply"
          :ref="(el) => setCommentRef(comment.id, el)" />
      </div>
      <div
        v-else
        class="text-center text-gray-500 py-8">
        暂无评论，来说两句吧~
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface ReplyData {
  commentId: string;
  content: string;
}

const props = defineProps<{
  contentId: string;
  allowComments: boolean;
}>();

const { getCommentsList, createComment, subscribeComments } = useComments();

const newComment = ref("");
const isSubmitting = ref(false);
const commentRefs = ref<Record<string, { refreshReplies: () => Promise<void> }>>({});

const {
  data: comments,
  refresh: refreshComments,
  status,
  error,
} = await useLazyAsyncData(`comments-${props.contentId}`, () =>
  getCommentsList("content", props.contentId, {
    fields: ["id", "comment", "user_created.*", "date_created", "parent_comment_id.*"],
    sort: ["-date_created"],
  })
);

const isLoading = computed(() => status.value === "pending");

const rootComments = computed(
  () => comments.value?.filter((comment) => !comment.parent_comment_id) ?? []
);

const totalComments = computed(() => comments.value?.length ?? 0);

const setCommentRef = (id: string, el: any) => {
  if (el) {
    commentRefs.value[id] = el;
  } else {
    delete commentRefs.value[id];
  }
};

const submitComment = async () => {
  const trimmedComment = newComment.value.trim();
  if (!trimmedComment || isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    await createComment({
      content_id: props.contentId,
      comment: trimmedComment,
    });
    newComment.value = "";
    await refreshComments();
  } catch (error) {
    console.error("Failed to submit comment:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleReply = async ({ commentId, content }: ReplyData) => {
  if (!content.trim() || isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    await createComment({
      content_id: props.contentId,
      parent_comment_id: commentId,
      comment: content.trim(),
    });

    const targetRef = commentRefs.value[commentId];
    if (targetRef) {
      await targetRef.refreshReplies();
    }
  } catch (error) {
    console.error("Failed to submit reply:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const refreshAllComments = async () => {
  await refreshComments();
  await Promise.all(Object.values(commentRefs.value).map((ref) => ref?.refreshReplies()));
};

onMounted(() => {
  subscribeComments(props.contentId, async (event) => {
    if (["create", "update", "delete"].includes(event.event)) {
      await refreshAllComments();
    }
  });
});
</script>
