import React from "react";
import { ICONS } from "./icons.js";

// ── Data ──────────────────────────────────────────────────────────────────
const SAMPLES = {
  "12.345.678/0001-90": {
    name: "Mercatto Distribuição Ltda", setor: "Atacado · Alimentos", fundacao: "2014",
    initials: "MD", decision: "Recomendado", band: "go",
    traits: [
      { kind: "good", text: "Pagamentos em dia", icon: "check-circle" },
      { kind: "good", text: "Faturamento estável", icon: "trend-up" },
      { kind: "good", text: "Quadro societário sem pendências", icon: "shield-check" },
      { kind: "good", text: "12 anos de Receita ativa", icon: "calendar-blank" },
    ]
  },
  "33.222.111/0001-44": {
    name: "Vega Indústria & Comércio", setor: "Indústria · Têxtil", fundacao: "2019",
    initials: "VI", decision: "Atenção", band: "caution",
    traits: [
      { kind: "good", text: "Cadastro regular na Receita", icon: "check-circle" },
      { kind: "neutral", text: "Atrasos recentes em pagamentos", icon: "clock" },
      { kind: "neutral", text: "Faturamento oscilando", icon: "trend-down" },
      { kind: "good", text: "7 anos de Receita ativa", icon: "calendar-blank" },
    ]
  },
  "55.999.444/0001-12": {
    name: "Northbay Trading ME", setor: "Importação", fundacao: "2023",
    initials: "NT", decision: "Não recomendado", band: "stop",
    traits: [
      { kind: "bad", text: "Empresa recém-aberta", icon: "warning-circle" },
      { kind: "bad", text: "Sócio ligado a empresas com pendências", icon: "user-minus" },
      { kind: "bad", text: "Cadastro inconsistente na Receita", icon: "x-circle" },
    ]
  }
};
const ANALYSIS_STEPS = ["Consultando a Receita Federal", "Cruzando o quadro societário", "Lendo faturamento, pagamentos e sinais alternativos", "Aplicando o modelo RiskPlus"];
const STEP_MS = 520;

const SOURCES = ["Receita Federal", "Quadro societário", "Comportamento de faturamento", "Comportamento de pagamentos", "Sinais alternativos", "Modelo RiskPlus"];

const STATEMENTS = [
  { us: <><b>Uma recomendação clara</b>, com os motivos ao lado.</>, them: "Score sem explicação." },
  { us: <>Analisa empresas <b>fora do bureau</b> usando sinais alternativos.</>, them: "Empresa nova ou pequena costuma aparecer como “sem informação”." },
  { us: <>Você cola o CNPJ e <b>tem a resposta em segundos.</b></>, them: "Relatório longo pra interpretar." },
  { us: <><b>No painel ou via API</b>, do jeito que funcionar melhor pra você.</>, them: "Planilha ou integração antiga." },
];

const FAQS = [
  { q: "Como a RiskPlus analisa empresas que não aparecem no bureau?",
    a: "A gente cruza os dados da Receita Federal e do quadro societário com o comportamento de faturamento e pagamentos e com sinais alternativos de fontes contratadas. Tudo passa pelo nosso modelo. Por isso MEI, empresa nova e pequeno negócio também recebem uma resposta." },
  { q: "De onde vêm os dados? Está de acordo com a LGPD?",
    a: "A RiskPlus analisa empresas, pelo CNPJ. Usamos dados públicos, como o cadastro da Receita Federal e o quadro societário, e dados de parceiros contratados sobre faturamento, pagamentos e outros sinais de risco. Do quadro societário, usamos só os dados públicos da Receita. A LGPD permite usar dados para proteção do crédito, e a gente usa só o que a análise precisa. Se algum desses dados for seu, você pode pedir acesso, correção ou revisão de uma análise pelo e-mail comercial@riskplus.com.br." },
  { q: "Dá pra analisar vários CNPJs de uma vez ou integrar com meu sistema?",
    a: "Dá. No dia a dia, você cola o CNPJ no painel. Se tiver uma lista, manda pra gente que devolvemos a análise de todos em CSV. Também dá pra integrar via API." },
];

