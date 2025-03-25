<template>
  <article class="py-3 space-y-5">
    <div class="text-xl font-bold">{{ content.title }}</div>
    <div class="flex justify-between items-center text-sm text-neutral-500 select-none">
      <div class="flex items-center space-x-3">
        <UAvatar
          :src="useAssets(content.user_created.avatar) || undefined"
          size="sm" />
        <div class="text-neutral-50">
          {{ content.user_created.first_name }}
        </div>
        <div>&bull;</div>
        <div>
          {{ useDatetime(content.date_created) }}
        </div>
      </div>
      <div>阅读约需 {{ useReadingTime(content.body) }}</div>
    </div>

    <Suspense>
      <template #default>
        <MDC
          :value="content.body"
          class="prose dark:prose-invert mdc-prose" />
      </template>
      <template #fallback>
        <div class="flex justify-center items-center text-primary-500 space-x-2 h-42">
          <UIcon
            name="svg-spinners:pulse-rings-3"
            class="size-8" />
          <div class="text-sm">正在渲染，请稍等。</div>
        </div>
      </template>
    </Suspense>

    <div class="flex justify-between items-center select-none">
      <CommonLikeButton
        :content-id="content.id"
        :icon-size="20" />
      <CommonBookmarkButton
        :content-id="content.id"
        :icon-size="20" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Contents } from "~/types";

defineProps<{
  content: Contents.Item;
}>();

// 创建一个异步组件包装器，仅测试加载效果
// const MDC = defineAsyncComponent(async () => {
//   // 添加延迟用于测试
//   await new Promise(resolve => setTimeout(resolve, 300000));
//   return import('~/app.vue');
// })
</script>
