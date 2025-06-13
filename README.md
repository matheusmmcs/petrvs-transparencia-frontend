# PETRVS - Transparência Frontend (PGD)

Como executar o projeto em ambiente de desenvolvimento (docker):


## 💻 1 -  Desenvolvimento

Basta configurar os arquivos:

 - .env:
 
```ini
VITE_API_URL=http://localhost:8880
VITE_HEADER_TITLE=Transparência PGD - Órgão
VITE_FOOTER_TEXT=Texto de rodapé
```

 Em seguida executar o comando:

```sh
docker-compose up --build
```

OBS: ao testar, abrir um navegador com CORS desabilitado. No MacOS pode-se utilizar o seguinte comando:

```sh
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

No linux:

```sh
google-chrome --disable-web-security --user-data-dir="/tmp/"
```

A API ficará disponível em **[http://0.0.0.0:5173/transparencia](http://0.0.0.0:5173/transparencia)**! 🚀

A aplicação utiliza PrimeVue + Vite, possuindo hot-reload, auxiliando no ajuste da aplicação sem necessitar de novo build.
