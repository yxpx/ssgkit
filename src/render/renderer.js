import path from "node:path";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import Handlebars from "handlebars";

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

export async function renderSite({ pages, collections, templatesRoot, outputDir }) {
  const partialsDir = path.join(templatesRoot, "partials");
  const layoutsDir = path.join(templatesRoot, "layouts");

  await registerPartials(partialsDir);
  const layouts = await loadLayouts(layoutsDir);

  const generated = [];

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
        title: "SSGKit",
        generatedAt: new Date().toISOString()
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
