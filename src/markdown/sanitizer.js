import sanitizeHtml from "sanitize-html";

function isExternalUrl(href) {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

const sanitizeOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "pre",
    "code",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "a",
    "strong",
    "em",
    "del",
    "ins",
    "sup",
    "sub",
    "span",
    "div",
    "img",
    "figure",
    "figcaption"
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "loading", "decoding"],
    code: ["class"],
    pre: ["class", "data-language"],
    h1: ["class"],
    h2: ["class"],
    h3: ["class"],
    h4: ["class"],
    h5: ["class"],
    h6: ["class"],
    p: ["class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
    div: ["class"],
    span: ["class"],
    th: ["scope"]
  },
  allowedClasses: {
    h1: [
      /^section-label$/,
      /^about$/,
      /^research$/,
      /^publications$/,
      /^projects$/,
      /^teaching$/,
      /^affiliation$/,
      /^contact$/,
      /^links$/
    ],
    h2: [
      /^section-label$/,
      /^about$/,
      /^research$/,
      /^publications$/,
      /^projects$/,
      /^teaching$/,
      /^affiliation$/,
      /^contact$/,
      /^links$/
    ],
    h3: [/^[a-zA-Z0-9_-]+$/],
    h4: [/^[a-zA-Z0-9_-]+$/],
    h5: [/^[a-zA-Z0-9_-]+$/],
    h6: [/^[a-zA-Z0-9_-]+$/],
    code: [/^hljs$/, /^language-/],
    pre: ["code-block"],
    div: [
      /^callout$/,
      /^callout-/,
      /^interest-tags$/,
      /^teaching-list$/,
      /^teaching-item$/,
      /^teaching-header$/,
      /^teaching-term$/,
      /^teaching-notes$/,
      /^teaching-links$/,
      /^course-title$/,
      /^about-bio$/
    ],
    span: [/^hljs.*/, /^interest-tag$/, /^primary-author$/],
    p: [/^[a-zA-Z0-9_-]+$/],
    ul: [/^[a-zA-Z0-9_-]+$/],
    ol: [/^[a-zA-Z0-9_-]+$/],
    li: [/^[a-zA-Z0-9_-]+$/]
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a(tagName, attribs) {
      const next = { ...attribs };
      if (!next.href) {
        return { tagName, attribs: next };
      }
      if (isExternalUrl(next.href)) {
        next.target = "_blank";
        next.rel = "noopener noreferrer";
      }
      return { tagName, attribs: next };
    },
    img(tagName, attribs) {
      return {
        tagName,
        attribs: {
          ...attribs,
          loading: "lazy",
          decoding: "async"
        }
      };
    }
  }
};

export function sanitizeRenderedHtml(rawHtml) {
  return sanitizeHtml(rawHtml, sanitizeOptions);
}
