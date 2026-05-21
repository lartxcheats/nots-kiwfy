# 🍉 Setup Kiwufy - Novo Repositório

## Passos para criar o repositório separado:

### 1. Criar novo repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `kiwufy-notificacoes`
3. Descrição: `App de notificações de vendas Kiwufy`
4. Público ou Privado (sua escolha)
5. **NÃO** marque "Add README"
6. Clique em "Create repository"

### 2. Copiar arquivos para nova pasta
```bash
# Criar nova pasta fora do projeto atual
cd ..
mkdir kiwufy-notificacoes
cd kiwufy-notificacoes

# Copiar arquivos do kiwufy
cp -r "../psite(notificações KIUFI)/kiwufy/"* .
```

### 3. Inicializar Git e fazer push
```bash
git init
git add .
git commit -m "Initial commit - Kiwufy app"
git branch -M master
git remote add origin https://github.com/SEU_USUARIO/kiwufy-notificacoes.git
git push -u origin master
```

### 4. Configurar Codemagic
1. Acesse: https://codemagic.io/apps
2. Clique em "Add application"
3. Conecte o novo repositório `kiwufy-notificacoes`
4. O Codemagic vai detectar o `codemagic.yaml` automaticamente
5. Clique em "Start new build"
6. Aguarde o build e baixe o `Kiwufy.ipa`

### 5. Instalar no iPhone
1. Baixe o arquivo `Kiwufy.ipa`
2. Use AltStore, Sideloadly ou TestFlight
3. Instale no iPhone
4. Confie no certificado em: Ajustes > Geral > VPN e Gerenciamento de Dispositivos

## Arquivos incluídos:
- ✅ index.html
- ✅ script.js
- ✅ style.css
- ✅ manifest.json
- ✅ service-worker.js
- ✅ iconeki.png
- ✅ capacitor.config.json
- ✅ package.json
- ✅ codemagic.yaml
- ✅ README.md

## Pronto! 🎉
Agora você tem dois apps separados:
1. **Mercado Pago** (repositório atual)
2. **Kiwufy** (novo repositório)
