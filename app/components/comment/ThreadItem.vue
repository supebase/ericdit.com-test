<template>
  <UCard
    :ui="{ root: replyCount ? '' : 'divide-none', body: replyCount ? 'p-4 sm:p-6' : 'p-0 sm:p-0' }"
    variant="soft"
    class="my-8">
    <template #header>
      <div class="-space-y-2">
        <div class="flex">
          <div class="mr-3">
            <UChip
              inset
              position="bottom-right"
              :color="userStatus ? 'primary' : 'neutral'">
              <UAvatar
                :src="useAssets(comment.user_created.avatar || '')"
                :alt="!comment.user_created.avatar ? comment.user_created.first_name : undefined"
                size="sm"
                loading="lazy"
                class="uppercase" />
            </UChip>
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3 text-sm nums tabular-nums">
                <div class="text-base font-medium">{{ comment.user_created.first_name }}</div>
                <div class="text-neutral-500">
                  {{ useDateFormatter(comment.date_created) }}
                </div>
                <UIcon
                  name="hugeicons:arrow-right-01"
                  class="size-3 text-neutral-500" />
                <div class="text-neutral-500">
                  {{ comment.user_created.location }}
                </div>
              </div>

              <SharedLikeButton
                :comment-id="comment.id"
                :icon-size="18" />
            </div>
          </div>
        </div>
        <div
          class="ml-10 cursor-pointer"
          @click="toggleReplyInput">
          {{ comment.comment }}
        </div>
        <div class="mt-3 ml-10">
          <button
            @click="toggleReplyInput"
            class="text-sm text-neutral-500 nums tabular-nums cursor-pointer">
            {{ replyCount > 0 ? `${replyCount} 条回复` : "回复" }}
          </button>
        </div>
      </div>

      <div
        class="transform transition-all duration-500 ease-in-out"
        :class="
          isReplying
            ? 'scale-100 opacity-100 max-h-[110px]'
            : 'scale-0 opacity-0 max-h-0 overflow-hidden'
        ">
        <div class="mt-3">
          <CommentEditor
            :placeholder="`回复：${comment.user_created.first_name}`"
            :is-submitting="isSubmitting"
            @submit="handleSubmit" />
          <UIcon
            v-if="isReplying"
            @click="cancelReply"
            name="hugeicons:cancel-circle"
            class="size-5 text-neutral-500 cursor-pointer absolute -top-2 -right-1" />
        </div>
      </div>
    </template>

    <CommentReplyThread
      ref="replyListRef"
      :comment-id="comment.id" />
  </UCard>
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

const { checkUserStatus, subscribeUserStatus, cleanup, usersStatus } = usePresence() as {
  checkUserStatus: (userId: string) => Promise<boolean>;
  subscribeUserStatus: (userId: string) => Promise<void>;
  cleanup: () => void;
  usersStatus: Ref<Record<string, boolean>>;
};
const userStatus = ref(false);

onMounted(async () => {
  if (import.meta.client) {
    // 先订阅，再检查状态
    await subscribeUserStatus(props.comment.user_created.id);
    userStatus.value = await checkUserStatus(props.comment.user_created.id);

    watch(
      () => usersStatus.value[props.comment.user_created.id],
      (newStatus) => {
        if (newStatus !== undefined) {
          // 添加undefined检查
          userStatus.value = newStatus;
        }
      },
      { immediate: true } // 立即执行一次
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
