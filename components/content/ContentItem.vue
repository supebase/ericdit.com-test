<template>
  <article class="py-4">
    <div class="space-y-4">
      <NuxtLink :to="`/article/${content.id}`">
        <div class="text-lg mb-2">{{ content.title }}</div>
      </NuxtLink>
      <div v-if="content.images.length === 1">
        <img
          :src="useAssets(content.images[0].directus_files_id) || undefined"
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
          <img
            :src="useAssets(item.directus_files_id) || undefined"
            class="rounded-lg aspect-[calc(4*3+1)/8] object-cover" />
        </UCarousel>
      </div>
      <div class="flex items-center">
        <div class="flex items-center space-x-2 w-1/4">
          <UAvatar
            :src="useAssets(content.user_created.avatar) || undefined"
            size="xs" />
          <div class="text-sm text-neutral-400">
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
</script>
