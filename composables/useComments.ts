import type { Comments } from "~/types";

export const useComments = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const getComments = async (contentId: string, options?: Comments.QueryOptions) => {
    try {
      const response = await $directus.request<Comments.Item[]>(
        $content.readItems("comments", {
          ...options,
          filter: {
            ...options?.filter,
            content_id: { _eq: contentId },
          },
        })
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const getReplies = async (commentId: string, options?: Comments.QueryOptions) => {
    try {
      const response = await $directus.request<Comments.Item[]>(
        $content.readItems("comments", {
          ...options,
          filter: {
            ...options?.filter,
            parent_comment_id: { _eq: commentId },
          },
        })
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const createComment = async (data: Partial<Comments.Item>) => {
    try {
      const response = await $directus.request<Comments.Item>(
        $content.createItem("comments", data)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.errors?.[0]?.message);
    }
  };

  const subscribeComments = async (contentId: string, callback: (item: any) => void) => {
    const { subscription } = await $realtimeClient.subscribe("comments", {
      query: {
        filter: {
          content_id: { _eq: contentId },
        },
      },
    });

    for await (const item of subscription) {
      callback(item);
    }

    return () => {
      $realtimeClient.disconnect();
    };
  };

  return {
    getComments,
    getReplies,
    createComment,
    subscribeComments,
  };
};
