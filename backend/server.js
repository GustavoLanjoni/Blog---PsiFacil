const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const db = require("./db");

const app = express();

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÕES GERAIS
|--------------------------------------------------------------------------
*/

// Não revela que o servidor utiliza Express
app.disable("x-powered-by");

// Necessário quando a aplicação está atrás do proxy do Render.
// Também permite que express-rate-limit identifique corretamente o IP.
app.set("trust proxy", 1);


/*
|--------------------------------------------------------------------------
| HEADERS DE SEGURANÇA
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    contentSecurityPolicy: false,

    crossOriginResourcePolicy: {
      policy: "cross-origin"
    },

    referrerPolicy: {
      policy: "strict-origin-when-cross-origin"
    }
  })
);


/*
|--------------------------------------------------------------------------
| BODY / JSON
|--------------------------------------------------------------------------
|
| Limita o tamanho das requisições recebidas pelo servidor.
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);


/*
|--------------------------------------------------------------------------
| RATE LIMIT GLOBAL
|--------------------------------------------------------------------------
|
| Proteção geral contra excesso de requisições.
|--------------------------------------------------------------------------
*/

const limiteGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    erro: "Muitas requisições. Aguarde alguns minutos e tente novamente."
  }
});

app.use(limiteGlobal);


/*
|--------------------------------------------------------------------------
| RATE LIMIT DE AUTENTICAÇÃO
|--------------------------------------------------------------------------
|
| Limite mais rigoroso para login e cadastro.
|--------------------------------------------------------------------------
*/

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente."
  }
});


/*
|--------------------------------------------------------------------------
| ROTAS
|--------------------------------------------------------------------------
*/

const postsRoutes = require("./routes/posts");
const leadsRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const interacoesRoutes = require("./routes/interacoes");
const usuariosRoutes = require("./routes/usuarios");
const perfilUserRoutes = require("./routes/perfilUser");
const postsSalvosRoutes = require("./routes/postsSalvos");
const frasesRoutes = require("./routes/frases");
const preferenciasRoutes = require("./routes/preferencias");
const pushRoutes = require("./routes/push");
const notificacoesRoutes = require("./routes/notificacoes");
const novidadesRoutes = require("./routes/novidades");
const parceriasRouter = require("./routes/parcerias");


/*
|--------------------------------------------------------------------------
| ARQUIVOS ESTÁTICOS
|--------------------------------------------------------------------------
*/

// Imagens públicas dos posts
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    etag: true,
    fallthrough: true
  })
);


// Frontend público
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    etag: true,
    lastModified: true
  })
);


/*
|--------------------------------------------------------------------------
| RATE LIMIT ESPECÍFICO PARA AUTENTICAÇÃO
|--------------------------------------------------------------------------
*/

// Login do administrador
app.use(
  "/auth/login",
  limiteLogin
);

// Login dos usuários
app.use(
  "/usuarios/login",
  limiteLogin
);

// Cadastro dos usuários
app.use(
  "/usuarios/cadastro",
  limiteLogin
);


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

app.use("/posts", postsRoutes);

app.use("/leads", leadsRoutes);

app.use("/auth", authRoutes);

app.use("/upload", uploadRoutes);

app.use("/interacoes", interacoesRoutes);

app.use("/usuarios", usuariosRoutes);

app.use("/perfil", perfilUserRoutes);

app.use("/salvos", postsSalvosRoutes);

app.use("/frases", frasesRoutes);

app.use("/preferencias", preferenciasRoutes);

app.use("/push", pushRoutes);

app.use("/notificacoes", notificacoesRoutes);

app.use("/novidades", novidadesRoutes);

app.use(express.json({limit: "1mb"}));

app.use("/parcerias", parceriasRouter);

/*
|--------------------------------------------------------------------------
| SITEMAP.XML
|--------------------------------------------------------------------------
|
| O sitemap consulta diretamente o PostgreSQL.
|
| Isso evita que o servidor precise fazer uma requisição HTTP
| para o próprio domínio.
|--------------------------------------------------------------------------
*/

app.get("/sitemap.xml", async (req, res) => {
  try {

    const resultado = await db.query(`
      SELECT id
      FROM posts
      WHERE status = 'publicado'
      ORDER BY id DESC
    `);

    const posts = resultado.rows;


    /*
    |--------------------------------------------------------------------------
    | PÁGINAS FIXAS
    |--------------------------------------------------------------------------
    */

    const urlsFixas = [
      "https://psifacilblog.com.br/",
      "https://psifacilblog.com.br/conteudo.html",
      "https://psifacilblog.com.br/ebooks.html",
      "https://psifacilblog.com.br/escuta.html"
    ];


    /*
    |--------------------------------------------------------------------------
    | ARTIGOS
    |--------------------------------------------------------------------------
    */

    const urlsPosts = posts.map((post) => {
      return `https://psifacilblog.com.br/post.html?id=${post.id}`;
    });


    const todasUrls = [
      ...urlsFixas,
      ...urlsPosts
    ];


    /*
    |--------------------------------------------------------------------------
    | ESCAPE XML
    |--------------------------------------------------------------------------
    */

    const escaparXml = (valor) => {
      return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };


    /*
    |--------------------------------------------------------------------------
    | GERAR XML
    |--------------------------------------------------------------------------
    */

    const urlsXml = todasUrls
      .map((url) => {
        return `  <url>
    <loc>${escaparXml(url)}</loc>
  </url>`;
      })
      .join("\n");


    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;


    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    res.status(200);

    res.set({
      "Content-Type": "application/xml; charset=utf-8",

      // O Google pode reutilizar o sitemap por um período curto.
      "Cache-Control": "public, max-age=3600"
    });

    return res.send(sitemap);

  } catch (error) {

    console.error("ERRO AO GERAR SITEMAP:", error);

    return res
      .status(500)
      .type("text/plain")
      .send("Erro ao gerar sitemap.");
  }
});


/*
|--------------------------------------------------------------------------
| ROBOTS.TXT
|--------------------------------------------------------------------------
*/

app.get("/robots.txt", (req, res) => {

  res.status(200);

  res.set({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600"
  });

  return res.send(`User-agent: *
Allow: /

Sitemap: https://psifacilblog.com.br/sitemap.xml
`);

});


/*
|--------------------------------------------------------------------------
| PÁGINA INICIAL
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {

  return res.sendFile(
    path.join(
      __dirname,
      "../frontend/psifacil.html"
    )
  );

});


/*
|--------------------------------------------------------------------------
| ROTA NÃO ENCONTRADA
|--------------------------------------------------------------------------
|
| Sempre deve permanecer DEPOIS das outras rotas.
|--------------------------------------------------------------------------
*/

app.use((req, res) => {

  return res.status(404).json({
    erro: "Rota não encontrada."
  });

});


/*
|--------------------------------------------------------------------------
| TRATAMENTO GLOBAL DE ERROS
|--------------------------------------------------------------------------
|
| Evita retornar detalhes internos do servidor para o navegador.
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {

  console.error("ERRO GLOBAL DO SERVIDOR:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    erro: "Erro interno do servidor."
  });

});


/*
|--------------------------------------------------------------------------
| INICIAR SERVIDOR
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando na porta ${PORT}`
  );

});