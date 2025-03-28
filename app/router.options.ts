import type { RouterConfig } from "@nuxt/schema";

// 添加安全导航函数
export const safeBack = () => {
  // 获取原始来源页面
  const originalPath = localStorage.getItem("originalPath") || "/";
  // 清除存储的路径
  localStorage.removeItem("originalPath");

  return navigateTo(originalPath);
};

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return {
        ...savedPosition,
      };
    }

    if (to.hash) {
      return {
        el: to.hash,
      };
    }

    return {
      top: 0,
      left: 0,
    };
  },
};
