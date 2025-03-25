<template>
  <article class="py-4">
    <div class="space-y-4">
      <NuxtLink :to="`/article/${content.id}`">
        <div class="text-lg mb-2">{{ content.title }}</div>
      </NuxtLink>
      <div
        v-if="content.images.length === 1"
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
          class="rounded-lg aspect-[calc(4*3+1)/8] object-cover" />
      </div>
      <div
        class="line-clamp-3 text-neutral-400"
        v-else-if="content.content_type_id.name !== 'pictures'">
        {{ content.body }}
      </div>
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
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <UAvatar
            :src="useAssets(content.user_created.avatar) || undefined"
            size="xs" />
          <div class="text-sm text-neutral-400 nums">
            {{ useDatetime(content.date_created) }}
          </div>
        </div>

        <CommonCommentsCounter
          :content-id="content.id"
          :allow-comments="content.allow_comments"
          :icon-size="18" />
        <CommonLikeButton
          :content-id="content.id"
          :icon-size="18" />
        <CommonBookmarkButton
          :content-id="content.id"
          :icon-size="18" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

defineProps<{
  content: Contents.Item;
}>();

// 图片加载状态
const singleImageLoading = ref(true);
const carouselImageLoading = ref(true);

// 图片加载完成处理函数
const onImageLoad = (type: "single" | "carousel") => {
  if (type === "single") {
    singleImageLoading.value = false;
  } else {
    carouselImageLoading.value = false;
  }
};
</script>
