import type { Bookmarks } from "~/types";

/**
 * 书签管理组合式函数
 * 提供书签相关的功能：
 * - 获取书签列表
 * - 创建新书签
 * - 删除书签
 * - 订阅书签变化
 */
export const useBookmarks = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  /**
   * 获取书签列表
   * @param options - 查询选项，包含过滤、排序、分页等条件
   * @returns Promise<Bookmarks.Item[]> 书签列表
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getBookmarks = async (options?: Bookmarks.QueryOptions): Promise<Bookmarks.Item[]> => {
    try {
      const response = await $directus.request<Bookmarks.Item[]>(
        $content.readItems("bookmarks", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取书签列表失败");
    }
  };

  /**
   * 创建新书签
   * @param data - 书签数据，包含文章ID等必要信息
   * @returns Promise<Bookmarks.Item> 创建成功的书签
   * @throws Error 当 API 请求失败时抛出错误
   */
  const createBookmark = async (data: Partial<Bookmarks.Item>): Promise<Bookmarks.Item> => {
    try {
      const response = await $directus.request<Bookmarks.Item>(
        $content.createItem("bookmarks", data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "创建书签失败");
    }
  };

  /**
   * 删除指定书签
   * @param id - 要删除的书签ID
   * @throws Error 当 API 请求失败时抛出错误
   */
  const deleteBookmark = async (id: string): Promise<void> => {
    try {
      await $directus.request($content.deleteItem("bookmarks", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "删除书签失败");
    }
  };

  /**
   * 订阅书签变化
   * @param query - 订阅查询条件
   * @param callback - 数据变化时的回调函数
   * @returns 取消订阅的清理函数
   */
  // ... 其他代码保持不变 ...

  const subscribeBookmarks = async (
    query: Bookmarks.QueryOptions,
    callback: (item: any) => void
  ): Promise<() => void> => {
    let subscription: any;

    const subscribe = async () => {
      try {
        const result = await $realtimeClient.subscribe("bookmarks", { query });
        subscription = result.subscription;

        for await (const item of subscription) {
          callback(item);
        }
      } catch (error) {
        console.error("Subscription error:", error);
        // 重试订阅
        setTimeout(subscribe, 3000);
      }
    };

    await subscribe();

    return () => {
      if (subscription) {
        subscription.return();
      }
    };
  };

  // ... 其他代码保持不变 ...

  return {
    getBookmarks,
    createBookmark,
    deleteBookmark,
    subscribeBookmarks,
  };
};
