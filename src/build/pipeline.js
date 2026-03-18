import path from "node:path";
import { rm } from "node:fs/promises";
import { crawlMarkdownFiles } from "../ingest/crawler.js";
import { parseMarkdownFile } from "../ingest/parser.js";
import { validateFrontmatter } from "../schema/validate.js";
import { markdownToSanitizedHtml } from "../markdown/md-to-html.js";
import { renderSite } from "../render/renderer.js";

export async function readAndValidate(contentDir) {
  const files = await crawlMarkdownFiles(contentDir);
  const docs = [];
  const errors = [];

  for (const filePath of files) {
    const doc = await parseMarkdownFile(filePath, contentDir);
    const result = validateFrontmatter(doc.meta);
    if (!result.valid) {
      errors.push({ filePath: doc.path, errors: result.errors });
      continue;
    }
    docs.push(doc);
  }

  return { docs, errors };
}

function groupCollections(docs) {
  const groups = {};
  for (const doc of docs) {
    if (!groups[doc.collection]) {
      groups[doc.collection] = [];
    }
    groups[doc.collection].push(doc);
  }
  return groups;
}

export async function buildSite({
  contentDir = path.resolve("content"),
  templatesRoot = path.resolve("templates"),
  outputDir = path.resolve("output")
} = {}) {
  const { docs, errors } = await readAndValidate(contentDir);

  if (errors.length > 0) {
    return {
      ok: false,
      phase: "validate",
      errors
    };
  }

  const pages = docs.map((doc) => ({
    ...doc,
    html: markdownToSanitizedHtml(doc.body)
  }));

  const collections = groupCollections(pages);

  await rm(outputDir, { recursive: true, force: true });
  const generatedFiles = await renderSite({
    pages,
    collections,
    templatesRoot,
    outputDir
  });

  return {
    ok: true,
    pages,
    collections,
    generatedFiles
  };
}
