import type { CollectionEntry } from "astro:content";

export type ArticleEntry = CollectionEntry<"articles">;
export type NoteEntry = CollectionEntry<"notes">;

export const getEntrySlug = (entry: ArticleEntry | NoteEntry) => entry.slug;

export const getEntryPath = (entry: ArticleEntry | NoteEntry) =>
  `/${entry.collection}/${getEntrySlug(entry)}`;

export const sortByDateDesc = <T extends ArticleEntry | NoteEntry>(
  entries: T[],
) => [...entries].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const formatDate = (date: Date) => {
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
};

export const formatNoteDate = (date: Date) => {
  const [y, mm, dd] = formatDate(date).split(".");
  return { y, md: `${mm}.${dd}` };
};

export const getTagColorClass = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("gpu") || t.includes("glsl")) return "gpu";
  if (t.includes("wasm") || t.includes("rust")) return "wasm";
  if (t.includes("css") || t.includes("web")) return "web";
  return "note";
};

export const getWritingDays = (entries: Array<ArticleEntry | NoteEntry>) => {
  if (entries.length === 0) return 0;

  const timestamps = entries.map((entry) => entry.data.date.valueOf());
  const first = Math.min(...timestamps);
  const last = Math.max(Date.now(), ...timestamps);
  const dayMs = 1000 * 60 * 60 * 24;

  return Math.max(1, Math.ceil((last - first) / dayMs));
};

export const getTagDistribution = (entries: Array<ArticleEntry | NoteEntry>) => {
  const total = entries.length || 1;
  const buckets = [
    {
      label: "WebGPU / 图形",
      className: "f1",
      tags: ["webgpu", "gpu", "glsl", "wgsl", "图形"],
    },
    {
      label: "Rust / WASM",
      className: "f2",
      tags: ["rust", "wasm"],
    },
    {
      label: "Web 前端",
      className: "f3",
      tags: ["css", "web", "浏览器"],
    },
    {
      label: "随笔思考",
      className: "f4",
      tags: ["随笔", "年终"],
    },
  ];

  return buckets.map((bucket) => {
    const count = entries.filter((entry) =>
      entry.data.tags.some((tag) =>
        bucket.tags.some((keyword) => tag.toLowerCase().includes(keyword.toLowerCase())),
      ),
    ).length;

    return {
      ...bucket,
      percentage: Math.round((count / total) * 100),
    };
  });
};
