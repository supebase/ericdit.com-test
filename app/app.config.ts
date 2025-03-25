/**
 * @file app.config.ts
 * @description 应用全局配置文件，包含UI主题、组件和交互行为的默认配置
 */

export default defineAppConfig({
  // UI 主题与组件配置
  ui: {
    // 颜色主题配置
    colors: {
      primary: "emerald", // 主要颜色：翠绿色
      neutral: "stone", // 中性色：石灰色
    },
    // 图标配置
    icons: {
      loading: "svg-spinners:ring-resize", // 加载动画图标
    },
    // 按钮组件配置
    button: {
      compoundVariants: [
        {
          class: {
            leadingIcon: "animate-none size-5", // 禁用按钮前置图标的动画效果
          },
        },
      ],
    },
  },

  // 消息提示配置
  toaster: {
    expand: false, // 禁用消息展开效果
    duration: 4000, // 消息显示持续时间（毫秒）
  },

  // 工具提示配置
  tooltip: {
    delayDuration: 300, // 提示显示延迟时间（毫秒）
  },
});
