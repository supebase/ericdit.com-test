<template>
  <div class="reply-list ml-8 mt-2 space-y-2">
    <CommentReplyItem
      v-for="reply in replies"
      :key="reply.id"
      :reply="reply" />
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  commentId: string;
}>();

const { getCommentsList } = useComments();
const replies = ref<Comments.Item[]>([]);

const fetchReplies = async () => {
  replies.value =
    (await getCommentsList("reply", props.commentId, {
      fields: ["id", "comment", "user_created.*", "date_created"],
      sort: ["-date_created"],
    })) || [];
};

const repliesCount = computed(() => replies.value.length);

onMounted(fetchReplies);

defineExpose({
  refresh: fetchReplies,
  repliesCount,
});
</script>
