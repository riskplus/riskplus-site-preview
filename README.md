# Site RiskPlus

Site institucional da RiskPlus. Página única em React, compilada com esbuild para HTML, CSS e JS estáticos.

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
- `src/icons.js`: ícones Phosphor em SVG, gerados por `scripts/icons.mjs`.
- `assets/`: logos e favicon.
- `build.mjs`: script de build. A saída em `dist/` é o que vai para o servidor.
