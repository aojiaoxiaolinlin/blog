import { getCollection, render } from "astro:content";
import {
  type ArticleEntry,
  type NoteEntry,
  getTagDistribution,
  getWritingDays,
  sortByDateDesc,
} from "./content";

export interface RenderMetrics {
  minutesRead: number;
  characterCount: number;
  lastModified?: string;
}

export interface RenderedEntry<T extends ArticleEntry | NoteEntry> {
  entry: T;
  metrics: RenderMetrics;
}

const getMetrics = async (entry: ArticleEntry | NoteEntry): Promise<RenderMetrics> => {
  const { remarkPluginFrontmatter } = await render(entry);

  return {
    minutesRead: Number(remarkPluginFrontmatter.minutesRead || 1),
    characterCount: Number(remarkPluginFrontmatter.characterCount || 0),
    lastModified: remarkPluginFrontmatter.lastModified,
  };
};

export const getArticles = async () => sortByDateDesc(await getCollection("articles"));

export const getNotes = async () => sortByDateDesc(await getCollection("notes"));

export const getRenderedEntries = async <T extends ArticleEntry | NoteEntry>(
  entries: T[],
): Promise<RenderedEntry<T>[]> =>
  Promise.all(
    entries.map(async (entry) => ({
      entry,
      metrics: await getMetrics(entry),
    })),
  );

export const getRecentArticles = async (limit = 5) => {
  const articles = await getArticles();
  return getRenderedEntries(articles.slice(0, limit));
};

export const getRecentNotes = async (limit = 5) => {
  const notes = await getNotes();
  return getRenderedEntries(notes.slice(0, limit));
};

export const getSiteStats = async () => {
  const [articles, notes] = await Promise.all([getArticles(), getNotes()]);
  const renderedEntries = await getRenderedEntries([...articles, ...notes]);
  const totalReadMinutes = renderedEntries.reduce(
    (sum, item) => sum + item.metrics.minutesRead,
    0,
  );

  return {
    articleCount: articles.length,
    noteCount: notes.length,
    totalReadMinutes,
    writingDays: getWritingDays([...articles, ...notes]),
    tagDistribution: getTagDistribution([...articles, ...notes]),
  };
};
