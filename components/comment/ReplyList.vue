<template>
  <div class="reply-list ml-8 mt-2 space-y-2">
    <CommentReplyItem
      v-for="reply in displayReplies"
      :key="reply.id"
      :reply="reply" />

    <div
      v-if="replies.length > 2"
      class="text-sm">
      <button
        class="text-gray-500 hover:text-gray-700"
        @click="toggleExpand">
        {{ isExpanded ? "收起回复" : `更多回复 (${replies.length - 2})` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comments } from "~/types";

const props = defineProps<{
  commentId: string;
}>();

const { getCommentsList } = useComments();
const replies = ref<Comments.Item[]>([]);
const isExpanded = ref(false);

const fetchReplies = async () => {
  replies.value =
    (await getCommentsList("reply", props.commentId, {
      fields: ["id", "comment", "user_created.*", "date_created"],
      sort: ["-date_created"],
    })) || [];
};

const displayReplies = computed(() => {
  return isExpanded.value ? replies.value : replies.value.slice(0, 2);
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const repliesCount = computed(() => replies.value.length);

onMounted(fetchReplies);

defineExpose({
  refresh: fetchReplies,
  repliesCount,
});
</script>
