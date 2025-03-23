/**
 * 资源 URL 缓存
 * 用于存储已经生成的资源 URL，避免重复计算
 * key: 原始资源路径
 * value: 完整的资源访问 URL
 */
const assetCache = new Map<string, string>();

/**
 * 资源 URL 生成组合式函数
 * 将相对资源路径转换为完整的 Directus 资源访问 URL
 *
 * @param image - 资源路径（可以是相对路径或完整 URL）
 * @returns 完整的资源访问 URL
 *
 * @example
 * ```ts
 * const avatarUrl = useAssets('users/avatar.jpg')
 * // 返回: https://api.example.com/assets/users/avatar.jpg
 *
 * const logoUrl = useAssets('brand/logo.png')
 * // 返回: https://api.example.com/assets/brand/logo.png
 * ```
 */
export const useAssets = (image: string): string => {
  // 从运行时配置获取 Directus API URL
  const { directusApiUrl } = useRuntimeConfig().public;

  // 构建基础 URL，确保以 /assets/ 结尾
  const baseUrl = new URL(directusApiUrl);
  baseUrl.pathname = "assets/";
  if (!baseUrl.pathname.endsWith("/")) {
    baseUrl.pathname += "/";
  }

  // 检查缓存中是否已存在该资源的 URL
  if (assetCache.has(image)) {
    return assetCache.get(image)!;
  }

  // 生成完整的资源 URL 并缓存
  const url = new URL(image, baseUrl).toString();
  assetCache.set(image, url);

  return url;
};
