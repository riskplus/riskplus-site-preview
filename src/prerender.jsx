// Roda só no build (Node): gera o HTML da página e os dados estruturados (JSON-LD).
// Assim buscadores, IAs e prévias de link leem o conteúdo sem executar JavaScript.
import React from "react";
import { renderToString } from "react-dom/server";
import { App, FAQS, LINKEDIN_URL } from "./main.jsx";
import { PrivacyPage } from "./privacidade.jsx";
import { DocePage, DOCE_FAQS } from "./doc-e.jsx";

const SITE = "https://riskplus.com.br/";

export const renderApp = () => renderToString(<App />);
export const renderPrivacy = () => renderToString(<PrivacyPage />);
export const renderDoce = () => renderToString(<DocePage />);

export const jsonLd = () => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE + "#organization",
    name: "RiskPlus",
    legalName: "RiskPlus Tecnologia Ltda.",
    taxID: "35.951.627/0001-02",
    url: SITE,
    logo: SITE + "assets/apple-touch-icon.png",
    description: "Apoio à decisão de risco e crédito para empresas que vendem a prazo para outras empresas.",
    address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
    contactPoint: { "@type": "ContactPoint", contactType: "sales", email: "comercial@riskplus.com.br", availableLanguage: "Portuguese" },
    ...(LINKEDIN_URL ? { sameAs: [LINKEDIN_URL] } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

const faqPage = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

// /doc-e/: produto de software sem preço (a LP não mostra preço) e as perguntas da página.
export const jsonLdDoce = () => [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Doc-e",
    url: SITE + "doc-e/",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "pt-BR",
    description: "Reúne os documentos fiscais eletrônicos do CNPJ, recebidos e emitidos, num só lugar: NF-e, NFC-e, NFS-e, CT-e e CT-e OS, com manifestação do destinatário e API.",
    publisher: { "@type": "Organization", "@id": SITE + "#organization", name: "RiskPlus", url: SITE },
  },
  faqPage(DOCE_FAQS),
];
