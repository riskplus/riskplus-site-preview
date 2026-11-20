// Página /doc-e/: LP do Doc-e, produto de documentos fiscais da RiskPlus.
// O build gera o HTML (src/prerender.jsx) e o navegador só hidrata: abas do mock do topo, FAQ, formulário e cookies.
// Copy aprovada pelos sócios em 20/11/2026: não mude o texto sem passar pela especificação.
// Telas: mocks em HTML com os rótulos do app real e dados fictícios (CNPJ e chave sempre mascarados).
import React from "react";
import { Icon, FAQ, LeadForm, CookieBanner, useReveal, GA_ID, openCookies, LINKEDIN_URL } from "./main.jsx";

// A página tem <base href="../">: as âncoras levam o caminho da página para não voltarem à home.
const A = (id) => `doc-e/#${id}`;

// Os nomes dos documentos (NF-e, CT-e OS, Doc-e...) não quebram na hífen.
const DOC_NOMES = /((?:NF|NFC|NFS|CT|Doc)-e(?: OS)?)/g;
const nw = (s) => s.split(DOC_NOMES).map((p, i) => (i % 2 ? <span key={i} className="nw">{p}</span> : p));

export const DOCE_FAQS = [
  { q: "De quanto tempo para trás o Doc-e busca?",
    a: "Na entrada, os últimos 90 dias. Depois disso, ele acompanha as notas novas várias vezes ao dia." },
  { q: "Por quanto tempo os XMLs ficam guardados?",
    a: "Os XMLs ficam organizados e disponíveis para baixar." },
  { q: "Como o Doc-e trata os dados da minha empresa? (LGPD)",
    a: "Os dados de cada cliente ficam isolados dos demais. As ações ficam registradas na auditoria." },
  { q: "O Doc-e emite nota?",
    a: "Não. Ele reúne e organiza os documentos que a sua empresa recebe e emite." },
];

const COBERTURA = ["NF-e", "NFC-e", "NFS-e", "CT-e", "CT-e OS"];

// ── Mock do app ───────────────────────────────────────────────────────────
// Selo do app: pílula com ponto colorido (tons: go, wait, stop, info, neutral).
const Selo = ({ tom, children }) => <span className={`dx-badge ${tom}`}><i aria-hidden="true" />{children}</span>;

const cnpj = (fim) => `••.•••.•••/${fim}`;
const chave = (inicio, fim) => `${inicio} •••• … ${fim}`;

