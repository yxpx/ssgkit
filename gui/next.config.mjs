import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const guiNodeModules = path.join(__dirname, "node_modules");

const sharedRuntimeDeps = [
  "ajv",
  "ajv-formats",
  "handlebars",
  "highlight.js",
  "markdown-it",
  "markdown-it-container",
  "markdown-it-footnote",
  "sanitize-html"
];

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  experimental: {
    externalDir: true
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...Object.fromEntries(
        sharedRuntimeDeps.map((dep) => [dep, path.join(guiNodeModules, dep)])
      )
    };

    return config;
  }
};

export default nextConfig;
