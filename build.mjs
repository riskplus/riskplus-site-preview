// Gera o site estático em dist/.
// Uso: `npm run build` (uma vez) ou `npm run dev` (recompila ao salvar).
import * as esbuild from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const OUT = "dist";
const TMP = ".build";
const watch = process.argv.includes("--watch");
const mode = watch ? "development" : "production";

const options = {
  entryPoints: ["src/client.jsx"],
  bundle: true,
  minify: !watch,
  sourcemap: watch,
  target: "es2018",
  outdir: OUT,
  entryNames: watch ? "app" : "app-[hash]",
  metafile: true,
  jsx: "transform",
  define: { "process.env.NODE_ENV": JSON.stringify(mode) },
  logLevel: "info",
};

// Renderiza a página no Node para o HTML já sair com o conteúdo.
let runs = 0;
async function prerender() {
  const file = `${TMP}/prerender.mjs`;
  await esbuild.build({
    entryPoints: ["src/prerender.jsx"],
    bundle: true,
    platform: "node",
    format: "esm",
    // react e react-dom vêm do node_modules: o react-dom/server usa require() do Node.
    packages: "external",
    outfile: file,
    jsx: "transform",
    define: { "process.env.NODE_ENV": JSON.stringify(mode) },
    logLevel: "warning",
  });
  // A query força o Node a reimportar o arquivo novo no modo watch.
  const mod = await import(`${pathToFileURL(file).href}?v=${++runs}`);
  return { html: mod.renderApp(), ld: mod.jsonLd() };
}

// "<" escapado impede que um texto feche a tag <script> do JSON-LD.
const ldTags = (items) =>
  items.map((o) => `  <script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");

// Copia os arquivos estáticos e escreve o index.html com o conteúdo pronto e o bundle gerado.
async function writePage(result) {
  const js = Object.keys(result.metafile.outputs).find((f) => f.endsWith(".js"));
  const name = js.slice(OUT.length + 1);
  let html = await readFile("index.html", "utf8");
  for (const tag of ['<script src="app.js"></script>', '<div id="root"></div>', "</head>"]) {
    if (!html.includes(tag)) throw new Error(`index.html precisa ter ${tag}`);
  }
  const { html: body, ld } = await prerender();
  html = html
    .replace('<script src="app.js"></script>', `<script src="${name}"></script>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace("</head>", `${ldTags(ld)}\n</head>`);
  await writeFile(`${OUT}/index.html`, html);
  await cp("assets", `${OUT}/assets`, { recursive: true });
  // static/ vai para a raiz do site (robots.txt, sitemap.xml).
  await cp("static", OUT, { recursive: true });
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: "page", setup: (b) => b.onEnd((r) => r.errors.length || writePage(r)) }],
  });
  await ctx.watch();
} else {
  const result = await esbuild.build(options);
  await writePage(result);
  await rm(TMP, { recursive: true, force: true });
}
