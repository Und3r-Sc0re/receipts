// Bundles the extension into dist/ (load-unpacked target).
import { build } from "esbuild";
import { mkdirSync, copyFileSync, cpSync, existsSync } from "node:fs";

const OUT = "dist";
mkdirSync(OUT, { recursive: true });

await build({
  entryPoints: {
    content: "src/content.ts",
    background: "src/background.ts",
  },
  bundle: true,
  format: "esm",
  target: "chrome110",
  outdir: OUT,
  logLevel: "info",
});

copyFileSync("manifest.json", `${OUT}/manifest.json`);

if (existsSync("icons")) {
  cpSync("icons", `${OUT}/icons`, { recursive: true });
}

console.log("Built extension → dist/  (load unpacked in chrome://extensions)");
