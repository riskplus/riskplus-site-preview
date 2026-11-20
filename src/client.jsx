// Entrada do navegador.
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./main.jsx";

const root = document.getElementById("root");
// O build já entrega o HTML pronto (src/prerender.jsx): o React só assume a página.
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
