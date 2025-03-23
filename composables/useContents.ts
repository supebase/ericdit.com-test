import type { Contents } from "~/types";

export const useContents = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  /**
   * 获取内容列表
   */
  const getContents = async (options?: Contents.QueryOptions): Promise<Contents.Item[] | null> => {
    try {
      const response = await $directus.request<Contents.Item[]>(
        $content.readItems("contents", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  /**
   * 获取单个内容详情
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
      throw new Error(error.errors?.[0]?.message);
    }
  };

  /**
   * 订阅内容更新
   */
  const subscribeContents = async (query: Contents.QueryOptions, callback: (item: any) => void) => {
    const { subscription } = await $realtimeClient.subscribe("contents", { query });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      $realtimeClient.disconnect();
    };
  };

  return {
    getContents,
    getContent,
    subscribeContents,
  };
};
