import type { User } from "~/types";

/**
 * 用户在线状态管理组合式函数
 *
 * 提供用户在线状态的实时追踪、更新和订阅功能：
 * - 自动追踪用户活动状态
 * - 实时更新用户在线/离线状态
 * - 支持其他用户状态订阅
 * - 处理用户离线超时检测
 */
export const useUserStatus = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();
  const user = useState<User.Profile | null>("auth:user");

  // 状态更新锁，防止并发更新
  let isUpdating = false;
  let activityTimeout: ReturnType<typeof setTimeout>;

  // 用户状态相关常量
  const ACTIVITY_TIMEOUT_MS = 1000; // 活动防抖时间
  const OFFLINE_THRESHOLD_MINUTES = 7; // 离线判定阈值
  const STATUS_CHECK_INTERVAL_MS = 60000; // 状态检查间隔

  /**
   * 更新用户在线状态
   * @param status - true 表示在线，false 表示离线
   * @returns Promise<void>
   */
  const updateUserStatus = async (status: boolean) => {
    if (!user.value?.id || isUpdating) return;

    try {
      isUpdating = true;
      const now = new Date().toISOString();

      const existingStatus = await $directus.request(
        $content.readItems("users_status", {
          filter: {
            user_created: { _eq: user.value.id },
          },
          limit: 1,
        })
      );

      if (existingStatus.length > 0) {
        await $directus.request(
          $content.updateItem("users_status", existingStatus[0].id, {
            status,
            last_activity_at: now,
          })
        );
      } else {
        await $directus.request(
          $content.createItem("users_status", {
            status,
            last_activity_at: now,
          })
        );
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      isUpdating = false;
    }
  };

  /**
   * 检查指定用户的在线状态
   * @param userId - 要检查的用户ID
   * @returns Promise<boolean> - true 表示在线，false 表示离线
   */
  const checkUserStatus = async (userId: string): Promise<boolean> => {
    try {
      const response = await $directus.request<User.Status[]>(
        $content.readItems("users_status", {
          filter: {
            user_created: { _eq: userId },
          },
          limit: 1,
        })
      );

      if (!response.length) return false;

      const lastActivity = new Date(response[0].last_activity_at || "");
      const now = new Date();
      const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

      if (diffMinutes > OFFLINE_THRESHOLD_MINUTES) {
        return false;
      }

      return response[0].status;
    } catch (error) {
      console.error("Failed to check user status:", error);
      return false;
    }
  };

  /**
   * 订阅用户状态变化
   * @param userId - 要订阅的用户ID
   * @param callback - 状态变化时的回调函数
   * @returns 清理函数，用于取消订阅
   */
  const subscribeUserStatus = async (userId: string, callback: (status: boolean) => void) => {
    try {
      const { subscription } = await $realtimeClient.subscribe("users_status", {
        query: {
          filter: {
            user_created: { _eq: userId },
          },
          fields: ["status", "last_activity_at"],
        },
      });

      const checkInterval = setInterval(async () => {
        const status = await checkUserStatus(userId);
        callback(status);
      }, STATUS_CHECK_INTERVAL_MS);

      for await (const item of subscription) {
        if (!item) continue;

        if (item.event === "update" || item.event === "create") {
          const status = await checkUserStatus(userId);
          callback(status);
        }
      }

      return () => clearInterval(checkInterval);
    } catch (error) {
      console.error("Failed to subscribe to user status:", error);
    }
  };

  /**
   * 防抖处理的活动状态更新函数
   */
  const debouncedUpdateActivity = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      if (user.value?.id) {
        updateUserStatus(true);
      }
    }, ACTIVITY_TIMEOUT_MS);
  };

  /**
   * 清理函数
   */
  const cleanup = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
  };

  return {
    updateUserStatus,
    checkUserStatus,
    updateLastActivity: debouncedUpdateActivity,
    subscribeUserStatus,
    cleanup,
  };
};
