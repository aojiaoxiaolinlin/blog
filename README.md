# VOID.dev

一个基于 Astro 构建的个人技术博客与作品站，内容以文章、短笔记和实验型展示为主。

## 技术栈

- Astro 5
- MDX 内容集合
- Tailwind CSS 4
- Astro Expressive Code
- 自定义 `remark` / `rehype` 插件
- Vercel 适配器

## 目录结构

```text
src/
  components/     页面组件与文章组件
  content/        文章、笔记与内容 schema
  layouts/        全局布局
  lib/            内容数据与公共工具
  pages/          首页、归档页与详情页
  styles/         全局样式与组件样式
```

## 本地开发

```sh
pnpm install
pnpm dev
```

## 构建与检查

```sh
pnpm astro check
pnpm build
pnpm preview
```

## rust wasm 编译

```sh
cargo build --target wasm32-unknown-unknown --release

wasm-pack build --target web --out-dir pkg --release
```

如果本机没有全局 `pnpm`，也可以直接调用项目内的 Astro CLI。

## 当前实现

- 文章与笔记都通过 Astro Content Collections 管理
- 首页展示最近文章、最近笔记和实验区块
- `/articles` 与 `/notes` 提供完整归档页
- 详情页支持目录、代码高亮、数学公式、GFM、自定义指令和更新时间
- 站内统计改为由内容集合实时计算，不再依赖随机或硬编码数字

## 后续可继续完善

- 真正的 RSS 输出
- 邮件订阅后端
- 标签归档页与搜索
- 真实项目链接与社交资料
