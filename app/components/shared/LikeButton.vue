<template>
  <div class="flex justify-end items-center">
    <button
      @click="handleLike"
      :disabled="!isAuthenticated || isProcessing"
      class="text-sm flex items-center space-x-2 text-neutral-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'text-primary-400': isLiked }">
      <UIcon
        name="svg-spinners:ring-resize"
        :size="iconSize"
        class="text-neutral-500"
        v-if="isProcessing" />
      <UIcon
        v-else
        :name="isLiked ? 'hugeicons:heart-check' : 'hugeicons:favourite'"
        :size="iconSize" />
      <div class="flex items-center tabular-nums">
        <div
          v-for="(digit, index) in displayDigits"
          :key="index"
          class="number-column">
          <div
            class="number-scroll"
            :style="{ transform: `translateY(${digit * -10}%)` }">
            <div
              v-for="n in 10"
              :key="n"
              class="number-cell">
              {{ n - 1 }}
            </div>
          </div>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  commentId?: string;
  contentId?: string;
  iconSize?: number;
}>();

const { isAuthenticated } = useAuth();
const { getLikes, createLike, deleteLike, subscribeLikes } = useLikes();

const isLiked = ref(false);
const likesCount = ref(0);
const currentLikeId = ref<string | null>(null);
const isProcessing = ref(false);

// 将数字转换为数字数组
const displayDigits = computed(() => {
  return String(likesCount.value).padStart(1, "0").split("").map(Number);
});

const fetchLikes = async () => {
  try {
    const filter: Record<string, any> = {};
    if (props.commentId) {
      filter.comment_id = { _eq: props.commentId };
    } else if (props.contentId) {
      filter.content_id = { _eq: props.contentId };
    }

    const likes = await getLikes({
      fields: ["id", "user_created.id"],
      filter,
    });

    likesCount.value = likes.length;
    const currentUserId = useAuth().user.value?.id;
    const userLike = likes.find((like) => like.user_created?.id === currentUserId);

    isLiked.value = false;
    currentLikeId.value = null;

    if (userLike) {
      isLiked.value = true;
      currentLikeId.value = userLike.id;
    }
  } catch (error) {
    console.error("Failed to fetch likes:", error);
  }
};

const handleLikeAction = async () => {
  if (!isAuthenticated.value || isProcessing.value) return;

  try {
    isProcessing.value = true;

    if (isLiked.value && currentLikeId.value) {
      await deleteLike(currentLikeId.value);
      likesCount.value--;
      isLiked.value = false;
      currentLikeId.value = null;
    } else {
      const newLike = await createLike({
        comment_id: props.commentId,
        content_id: props.contentId,
      });
      likesCount.value++;
      isLiked.value = true;
      currentLikeId.value = newLike.id;
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
  } finally {
    isProcessing.value = false;
  }
};

const handleLike = useDebounceFn(handleLikeAction, 500);

onMounted(async () => {
  subscribeLikes(
    {
      fields: ["id", "user_created.id"],
    },
    async (event) => {
      if (["create", "delete"].includes(event.event)) {
        await fetchLikes();
      }
    }
  );

  await fetchLikes();
});

watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    isLiked.value = false;
    currentLikeId.value = null;
  } else {
    fetchLikes();
  }
});
</script>

<style scoped>
.number-column {
  display: inline-block;
  height: 1.25em;
  overflow: hidden;
  position: relative;
}

.number-scroll {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.number-cell {
  height: 1.25em;
  width: 0.6em;
  text-align: center;
  line-height: 1.25em;
}
</style>
