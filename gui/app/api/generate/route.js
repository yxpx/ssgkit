import path from "node:path";
import os from "node:os";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import JSZip from "jszip";

import { validateFrontmatter } from "../../../../src/schema/validate.js";
import { markdownToSanitizedHtml } from "../../../../src/markdown/md-to-html.js";
import { renderSite } from "../../../../src/render/renderer.js";
import { slugify } from "../../../../src/utils/slugify.js";

export const runtime = "nodejs";

function toList(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function buildTeachingHtml(items, options = {}) {
  const { includeHeading = true } = options;
  const lines = [];

  if (includeHeading) {
    lines.push('<h2 class="section-label teaching">Teaching</h2>', "");
  }

  lines.push('<div class="teaching-list">');
  for (const item of items) {
    const course = String(item.course || "").trim();
    if (!course) continue;

    const term = String(item.semester || item.term || "").trim();
    const notes = String(item.notes || "").trim();
    const materialsUrl = String(item.materialsUrl || item.driveUrl || "").trim();

    lines.push('<div class="teaching-item">');
    lines.push('<div class="teaching-header">');
    lines.push(`<div class="course-title">${course}</div>`);
    lines.push("</div>");
    if (term) lines.push(`<div class="teaching-term">Term: ${term}</div>`);
    if (notes) lines.push(`<div class="teaching-notes">${notes}</div>`);
    if (materialsUrl) {
      lines.push(`<div class="teaching-links"><a href="${materialsUrl}">Course materials</a></div>`);
    }
    lines.push("</div>");
  }
  lines.push("</div>", "");

  return lines.join("\n").trim();
}

function buildHomeMarkdown(payload) {
  const lines = [];

  if (payload.homeIntro || payload.shortBio) {
    lines.push('<h2 class="section-label about">About</h2>', "");
    if (payload.homeIntro) {
      lines.push(payload.homeIntro, "");
    }
    if (payload.shortBio) {
      lines.push(payload.shortBio, "");
    }
  }

  const interests = toList(payload.tagline);
  if (interests.length > 0) {
    lines.push('<h2 class="section-label research">Research Interests</h2>', "");
    lines.push('<div class="interest-tags">');
    for (const interest of interests) {
      lines.push(`<span class="interest-tag">${interest}</span>`);
    }
    lines.push("</div>", "");
  }

  if (payload.includeTeaching) {
    const validTeaching = (payload.teaching || []).filter((item) => String(item.course || "").trim());
    if (validTeaching.length) {
      lines.push(buildTeachingHtml(validTeaching, { includeHeading: true }));
    }
  }

  return lines.join("\n").trim();
}

function buildAboutMarkdown(payload) {
  const aboutBio = String(payload.longBio || "").trim();
  if (!aboutBio) {
    return "";
  }

  const lines = ['<h2 class="section-label about">About</h2>', "", aboutBio];
  return lines.join("\n").trim();
}

function buildProjectMarkdown(project) {
  const lines = [];
  lines.push('<h2 class="section-label publications">Publication</h2>', "");
  if (project.authors) lines.push(`**Authors:** ${project.authors}`, "");
  if (project.venue || project.year) {
    lines.push(`**Venue:** ${[project.venue, project.year].filter(Boolean).join(", ")}`, "");
  }
  if (project.summary) lines.push(project.summary, "");
  if (project.links) {
    const links = toList(project.links);
    if (links.length) {
      lines.push("**Links**", "");
      for (const link of links) {
        lines.push(`- ${link}`);
      }
      lines.push("");
    }
  }
  if (project.content) {
    lines.push(project.content, "");
  }

  return lines.join("\n").trim();
}

function buildPublicationsPageHtml(items) {
  const lines = ['<h2 class="section-label publications">Publications</h2>', "", '<div class="teaching-list">'];

  for (const item of items) {
    const title = String(item.title || "").trim();
    if (!title) continue;

    const venue = String(item.venue || "").trim();
    const year = String(item.year || "").trim();
    const authors = String(item.authors || "").trim();
    const summary = String(item.summary || "").trim();
    const slug = String(item.slug || "").trim();

    lines.push('<div class="teaching-item">');
    lines.push(`<div class="course-title">${title}</div>`);
    if (venue || year) {
      lines.push(`<div class="teaching-term">${[venue, year].filter(Boolean).join(" | ")}</div>`);
    }
    if (authors) lines.push(`<div class="teaching-notes"><strong>Authors:</strong> ${authors}</div>`);
    if (summary) lines.push(`<div class="teaching-notes">${summary}</div>`);
    if (slug) {
      lines.push(`<div class="teaching-links"><a href="./projects/${slug}.html">Read publication page</a></div>`);
    }
    lines.push("</div>");
  }

  lines.push("</div>");
  return lines.join("\n").trim();
}

function buildProjectsPageHtml(items) {
  const lines = ['<h2 class="section-label projects">Projects</h2>', "", '<div class="teaching-list">'];

  for (const item of items) {
    const title = String(item.title || "").trim();
    if (!title) continue;

    const period = String(item.period || item.timeline || "").trim();
    const summary = String(item.summary || "").trim();
    const link = String(item.link || item.url || "").trim();

    lines.push('<div class="teaching-item">');
    lines.push(`<div class="course-title">${title}</div>`);
    if (period) lines.push(`<div class="teaching-term">${period}</div>`);
    if (summary) lines.push(`<div class="teaching-notes">${summary}</div>`);
    if (link) lines.push(`<div class="teaching-links"><a href="${link}">Project link</a></div>`);
    lines.push("</div>");
  }

  lines.push("</div>");
  return lines.join("\n").trim();
}

function toSchemaDate(value) {
  const input = String(value || "").trim();
  if (!input) return undefined;
  if (/^\d{4}$/.test(input)) {
    return `${input}-01-01`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  return undefined;
}

function buildDocuments(payload) {
  const owner = payload.siteName || "Creator";
  const pages = [];
  const publicationPageItems = [];

  pages.push({
    slug: "home",
    collection: "pages",
    validationRef: { tab: "profile" },
    meta: {
      title: "Home",
      layout: "main",
      author: owner
    },
    body: buildHomeMarkdown(payload)
  });

  if (payload.includeAbout) {
    const aboutBody = buildAboutMarkdown(payload);
    if (aboutBody) {
      pages.push({
        slug: "about",
        collection: "pages",
        validationRef: { tab: "cv" },
        meta: {
          title: "About",
          layout: "page",
          author: owner
        },
        body: aboutBody
      });
    }
  }

  if (payload.includeTeaching) {
    const teachingItems = (payload.teaching || []).filter((item) => String(item.course || "").trim());
    if (teachingItems.length) {
      pages.push({
        slug: "teaching",
        collection: "pages",
        validationRef: { tab: "teaching" },
        meta: {
          title: "Teaching",
          layout: "page",
          author: owner
        },
        body: buildTeachingHtml(teachingItems, { includeHeading: true })
      });
    }
  }

  if (payload.includePublications) {
    const used = new Set();
    for (const [publicationIndex, rawProject] of (payload.publications || []).entries()) {
      const title = String(rawProject.title || "").trim();
      if (!title) continue;

      let slug = slugify(title);
      if (!slug) slug = "project";
      let suffix = 2;
      while (used.has(slug)) {
        slug = `${slugify(title)}-${suffix}`;
        suffix += 1;
      }
      used.add(slug);

      pages.push({
        slug,
        collection: "projects",
        validationRef: { tab: "publications", index: publicationIndex },
        authors: rawProject.authors || undefined,
        venue: rawProject.venue || undefined,
        year: rawProject.year || undefined,
        meta: {
          title,
          layout: "project",
          date: toSchemaDate(rawProject.year),
          author: owner,
          summary: rawProject.summary || undefined,
          draft: false
        },
        body: buildProjectMarkdown(rawProject)
      });

      publicationPageItems.push({
        title,
        venue: rawProject.venue || "",
        year: rawProject.year || "",
        authors: rawProject.authors || "",
        summary: rawProject.summary || "",
        slug
      });
    }

    if (publicationPageItems.length) {
      pages.push({
        slug: "publications",
        collection: "pages",
        validationRef: { tab: "publications" },
        meta: {
          title: "Publications",
          layout: "page",
          author: owner
        },
        body: buildPublicationsPageHtml(publicationPageItems)
      });
    }
  }

  if (payload.includeProjects) {
    const projectItems = (payload.projects || []).filter((item) => String(item.title || "").trim());
    if (projectItems.length) {
      pages.push({
        slug: "projects",
        collection: "pages",
        validationRef: { tab: "projects" },
        meta: {
          title: "Projects",
          layout: "page",
          author: owner
        },
        body: buildProjectsPageHtml(projectItems)
      });
    }
  }

  return pages;
}

function groupCollections(pages) {
  const groups = {};
  for (const page of pages) {
    if (!groups[page.collection]) {
      groups[page.collection] = [];
    }
    groups[page.collection].push(page);
  }
  return groups;
}

async function listFilesRecursive(rootDir, currentDir = rootDir, bucket = []) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await listFilesRecursive(rootDir, fullPath, bucket);
      continue;
    }
    const rel = path.relative(rootDir, fullPath).replaceAll("\\", "/");
    bucket.push({ rel, fullPath });
  }
  return bucket;
}

