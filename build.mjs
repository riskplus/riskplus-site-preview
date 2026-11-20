// Gera o site estático em dist/.
// Uso: `npm run build` (uma vez) ou `npm run dev` (recompila ao salvar).
import * as esbuild from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const OUT = "dist";
const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: !watch,
  sourcemap: watch,
  target: "es2018",
  outdir: OUT,
  entryNames: watch ? "app" : "app-[hash]",
  metafile: true,
  jsx: "transform",
  define: { "process.env.NODE_ENV": JSON.stringify(watch ? "development" : "production") },
  logLevel: "info",
};

// Copia os arquivos estáticos e escreve o index.html apontando para o bundle gerado.
async function writePage(result) {
  const js = Object.keys(result.metafile.outputs).find((f) => f.endsWith(".js"));
  const name = js.slice(OUT.length + 1);
  const html = await readFile("index.html", "utf8");
  if (!html.includes('<script src="app.js"></script>')) {
    throw new Error('index.html precisa ter <script src="app.js"></script>');
  }
  await writeFile(`${OUT}/index.html`, html.replace('<script src="app.js"></script>', `<script src="${name}"></script>`));
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
}
