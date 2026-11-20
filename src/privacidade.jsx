// Página /privacidade/. O build gera o HTML (src/prerender.jsx) e o navegador só hidrata o aviso de cookies.
// Rascunho para revisão jurídica: não mude o texto sem passar pelo advogado.
import React from "react";
import { Logo, ThemeToggle, Footer, CookieBanner } from "./main.jsx";

export const PRIVACY_UPDATED = "20 de novembro de 2026";

const Sec = ({ id, title, children }) => (
  <section id={id}>
    <h2>{title}</h2>
    {children}
  </section>
);

export const PrivacyPage = () => (
  <>
    <header className="gnav">
      <div className="wrap">
        <a href="./" className="logo" aria-label="RiskPlus, voltar ao site"><Logo /></a>
        <div className="pp-right">
          <a href="./#acesso" className="pill pill-fill pill-sm pp-cta">Falar com o time</a>
          <ThemeToggle />
        </div>
      </div>
    </header>
    <main id="main" className="pp">
      <div className="wrap-narrow">
        <h1 className="h-lg">Política de Privacidade</h1>
        <p className="pp-meta">Atualizada em {PRIVACY_UPDATED}.</p>

        <p>Esta política explica quais dados pessoais a RiskPlus trata, por quê, com quem compartilha e como você pode exercer seus direitos. Ela vale para este site e para o serviço de análise de empresas.</p>

        <Sec id="quem-somos" title="Quem somos">
          <p>A RiskPlus Tecnologia Ltda., CNPJ 35.951.627/0001-02, com sede em São Paulo (SP), é a controladora dos dados tratados neste site e no serviço.</p>
          <p>Para qualquer assunto sobre privacidade e dados pessoais, escreva para <a href="mailto:comercial@riskplus.com.br">comercial@riskplus.com.br</a>.</p>
        </Sec>

        <Sec id="formulario" title="Formulário de contato">
          <p>Quando você preenche o formulário "Falar com o time", recebemos nome, empresa, e-mail corporativo, WhatsApp e, se você informar, o CNPJ da empresa.</p>
          <p>Usamos esses dados para responder ao seu contato e marcar a consulta grátis. A base legal é a execução de procedimentos preliminares a um contrato, a seu pedido (LGPD, art. 7º, V).</p>
          <p>Os dados ficam no Google Workspace da RiskPlus: numa planilha e no e-mail do time comercial. Guardamos por até 24 meses depois do último contato. Se você virar cliente, guardamos enquanto durar a relação e pelo prazo que a lei exigir depois dela.</p>
          <p>Para barrar envios automáticos, o formulário tem um campo escondido e mede o tempo entre abrir a página e enviar. Isso não coleta nenhum dado além dos campos acima.</p>
        </Sec>

        <Sec id="demo" title="Demonstração de análise">
          <p>A análise de CNPJ no topo do site é uma demonstração. Ela mostra apenas exemplos fictícios. O CNPJ digitado ali não é consultado nem enviado para a RiskPlus, a menos que você o leve para o formulário de contato.</p>
        </Sec>

        <Sec id="cookies" title="Cookies e Google Analytics">
          <p>Usamos o Google Analytics 4 para entender como as pessoas usam o site: páginas visitadas, tempo na página, origem da visita, tipo de dispositivo e região aproximada.</p>
          <p>O Google Analytics só é ativado se você clicar em "Aceitar" no aviso de cookies. Antes disso, nenhum script do Google é carregado e nenhum cookie de análise é gravado. A base legal é o seu consentimento (LGPD, art. 7º, I).</p>
          <p>Sua escolha fica salva no seu navegador. Para mudar de ideia, use o link "Cookies" no rodapé. Se você recusar depois de ter aceitado, apagamos os cookies do Google Analytics do seu navegador.</p>
          <p>O site não usa cookies de publicidade.</p>
        </Sec>

        <Sec id="analise" title="Dados das empresas analisadas">
          <p>A RiskPlus analisa empresas pelo CNPJ para apoiar a decisão de vender a prazo. A recomendação ajuda a análise de risco do cliente, e a decisão de vender a prazo é sempre do cliente.</p>
          <p>Na análise, usamos:</p>
          <ul>
            <li>dados públicos, como o cadastro da Receita Federal e o quadro societário;</li>
            <li>dados de parceiros contratados sobre faturamento, pagamentos e outros sinais de risco da empresa.</li>
          </ul>
          <p>Dados de empresa, em regra, não são dados pessoais. Alguns podem ser, como o nome dos sócios ou o CNPJ de um empresário individual. Do quadro societário, usamos só os dados públicos da Receita Federal. Não consultamos CPF e não usamos dados pessoais sensíveis.</p>
          <p>Quando a análise envolve dado pessoal, a base legal é a proteção do crédito (LGPD, art. 7º, X).</p>
        </Sec>

        <Sec id="compartilhamento" title="Com quem compartilhamos">
          <p>Compartilhamos dados só com quem precisa deles para o serviço funcionar:</p>
          <ul>
            <li><b>Google</b>, que fornece o Google Workspace (e-mail e planilhas) e o Google Analytics;</li>
            <li><b>Hostinger</b>, que hospeda o servidor do site. O servidor pode registrar dados técnicos de acesso, como endereço IP, data e página, para segurança e diagnóstico;</li>
            <li><b>parceiros de dados</b> contratados para a análise de empresas;</li>
            <li><b>autoridades</b>, quando a lei ou uma ordem judicial exigir.</li>
          </ul>
          <p>Não vendemos dados pessoais.</p>
        </Sec>

        <Sec id="transferencia" title="Transferência internacional">
          <p>O Google pode processar dados em servidores fora do Brasil. Nesses casos, a transferência segue as garantias previstas na LGPD (arts. 33 a 36) e nos termos de serviço do Google.</p>
        </Sec>

        <Sec id="direitos" title="Seus direitos">
          <p>Se algum dado tratado pela RiskPlus for seu, você pode pedir:</p>
          <ul>
            <li>confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>informação sobre com quem compartilhamos seus dados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;</li>
            <li>eliminação dos dados tratados com seu consentimento e revogação do consentimento;</li>
            <li>revisão de uma análise feita de forma automatizada e explicação dos critérios usados, respeitado o segredo comercial (LGPD, art. 20).</li>
          </ul>
          <p>Para pedir, escreva para <a href="mailto:comercial@riskplus.com.br">comercial@riskplus.com.br</a>. Podemos pedir informações para confirmar sua identidade. Respondemos em até 15 dias.</p>
          <p>Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>
        </Sec>

        <Sec id="seguranca" title="Segurança">
          <p>O site só funciona por conexão criptografada (HTTPS). O acesso aos dados de contato e às análises é restrito às pessoas da RiskPlus que precisam deles para trabalhar.</p>
        </Sec>

        <Sec id="mudancas" title="Mudanças nesta política">
          <p>Podemos atualizar esta política. A data da última atualização fica no topo da página. Se a mudança for relevante, avisamos neste site.</p>
        </Sec>
      </div>
    </main>
    <Footer />
    <CookieBanner />
  </>
);
