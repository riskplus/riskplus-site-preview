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
  return { html: mod.renderApp(), ld: mod.jsonLd(), privacy: mod.renderPrivacy(), doce: mod.renderDoce(), doceLd: mod.jsonLdDoce() };
}

// "<" escapado impede que um texto feche a tag <script> do JSON-LD.
const ldTags = (items) =>
  items.map((o) => `  <script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");

// As subpáginas (/privacidade/, /doc-e/) usam o mesmo <head> e CSS, com título, descrição, endereço e prévia próprios.
// O <base href="../"> faz os caminhos relativos (assets, bundle, links) apontarem para a raiz do site.
const SUBPAGES = {
  privacidade: {
    title: "Política de Privacidade · RiskPlus",
    desc: "Quais dados pessoais a RiskPlus trata no site e no serviço de análise de empresas, por quê, com quem compartilha e como exercer seus direitos.",
    url: "https://riskplus.com.br/privacidade/",
  },
  // SEO da especificação da LP do Doc-e (20/11/2026).
  "doc-e": {
    title: "Doc-e · Captura automática de XML de NF-e, NFS-e e CT-e",
    desc: "Pare de pedir XML para fornecedor. O Doc-e reúne NF-e, NFC-e, NFS-e e CT-e do seu CNPJ, recebidos e emitidos, num só lugar. Com manifestação e API.",
    url: "https://riskplus.com.br/doc-e/",
    ogTitle: "Pare de pedir XML para fornecedor.",
    ogDesc: "Todos os documentos fiscais do seu CNPJ num só lugar.",
    image: "https://riskplus.com.br/assets/og-doc-e.png",
    imageAlt: "Doc-e, da RiskPlus: pare de pedir XML para fornecedor.",
  },
};
function subPage(html, page, body, ld = []) {
  const p = SUBPAGES[page];
  const ogTitle = p.ogTitle ?? p.title, ogDesc = p.ogDesc ?? p.desc;
  const swaps = [
    [/<title>[^<]*<\/title>/, `<title>${p.title}</title>`],
    [/(<meta name="description" content=")[^"]*/, `$1${p.desc}`],
    [/(<link rel="canonical" href=")[^"]*/, `$1${p.url}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${p.url}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${ogTitle}`],
    [/(<meta name="twitter:title" content=")[^"]*/, `$1${ogTitle}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${ogDesc}`],
    [/(<meta name="twitter:description" content=")[^"]*/, `$1${ogDesc}`],
    ...(p.image ? [
      [/(<meta property="og:image" content=")[^"]*/, `$1${p.image}`],
      [/(<meta name="twitter:image" content=")[^"]*/, `$1${p.image}`],
      [/(<meta property="og:image:alt" content=")[^"]*/, `$1${p.imageAlt}`],
    ] : []),
    [/<head>/, `<head>\n  <base href="../" />`],
    // Função como substituto: o HTML e o JSON-LD podem ter "$" (preços), que o replace leria como padrão.
    [/<div id="root"><\/div>/, () => `<div id="root" data-page="${page}">${body}</div>`],
    [/<\/head>/, () => `${ld.length ? ldTags(ld) + "\n" : ""}</head>`],
  ];
  for (const [re, to] of swaps) {
    if (!re.test(html)) throw new Error(`index.html: não achei ${re}`);
    html = html.replace(re, to);
  }
  return html;
}

// Copia os arquivos estáticos e escreve o index.html com o conteúdo pronto e o bundle gerado.
async function writePage(result) {
  const js = Object.keys(result.metafile.outputs).find((f) => f.endsWith(".js"));
  const name = js.slice(OUT.length + 1);
  let html = await readFile("index.html", "utf8");
  for (const tag of ['<script src="app.js"></script>', '<div id="root"></div>', "</head>"]) {
    if (!html.includes(tag)) throw new Error(`index.html precisa ter ${tag}`);
  }
  const { html: body, ld, privacy, doce, doceLd } = await prerender();
  html = html.replace('<script src="app.js"></script>', `<script src="${name}"></script>`);
  await writeFile(`${OUT}/index.html`, html
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
    .replace("</head>", () => `${ldTags(ld)}\n</head>`));
  for (const [page, sub, subLd] of [["privacidade", privacy], ["doc-e", doce, doceLd]]) {
    await mkdir(`${OUT}/${page}`, { recursive: true });
    await writeFile(`${OUT}/${page}/index.html`, subPage(html, page, sub, subLd));
  }
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
