# SSGKit

SSGKit is a template-driven static site generator with a GUI editor.

It has two parts:
- Root application: CLI pipeline that validates content and generates static HTML.
- GUI application: Next.js editor in the gui folder for entering profile data and exporting a generated site package.

## Project Structure

- src: generator pipeline, markdown, rendering, schema validation, utilities.
- templates: Handlebars layouts, partials, and styles used for generated pages.
- content: sample markdown input.
- output: generated static files from CLI build.
- gui: Next.js GUI editor and API route for generation.

## Local Commands

From repository root:
- Install dependencies: npm install
- Validate content: npm run validate
- Build static site: npm run build
- Start GUI in development: npm run gui:dev
- Build GUI: npm run gui:build

## Vercel Deployment

Recommended deployment target is the GUI app in the gui folder.

Vercel dashboard setup:
1. Import the repository.
2. Set Root Directory to gui.
3. Framework Preset: Next.js.
4. Install Command: npm install
5. Build Command: npm run build
6. Output Directory: leave empty (default for Next.js).
7. Deploy.

CLI alternative (Vercel CLI):
1. Install Vercel CLI globally: npm i -g vercel
2. Login: vercel login
3. From repository root, run: vercel --cwd gui
4. For production deployment: vercel --cwd gui --prod

## Notes

- Node.js 18 or newer is required.
- The GUI build may show a non-fatal Handlebars warning; deployment still succeeds.