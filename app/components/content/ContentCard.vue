<template>
  <article class="py-4 select-none">
    <NuxtLink :to="{ name: 'article-id', params: { id: content.id } }">
      <!-- 非单图模式的标题显示 -->
      <div
        v-if="displayType !== 'single'"
        class="text-lg mb-2">
        {{ content.title }}
      </div>

      <!-- 单图显示 -->
      <div
        v-if="displayType === 'single'"
        class="relative">
        <div
          v-if="singleImageLoading"
          class="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded-lg">
          <UIcon
            name="svg-spinners:6-dots-scale-middle"
            class="size-7 text-neutral-500" />
        </div>
        <img
          :src="useAssets(content.images[0].directus_files_id) || undefined"
          @load="onImageLoad('single')"
          class="rounded-lg aspect-[calc(4*3+1)/8] object-cover w-full" />
        <div
          class="absolute bottom-0 left-0 right-0 p-3 m-2 bg-black/50 backdrop-blur-sm rounded-lg">
          <div class="text-base text-white text-center">{{ content.title }}</div>
        </div>
      </div>

      <!-- 文本内容显示 -->
      <div
        v-else-if="displayType === 'text'"
        class="line-clamp-3 text-base text-neutral-400">
        {{ cleanBody }}
      </div>

      <!-- 图库轮播显示 -->
      <div v-else>
        <UCarousel
          v-slot="{ item }: { item: { directus_files_id: string } }"
          autoplay
          class-names
          wheel-gestures
          :items="content.images"
          :ui="{
            item: 'basis-[85%] transition-opacity [&:not(.is-snapped)]:opacity-40 duration-500',
          }">
          <div class="relative">
            <div
              v-if="carouselImageLoading"
              class="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded-lg">
              <UIcon
                name="svg-spinners:6-dots-scale-middle"
                class="size-7 text-neutral-500" />
            </div>
            <img
              :src="useAssets(item.directus_files_id) || undefined"
              @load="onImageLoad('carousel')"
              class="rounded-lg aspect-[calc(4*3+1)/8] object-cover" />
          </div>
        </UCarousel>
      </div>
    </NuxtLink>

    <div class="flex justify-between items-center mt-4">
      <div class="flex items-center space-x-2">
        <UAvatar
          :src="useAssets(content.user_created.avatar) || undefined"
          size="xs"
          loading="lazy" />
        <div class="text-sm text-neutral-400 nums tabular-nums">
          {{ useDateFormatter(content.date_created) }}
        </div>
      </div>

      <SharedCommentCounter
        :content-id="content.id"
        :allow-comments="content.allow_comments"
        :icon-size="18" />
      <SharedLikeButton
        :content-id="content.id"
        :icon-size="18" />
      <SharedBookmarkButton
        :content-id="content.id"
        :icon-size="18" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

const props = defineProps<{
  content: Contents.Item;
}>();

const { cleanMarkdown } = useContents();

// 处理后的文本内容
const cleanBody = computed(() => cleanMarkdown(props.content.body));

// 图片加载状态
const singleImageLoading = ref(true);
const carouselImageLoading = ref(true);

// 计算显示类型
const displayType = computed(() => {
  const { images, content_type_id } = props.content;

  // 如果没有图片，显示文本
  if (!images?.length) return "text";

  // 如果只有一张图片，显示单图
  if (images.length === 1) return "single";

  // 如果是图库类型且有多张图片，显示轮播
  if (content_type_id.name === "pictures" && images.length > 1) return "carousel";

  // 默认显示文本
  return "text";
});

// 图片加载完成处理函数
const onImageLoad = (type: "single" | "carousel") => {
  if (type === "single") {
    singleImageLoading.value = false;
  } else {
    carouselImageLoading.value = false;
  }
};
</script>