// ── Helpers ───────────────────────────────────────────────────────────────
const formatCnpj = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};
// A demo do hero manda o CNPJ digitado para o formulário de contato.
const prefillLead = (cnpj) => window.dispatchEvent(new CustomEvent("riskplus:prefill", { detail: { cnpj } }));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Ícones Phosphor em SVG inline (src/icons.js). O <i> mantém os seletores de CSS existentes.
const Icon = ({ n, b }) => {
  const inner = ICONS[b ? "bold" : "regular"][n];
  return (
    <i className="ic" aria-hidden="true">
      {inner && <svg viewBox="0 0 256 256" fill="currentColor" dangerouslySetInnerHTML={{ __html: inner }} />}
    </i>
  );
};
const Logo = () => (
  <>
    <img className="logo-light" src="assets/logo-blue.svg" alt="RiskPlus" />
    <img className="logo-dark" src="assets/logo-white.svg" alt="RiskPlus" />
  </>
);

// Seletor de tema claro/escuro. Sem escolha salva, o site segue o tema do sistema.
const THEME_KEY = "rp-theme";
const currentTheme = () => {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
const ThemeToggle = () => (
  <button
    type="button"
    className="theme-btn"
    aria-label="Alternar entre tema claro e escuro"
    title="Tema claro ou escuro"
    onClick={() => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch { /* navegador sem storage */ }
    }}
  >
    <span className="ic-moon"><Icon n="moon" /></span>
    <span className="ic-sun"><Icon n="sun" /></span>
  </button>
);

