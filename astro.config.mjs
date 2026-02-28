import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { remarkReadingTime } from './remark-reading-time.mjs'
import { remarkModifiedTime } from './remark-modified-time.mjs'
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import { remarkDirectiveRehype } from './remark-directive-rehype.mjs';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeImgSize from 'rehype-img-size';
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const voidDarkTheme = JSON.parse(
  readFileSync(path.join(__dirname, 'src/styles/void-dark-theme.json'), 'utf-8')
);


/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const expressiveCodeOptions = {
  // Theme matching VOID.dev dark palette
  themes: [voidDarkTheme],
  plugins: [pluginLineNumbers()],
  defaultProps: {
    showLineNumbers: true,
  },
  // ─── 3. 全局样式变量覆盖 ───────────────────
  styleOverrides: {

    // 字体
    codeFontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    codeFontSize: '0.825rem',
    codeLineHeight: '1.72',
    uiFontFamily: "'Fira Code', 'JetBrains Mono', monospace",

    // 圆角
    borderRadius: '8px',

    // 代码背景
    codeBackground: '#070712',

    // 选中文字
    codeSelectionBackground: 'rgba(124,106,245,0.22)',

    frames: {
      // ── Header 背景 ──────────────────────────────
      editorTabBarBackground: '#111120',
      terminalTitlebarBackground: '#111120',

      // ── Active tab（语言标签）────────────────────
      // 背景透明 → 融入 header
      editorActiveTabBackground: '#070712',
      editorActiveTabForeground: '#6b6880',

      // ★ 关键：把 tab 上下指示线都设为透明 → 消除下划线
      editorActiveTabIndicatorTopColor: 'transparent',
      editorActiveTabIndicatorBottomColor: 'transparent',

      // ★ 关键：把 tab 的左右边框也去掉
      editorActiveTabBorderColor: 'transparent',

      // Tab bar 底部分割线
      editorTabBarBorderBottomColor: 'rgba(255,255,255,0.08)',

      // 非激活 tab（多 tab 场景）
      editorTabBarBackground: '#111120',

      // ── 终端帧 ───────────────────────────────────
      terminalTitlebarForeground: '#5e5b72',
      terminalTitlebarBorderBottomColor: 'rgba(255,255,255,0.08)',

      // ★ 终端圆点颜色（expressive-code 通过这三个变量控制）
      terminalTitlebarDotsForeground: '#111120',  // dot 内部色
      terminalTitlebarDotsOpacity: '1',

      // ── 复制按钮 ──────────────────────────────────
      inlineButtonBackground: 'transparent',
      inlineButtonBorder: 'rgba(255,255,255,0.12)',
      inlineButtonForeground: '#6b6880',
      inlineButtonHoverBackground: 'rgba(255,255,255,0.06)',
      inlineButtonHoverForeground: '#e8e6f0',

      // 复制成功提示
      tooltipSuccessBackground: 'rgba(106,245,200,0.15)',
      tooltipSuccessForeground: '#6af5c8',

      // ── 阴影 ──────────────────────────────────────
      frameBoxShadowCssValue:
        '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
    },

    // ── 行号 ──────────────────────────────────────
    // 注意：需在 MDX 里用 showLineNumbers 或全局开启
    codeLineNumbersForeground: 'rgba(255,255,255,0.16)',
    codeLineNumbersBorderColor: 'rgba(255,255,255,0.06)',

    // ── 标记高亮行 ────────────────────────────────
    codeHighlightLineBgColor: 'rgba(255,255,255,0.04)',
    codeHighlightLineMarkerColor: 'rgba(124,106,245,0.65)',

    // ── diff ──────────────────────────────────────
    insDiffIndicatorColor: '#6af5c8',
    delDiffIndicatorColor: '#f56a6a',
    insLineBgColor: 'rgba(106,245,200,0.06)',
    delLineBgColor: 'rgba(245,106,106,0.08)',
  },

  // ─── 4. Shiki 变换器：行悬停高亮 ──────────
  shikiConfig: {
    transformers: [
      // 鼠标悬停高亮当前行（需要配合下方 CSS）
    ],
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [expressiveCode(expressiveCodeOptions), mdx(), react(), partytown()],

  markdown: {
    shikiConfig: {
      theme: 'dracula',
      // 让 code-block 内部的 <pre> 背景变为透明，以便应用我们在 CSS 中的渐变或纯色背景 `#070712`
      wrap: true,
    },
    remarkPlugins: [
      remarkGfm,
      remarkReadingTime,
      remarkModifiedTime,
      remarkMath,
      remarkDirective,
      remarkDirectiveRehype,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypeKatex,
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      [rehypeImgSize, { dir: 'public' }]
    ]
  },

  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['fiducially-nemoricole-wanita.ngrok-free.dev']
    },
    server: {
      allowedHosts: ['fiducially-nemoricole-wanita.ngrok-free.dev']
    }
  }
});