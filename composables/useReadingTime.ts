interface ImageMeta {
  directus_files_id: string;
}

// 阅读速度配置
const READ_SPEED_CONFIG = {
  WORDS_PER_MINUTE: 200,
  CHINESE_CHARS_PER_MINUTE: 300,
  IMAGE_TIME: 0.25,
  CAROUSEL_BASE_TIME: 0.25,
  CODE_BLOCK_BASE_TIME: 0.3,
  CODE_LINE_TIME: 0.07,
} as const;

export const useReadingTime = (content: string, images?: Array<ImageMeta>): string => {
  const calculateCodeTime = (content: string): number => {
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.reduce((total, block) => {
      const lines = block.split("\n").length - 2;
      return (
        total + READ_SPEED_CONFIG.CODE_BLOCK_BASE_TIME + lines * READ_SPEED_CONFIG.CODE_LINE_TIME
      );
    }, 0);
  };

  const calculateTextTime = (content: string): number => {
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, "");
    const chineseChars = contentWithoutCode.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = contentWithoutCode
      .replace(/[\u4e00-\u9fa5]/g, "")
      .trim()
      .split(/\s+/).length;

    return (
      chineseChars / READ_SPEED_CONFIG.CHINESE_CHARS_PER_MINUTE +
      englishWords / READ_SPEED_CONFIG.WORDS_PER_MINUTE
    );
  };

  const calculateImageTime = (imagesCount: number): number => {
    return imagesCount > 0
      ? READ_SPEED_CONFIG.CAROUSEL_BASE_TIME + imagesCount * READ_SPEED_CONFIG.IMAGE_TIME
      : 0;
  };

  const calculateReadingTime = (content: string, imagesCount: number = 0): number => {
    if (!content) return 0;

    const codeTime = calculateCodeTime(content);
    const textTime = calculateTextTime(content);
    const imageTime = calculateImageTime(imagesCount);

    return Math.ceil(textTime + imageTime + codeTime);
  };

  const totalImages = (images?.length || 0) + (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

  return `${calculateReadingTime(content, totalImages)} 分钟`;
};