function validatePageMeta(pages) {
  const errors = [];
  for (const page of pages) {
    const result = validateFrontmatter(page.meta);
    if (!result.valid) {
      errors.push({
        slug: page.slug,
        ref: page.validationRef || null,
        errors: result.errors
      });
    }
  }
  return errors;
}

export async function POST(request) {
  const payload = await request.json();
  const pages = buildDocuments(payload);

  const validationErrors = validatePageMeta(pages);
  if (validationErrors.length > 0) {
    return Response.json(
      {
        error: "Invalid fields detected.",
        details: validationErrors
      },
      { status: 400 }
    );
  }

  const renderedPages = pages.map((page) => ({
    ...page,
    html: markdownToSanitizedHtml(page.body)
  }));
  const collections = groupCollections(renderedPages);

  const rootDir = path.resolve(process.cwd(), "..");
  const templatesRoot = path.join(rootDir, "templates");
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ssgkit-gui-"));
  const outputDir = path.join(tempDir, "site");

  try {
    await renderSite({
      pages: renderedPages,
      collections,
      templatesRoot,
      outputDir,
      site: {
        title: payload.siteName || "Faculty Profile",
        description: payload.tagline || "Academic profile",
        profile: {
          name: payload.siteName || "Faculty Member",
          role: payload.role || "Assistant Professor",
          institution: payload.institution || "",
          department: payload.department || "",
          office: payload.office || "",
          email: payload.email || "",
          location: payload.location || "",
          scholarUrl: payload.scholarUrl || "",
          githubUrl: payload.githubUrl || "",
          linkedinUrl: payload.linkedinUrl || "",
          cvUrl: payload.cvUrl || "",
          photoUrl: payload.profileImageUpload || payload.profileImageUrl || ""
        },
        theme: {
          primaryColor: payload.primaryColor || "#0b4aa6",
          accentColor: payload.accentColor || "#08357a"
        }
      }
    });

    const files = await listFilesRecursive(outputDir);
    const zip = new JSZip();

    for (const file of files) {
      const content = await readFile(file.fullPath);
      zip.file(file.rel, content);
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=ssgkit-site.zip"
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: error?.message || "Failed to generate site"
      },
      { status: 500 }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
