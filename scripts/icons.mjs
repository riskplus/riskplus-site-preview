// Gera src/icons.js com os paths SVG dos ícones Phosphor usados no site.
// Uso: node scripts/icons.mjs <pasta assets do @phosphor-icons/core@2.1.1>
// Para adicionar um ícone, inclua o nome na lista e rode de novo.
import { readFile, writeFile } from "node:fs/promises";

const USED = {
  regular: ["arrow-right", "check-circle", "circle", "list", "plus", "x"],
  bold: [
    "calendar-blank", "caret-left", "caret-right", "check", "check-circle", "circle",
    "circle-notch", "clock", "lock-simple", "shield-check", "trend-down", "trend-up",
    "user-minus", "warning", "warning-circle", "x", "x-circle",
  ],
};

const dir = process.argv[2];
if (!dir) throw new Error("Informe a pasta assets do @phosphor-icons/core");

const icons = {};
for (const [weight, names] of Object.entries(USED)) {
  icons[weight] = {};
  for (const name of names) {
    const file = weight === "regular" ? `${dir}/regular/${name}.svg` : `${dir}/bold/${name}-bold.svg`;
    const svg = await readFile(file, "utf8");
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
    icons[weight][name] = inner;
  }
}

await writeFile(
  "src/icons.js",
  "// Gerado por scripts/icons.mjs a partir de @phosphor-icons/core@2.1.1 (MIT). Não editar à mão.\n" +
    `export const ICONS = ${JSON.stringify(icons, null, 2)};\n`
);
console.log("src/icons.js gerado");