// Uma aba por tipo de documento. Colunas e rótulos iguais às listas do app.
// `quando` e `estado` são as colunas de data e situação, escondidas no celular.
const LISTAS = [
  {
    aba: "NF-e", titulo: "NF-e recebidas", quando: "Emissão", doc: "Nota", parte: "Emitente", valor: "Valor", estado: "Situação",
    linhas: [
      { quando: "19/11/2026", num: "4.512", serie: "1", chave: chave("3526", "4512"), nome: "Atacadão Fictício Ltda", id: cnpj("0001-12"), valor: "R$ 18.430,00", estado: ["go", "Completa"] },
      { quando: "19/11/2026", num: "88.031", serie: "2", chave: chave("3526", "8031"), nome: "Embalagens Modelo S.A.", id: cnpj("0003-40"), valor: "R$ 2.115,90", estado: ["neutral", "Resumo"] },
      { quando: "18/11/2026", num: "120.996", serie: "1", chave: chave("4126", "0996"), nome: "Distribuidora Demo Ltda", id: cnpj("0001-77"), valor: "R$ 41.002,37", estado: ["go", "Completa"] },
      { quando: "18/11/2026", num: "7.204", serie: "3", chave: chave("3126", "7204"), nome: "Química Inventada Ltda", id: cnpj("0002-05"), valor: "R$ 640,00", estado: ["stop", "Cancelada"] },
    ],
  },
  {
    aba: "NFC-e", titulo: "NFC-e", quando: "Emissão", doc: "Nota", parte: "Destinatário", valor: "Valor", estado: "Situação",
    linhas: [
      { quando: "19/11/2026", num: "91.442", serie: "4", chave: chave("3526", "1442"), nome: "Consumidor não identificado", id: "", valor: "R$ 89,90", estado: ["go", "Autorizada"] },
      { quando: "19/11/2026", num: "91.441", serie: "4", chave: chave("3526", "1441"), nome: "Consumidor não identificado", id: "", valor: "R$ 312,00", estado: ["go", "Autorizada"] },
      { quando: "19/11/2026", num: "6.208", serie: "2", chave: chave("3326", "6208"), nome: "Consumidor não identificado", id: "", valor: "R$ 54,70", estado: ["go", "Autorizada"] },
      { quando: "18/11/2026", num: "91.380", serie: "4", chave: chave("3526", "1380"), nome: "Consumidor não identificado", id: "", valor: "R$ 1.020,00", estado: ["stop", "Cancelada"] },
    ],
  },
  {
    aba: "NFS-e", titulo: "NFS-e", quando: "Competência", doc: "Número", parte: "Prestador", valor: "Valor dos serviços", estado: "ISS",
    linhas: [
      { quando: "01/11/2026", num: "880", nome: "Contabilidade Fictícia S/S", id: cnpj("0001-31"), valor: "R$ 3.500,00", estado: "R$ 175,00" },
      { quando: "01/11/2026", num: "127", nome: "Limpeza Modelo Ltda", id: cnpj("0001-58"), valor: "R$ 4.180,00", estado: "R$ 209,00" },
      { quando: "01/11/2026", num: "2.041", nome: "Software Exemplo Ltda", id: cnpj("0001-90"), valor: "R$ 1.290,00", estado: "R$ 25,80" },
      { quando: "01/10/2026", num: "876", nome: "Contabilidade Fictícia S/S", id: cnpj("0001-31"), valor: "R$ 3.500,00", estado: "R$ 175,00" },
    ],
  },
  {
    aba: "CT-e", titulo: "CT-e", quando: "Emissão", doc: "CT-e", parte: "Emitente", valor: "Valor", estado: "Situação",
    linhas: [
      { quando: "19/11/2026", num: "55.019", serie: "1", chave: chave("3526", "5019"), nome: "Transportes Exemplo ME", id: cnpj("0001-64"), valor: "R$ 1.230,00", estado: ["go", "Autorizado"] },
      { quando: "18/11/2026", os: true, num: "3.110", serie: "1", chave: chave("3526", "3110"), nome: "Fretes Imaginários Ltda", id: cnpj("0002-23"), valor: "R$ 4.800,00", estado: ["go", "Autorizado"] },
      { quando: "18/11/2026", num: "55.002", serie: "1", chave: chave("4126", "5002"), nome: "Logística Demo S.A.", id: cnpj("0004-09"), valor: "R$ 860,40", estado: ["go", "Autorizado"] },
      { quando: "17/11/2026", num: "54.987", serie: "1", chave: chave("3526", "4987"), nome: "Transportes Exemplo ME", id: cnpj("0001-64"), valor: "R$ 412,15", estado: ["neutral", "Só resumo"] },
    ],
  },
];

// Moldura do app: barra com a marca e o grupo de empresas, como no topo do Doc-e.
const AppFrame = ({ children, className = "" }) => (
  <div className={`dx-app ${className}`}>
    <div className="dx-app-bar" aria-hidden="true">
      <span className="dx-dots"><i /><i /><i /></span>
      <span className="dx-app-brand">Doc-e</span>
      <span className="dx-app-co">Grupo Exemplo · 3 CNPJs</span>
    </div>
    {children}
  </div>
);

