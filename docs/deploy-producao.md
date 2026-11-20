# Deploy em produção (riskplus.com.br)

O workflow `.github/workflows/producao.yml` publica o site a cada push na `main`. Ele roda `npm run build` e copia a pasta `dist/` para a VPS com `rsync` por SSH. No fim, confere se `https://riskplus.com.br/` já serve o bundle novo.

Enquanto a configuração abaixo não existir, o job só mostra um aviso e não falha.

A configuração é feita uma vez, por quem tem acesso de administrador à VPS.

## 1. Descobrir a pasta do site

O Caddy serve o site a partir de uma pasta. Para achar qual:

```bash
sudo grep -rn -A6 'riskplus.com.br' /etc/caddy /srv/*/app/deploy/Caddyfile 2>/dev/null
```

A linha `root` mostra a pasta. Se o Caddy roda em Docker, a pasta que importa é a do **servidor**, montada como volume no container. Ela aparece no `docker-compose.yml`, não no Caddyfile.

Nos passos abaixo, essa pasta é `PASTA_DO_SITE`.

## 2. Criar um usuário só para o deploy

O GitHub não deve entrar com o usuário de administrador. Um usuário sem `sudo`, dono só da pasta do site, limita o estrago se a chave vazar.

```bash
sudo adduser --disabled-password --gecos "" deploy-site
sudo chown -R deploy-site:deploy-site PASTA_DO_SITE
sudo chmod 755 PASTA_DO_SITE
```

O `rsync` precisa estar instalado na VPS: `sudo apt install -y rsync`.

## 3. Criar a chave do GitHub

Na sua máquina, numa pasta temporária:

```bash
ssh-keygen -t ed25519 -N "" -C "github-actions riskplus-site" -f riskplus-deploy
```

Coloque a chave pública no servidor:

```bash
sudo install -d -m 700 -o deploy-site -g deploy-site /home/deploy-site/.ssh
sudo tee -a /home/deploy-site/.ssh/authorized_keys < riskplus-deploy.pub
sudo chown deploy-site:deploy-site /home/deploy-site/.ssh/authorized_keys
sudo chmod 600 /home/deploy-site/.ssh/authorized_keys
```

Teste a entrada:

```bash
ssh -i riskplus-deploy deploy-site@177.7.46.36 'ls PASTA_DO_SITE'
```

## 4. Cadastrar no GitHub

Na pasta do repositório, com o `gh` logado numa conta com acesso de administrador ao `riskplus/riskplus-site-preview`:

```bash
gh variable set DEPLOY_HOST --body "177.7.46.36"
```

```bash
gh variable set DEPLOY_USER --body "deploy-site"
```

```bash
gh variable set DEPLOY_PATH --body "PASTA_DO_SITE"
```

```bash
gh secret set DEPLOY_SSH_KEY < riskplus-deploy
```

```bash
ssh-keyscan -t ed25519 177.7.46.36 | gh secret set DEPLOY_KNOWN_HOSTS
```

Antes de cadastrar a `DEPLOY_KNOWN_HOSTS`, confira se a impressão digital bate com a do servidor (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`, na VPS). Depois, apague os arquivos `riskplus-deploy` e `riskplus-deploy.pub` da máquina.

## 5. Rodar o primeiro deploy

```bash
gh workflow run producao.yml
```

Acompanhe em **Actions → Produção**. O último passo só passa quando `riskplus.com.br` está servindo o bundle novo.

## Voltar uma versão

O deploy publica sempre o que está na `main`. Para voltar, reverta o commit na `main` (`git revert`). O workflow publica de novo a versão anterior.
