export default defineNuxtPlugin(() => {
  const route = useRoute();

  // 监听路由变化
  watch(
    () => route.path,
    (newPath) => {
      if (!newPath.includes("/login") && !newPath.includes("/register")) {
        localStorage.setItem("originalPath", newPath);
      }
    },
    { immediate: true }
  );
});
