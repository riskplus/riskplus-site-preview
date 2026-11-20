// Entrada do navegador.
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./main.jsx";
import { PrivacyPage } from "./privacidade.jsx";

const root = document.getElementById("root");
// Cada página HTML diz qual componente ela é (data-page no #root).
const Page = root.dataset.page === "privacidade" ? PrivacyPage : App;
// O build já entrega o HTML pronto (src/prerender.jsx): o React só assume a página.
if (root.hasChildNodes()) hydrateRoot(root, <Page />);
else createRoot(root).render(<Page />);
