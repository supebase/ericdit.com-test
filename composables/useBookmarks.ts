import type { Bookmarks } from "~/types";

export const useBookmarks = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const getBookmarks = async (options?: Bookmarks.QueryOptions) => {
    try {
      const response = await $directus.request<Bookmarks.Item[]>(
        $content.readItems("bookmarks", options)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const createBookmark = async (data: Partial<Bookmarks.Item>) => {
    try {
      const response = await $directus.request<Bookmarks.Item>(
        $content.createItem("bookmarks", data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await $directus.request($content.deleteItem("bookmarks", id));
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const subscribeBookmarks = async (
    query: Bookmarks.QueryOptions,
    callback: (item: any) => void
  ) => {
    const { subscription } = await $realtimeClient.subscribe("bookmarks", { query });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      $realtimeClient.disconnect();
    };
  };

  return {
    getBookmarks,
    createBookmark,
    deleteBookmark,
    subscribeBookmarks,
  };
};
