// Bundles @tailwindplus/elements into a single self-contained ES module so the
// packaged app never fetches it from a CDN at runtime. Dev-only — see package.json.
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["@tailwindplus/elements"],
    bundle: true,
    format: "esm",
    outfile: "frontend/vendor/elements.js",
    minify: true,
  })
  .catch(() => process.exit(1));