// Fades [data-reveal] elements in once they enter the viewport.
const useReveal = () => {
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.dataset.shown = ""; io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

// ── Nav ───────────────────────────────────────────────────────────────────
const NAV = [
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#produto", label: "Produto" },
  { href: "#faq", label: "FAQ" },
];

const Nav = () => {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("");

  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive("#" + e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["#hero", ...NAV.map((l) => l.href)].forEach((h) => { const el = document.querySelector(h); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <>
      <header className="gnav">
        <div className="wrap">
          <a href="#main" className="logo" aria-label="RiskPlus, início"><Logo /></a>
          <nav aria-label="Principal">
            {NAV.map((l) => <a key={l.href} href={l.href} className={active === l.href ? "active" : ""}>{l.label}</a>)}
          </nav>
          <div className="right">
            <a href="#acesso" className="pill pill-fill pill-sm">Falar com o time</a>
            <ThemeToggle />
            <button type="button" className="icon-btn" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(true)}><Icon n="list" /></button>
          </div>
        </div>
      </header>
      <div className={`mmenu ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
        <div className="top"><button type="button" className="icon-btn" aria-label="Fechar menu" onClick={() => setOpen(false)}><Icon n="x" /></button></div>
        <nav>{NAV.map((l, i) => <a key={l.href} href={l.href} style={{ "--i": i }} onClick={() => setOpen(false)}>{l.label}</a>)}</nav>
        <a href="#acesso" className="pill pill-fill" onClick={() => setOpen(false)}>Falar com o time</a>
      </div>
    </>
  );
};

// ── Hero + live demo ──────────────────────────────────────────────────────
const Hero = () => {
  const first = Object.keys(SAMPLES)[0];
  const [cnpj, setCnpj] = React.useState(first);
  const [phase, setPhase] = React.useState("analyzing");
  const [stepIdx, setStepIdx] = React.useState(0);
  const [result, setResult] = React.useState(null);
  const [shown, setShown] = React.useState(first);
  const timers = React.useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const analisar = (raw, delay = 0) => {
    const key = raw ?? cnpj;
    clear();
    const sample = SAMPLES[key];
    // A demo só tem resultado para os CNPJs de exemplo. Para qualquer outro, convida a falar com o time.
    if (!sample) { setShown(key); setPhase("demo-only"); return; }
    setPhase("analyzing"); setStepIdx(0);
    ANALYSIS_STEPS.forEach((_, i) => timers.current.push(setTimeout(() => setStepIdx(i + 1), delay + (i + 1) * STEP_MS)));
    timers.current.push(setTimeout(() => { setResult(sample); setShown(key); setPhase("result"); }, delay + ANALYSIS_STEPS.length * STEP_MS + 260));
  };
  React.useEffect(() => { analisar(first, 1200); return clear; }, []);
  const busy = phase === "analyzing";

  // Start offsets for the pinned hero: text centered on top, demo centered
  // below it. The scroll animation carries both back to their grid cells.
  const heroRef = React.useRef(null), pinRef = React.useRef(null), textRef = React.useRef(null), demoRef = React.useRef(null);
  React.useEffect(() => {
    const measure = () => {
      const pin = pinRef.current, t = textRef.current, d = demoRef.current;
      const W = pin.clientWidth, top = 48, gap = 56;
      const vars = {
        "--tx": `${(W - t.offsetWidth) / 2 - t.offsetLeft}px`,
        "--ty": `${top - t.offsetTop}px`,
        "--dx": `${(W - d.offsetWidth) / 2 - d.offsetLeft}px`,
        "--dy": `${top + t.offsetHeight + gap - d.offsetTop}px`,
      };
      Object.entries(vars).forEach(([k, v]) => heroRef.current.style.setProperty(k, v));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(pinRef.current);
    ro.observe(textRef.current);
    ro.observe(demoRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="hero tile" id="hero" ref={heroRef}>
      <div className="hero-pin" ref={pinRef}>
      <div className="hero-grid">
      <div className="hero-text" ref={textRef}>
        <h1 className="h-xl load" style={{ "--d": "100ms" }}>Saiba <span className="hl">em segundos</span> se vale vender a prazo.</h1>
        <p className="lead load" style={{ "--d": "260ms" }}>Cole o CNPJ do seu cliente B2B. A RiskPlus responde mesmo quando a empresa não tem histórico no bureau.</p>
        <div className="actions load" style={{ "--d": "400ms" }}>
          <a href="#acesso" className="pill pill-fill">Falar com o time</a>
          <a href="#como-funciona" className="more">Como funciona <Icon n="caret-right" b /></a>
        </div>
      </div>

      <div className="hero-demo" ref={demoRef}>
      <div className="load" style={{ "--d": "560ms" }}>
        <div>
          <div className="demo">
            <div className="demo-head">
              <span>Análise de CNPJ</span>
              <span className="ok"><Icon n="lock-simple" b />De acordo com a LGPD</span>
            </div>
            <div className="demo-row">
              <input value={cnpj} placeholder="00.000.000/0000-00" inputMode="numeric" aria-label="CNPJ"
                onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && !busy && analisar()} />
              <button type="button" onClick={() => analisar()} disabled={busy || cnpj.replace(/\D/g, "").length < 14}>
                {busy ? "Analisando…" : <>Analisar <Icon n="arrow-right" /></>}
              </button>
            </div>
            <div className="demo-ex" aria-label="CNPJs de exemplo">
              {Object.keys(SAMPLES).map((k) => (
                <button type="button" key={k} aria-pressed={shown === k && !busy} disabled={busy} onClick={() => { setCnpj(k); analisar(k); }}>{k}</button>
              ))}
            </div>
            <div className="demo-stage" aria-live="polite">
              {busy && (
                <div className="skel">
                  {ANALYSIS_STEPS.map((s, i) => {
                    const st = i < stepIdx ? "done" : i === stepIdx ? "active" : "";
                    return (
                      <div key={i} className={`row ${st}`}>
                        <Icon n={st === "done" ? "check-circle" : st === "active" ? "circle-notch" : "circle"} b={st !== ""} />{s}
                      </div>
                    );
                  })}
                  <div className="bar w3"></div>
                  <div className="bar w1"></div>
                  <div className="bar w2"></div>
                </div>
              )}
              {phase === "demo-only" && (
                <div className="demo-only">
                  <p>Isso aqui é uma demonstração. Pra analisar esse CNPJ, fale com o time.</p>
                  <a href="#acesso" className="pill pill-fill" onClick={() => prefillLead(shown)}>Falar com o time</a>
                </div>
              )}
              {phase === "result" && result && (
                <div className={`res ${result.band}`}>
                  <div className="res-top">
                    <div className="res-av">{result.initials}</div>
                    <div>
                      <div className="res-co">{result.name}</div>
                      <div className="res-cnpj">CNPJ {shown}</div>
                    </div>
                    <span className="res-ex">Exemplo</span>
                  </div>
                  <div className="res-head-row">
                    <span className="res-k">Recomendação</span>
                    <span className={`res-decision tone-${result.band}`}>{result.decision}</span>
                  </div>
                  <span className="res-k">Motivos</span>
                  <div className="traits">
                    {result.traits.map((t, i) => <span key={i} className={`trait ${t.kind}`} style={{ "--i": i }}><Icon n={t.icon} b />{t.text}</span>)}
                  </div>
                  <div className="kv">
                    <div><div className="k">Setor</div><div className="v">{result.setor}</div></div>
                    <div><div className="k">Fundação</div><div className="v">{result.fundacao}</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
    </section>
  );
};

const Marquee = () => (
  <div className="marquee" aria-label="Fontes cruzadas em cada análise">
    <div className="track" aria-hidden="true">
      {[...SOURCES, ...SOURCES].map((s, i) => <span key={i}>{s}</span>)}
    </div>
  </div>
);

// ── Differentiators: tabela comparativa RiskPlus x bureau ────────────────
const Differentiators = () => (
  <section className="sec" id="diferenciais">
    <div className="wrap center lit-head">
      <h2 className="h-lg" data-reveal>O bureau só enxerga quem já tem histórico de crédito.</h2>
      <p className="lead sub-c" data-reveal style={{ "--i": 1 }}>A RiskPlus olha também pra dados que o bureau não usa. Por isso consegue analisar MEI e empresa recém-aberta.</p>
    </div>
    <div className="wrap">
      <div className="cmp" role="table" aria-label="Comparação entre a RiskPlus e o bureau">
        <div className="cmp-row cmp-head" role="row">
          <span role="columnheader">Com a RiskPlus</span>
          <span role="columnheader">No bureau</span>
        </div>
        {STATEMENTS.map((s, i) => (
          <div className="cmp-row" role="row" key={i} data-reveal style={{ "--i": i }}>
            <h3 role="cell">{s.us}</h3>
            <p role="cell"><span className="cmp-tag">No bureau</span>{s.them}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── How it works: responsive grid (3 colunas no desktop, empilha no celular) ──
const HowItWorks = () => {
  return (
    <section className="sec tile" id="como-funciona">
      <div className="wrap gal-head">
        <h2 className="h-lg" data-reveal>Do CNPJ à decisão em três passos.</h2>
      </div>
      <div className="wrap gal">
        <article className="gcard">
          <span className="step">Primeiro</span>
          <h3>Cole o CNPJ.</h3>
          <p className="gtext">Qualquer empresa brasileira, com ou sem pontos e barra no número.</p>
          <div className="gvis"><div className="field-mock"><span>12.345.678/0001-90</span><span className="caret"></span></div></div>
        </article>
        <article className="gcard blue">
          <span className="step">Depois</span>
          <h3>A RiskPlus cruza os dados.</h3>
          <p className="gtext">Receita Federal, quadro societário, comportamento de faturamento e pagamentos e sinais alternativos passam pelo nosso modelo em segundos.</p>
          <div className="gvis"><div className="chips">{SOURCES.slice(0, 5).map((s) => <span key={s}>{s}</span>)}</div></div>
        </article>
        <article className="gcard">
          <span className="step">Por fim</span>
          <h3>Decida com os motivos na mão.</h3>
          <p className="gtext">Você recebe Recomendado, Atenção ou Não recomendado e os fatores que pesaram. Fica fácil explicar pro cliente ou pro sócio por que o prazo saiu ou não.</p>
          <div className="gvis"><div className="verdicts">
            <span className="go">Recomendado <Icon n="check" b /></span>
            <span className="caution">Atenção <Icon n="warning" b /></span>
            <span className="stop">Não recomendado <Icon n="x" b /></span>
          </div></div>
        </article>
      </div>
    </section>
  );
};

// ── Product (dark color block) ────────────────────────────────────────────
const PRODUCT_FOR = [["check-circle", "Pagamentos em dia"], ["trend-up", "Faturamento estável"], ["shield-check", "Quadro societário sem pendências"], ["calendar-blank", "12 anos de Receita ativa"]];
const PRODUCT_WATCH = [["clock", "1 atraso regularizado"]];
const Product = () => (
  <section className="sec dark" id="produto">
    <div className="wrap center">
      <h2 className="h-lg" data-reveal>Uma resposta que você entende de primeira.</h2>
      <p className="lead sub-c" data-reveal style={{ "--i": 1 }}>A RiskPlus diz se vale vender a prazo e mostra o que pesou a favor e o que pesou contra.</p>
    </div>
    <div className="wrap">
      <div className="pcard" data-reveal style={{ "--i": 2 }}>
        <div className="pcard-top">
          <div className="av">MD</div>
          <div>
            <div className="who">Mercatto Distribuição Ltda, CNPJ 12.345.678/0001-90</div>
            <div className="arch go">Recomendado</div>
            <p className="desc">Empresa com pagamentos em dia e faturamento estável. Quadro societário sem pendências e cadastro regular na Receita Federal.</p>
          </div>
          <span className="badge">Exemplo de análise</span>
        </div>
        <div className="pfactors">
          <div>
            <div className="k">A favor</div>
            <div className="traits">{PRODUCT_FOR.map(([ic, t]) => <span key={t} className="trait good"><Icon n={ic} b />{t}</span>)}</div>
          </div>
          <div>
            <div className="k">Ponto de atenção</div>
            <div className="traits">{PRODUCT_WATCH.map(([ic, t]) => <span key={t} className="trait neutral"><Icon n={ic} b />{t}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── The three decisions: bento ───────────────────────────────────────────
const DECISIONS = [
  { cls: "go big", icon: "check-circle", name: "Recomendado", desc: "Pode vender a prazo. Os sinais mostram uma empresa que paga em dia.",
    traits: ["Pagamentos em dia", "Faturamento estável ou crescente", "Quadro societário sem pendências", "Cadastro regular na Receita Federal"] },
  { cls: "caution", icon: "warning", name: "Atenção", desc: "Os sinais estão misturados. Vale olhar os motivos antes de decidir.",
    traits: ["Atrasos recentes em pagamentos", "Faturamento com oscilações"] },
  { cls: "stop", icon: "x-circle", name: "Não recomendado", desc: "Os sinais de risco pesam mais. O mais seguro é vender à vista.",
    traits: ["Sócio ligado a empresas com pendências", "Cadastro inconsistente na Receita Federal"] },
];
const Decisions = () => (
  <section className="sec">
    <div className="wrap">
      <div className="center">
        <h2 className="h-lg" data-reveal>Três respostas possíveis.</h2>
        <p className="lead sub-c" data-reveal style={{ "--i": 1 }}>Cada CNPJ sai com uma recomendação clara e os fatores que levaram até ela.</p>
      </div>
      <div className="bento">
        {DECISIONS.map((d, i) => (
          <article key={d.name} className={`bt ${d.cls}`} data-reveal style={{ "--i": i }}>
            <span className="letter" aria-hidden="true"><Icon n={d.icon} b /></span>
            <span className="tag"><Icon n={d.icon} b />Recomendação</span>
            <h3>{d.name}</h3>
            <p className="bt-desc">{d.desc}</p>
            <div className="bt-k">Sinais que costumam levar aqui</div>
            <ul>{d.traits.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQ_NOTE = <>Se sua dúvida não está aqui, <a href="#acesso">fale com o time</a>. A gente responde em até um dia útil.</>;
// A /doc-e/ usa o mesmo acordeão com as próprias perguntas e sem a nota final.
const FAQ = ({ items = FAQS, note = FAQ_NOTE }) => {
  const [open, setOpen] = React.useState(-1);
  return (
    <section className="sec tile" id="faq">
      <div className="wrap-narrow">
        <h2 className="h-lg center" data-reveal>Perguntas frequentes.</h2>
        <div className="faq">
          {items.map((f, i) => (
            <div key={i} className={`qa ${open === i ? "open" : ""}`}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} aria-controls={`qa-${i}`}>
                <span>{f.q}</span><Icon n="plus" />
              </button>
              <div className="a" id={`qa-${i}`} role="region"><div><p>{f.a}</p></div></div>
            </div>
          ))}
        </div>
        {note && <p className="faq-note">{note}</p>}
      </div>
    </section>
  );
};

// ── Analytics (GA4 só com consentimento) ─────────────────────────────────
// ID da propriedade GA4 (G-XXXXXXXXXX). Vazio: nada é carregado e o aviso de cookies não aparece.
const GA_ID = "";
const CONSENT_KEY = "riskplus-cookies"; // "aceito" | "recusado"
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const saveConsent = (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* navegador sem storage */ } };
let gaLoaded = false;
// O script do Google só é baixado depois do "Aceitar".
const loadGA = () => {
  if (!GA_ID || gaLoaded) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
};
const track = (name, params) => { if (gaLoaded) window.gtag("event", name, params); };
// Ao recusar depois de ter aceitado: apaga os cookies _ga e recarrega sem o GA.
const clearGaCookies = () => {
  const host = location.hostname;
  document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => n.startsWith("_ga")).forEach((n) => {
    [host, "." + host.replace(/^www\./, "")].forEach((d) => { document.cookie = `${n}=; Max-Age=0; path=/; domain=${d}`; });
    document.cookie = `${n}=; Max-Age=0; path=/`;
  });
};
const openCookies = () => window.dispatchEvent(new Event("riskplus:cookies"));

const CookieBanner = () => {
  const [open, setOpen] = React.useState(false); // fechado no HTML do build; decide no navegador
  React.useEffect(() => {
    if (!GA_ID) return;
    const c = readConsent();
    if (c === "aceito") loadGA();
    else if (!c) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("riskplus:cookies", reopen);
    return () => window.removeEventListener("riskplus:cookies", reopen);
  }, []);
  if (!open) return null;
  const choose = (v) => {
    saveConsent(v);
    setOpen(false);
    if (v === "aceito") loadGA();
    else if (gaLoaded) { clearGaCookies(); location.reload(); }
  };
  return (
    <div className="cookies" role="region" aria-label="Aviso de cookies">
      <p>Usamos cookies do Google Analytics para entender como as pessoas usam o site. Eles só são ativados se você aceitar. Saiba mais na <a href="privacidade/">Política de Privacidade</a>.</p>
      <div className="cookies-btns">
        <button type="button" className="pill pill-line pill-sm" onClick={() => choose("recusado")}>Recusar</button>
        <button type="button" className="pill pill-fill pill-sm" onClick={() => choose("aceito")}>Aceitar</button>
      </div>
    </div>
  );
};

// ── Access form ───────────────────────────────────────────────────────────
// URL do Google Apps Script que recebe o lead (docs/envio-do-lead.md).
// Vazia, o formulário mostra o erro com o e-mail do comercial.
const LEAD_ENDPOINT = "";

// Formulário de contato. O site usa sem `produto`; a /doc-e/ manda produto "Doc-e", que vai no assunto e na planilha.
const LeadForm = ({ produto, cta = "Falar com o time", doneText = "A gente fala com você pra marcar sua consulta grátis." }) => {
  const [form, setForm] = React.useState({ nome: "", empresa: "", email: "", whatsapp: "", cnpj: "" });
  const [errors, setErrors] = React.useState({});
  const [sent, setSent] = React.useState(false);
  const [status, setStatus] = React.useState("idle"); // idle | sending | error
  const [hp, setHp] = React.useState(""); // campo escondido contra robôs
  const startedAt = React.useRef(Date.now());
  const formRef = React.useRef(null);

  // CNPJ digitado na demo do hero chega aqui já preenchido.
  React.useEffect(() => {
    const onPrefill = (e) => setForm((f) => ({ ...f, cnpj: formatCnpj(e.detail.cnpj || "") }));
    window.addEventListener("riskplus:prefill", onPrefill);
    return () => window.removeEventListener("riskplus:prefill", onPrefill);
  }, []);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "cnpj" ? formatCnpj(value) : value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };
  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    const err = {};
    if (!form.nome.trim()) err.nome = "Informe seu nome.";
    if (!form.empresa.trim()) err.empresa = "Informe a empresa.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Use um e-mail válido, ex.: nome@empresa.com.br";
    const tel = form.whatsapp.replace(/\D/g, "");
    if (tel.length < 10 || tel.length > 11) err.whatsapp = "Informe o WhatsApp com DDD, ex.: (11) 91234-5678";
    if (form.cnpj && form.cnpj.replace(/\D/g, "").length !== 14) err.cnpj = "O CNPJ tem 14 dígitos.";
    setErrors(err);
    const first = Object.keys(err)[0];
    if (first) { formRef.current?.querySelector(`#f-${first}`)?.focus(); return; }

    setStatus("sending");
    try {
      if (!LEAD_ENDPOINT) throw new Error("LEAD_ENDPOINT vazio");
      // text/plain evita o preflight de CORS, que o Apps Script não responde.
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...form, ...(produto ? { produto } : {}), site: hp, ms: Date.now() - startedAt.current, pagina: location.href }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.erro || "falha");
      setSent(true);
      track("generate_lead", { form: produto ? produto.toLowerCase() : "acesso" });
    } catch {
      setStatus("error");
    }
  };
  const field = (name, label, props = {}, opt) => (
    <div className={`field ${errors[name] ? "err" : ""}`}>
      <label htmlFor={`f-${name}`}>{label}{opt && <span className="opt">opcional</span>}</label>
      <input id={`f-${name}`} name={name} value={form[name]} onChange={handle} aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `f-${name}-msg` : undefined} {...props} />
      {errors[name] && <span className="msg" id={`f-${name}-msg`}>{errors[name]}</span>}
    </div>
  );

  return sent ? (
    <div className="done">
      <Icon n="check-circle" />
      <h3>Recebemos seu contato.</h3>
      <p>{doneText}</p>
    </div>
  ) : (
    <form onSubmit={submit} noValidate ref={formRef}>
      {field("nome", "Nome completo", { placeholder: "Seu nome", autoComplete: "name" })}
      {field("empresa", "Empresa", { placeholder: "Nome da empresa", autoComplete: "organization" })}
      {field("email", "E-mail corporativo", { type: "email", placeholder: "voce@empresa.com.br", autoComplete: "email" })}
      {field("whatsapp", "WhatsApp", { type: "tel", placeholder: "(11) 91234-5678", inputMode: "tel", autoComplete: "tel" })}
      {field("cnpj", "CNPJ da empresa", { placeholder: "00.000.000/0001-00", inputMode: "numeric" }, true)}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-site">Site</label>
        <input id="f-site" name="site" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      <p className="consent">Ao enviar, você concorda com a <a href="privacidade/">Política de Privacidade</a>.</p>
      <button type="submit" className="pill pill-fill" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : cta}
      </button>
      {status === "error" && (
        <p className="send-err" role="alert">
          Não conseguimos enviar agora. Tente de novo ou escreva para <a href="mailto:comercial@riskplus.com.br">comercial@riskplus.com.br</a>.
        </p>
      )}
      <p className="fine">Respondemos em até um dia útil.</p>
    </form>
  );
};

