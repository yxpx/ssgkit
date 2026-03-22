import { createMarkdownRenderer } from "./md-config.js";
import { sanitizeRenderedHtml } from "./sanitizer.js";

const md = createMarkdownRenderer();

export function markdownToSanitizedHtml(markdown) {
  const input = typeof markdown === "string" ? markdown : "";
  const rawHtml = md.render(input);
  return sanitizeRenderedHtml(rawHtml);
}
