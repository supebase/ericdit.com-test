<template>
  <div class="relative">
    <!-- 加载动画 -->
    <div
      v-if="imageLoading"
      class="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded-lg">
      <UIcon
        name="svg-spinners:6-dots-scale-middle"
        class="size-7 text-neutral-500" />
    </div>

    <!-- 图片组件 -->
    <component
      :is="ImageComponent"
      :src="refinedSrc"
      :alt="props.alt"
      :width="props.width"
      :height="props.height"
      @load="onImageLoad" />
  </div>
</template>

<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from "ufo";
import { useRuntimeConfig, computed } from "#imports";

import ImageComponent from "#build/mdc-image-component.mjs";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
});

const refinedSrc = computed(() => {
  if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL));
    if (_base !== "/" && !props.src.startsWith(_base)) {
      return joinURL(_base, props.src);
    }
  }
  return props.src;
});

// 添加图片加载状态
const imageLoading = ref(true);

// 图片加载完成处理函数
const onImageLoad = () => {
  imageLoading.value = false;
};
</script>
