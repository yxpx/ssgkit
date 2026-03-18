import { readdir } from "node:fs/promises";
import path from "node:path";

async function walk(dir, out) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, out);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(fullPath);
    }
  }
}

export async function crawlMarkdownFiles(contentDir) {
  const files = [];
  await walk(contentDir, files);
  files.sort();
  return files;
}
