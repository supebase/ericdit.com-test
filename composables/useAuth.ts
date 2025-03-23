import type { User } from "~/types";

/**
 * 用户认证管理组合式函数
 * 提供用户认证相关功能：
 * - 用户登录
 * - 用户登出
 * - 刷新用户信息
 * - 认证状态管理
 */
export const useAuth = () => {
  const { $directus, $user, $authClient } = useNuxtApp();

  /**
   * 用户信息状态
   * null 表示未登录或登录失效
   */
  const user = useState<User.Profile | null>("auth:user", () => null);

  /**
   * 用户认证状态
   * true: 已登录
   * false: 未登录或登录失效
   */
  const isAuthenticated = computed(() => !!user.value);

  /**
   * 用户登录
   * @param email - 用户邮箱
   * @param password - 用户密码
   * @throws Error 当登录失败时抛出错误
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await $authClient.login(email, password);
      await refreshUser();
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "登录失败");
    }
  };

  /**
   * 用户登出
   * 清除用户认证信息和状态
   * @throws Error 当登出失败时抛出错误
   */
  const logout = async (): Promise<void> => {
    try {
      await $authClient.logout();
      user.value = null;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "登出失败");
    }
  };

  /**
   * 刷新用户信息
   * 获取最新的用户数据并更新状态
   * @throws Error 当获取用户信息失败时抛出错误
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await $directus.request<User.Profile>($user.readMe());
      user.value = response;
    } catch (error: any) {
      user.value = null;
      throw new Error(error.errors?.[0]?.message || "获取用户信息失败");
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
