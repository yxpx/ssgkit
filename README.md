## Project overview

A minimal, template driven Static Site Generator (SSG) that converts structured Markdown content with YAML frontmatter into an optimized, responsive portfolio website. Goals for the initial implementation:

* Provide a strict content schema and validation.
* Implement a content ingestion pipeline (filesystem crawler and frontmatter parser).
* Convert Markdown to sanitized HTML.
* Implement a Handlebars-based templating architecture with layouts and partials.
* Provide basic CLI commands for build and local development.

## Tech stack

* Runtime: Node.js (>= 16)
* Language: JavaScript (ES2020+) or TypeScript (optional)
* Core libraries:

  * `gray-matter` for frontmatter parsing
  * `markdown-it` or `marked` for Markdown to HTML conversion
  * `dompurify` + `jsdom` or `sanitize-html` for HTML sanitization
  * `handlebars` for templating
  * `chokidar` for file watching (dev server)
  * `fs-extra` for file operations
  * `commander` or `yargs` for CLI
  * `eslint`, `prettier`, `jest` (or vitest) for linting and tests
* Optional for later phases: `imagemin`, `terser`, `clean-css`


## Content schema (frontmatter)

Use YAML frontmatter in each Markdown file. Strict schema reduces runtime errors and improves UX.

Minimal fields and types

```yaml
# required top-level fields
title: string           # required
layout: string          # required, one of: main, project, page

# optional
date: YYYY-MM-DD        # optional, ISO date
author: string
tags: [string]
summary: string
thumbnail: string       # relative path to an image in content/assets
draft: boolean
```

Example `projects/my-project.md`

```md
---
title: "Template Driven SSG"
layout: project
date: 2026-02-10
author: "Author Name"
tags: [web, design]
summary: "Small SSG prototype"
thumbnail: "assets/project1.png"
---
# Project title

Project description...
```

Provide a JSON Schema file at `src/schema/content-schema.json` and run validation at ingestion. Validation failure should stop the build with a clear error.

## Installation and environment

1. Install Node.js >= 16.
2. Clone repository.
3. Install dependencies:

```bash
npm install
# or
pnpm install
```

4. Recommended `package.json` scripts

```json
{
  "scripts": {
    "dev": "node ./src/cli.js dev",
    "build": "node ./src/cli.js build",
    "clean": "rimraf output",
    "test": "jest"
  }
}
```

## Development workflow

* `npm run dev` starts a local HTTP server that serves `output/` and watches `content/` and `templates/`. On change, perform an incremental rebuild of affected pages.
* `npm run build` runs a full build pipeline: ingest -> md-to-html -> render -> write `output/`.
* Use the CLI to validate content: `node src/cli.js validate`.

## Implementation notes and acceptance criteria for v1

1. Environment and schema (phase 1)

   * Provide `package.json` and minimal scripts.
   * Add `src/schema/content-schema.json` with validation for required fields.
   * Implement a CLI command `validate` that reads content and validates all frontmatter entries. Exit code non-zero on any schema errors.

2. Core data ingestion (phase 2)

   * Implement `src/ingest/crawler.js` to recursively walk `content/` and return Markdown file paths.
   * Implement `src/ingest/parser.js` that uses `gray-matter` to extract YAML frontmatter and raw body.
   * Produce an intermediate JSON representation:

     ```json
     {
       "path": "content/projects/my-project.md",
       "slug": "my-project",
       "meta": { ... frontmatter ... },
       "body": "raw markdown"
     }
     ```
   * The ingestion module should collect collections (e.g., projects) and expose them as arrays for rendering.

3. Lexical analysis and Markdown conversion (phase 3)

   * Implement `src/markdown/md-to-html.js`:

     * Convert Markdown to HTML using `markdown-it` or `marked`.
     * Sanitize the resulting HTML to remove unsafe tags and attributes.
     * Preserve code blocks and generate syntax-highlight class names (no need to integrate a highlighter for v1).
     * Produce `html` property to be injected into templates.

4. Templating architecture (phase 4)

   * Install and configure `handlebars`.
   * Provide `templates/layouts/main.hbs` and `templates/partials/*`.
   * Implement `src/render/renderer.js` that:

     * Registers partials automatically by scanning `templates/partials`.
     * Compiles layouts and renders final HTML by injecting page-specific data and sanitized HTML body.
     * Writes files to `output/<slug>.html` or `output/projects/<slug>.html` based on collection.
   * Ensure template selection follows `layout` in frontmatter.

## CLI usage examples

```bash
# validate all content
node src/cli.js validate

# full build
node src/cli.js build

# start dev server with watcher and live reload
node src/cli.js dev --port 8080
```

## Testing

* Unit tests for:

  * crawler returns expected file list for a synthetic directory tree
  * parser extracts frontmatter and body correctly
  * md-to-html sanitizes and converts headings, lists, and code blocks
  * renderer chooses template and injects page data
* Use `jest` or `vitest`. Keep tests deterministic using temporary directories.

## Development guidelines

* Prefer small pure functions with unit tests.
* Keep templates logic-less; avoid embedding heavy JS in handlebars.
* Fail early on invalid schemas.
* Keep generated output deterministic for reproducible builds.

## Current implementation scope (as of Mar 18)

This repository currently implements only the first four timeline phases:

1. Environment & schema
2. Core data ingestion
3. Lexical analysis (Markdown -> sanitized HTML)
4. Templating architecture (Handlebars layouts + partials)

No dev server, incremental build logic, deployment, plugin system, or optimization pipeline is included yet.

## Quick demo commands

```bash
npm install
npm run validate
npm run build
```
