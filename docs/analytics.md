# Analytics (GA4 com aviso de cookies)

O site mede o uso com o Google Analytics 4, e só depois que a pessoa clica em **Aceitar** no aviso de cookies.

- **Antes do aceite:** nenhum script do Google é baixado e nenhum cookie é gravado.
- **Escolha:** fica salva no navegador (`localStorage`, chave `riskplus-cookies`).
- **Mudar de ideia:** o link **Cookies**, no rodapé, reabre o aviso. Quem recusa depois de ter aceitado tem os cookies `_ga` apagados, e a página recarrega sem o GA.
- **Eventos:** além das visitas de página, o envio do formulário dispara o evento `generate_lead`.

Enquanto `GA_ID` estiver vazio em `src/main.jsx`, nada disso aparece: sem ID, não há o que medir, e o aviso não faz sentido.

## Ligar (uma vez)

1. Em [analytics.google.com](https://analytics.google.com), com uma conta Google da RiskPlus, crie uma **propriedade** chamada "Site RiskPlus", com fuso de São Paulo e moeda Real.
2. Crie um **fluxo de dados da Web** para `https://riskplus.com.br`.
3. Copie o **ID da métrica**. Ele começa com `G-`.
4. Coloque o ID em `GA_ID`, no `src/main.jsx`, e faça o merge na `main`. O deploy publica sozinho.
5. Em **Administrador → Eventos**, marque `generate_lead` como **evento principal** (conversão).
6. Em **Administrador → Configurações de dados → Retenção de dados**, escolha o prazo. O padrão é 2 meses, e 14 meses é o máximo.

## Política de privacidade

A política precisa citar o Google Analytics: que dados ele coleta (páginas, dispositivo, origem da visita), que só roda com aceite, o prazo de retenção e que o Google processa os dados fora do Brasil.
