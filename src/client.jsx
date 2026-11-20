// Entrada do navegador.
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./main.jsx";
import { PrivacyPage } from "./privacidade.jsx";
import { DocePage } from "./doc-e.jsx";

const root = document.getElementById("root");
// Cada página HTML diz qual componente ela é (data-page no #root).
const PAGES = { privacidade: PrivacyPage, "doc-e": DocePage };
const Page = PAGES[root.dataset.page] || App;
// O build já entrega o HTML pronto (src/prerender.jsx): o React só assume a página.
if (root.hasChildNodes()) hydrateRoot(root, <Page />);
else createRoot(root).render(<Page />);
