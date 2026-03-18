import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    const safe = str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const langClass = lang ? `language-${lang}` : "language-text";
    return `<pre><code class="${langClass}">${safe}</code></pre>`;
  }
});

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6"
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"]
  }
};

export function markdownToSanitizedHtml(markdown) {
  const rawHtml = md.render(markdown);
  return sanitizeHtml(rawHtml, sanitizeOptions);
}