// Tabela de uma lista do app. Só a do topo troca de aba.
const Lista = ({ l }) => (
  <table className="dx-table">
    <caption className="sr-only">{l.titulo}, dados fictícios</caption>
    <thead>
      <tr>
        <th className="dx-sm-hide">{l.quando}</th>
        <th>{l.doc}</th>
        <th>{l.parte}</th>
        <th className="r">{l.valor}</th>
        <th className={`dx-sm-hide${typeof l.linhas[0].estado === "string" ? " r" : ""}`}>{l.estado}</th>
      </tr>
    </thead>
    <tbody>
      {l.linhas.map((r) => (
        <tr key={r.num}>
          <td className="dx-sm-hide num">{r.quando}</td>
          <td>
            <div className="dx-strong num">{r.os && <span className="dx-soft">CT-e OS </span>}{r.num}{r.serie && <span className="dx-soft"> · série {r.serie}</span>}</div>
            {r.chave && <div className="dx-sub num">{r.chave}</div>}
          </td>
          <td className="dx-party">
            <div className="dx-strong dx-link">{r.nome}</div>
            {r.id && <div className="dx-sub num">{r.id}</div>}
          </td>
          <td className="r num">{r.valor}</td>
          {typeof r.estado === "string"
            ? <td className="dx-sm-hide r num">{r.estado}</td>
            : <td className="dx-sm-hide"><Selo tom={r.estado[0]}>{r.estado[1]}</Selo></td>}
        </tr>
      ))}
    </tbody>
  </table>
);

// Topo: a única tela clicável. Abas acessíveis (setas, Home e End trocam de aba).
const HeroApp = () => {
  const [ativa, setAtiva] = React.useState(0);
  const refs = React.useRef([]);
  const teclado = (e, i) => {
    const ultimo = LISTAS.length - 1;
    const destino = { ArrowRight: i === ultimo ? 0 : i + 1, ArrowLeft: i === 0 ? ultimo : i - 1, Home: 0, End: ultimo }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    setAtiva(destino);
    refs.current[destino]?.focus();
  };
  const l = LISTAS[ativa];
  return (
    <AppFrame>
      <div className="dx-tabs" role="tablist" aria-label="Tipo de documento">
        {LISTAS.map((x, i) => (
          <button key={x.aba} type="button" role="tab" id={`dx-aba-${i}`} aria-selected={i === ativa} aria-controls="dx-painel"
            tabIndex={i === ativa ? 0 : -1} ref={(el) => (refs.current[i] = el)} onClick={() => setAtiva(i)} onKeyDown={(e) => teclado(e, i)}>
            {x.aba}
          </button>
        ))}
      </div>
      <div className="dx-panel" role="tabpanel" id="dx-painel" aria-labelledby={`dx-aba-${ativa}`}>
        <div className="dx-head">
          <div>
            <div className="dx-eyebrow">Documentos</div>
            <div className="dx-title">{l.titulo}</div>
          </div>
          <div className="dx-actions" aria-hidden="true">
            <span className="dx-btn">Exportar XLSX</span>
            <span className="dx-btn">Baixar XML (ZIP)</span>
          </div>
        </div>
        <Lista l={l} />
      </div>
    </AppFrame>
  );
};

// Manifestação: detalhe de uma NF-e recebida, com o formulário "Manifestar o destinatário" do app.
const MANIFESTACOES = ["Confirmação da Operação", "Ciência da Operação", "Desconhecimento da Operação", "Operação não Realizada"];
const ManifestacaoApp = () => (
  <AppFrame>
    <div className="dx-panel" aria-label="Detalhe de uma NF-e recebida, dados fictícios" role="img">
      <div className="dx-back">‹ NF-e recebidas</div>
      <div className="dx-head">
        <div>
          <div className="dx-title num">NF-e 88.031 · série 2</div>
          <div className="dx-sub num">3526 •••• •••• •••• •••• •••• •••• •••• •••• •••• 8031</div>
        </div>
        <div className="dx-actions">
          <span className="dx-btn">Baixar XML</span>
          <span className="dx-btn">Baixar DANFE</span>
        </div>
      </div>
      <div className="dx-box">
        <div className="dx-box-t">Resumo</div>
        <div className="dx-badges"><Selo tom="neutral">Resumo</Selo><Selo tom="neutral">Sem manifestação</Selo></div>
        <dl className="dx-pairs">
          <div><dt>Emitente</dt><dd>Embalagens Modelo S.A.</dd></div>
          <div><dt>CNPJ do emitente</dt><dd className="num">{cnpj("0003-40")}</dd></div>
          <div><dt>Emissão</dt><dd className="num">19/11/2026</dd></div>
          <div><dt>Valor</dt><dd className="num">R$ 2.115,90</dd></div>
        </dl>
      </div>
      <div className="dx-box">
        <div className="dx-box-t">Manifestar o destinatário</div>
        <div className="dx-label">Tipo de manifestação</div>
        <div className="dx-select">
          <div className="dx-select-v">Confirmação da Operação <Icon n="caret-right" b /></div>
          <ul className="dx-options">
            {MANIFESTACOES.map((m, i) => <li key={m} className={i === 0 ? "on" : ""}>{i === 0 && <Icon n="check" b />}{m}</li>)}
          </ul>
        </div>
        <span className="dx-btn dx-btn-fill">Manifestar</span>
      </div>
    </div>
  </AppFrame>
);

