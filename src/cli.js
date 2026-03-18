#!/usr/bin/env node
import path from "node:path";
import { readFile } from "node:fs/promises";
import { buildSite, readAndValidate } from "./build/pipeline.js";

function printValidationErrors(errors) {
  for (const entry of errors) {
    console.error(`- ${entry.filePath}`);
    for (const err of entry.errors) {
      console.error(`  ${err.instancePath || "(root)"}: ${err.message}`);
    }
  }
}

async function runValidate(contentDir) {
  const { docs, errors } = await readAndValidate(contentDir);

  console.log("PHASE 1 - Schema validation");
  console.log(`Checked files: ${docs.length + errors.length}`);

  if (errors.length > 0) {
    console.error("Validation failed:");
    printValidationErrors(errors);
    process.exitCode = 1;
    return;
  }

  const byCollection = docs.reduce((acc, doc) => {
    acc[doc.collection] = (acc[doc.collection] || 0) + 1;
    return acc;
  }, {});

  console.log("Validation passed.");
  console.log(`Collections: ${JSON.stringify(byCollection)}`);
}

async function runBuild(contentDir, templatesRoot, outputDir) {
  const result = await buildSite({ contentDir, templatesRoot, outputDir });

  if (!result.ok) {
    console.error("Build stopped in validation stage.");
    printValidationErrors(result.errors);
    process.exitCode = 1;
    return;
  }

  console.log("PHASE 2/3/4 - Ingestion + Markdown + Templating");
  console.log(`Pages processed: ${result.pages.length}`);
  console.log(`Generated files: ${result.generatedFiles.length}`);
  for (const file of result.generatedFiles) {
    console.log(`- ${file}`);
  }
}

async function runPresent(outputDir) {
  const sample = path.join(outputDir, "index.html");
  const html = await readFile(sample, "utf8");
  const compact = html.replace(/\s+/g, " ").trim();

  console.log("WEEKLY DEMO SNAPSHOT");
  console.log(`Sample file: ${path.relative(process.cwd(), sample).replaceAll("\\", "/")}`);
  console.log(`Preview: ${compact.slice(0, 220)}...`);
}

async function main() {
  const command = process.argv[2] || "build";
  const contentDir = path.resolve("content");
  const templatesRoot = path.resolve("templates");
  const outputDir = path.resolve("output");

  if (command === "validate") {
    await runValidate(contentDir);
    return;
  }

  if (command === "build") {
    await runBuild(contentDir, templatesRoot, outputDir);
    return;
  }

  if (command === "present") {
    await runPresent(outputDir);
    return;
  }

  console.log("Usage: node src/cli.js <validate|build|present>");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
