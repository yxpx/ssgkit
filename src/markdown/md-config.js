import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItContainer from "markdown-it-container";
import hljs from "highlight.js";

function renderContainer(tokens, idx) {
  const token = tokens[idx];
  const info = (token.info || "").trim();
  if (token.nesting === 1) {
    const type = info || "note";
    return `<div class="callout callout-${type}">`;
  }
  return "</div>";
}

export function createMarkdownRenderer() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(code, { language }).value;
      return `<pre class="code-block" data-language="${language}"><code class="hljs language-${language}">${highlighted}</code></pre>`;
    }
  });

  md.use(markdownItFootnote);
  md.use(markdownItContainer, "note", { render: renderContainer });
  md.use(markdownItContainer, "tip", { render: renderContainer });
  md.use(markdownItContainer, "warn", { render: renderContainer });

  return md;
}
