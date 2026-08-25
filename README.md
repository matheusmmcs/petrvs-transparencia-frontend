# PETRVS - Transparência Frontend (PGD)

Interface de transparência do Programa de Gestão e Desempenho (PGD) do PETRVS, desenvolvida em **Vue 3**, **Vite**, **PrimeVue** e **TailwindCSS**.

---

## 💻 1. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto (você pode copiar o `.env-sample`):

```sh
cp .env-sample .env
```

Configure as variáveis de ambiente necessárias:

```ini
# URL da API de Transparência

# Ou para apontar para a API local (porta padrão 8880):
VITE_API_URL=http://localhost:8880

# Títulos e textos de exibição
VITE_HEADER_TITLE=Transparência PGD - Órgão
VITE_FOOTER_TEXT=Texto de rodapé
```

---

## 🚀 2. Executando em Desenvolvimento

### Opção A: Utilizando Docker Compose (Recomendado)

Utilize o arquivo `docker-compose-dev.yml` para iniciar o container com suporte a *hot-reload*:

```sh
docker compose -f docker-compose-dev.yml up --build
```

*(Caso use Docker Compose v1: `docker-compose -f docker-compose-dev.yml up --build`)*

A aplicação ficará disponível em: **[http://localhost:5173/transparencia](http://localhost:5173/transparencia)**

### Opção B: Execução Local (Node.js)

Caso prefira executar diretamente na máquina host:

```sh
# Instalação das dependências
npm install

# Inicialização do servidor de desenvolvimento Vite
npm run dev
```

A aplicação ficará disponível em: **[http://localhost:5173/transparencia](http://localhost:5173/transparencia)**

---

## 🌐 3. Testes com CORS / Ambiente Homologação

Ao testar a aplicação em desenvolvimento local conectada à API remota de homologação (`https://petrvshomolog.ufpi.edu.br/transparencia-api/`), pode ser necessário desabilitar a checagem de CORS no navegador caso a API remota restrinja requisições originadas de `localhost`.

### macOS:
```sh
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

### Linux:
```sh
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_test"
```

### Windows:
```cmd
chrome.exe --disable-web-security --user-data-dir="C:/tmp/chrome_dev_test"
```

---

## 📦 4. Build e Deploy

### 4.1. Versionamento

Antes de realizar o deploy de uma nova versão:
1. Atualize o campo `"version"` no arquivo `package.json` (ex: `1.1.5` -> `1.1.6`).
2. Faça commit e push das alterações para o repositório no GitHub.

### 4.2. Deploy Automatizado (GitHub Actions & GHCR)

O repositório possui uma GitHub Action configurada (`.github/workflows/build-and-push.yml`) para construir e publicar automaticamente a imagem no **GitHub Container Registry (ghcr.io)**:

1. Acesse o repositório no GitHub e vá até a aba **Actions**.
2. No menu lateral esquerdo, selecione o workflow **Build and Push Docker Image**.
3. Clique em **Run workflow**.
4. Selecione a branch desejada e defina o parâmetro:
   - `confirm_version`: `true`
5. Clique em **Run workflow** para iniciar a compilação e envio da imagem Docker.
6. A imagem será publicada em:
   `ghcr.io/<organizacao-ou-usuario>/petrvs-transparencia-frontend:<versao>`

### 4.3. Build Manual (Produção Estática)

Para gerar os artefatos estáticos de produção sem Docker:

```sh
npm run build
```

Os arquivos compilados e otimizados serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor HTTP (como Nginx ou Apache).

### 4.4. Build Manual da Imagem Docker

Para construir a imagem Docker localmente:

```sh
docker build -t petrvs-transparencia-frontend:latest .
```
