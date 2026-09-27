const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const app = express();

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÕES BÁSICAS DE SEGURANÇA
|--------------------------------------------------------------------------
*/

// Não informa que o servidor utiliza Express
app.disable("x-powered-by");

// Headers de segurança HTTP
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Limite de tamanho das requisições JSON
app.use(
  express.json({
    limit: "1mb"
  })
);


/*
|--------------------------------------------------------------------------
| RATE LIMIT GLOBAL
|--------------------------------------------------------------------------
|
| Limita excesso de requisições para evitar abuso do servidor.
|
| 300 requisições por IP a cada 15 minutos.
|
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
| RATE LIMIT PARA LOGIN
|--------------------------------------------------------------------------
|
| Login recebe um limite mais rigoroso para dificultar tentativas
| repetidas de senha.
|
*/

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    erro: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente."
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


/*
|--------------------------------------------------------------------------
| ARQUIVOS ESTÁTICOS
|--------------------------------------------------------------------------
*/

// Imagens públicas dos posts
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Frontend público
app.use(
  express.static(path.join(__dirname, "../frontend"))
);


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

// Login do administrador
app.use(
  "/auth/login",
  limiteLogin
);

// Login/cadastro dos usuários
app.use(
  "/usuarios/login",
  limiteLogin
);

app.use(
  "/usuarios/cadastro",
  limiteLogin
);


// Rotas da API
app.use("/posts", postsRoutes);

app.use("/leads", leadsRoutes);

app.use("/auth", authRoutes);

app.use("/upload", uploadRoutes);

app.use("/interacoes", interacoesRoutes);

app.use("/usuarios", usuariosRoutes);

app.use("/perfil", perfilUserRoutes);

app.use("/salvos", postsSalvosRoutes);


/*
|--------------------------------------------------------------------------
| SITEMAP
|--------------------------------------------------------------------------
*/

app.get("/sitemap.xml", async (req, res) => {
  try {
    const resposta = await fetch(
      "https://psifacil-blog.onrender.com/posts"
    );

    if (!resposta.ok) {
      throw new Error("Erro ao buscar os posts.");
    }

    const posts = await resposta.json();

    const urlsFixas = [
      "https://psifacil-blog.onrender.com/",
      "https://psifacil-blog.onrender.com/psifacil.html",
      "https://psifacil-blog.onrender.com/conteudo.html",
      "https://psifacil-blog.onrender.com/ebooks.html",
      "https://psifacil-blog.onrender.com/escuta.html"
    ];

    const urlsPosts = posts.map((post) => {
      return `https://psifacil-blog.onrender.com/post.html?id=${post.id}`;
    });

    const todasUrls = [
      ...urlsFixas,
      ...urlsPosts
    ];

    const urlsXml = todasUrls
      .map((url) => {
        return `  <url>
    <loc>${url}</loc>
  </url>`;
      })
      .join("\n");

    res.type("application/xml");

    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`);
  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);

    res
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
  res.type("text/plain");

  res.send(`User-agent: *
Allow: /

Sitemap: https://psifacil-blog.onrender.com/sitemap.xml`);
});


/*
|--------------------------------------------------------------------------
| PÁGINA INICIAL
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/psifacil.html")
  );
});


/*
|--------------------------------------------------------------------------
| ROTA NÃO ENCONTRADA
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada."
  });
});


/*
|--------------------------------------------------------------------------
| TRATAMENTO GLOBAL DE ERROS
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("ERRO GLOBAL DO SERVIDOR:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
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
  console.log(`Servidor rodando na porta ${PORT}`);
});