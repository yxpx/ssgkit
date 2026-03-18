import path from "node:path";
import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { slugFromFilePath } from "../utils/slugify.js";

export async function parseMarkdownFile(filePath, contentRoot) {
  const raw = await readFile(filePath, "utf8");
  const parsed = matter(raw);
  const meta = { ...(parsed.data || {}) };

  if (meta.date instanceof Date) {
    meta.date = meta.date.toISOString().slice(0, 10);
  }

  const relPath = path.relative(process.cwd(), filePath).replaceAll("\\", "/");
  const relToContent = path.relative(contentRoot, filePath).replaceAll("\\", "/");
  const parts = relToContent.split("/");
  const collection = parts.length > 1 ? parts[0] : "pages";

  return {
    path: relPath,
    sourcePath: filePath,
    slug: slugFromFilePath(filePath),
    collection,
    meta,
    body: parsed.content.trim()
  };
}
