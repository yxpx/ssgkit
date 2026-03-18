import path from "node:path";

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugFromFilePath(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return slugify(name);
}
