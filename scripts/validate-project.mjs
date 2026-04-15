import { access, readFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const requiredFiles = [
  "index.html",
  "src/game.js",
  "src/entities/player.js",
  "src/entities/entity.js",
  "src/systems/collision.js",
  "src/systems/rules.js",
  "src/systems/spawn.js",
  "src/systems/view.js",
  ".gitignore",
];

async function ensureFilesExist() {
  await Promise.all(
    requiredFiles.map((filePath) => access(path.join(rootDir, filePath))),
  );
}

async function ensureHtmlUsesModuleEntry() {
  const html = await readFile(path.join(rootDir, "index.html"), "utf8");

  if (!html.includes('type="module"') || !html.includes('src="src/game.js"')) {
    throw new Error("index.html must load src/game.js as a module entry.");
  }
}

async function main() {
  await ensureFilesExist();
  await ensureHtmlUsesModuleEntry();
  console.log("Project validation passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
