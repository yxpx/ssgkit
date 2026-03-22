import path from "node:path";
import { readdir, readFile, mkdir, writeFile, cp } from "node:fs/promises";
import Handlebars from "handlebars";

function registerHelpers() {
  Handlebars.registerHelper("eq", (left, right) => left === right);
  Handlebars.registerHelper("initials", (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "NA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  });
  Handlebars.registerHelper("formatAuthors", (authors, ownerName) => {
    const authorList = String(authors || "").trim();
    if (!authorList) return "";
    const owner = String(ownerName || "").trim();
    if (!owner) return new Handlebars.SafeString(Handlebars.escapeExpression(authorList));
    const escapedOwner = owner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedOwner, "ig");
    const highlighted = authorList.replace(
      regex,
      (match) => `<span class=\"primary-author\">${Handlebars.escapeExpression(match)}</span>`
    );
    return new Handlebars.SafeString(highlighted);
  });
}

function buildPublicationGroups(projectPages) {
  const groups = new Map();
  const sorted = [...projectPages].sort((a, b) => {
    const ay = Number.parseInt(String(a.year || ""), 10) || 0;
    const by = Number.parseInt(String(b.year || ""), 10) || 0;
    return by - ay;
  });

  for (const page of sorted) {
    const year = String(page.year || "Undated");
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year).push(page);
  }

  return [...groups.entries()].map(([year, items]) => ({ year, items }));
}

async function getTemplateFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".hbs"))
    .map((entry) => path.join(dirPath, entry.name));
}

async function registerPartials(partialsDir) {
  const files = await getTemplateFiles(partialsDir);
  for (const filePath of files) {
    const name = path.basename(filePath, ".hbs");
    const source = await readFile(filePath, "utf8");
    Handlebars.registerPartial(name, source);
  }
}

async function loadLayouts(layoutsDir) {
  const files = await getTemplateFiles(layoutsDir);
  const layouts = new Map();
  for (const filePath of files) {
    const name = path.basename(filePath, ".hbs");
    const source = await readFile(filePath, "utf8");
    layouts.set(name, Handlebars.compile(source));
  }
  return layouts;
}

function getOutputRelativePath(page) {
  if (page.collection === "projects") {
    return path.join("projects", `${page.slug}.html`);
  }

  if (page.slug === "home") {
    return "index.html";
  }

  return `${page.slug}.html`;
}

function getAssetBase(page) {
  return page.collection === "projects" ? "../" : "./";
}

function buildNavigation(pages) {
  return pages
    .filter((page) => page.collection === "pages" && page.slug !== "home")
    .map((page) => ({
      title: page.meta.title,
      slug: page.slug,
      href: `${page.slug}.html`
    }));
}

async function copySharedStyles(templatesRoot, outputDir) {
  const stylesSource = path.join(templatesRoot, "styles");
  const stylesOutput = path.join(outputDir, "styles");
  try {
    await cp(stylesSource, stylesOutput, { recursive: true, force: true });
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function copySharedAssets(templatesRoot, outputDir) {
  const assetsSource = path.join(templatesRoot, "assets");
  try {
    await cp(assetsSource, outputDir, { recursive: true, force: true });
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
}

export async function renderSite({ pages, collections, templatesRoot, outputDir, site: siteOverrides = {} }) {
  const partialsDir = path.join(templatesRoot, "partials");
  const layoutsDir = path.join(templatesRoot, "layouts");

  registerHelpers();
  await registerPartials(partialsDir);
  const layouts = await loadLayouts(layoutsDir);
  await copySharedStyles(templatesRoot, outputDir);
  await copySharedAssets(templatesRoot, outputDir);

  const navItems = buildNavigation(pages);

  const generated = [];
  const profile = {
    role: "",
    institution: "",
    department: "",
    office: "",
    email: "",
    location: "",
    scholarUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    cvUrl: "",
    photoUrl: "",
    ...siteOverrides.profile
  };
  const baseSite = {
    title: "Academic Portfolio",
    description: "Academic portfolio generated from structured profile content.",
    generatedAt: new Date().toISOString(),
    ...siteOverrides,
    profile,
    navItems
  };
  const timestamp = baseSite.generatedAt;
  baseSite.generatedMonthYear = new Date(timestamp).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric"
  });
  baseSite.publicationGroups = buildPublicationGroups(collections.projects || []);

  for (const page of pages) {
    const layoutName = page.meta.layout || "main";
    const layout = layouts.get(layoutName) || layouts.get("main");
    if (!layout) {
      throw new Error("No layout found. Expected at least templates/layouts/main.hbs");
    }

    const html = layout({
      page,
      content: page.html,
      collections,
      site: {
        ...baseSite,
        assetBase: getAssetBase(page)
      }
    });

    const relOutputPath = getOutputRelativePath(page);
    const finalOutputPath = path.join(outputDir, relOutputPath);

    await mkdir(path.dirname(finalOutputPath), { recursive: true });
    await writeFile(finalOutputPath, html, "utf8");

    generated.push(path.relative(process.cwd(), finalOutputPath).replaceAll("\\", "/"));
  }

  return generated;
}
