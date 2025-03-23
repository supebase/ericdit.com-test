export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isAuthenticated, refreshUser } = useAuth();

  if (!user.value) {
    await refreshUser();
  }

  if (!isAuthenticated.value) {
    return navigateTo("/auth");
  }

  if (isAuthenticated.value && to.path === "/auth") {
    return navigateTo("/");
  }
});