// Nota inteira: as abas do documento como o app mostra, com a de produtos aberta.
const ABAS_NOTA = ["Dados gerais", "Emitente e destinatário", "Produtos (3)", "Totais", "Transporte", "Cobrança", "Informações adicionais", "Protocolo"];
const ITENS = [
  { n: 1, d: "Caixa de papelão 40x30x20", c: "CX-4030 · NCM 4819.10.00 · CFOP 5102", q: "1.200 UN", u: "R$ 4,00", t: "R$ 4.800,00" },
  { n: 2, d: "Fita adesiva transparente 48 mm", c: "FT-48 · NCM 3919.10.00 · CFOP 5102", q: "600 UN", u: "R$ 2,55", t: "R$ 1.530,00" },
  { n: 3, d: "Etiqueta térmica 100x150", c: "ET-10 · NCM 4821.10.00 · CFOP 5102", q: "5.000 UN", u: "R$ 0,17", t: "R$ 850,00" },
];
const NotaApp = () => {
  // No celular a barra de abas rola na horizontal: começa mostrando a aba aberta.
  const tabsRef = React.useRef(null);
  React.useEffect(() => {
    const bar = tabsRef.current, on = bar.querySelector(".on");
    if (bar.scrollWidth > bar.clientWidth) bar.scrollLeft = on.offsetLeft - bar.offsetLeft - 8;
  }, []);
  return (
  <AppFrame>
    <div className="dx-panel" aria-label="Conteúdo de uma nota fiscal, dados fictícios" role="img">
      <div className="dx-doc-tabs" ref={tabsRef}>
        {ABAS_NOTA.map((a, i) => <span key={a} className={i === 2 ? "on" : ""}>{a}</span>)}
      </div>
      <div className="dx-box-t dx-mt">Produtos e serviços (3)</div>
      <table className="dx-table">
        <thead>
          <tr><th className="dx-sm-hide">Item</th><th>Descrição</th><th className="r">Quantidade</th><th className="r dx-sm-hide">Unitário</th><th className="r">Total</th></tr>
        </thead>
        <tbody>
          {ITENS.map((i) => (
            <tr key={i.n}>
              <td className="dx-sm-hide num">{i.n}</td>
              <td className="dx-party"><div className="dx-strong">{i.d}</div><div className="dx-sub num">{i.c}</div></td>
              <td className="r num">{i.q}</td>
              <td className="r num dx-sm-hide">{i.u}</td>
              <td className="r num">{i.t}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AppFrame>
  );
};

// Exemplo de chamada da API v1 (dados fictícios).
const ApiCode = () => (
  <pre className="dx-code" aria-label="Exemplo de chamada da API do Doc-e">
    <code>
      <span className="c"># NF-e recebidas que mudaram desde a última leitura</span>{"\n"}
      <span className="k">GET</span> /api/v1/nfe?empresa=12&amp;atualizado_desde=<span className="s">2026-11-20T08:00</span>{"\n"}
      Authorization: Bearer <span className="s">••••••••</span>{"\n\n"}
      {"{ "}"total": 38, "pagina": 1, "itens": [{"\n"}
      {"  { "}"chave": <span className="s">"3526…4512"</span>, "numero": 4512,{"\n"}
      {"    "}"nome_emitente": <span className="s">"Atacadão Fictício Ltda"</span>,{"\n"}
      {"    "}"valor": 18430.00, "situacao": <span className="s">"completa"</span>,{"\n"}
      {"    "}"xml_url": <span className="s">"/api/v1/nfe/…/xml"</span>,{"\n"}
      {"    "}"pdf_url": <span className="s">"/api/v1/nfe/…/pdf"</span> {"}"}{"\n"}
      {"] }"}
    </code>
  </pre>
);

// ── Página ────────────────────────────────────────────────────────────────
const Brand = () => (
  <span className="dx-brand"><b>Doc<span>-e</span></b><small>da RiskPlus</small></span>
);

const NAV = [["cobertura", "Cobertura"], ["manifestacao", "Manifestação"], ["api", "API"], ["faq", "Perguntas"]];

const Nav = () => (
  <header className="gnav dx-nav">
    <div className="wrap">
      <a href={A("main")} className="logo" aria-label="Doc-e, da RiskPlus, início"><Brand /></a>
      <nav aria-label="Seções">
        {NAV.map(([id, label]) => <a key={id} href={A(id)}>{label}</a>)}
      </nav>
      <a href={A("contato")} className="pill pill-fill pill-sm">Agendar demonstração</a>
    </div>
  </header>
);

const Footer = () => (
  <footer className="foot dx-foot">
    <div className="wrap">
      <div className="dx-foot-top">
        <Brand />
        <nav className="dx-foot-links" aria-label="RiskPlus">
          <a href="./">riskplus.com.br</a>
          {LINKEDIN_URL && <a href={LINKEDIN_URL} target="_blank" rel="noopener">LinkedIn</a>}
        </nav>
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

export const DocePage = () => {
  useReveal();
  return (
    <>
      <Nav />
      <main id="main" className="dx">
        {/* 1. Topo */}
        <section className="dx-hero">
          <div className="wrap dx-hero-grid">
            <div className="dx-hero-text">
              <h1 className="h-xl load" style={{ "--d": "100ms" }}>Pare de pedir <span className="hl">XML</span> para fornecedor.</h1>
              <p className="lead load" style={{ "--d": "260ms" }}>{nw("O Doc-e reúne todos os documentos fiscais do seu CNPJ, recebidos e emitidos, num só lugar. Ele se atualiza sozinho várias vezes ao dia.")}</p>
              <div className="actions load" style={{ "--d": "400ms" }}>
                <a href={A("contato")} className="pill pill-fill">Agendar demonstração</a>
                <a href={A("api")} className="more">Para integradores <Icon n="caret-right" b /></a>
              </div>
            </div>
            <div className="load" style={{ "--d": "560ms" }}><HeroApp /></div>
          </div>
        </section>

        {/* 2. Cobertura */}
        <section className="sec tile center" id="cobertura">
          <div className="wrap">
            <h2 className="h-lg" data-reveal>Tudo o que sai contra o seu CNPJ, e tudo o que ele emite.</h2>
            <p className="lead sub-c" data-reveal style={{ "--i": 1 }}>{nw("NF-e, NFC-e, NFS-e, CT-e e CT-e OS. Recebidos e emitidos, de todo o país, na mesma tela.")}</p>
            <ul className="dx-cov" data-reveal style={{ "--i": 2 }}>
              {COBERTURA.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <p className="dx-note" data-reveal style={{ "--i": 3 }}>{nw("NFS-e de municípios no padrão nacional.")}</p>
          </div>
        </section>

        {/* 3. Como começa */}
        <section className="sec" id="como-comeca">
          <div className="wrap">
            <h2 className="h-lg center" data-reveal>{nw("Você conecta seus CNPJs. O resto o Doc-e faz.")}</h2>
            <div className="dx-steps">
              <article className="dx-step blue" data-reveal>
                <span className="step">Primeiro</span>
                <h3>CNPJs conectados</h3>
                <p>{nw("Cada CNPJ do grupo entra uma vez no Doc-e.")}</p>
              </article>
              <article className="dx-step" data-reveal style={{ "--i": 1 }}>
                <span className="step">Depois</span>
                <h3>90 dias</h3>
                <p>Na primeira busca, ele já traz os últimos 90 dias.</p>
              </article>
              <article className="dx-step" data-reveal style={{ "--i": 2 }}>
                <span className="step">Todo dia</span>
                <h3>Acompanhamento</h3>
                <p>{nw("A partir daí, o Doc-e busca os documentos novos várias vezes ao dia. Ninguém precisa encaminhar e-mail nem subir arquivo para a nota aparecer.")}</p>
              </article>
            </div>
          </div>
        </section>

        {/* 4. Manifestação */}
        <section className="sec tile" id="manifestacao">
          <div className="wrap dx-split">
            <div data-reveal>
              <h2 className="h-lg">{nw("Responda às NF-e recebidas sem sair do Doc-e.")}</h2>
              <p className="lead">{nw("Toda NF-e emitida contra o seu CNPJ pede uma resposta da empresa. No Doc-e, o time fiscal registra a manifestação direto na nota. Confirma a operação, desconhece uma nota que não reconhece ou informa que a operação não aconteceu.")}</p>
              <p className="lead">A ciência pode ser automática. Com ela, as notas que chegam só como resumo passam a vir com o XML completo.</p>
            </div>
            <div data-reveal style={{ "--i": 1 }}><ManifestacaoApp /></div>
          </div>
        </section>

        {/* 5. A nota inteira na tela + 6. Vários CNPJs e acesso */}
        <section className="sec" id="nota">
          <div className="wrap dx-split rev">
            <div data-reveal>
              <h2 className="h-lg">Abra a nota e veja tudo o que o XML traz.</h2>
              <p className="lead">A nota aparece em abas, como na consulta da SEFAZ: dados gerais, emitente e destinatário, produtos com os impostos de cada item, totais, transporte, cobrança e protocolo. Os eventos da nota ficam na mesma tela. Quando precisar levar para fora, baixe o XML, o DANFE, um ZIP com várias notas ou uma planilha em Excel.</p>
              <h3 className="dx-h3">Todos os CNPJs do grupo num só acesso.</h3>
              <p className="lead">Você decide quem vê cada empresa e o que cada pessoa pode fazer, com perfis prontos ou sob medida.</p>
              <p className="lead">Quem administra usuários entra com verificação em duas etapas. As ações ficam registradas na auditoria.</p>
            </div>
            <div data-reveal style={{ "--i": 1 }}><NotaApp /></div>
          </div>
        </section>

        {/* 7. Para integradores */}
        <section className="sec dark" id="api">
          <div className="wrap dx-split">
            <div data-reveal>
              <span className="dx-kicker">Para integradores</span>
              <h2 className="h-lg">Leve os documentos para o seu ERP.</h2>
              <p className="lead">{nw("A API do Doc-e entrega empresas, NF-e recebidas e emitidas, NFC-e, NFS-e e CT-e, com XML e PDF. Também aceita o envio de NF-e emitidas e a busca por chave. O acesso é por token, separado por cliente.")}</p>
              <a href={A("contato")} className="pill dx-pill-ghost">Pedir a documentação da API</a>
            </div>
            <div data-reveal style={{ "--i": 1 }}><ApiCode /></div>
          </div>
        </section>

        {/* 8. Perguntas frequentes */}
        <FAQ items={DOCE_FAQS} note={null} />

        {/* 9. Fechamento */}
        <section className="sec center" id="contato">
          <div className="wrap">
            <div className="dx-close" data-reveal>
              <h2 className="h-lg">{nw("Veja o Doc-e com os documentos da sua empresa.")}</h2>
              <p className="lead sub-c">{nw("Deixe seu contato. O time marca uma demonstração e mostra como o Doc-e funciona na sua rotina fiscal.")}</p>
              <div className="form">
                <LeadForm produto="Doc-e" cta="Agendar demonstração" doneText="O time fala com você para marcar a demonstração." />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
};
