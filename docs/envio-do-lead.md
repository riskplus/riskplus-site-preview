# Envio do lead (formulário "Falar com o time")

O formulário do site e o da LP do Doc-e (`/doc-e/`) enviam os dados para um Google Apps Script ligado a uma planilha do Google Workspace da RiskPlus. O script:

- grava cada lead numa linha da aba **Leads**;
- manda um e-mail para `comercial@riskplus.com.br` com o assunto "Novo lead do site: {Empresa}". O "Responder" vai direto para o e-mail do lead.
- marca o produto na coluna **Produto**. O formulário da `/doc-e/` envia `produto: "Doc-e"`: o assunto vira "Novo lead do Doc-e: {Empresa}". Os leads do site saem como "Análise de CNPJ". O script só aceita produtos da lista `PRODUTOS`.

Contra spam, há um campo escondido (robôs preenchem, pessoas não) e um tempo mínimo de 3 segundos entre abrir a página e enviar. Envios que caem nessas regras são descartados sem aviso.

O código está em `apps-script/lead.gs`. A URL do script fica em `LEAD_ENDPOINT`, no `src/main.jsx`. As duas páginas usam a mesma URL. Enquanto ela estiver vazia, o formulário mostra a mensagem de erro com o e-mail do comercial.

## Instalar (uma vez)

Use uma conta do Workspace da RiskPlus. O ideal é a própria `comercial@`. O e-mail sai da conta que instalar o script.

1. No Google Drive, crie uma planilha chamada **Leads do site**.
2. Na planilha, abra **Extensões → Apps Script**.
3. Apague o conteúdo do arquivo `Código.gs` e cole o conteúdo de `apps-script/lead.gs`. Salve.
4. Em **Configurações do projeto** (ícone de engrenagem), coloque o fuso horário `(GMT-03:00) São Paulo`.
5. No editor, escolha a função `testar` e clique em **Executar**. O Google pede autorização para a planilha e para enviar e-mail: aceite. Confira se chegou um e-mail em `comercial@` e se apareceu uma linha na aba **Leads**. Depois, apague essa linha de teste.
6. Clique em **Implantar → Nova implantação**. Em tipo, escolha **App da Web**.
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**.
7. Clique em **Implantar** e copie a **URL do app da Web**. Ela termina em `/exec`.
8. Abra essa URL no navegador. Tem que aparecer `{"ok":true,"servico":"lead riskplus"}`.
9. Passe a URL para quem cuida do site. Ela entra em `LEAD_ENDPOINT`, e o próximo deploy já liga o formulário.

Se a opção **Qualquer pessoa** não aparecer, o administrador do Workspace bloqueou apps da Web públicos. É preciso liberar em **Admin → Apps → Google Workspace → Drive e Documentos → Configurações de compartilhamento**.

## Mudar o código depois

Ao editar o script, publique em **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão**. Assim a URL continua a mesma. Uma **Nova implantação** cria uma URL nova, e aí é preciso trocar o `LEAD_ENDPOINT`.

Na primeira gravação depois da mudança da coluna **Produto**, o script completa o cabeçalho da aba **Leads** sozinho. As linhas antigas ficam com a coluna vazia.

## Limites

- O Gmail do Workspace manda até 1.500 e-mails por dia pelo Apps Script. Para um formulário de contato, sobra.
- O script recusa mais de 20 envios por minuto, como trava contra rajadas de spam.
- Se aparecer spam, o próximo passo é o Cloudflare Turnstile. Ele precisa de conta na Cloudflare e de menção na política de privacidade.
