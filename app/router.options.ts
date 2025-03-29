import type { RouterConfig } from "@nuxt/schema";

// 添加安全导航函数
export const safeBack = () => {
  const route = useRoute();
  const history = JSON.parse(localStorage.getItem("routeHistory") || "[]");
  const originalPath = localStorage.getItem("originalPath");

  // 如果是从登录/注册页面返回
  if (route.path.includes("/login") || route.path.includes("/register")) {
    // 如果有登录前的页面记录，优先返回该页面
    if (originalPath && !originalPath.includes("/login") && !originalPath.includes("/register")) {
      localStorage.removeItem("originalPath");
      return navigateTo(originalPath);
    }
    return navigateTo("/");
  }

  // 正常的返回逻辑
  if (history.length > 0 && history[history.length - 1] === route.path) {
    history.pop();
  }

  let previousPath = history.length > 0 ? history.pop() : "/";
  if (previousPath.includes("/login") || previousPath.includes("/register")) {
    previousPath = "/";
  }

  localStorage.setItem("routeHistory", JSON.stringify(history));
  return navigateTo(previousPath);
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
