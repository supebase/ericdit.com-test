import type { Likes } from "~/types";

export const useLikes = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const getLikes = async (options?: Likes.QueryOptions) => {
    try {
      const response = await $directus.request<Likes.Item[]>($content.readItems("likes", options));
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const createLike = async (data: Partial<Likes.Item>) => {
    try {
      const response = await $directus.request<Likes.Item>($content.createItem("likes", data));
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const deleteLike = async (id: string) => {
    try {
      await $directus.request($content.deleteItem("likes", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const subscribeLikes = async (query: Likes.QueryOptions, callback: (item: any) => void) => {
    const { subscription } = await $realtimeClient.subscribe("likes", { query });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      $realtimeClient.disconnect();
    };
  };

  return {
    getLikes,
    createLike,
    deleteLike,
    subscribeLikes,
  };
};
