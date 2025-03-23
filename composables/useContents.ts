import type { Contents } from "~/types";

/**
 * 内容管理组合式函数
 * 提供内容相关的查询和实时订阅功能：
 * - 获取内容列表
 * - 获取单个内容详情
 * - 订阅内容更新
 */
export const useContents = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  /**
   * 获取内容列表
   * @param options - 查询选项，包含过滤、排序、分页等条件
   * @returns Promise<Contents.Item[]> 内容列表
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getContents = async (options?: Contents.QueryOptions): Promise<Contents.Item[] | null> => {
    try {
      const response = await $directus.request<Contents.Item[]>(
        $content.readItems("contents", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取内容列表失败");
    }
  };

  /**
   * 获取单个内容详情
   * @param id - 内容ID
   * @param options - 查询选项，可指定需要返回的字段等
   * @returns Promise<Contents.Item> 内容详情
   * @throws Error 当 API 请求失败时抛出错误
   */
  const getContent = async (
    id: string,
    options?: Contents.QueryOptions
  ): Promise<Contents.Item | null> => {
    try {
      const response = await $directus.request<Contents.Item>(
        $content.readItem("contents", id, options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message || "获取内容详情失败");
    }
  };

  /**
   * 订阅内容更新
   * @param query - 订阅查询条件，用于过滤需要监听的内容
   * @param callback - 数据变化时的回调函数
   * @returns 取消订阅的清理函数
   */
  const subscribeContents = async (
    query: Contents.QueryOptions,
    callback: (item: any) => void
  ): Promise<() => void> => {
    const { subscription } = await $realtimeClient.subscribe("contents", { query });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      subscription.return();
    };
  };

  return {
    getContents,
    getContent,
    subscribeContents,
  };
};
