import type { User } from "~/types";

export const useUserStatus = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();
  const user = useState<User.Profile | null>("auth:user");
  const usersStatus = useState<Record<string, boolean>>("users:status", () => ({}));

  // 状态更新锁，防止并发更新
  let isUpdating = false;
  let activityTimeout: ReturnType<typeof setTimeout>;

  // 用户状态相关常量
  const ACTIVITY_TIMEOUT_MS = 1000;
  const OFFLINE_THRESHOLD_MINUTES = 7;
  const STATUS_CHECK_INTERVAL_MS = 60000;

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

      const status = diffMinutes <= OFFLINE_THRESHOLD_MINUTES && response[0].status;
      usersStatus.value[userId] = status;
      return status;
    } catch (error) {
      console.error("Failed to check user status:", error);
      return false;
    }
  };

  const subscribeUserStatus = async (userId: string) => {
    if (usersStatus.value[userId] !== undefined) return;

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
        await checkUserStatus(userId);
      }, STATUS_CHECK_INTERVAL_MS);

      for await (const item of subscription) {
        if (!item) continue;

        if (item.event === "update" || item.event === "create") {
          await checkUserStatus(userId);
        }
      }

      return () => clearInterval(checkInterval);
    } catch (error) {
      console.error("Failed to subscribe to user status:", error);
    }
  };

  const debouncedUpdateActivity = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      if (user.value?.id) {
        updateUserStatus(true);
      }
    }, ACTIVITY_TIMEOUT_MS);
  };

  const cleanup = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
  };

  return {
    usersStatus,
    updateUserStatus,
    checkUserStatus,
    updateLastActivity: debouncedUpdateActivity,
    subscribeUserStatus,
    cleanup,
  };
};