const Access = () => (
  <section className="sec" id="acesso">
    <div className="wrap">
      <div className="access" data-reveal>
        <div>
          <h2 className="h-lg">Faça sua primeira consulta com a gente.</h2>
          <p className="lead">Deixe seu contato. O time faz uma consulta grátis com você e mostra como a RiskPlus funciona na sua operação.</p>
          <ul className="perks">
            <li><Icon n="check-circle" />1 consulta grátis</li>
            <li><Icon n="check-circle" />Sem fidelidade e sem taxa de setup</li>
            <li><Icon n="check-circle" />Onboarding incluído</li>
          </ul>
        </div>
        <div className="form"><LeadForm /></div>
      </div>
    </div>
  </section>
);

// Página da RiskPlus no LinkedIn. Vazio esconde a coluna "Redes" e tira o sameAs do schema.
const LINKEDIN_URL = "https://www.linkedin.com/company/riskplus-br/";

// ── Footer ────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="foot">
    <div className="wrap">
      <p className="note">A RiskPlus usa dados públicos e dados de parceiros contratados. As recomendações apoiam a sua análise de risco, e a decisão de vender a prazo é sempre da sua empresa.</p>
      <div className="cols">
        <div><h4>Produto</h4><a href="#produto">Análise de CNPJ</a><a href="#faq">Análise em lote</a><a href="#faq">API</a><a href="doc-e/">Doc-e: documentos fiscais</a></div>
        <div><h4>Empresa</h4><a href="#acesso">Contato</a><a href="privacidade/">Segurança e LGPD</a></div>
        {LINKEDIN_URL && <div><h4>Redes</h4><a href={LINKEDIN_URL} target="_blank" rel="noopener">LinkedIn</a></div>}
      </div>
      <div className="legal">
        <span>© 2026 RiskPlus Tecnologia Ltda. CNPJ 35.951.627/0001-02, São Paulo.</span>
        <nav aria-label="Legal">
          <a href="privacidade/">Privacidade</a>
          {GA_ID && <button type="button" onClick={openCookies}>Cookies</button>}
        </nav>
      </div>
    </div>
  </footer>
);

const App = () => {
  useReveal();
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <Differentiators />
        <HowItWorks />
        <Product />
        <Decisions />
        <FAQ />
        <Access />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
};

// A montagem fica em src/client.jsx (navegador) e src/prerender.jsx (HTML pronto no build).
export { App, FAQS, LINKEDIN_URL, Logo, Icon, ThemeToggle, FAQ, LeadForm, Footer, CookieBanner, useReveal, GA_ID, openCookies };
