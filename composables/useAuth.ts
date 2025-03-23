import type { User } from "~/types";

export const useAuth = () => {
  const { $directus, $user, $authClient } = useNuxtApp();

  const user = useState<User.Profile | null>("auth:user", () => null);
  const isAuthenticated = computed(() => !!user.value);

  const login = async (email: string, password: string) => {
    try {
      await $authClient.login(email, password);
      await refreshUser();
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const logout = async () => {
    try {
      await $authClient.logout();
      user.value = null;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await $directus.request<User.Profile>($user.readMe());
      user.value = response;
    } catch (error: any) {
      user.value = null;
      throw new Error(error.errors?.[0]?.message);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };
};
