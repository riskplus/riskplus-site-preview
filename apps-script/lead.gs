// Recebe o lead do formulário do site, grava na planilha e avisa o comercial por e-mail.
// Roda como Google Apps Script ligado a uma planilha. Instalação: docs/envio-do-lead.md.

const DESTINO = "comercial@riskplus.com.br";
const ABA = "Leads";
const TEMPO_MINIMO_MS = 3000;      // envio mais rápido que isso é robô
const LIMITE_POR_MINUTO = 20;      // trava de segurança contra rajada de envios
const CABECALHO = ["Data", "Nome", "Empresa", "E-mail", "WhatsApp", "CNPJ", "Página"];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Campo escondido preenchido ou envio rápido demais: responde ok e descarta.
    if (d.site) return resposta({ ok: true });
    if (!(Number(d.ms) >= TEMPO_MINIMO_MS)) return resposta({ ok: true });

    const v = {
      nome: texto(d.nome),
      empresa: texto(d.empresa),
      email: texto(d.email),
      whatsapp: texto(d.whatsapp),
      cnpj: texto(d.cnpj),
      pagina: texto(d.pagina),
    };
    const tel = v.whatsapp.replace(/\D/g, "");
    if (!v.nome || !v.empresa || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) || tel.length < 10 || tel.length > 11) {
      return resposta({ ok: false, erro: "dados" });
    }
    if (!dentroDoLimite()) return resposta({ ok: false, erro: "limite" });

    const quando = new Date();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      aba().appendRow([quando, v.nome, v.empresa, v.email, v.whatsapp, v.cnpj, v.pagina].map(celula));
    } finally {
      lock.releaseLock();
    }

    const data = Utilities.formatDate(quando, "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
    MailApp.sendEmail({
      to: DESTINO,
      replyTo: v.email,
      name: "Site RiskPlus",
      subject: "Novo lead do site: " + v.empresa,
      body: [
        "Novo contato pelo formulário do site.",
        "",
        "Nome: " + v.nome,
        "Empresa: " + v.empresa,
        "E-mail: " + v.email,
        "WhatsApp: " + v.whatsapp,
        "CNPJ: " + (v.cnpj || "não informado"),
        "Data: " + data,
        "",
        "Responda este e-mail para falar direto com o lead.",
      ].join("\n"),
    });

    return resposta({ ok: true });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, erro: "interno" });
  }
}

// Abrir a URL no navegador mostra só isto. Serve para conferir se a implantação está no ar.
function doGet() {
  return resposta({ ok: true, servico: "lead riskplus" });
}

function texto(x) {
  return String(x == null ? "" : x).trim().slice(0, 200);
}

// Impede que um valor começando com = + - @ vire fórmula na planilha.
function celula(x) {
  return typeof x === "string" && /^[=+\-@]/.test(x) ? "'" + x : x;
}

function aba() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let a = planilha.getSheetByName(ABA);
  if (!a) a = planilha.insertSheet(ABA);
  if (a.getLastRow() === 0) a.appendRow(CABECALHO);
  return a;
}

function dentroDoLimite() {
  const cache = CacheService.getScriptCache();
  const chave = "envios-" + Math.floor(Date.now() / 60000);
  const n = Number(cache.get(chave) || 0) + 1;
  cache.put(chave, String(n), 120);
  return n <= LIMITE_POR_MINUTO;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Rode uma vez pelo editor para autorizar planilha e e-mail e testar o envio.
function testar() {
  const r = doPost({ postData: { contents: JSON.stringify({
    nome: "Teste", empresa: "Teste do script", email: DESTINO, whatsapp: "(11) 90000-0000", ms: 5000, pagina: "teste",
  }) } });
  console.log(r.getContent());
}
