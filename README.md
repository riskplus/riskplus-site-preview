# Site RiskPlus

Site institucional da RiskPlus. Páginas em React (home, `/privacidade/` e `/doc-e/`), compiladas com esbuild para HTML, CSS e JS estáticos.

## Rodar local

```bash
npm install
npm run build              # gera dist/
python3 -m http.server 8000 -d dist
```

Para editar com recompilação automática, use `npm run dev` num terminal e o servidor acima em outro.

## Estrutura

- `index.html`: marcação base e CSS. O build troca `<script src="app.js">` pelo bundle com hash.
- `src/main.jsx`: componentes e textos do site.
- `src/doc-e.jsx`: LP do Doc-e em `/doc-e/`, com os mocks do app (dados fictícios) e o formulário que envia `produto: "Doc-e"`.
- `src/privacidade.jsx`: política de privacidade em `/privacidade/`.
- `src/client.jsx`: entrada do navegador. Assume o HTML que já vem pronto do build.
- `src/prerender.jsx`: roda só no build. Gera o HTML da página e os dados estruturados (JSON-LD de `Organization` e `FAQPage`), para buscadores e prévias de link lerem sem JavaScript.
- `src/icons.js`: ícones Phosphor em SVG, gerados por `scripts/icons.mjs`.
- `assets/`: logos, favicon e imagens de prévia (`og.png`, `og-doc-e.png`, geradas a partir de `scripts/og/`).
- `build.mjs`: script de build. A saída em `dist/` é o que vai para o servidor.

## Publicação

A `main` é protegida: toda mudança entra por PR. Cada merge na `main` dispara o workflow **Produção**, que publica em `riskplus.com.br`. A configuração da VPS está em [docs/deploy-producao.md](docs/deploy-producao.md).

O site não sai mais pelo GitHub Pages. A cópia em `riskplus.github.io/riskplus-site-preview` foi desligada em 21/11/2026 para não duplicar o riskplus.com.br.

Outros guias: [envio do lead](docs/envio-do-lead.md) e [analytics com aviso de cookies](docs/analytics.md).
