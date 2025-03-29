<template>
  <div class="select-none pb-6">
    <USeparator v-if="allowComments">
      <div class="text-neutral-600 text-sm nums tabular-nums my-6">
        <span v-if="totalComments"> 有 {{ totalComments }} 条评论，快来加入讨论！ </span>
        <span v-else> 暂无评论，快来发表你的观点吧！ </span>
      </div>
    </USeparator>

    <div v-if="allowComments">
      <div
        class="transform transition-all duration-500 ease-in-out"
        :class="
          showMainCommentForm
            ? 'scale-100 opacity-100 max-h-[110px]'
            : 'scale-0 opacity-0 max-h-0 overflow-hidden'
        ">
        <div class="animate-in slide-in-from-left duration-500">
          <CommentEditor
            :is-submitting="isSubmitting"
            :placeholder="randomPlaceholder"
            @submit="handleSubmit" />
        </div>
      </div>
    </div>

    <UAlert
      v-else
      color="info"
      variant="soft"
      icon="hugeicons:comment-block-02"
      description="本页面评论功能已关闭。"
      class="my-8">
    </UAlert>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="hugeicons:alert-02"
      :description="error?.message || '加载评论失败，请稍后重试。'"
      class="my-8">
    </UAlert>

    <div
      v-else-if="isLoading && !comments"
      class="text-center my-8 text-neutral-500">
      <UIcon
        name="svg-spinners:3-dots-bounce"
        class="size-6 text-neutral-500" />
    </div>

    <template v-else>
      <div
        v-if="rootComments.length || !allowComments"
        class="my-8">
        <CommentThreadItem
          v-for="comment in rootComments"
          :key="comment.id"
          :comment="comment"
          :is-replying="activeReplyId === comment.id"
          @reply="handleReply"
          @reply-start="handleReplyStart(comment.id)"
          @reply-end="handleReplyEnd"
          :ref="(el) => setCommentRef(comment.id, el)" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AUTH_ERROR_MESSAGES } from "~/types/auth";

interface ReplyData {
  commentId: string;
  content: string;
}

const props = defineProps<{
  contentId: string;
  allowComments: boolean;
}>();

const { getCommentsList, createComment, subscribeComments } = useComments();
const toast = useToast();

const isSubmitting = ref(false);
const showMainCommentForm = ref(true);
const activeReplyId = ref<string | null>(null);
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

const PLACEHOLDERS = [
  "灵感来袭？快写下您的独特见解！",
  "分享您的故事或经验，让大家听听吧！",
  "欢迎加入讨论，畅所欲言~",
] as const;

const randomPlaceholder = ref("");

const generateRandomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * PLACEHOLDERS.length);
  randomPlaceholder.value = PLACEHOLDERS[randomIndex] ?? "";
};

const hideMainCommentForm = () => {
  showMainCommentForm.value = false;
};

const toggleMainCommentFormShow = () => {
  showMainCommentForm.value = true;
};

const handleReplyStart = (commentId: string) => {
  activeReplyId.value = commentId;
  hideMainCommentForm();
};

const handleReplyEnd = () => {
  activeReplyId.value = null;
  toggleMainCommentFormShow();
};

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

const handleSubmit = async (content: string) => {
  try {
    isSubmitting.value = true;
    await createComment({
      content_id: props.contentId,
      comment: content,
    });
    await refreshComments();

    toast.add({
      title: "评论成功",
      description: "您的评论已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? AUTH_ERROR_MESSAGES[error.message] || error.message
        : "发生错误，请稍后再试。";

    toast.add({
      title: "评论失败",
      description: errorMessage,
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleReply = async ({ commentId, content }: ReplyData) => {
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

    toast.add({
      title: "回复成功",
      description: "您的回复已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? AUTH_ERROR_MESSAGES[error.message] || error.message
        : "发生错误，请稍后再试。";

    toast.add({
      title: "回复失败",
      description: errorMessage,
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
    handleReplyEnd();
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

  generateRandomPlaceholder();
});

onActivated(generateRandomPlaceholder);
</script>
