const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const db = require("./db");
const renderPost = require("./services/renderPost");

const app = express();


/*
|--------------------------------------------------------------------------
| CONFIGURAÇÕES GERAIS
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

/*
|--------------------------------------------------------------------------
| TRUST PROXY
|--------------------------------------------------------------------------
*/

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
*/

const limiteGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    erro:
      "Muitas requisições. Aguarde alguns minutos e tente novamente."
  }
});

app.use(limiteGlobal);


/*
|--------------------------------------------------------------------------
| RATE LIMIT DE LOGIN / CADASTRO
|--------------------------------------------------------------------------
*/

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    erro:
      "Muitas tentativas. Aguarde alguns minutos e tente novamente."
  }
});


/*
|--------------------------------------------------------------------------
| IMPORTAÇÃO DAS ROTAS
|--------------------------------------------------------------------------
*/

const postsRoutes =
  require("./routes/posts");

const leadsRoutes =
  require("./routes/leads");

const authRoutes =
  require("./routes/auth");

const uploadRoutes =
  require("./routes/upload");

const interacoesRoutes =
  require("./routes/interacoes");

const usuariosRoutes =
  require("./routes/usuarios");

const perfilUserRoutes =
  require("./routes/perfilUser");

const postsSalvosRoutes =
  require("./routes/postsSalvos");

const frasesRoutes =
  require("./routes/frases");

const preferenciasRoutes =
  require("./routes/preferencias");

const pushRoutes =
  require("./routes/push");

const notificacoesRoutes =
  require("./routes/notificacoes");

const novidadesRoutes =
  require("./routes/novidades");

const parceriasRouter =
  require("./routes/parcerias");


/*
|--------------------------------------------------------------------------
| REDIRECIONAMENTO DAS URLs ANTIGAS DOS ARTIGOS
|--------------------------------------------------------------------------
|
| IMPORTANTE:
|
| Esta rota precisa ficar ANTES do express.static().
|
| Isso acontece porque existe um arquivo físico:
|
| frontend/post.html
|
| Se o express.static() vier primeiro, ele poderá entregar
| post.html diretamente e impedir que o redirecionamento
| seja executado.
|
| Exemplo antigo:
|
| /post.html?id=10
|
| Nova URL:
|
| /artigos/como-cuidar-da-sua-saude-mental-no-dia-a-dia
|
| Status utilizado:
|
| 301 = mudança permanente.
|
|--------------------------------------------------------------------------
*/

app.get(
  "/post.html",
  async (req, res, next) => {

    try {

      /*
      |--------------------------------------------------------------------------
      | PEGAR ID
      |--------------------------------------------------------------------------
      */

      const id =
        String(
          req.query.id || ""
        ).trim();


      /*
      |--------------------------------------------------------------------------
      | SEM ID
      |--------------------------------------------------------------------------
      |
      | Se alguém acessar simplesmente:
      |
      | /post.html
      |
      | não existe artigo específico para redirecionar.
      |
      */

      if (!id) {

        return res.redirect(
          301,
          "/"
        );

      }


      /*
      |--------------------------------------------------------------------------
      | VALIDAR ID
      |--------------------------------------------------------------------------
      */

      if (!/^\d+$/.test(id)) {

        return res.redirect(
          301,
          "/"
        );

      }


      /*
      |--------------------------------------------------------------------------
      | BUSCAR O SLUG DO POST
      |--------------------------------------------------------------------------
      */

      const resultado =
        await db.query(
          `
            SELECT
              id,
              slug
            FROM posts
            WHERE id = $1
              AND status = 'publicado'
            LIMIT 1
          `,
          [
            id
          ]
        );


      /*
      |--------------------------------------------------------------------------
      | POST NÃO ENCONTRADO
      |--------------------------------------------------------------------------
      */

      if (
        resultado.rows.length === 0
      ) {

        return res
          .status(404)
          .type("html")
          .send(
`<!DOCTYPE html>

<html lang="pt-BR">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="robots"
    content="noindex, follow"
  >

  <title>
    Artigo não encontrado | PsiFácil
  </title>

</head>

<body>

  <h1>
    Artigo não encontrado
  </h1>

  <p>
    O artigo solicitado não está disponível.
  </p>

  <a href="/">
    Voltar para o PsiFácil
  </a>

</body>

</html>`
          );

      }


      /*
      |--------------------------------------------------------------------------
      | SLUG
      |--------------------------------------------------------------------------
      */

      const post =
        resultado.rows[0];


      const slug =
        String(
          post.slug || ""
        ).trim();


      /*
      |--------------------------------------------------------------------------
      | POST SEM SLUG
      |--------------------------------------------------------------------------
      |
      | Isso não deveria acontecer após nossa migração,
      | mas mantemos a proteção.
      |
      */

      if (!slug) {

        console.error(
          `POST ${id} NÃO POSSUI SLUG.`
        );


        return res
          .status(500)
          .type("text/plain")
          .send(
            "Não foi possível localizar a nova URL deste artigo."
          );

      }


      /*
      |--------------------------------------------------------------------------
      | URL NOVA
      |--------------------------------------------------------------------------
      */

      const novaUrl =
        `/artigos/${encodeURIComponent(
          slug
        )}`;


      /*
      |--------------------------------------------------------------------------
      | REDIRECIONAMENTO PERMANENTE
      |--------------------------------------------------------------------------
      */

      return res.redirect(
        301,
        novaUrl
      );

    } catch (error) {

      console.error(
        "ERRO AO REDIRECIONAR URL ANTIGA:",
        error
      );


      return next(
        error
      );

    }

  }
);


/*
|--------------------------------------------------------------------------
| ARQUIVOS ESTÁTICOS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| UPLOADS
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",

  express.static(
    path.join(
      __dirname,
      "uploads"
    ),
    {
      maxAge: "7d",
      etag: true,
      fallthrough: true
    }
  )
);


/*
|--------------------------------------------------------------------------
| FRONTEND
|--------------------------------------------------------------------------
*/

app.use(
  express.static(
    path.join(
      __dirname,
      "../frontend"
    ),
    {
      etag: true,
      lastModified: true
    }
  )
);


/*
|--------------------------------------------------------------------------
| RATE LIMIT ESPECÍFICO DE AUTENTICAÇÃO
|--------------------------------------------------------------------------
*/

app.use(
  "/auth/login",
  limiteLogin
);

app.use(
  "/usuarios/login",
  limiteLogin
);

app.use(
  "/usuarios/cadastro",
  limiteLogin
);


/*
|--------------------------------------------------------------------------
| ROTAS DA API
|--------------------------------------------------------------------------
*/

app.use(
  "/posts",
  postsRoutes
);

app.use(
  "/leads",
  leadsRoutes
);

app.use(
  "/auth",
  authRoutes
);

app.use(
  "/upload",
  uploadRoutes
);

app.use(
  "/interacoes",
  interacoesRoutes
);

app.use(
  "/usuarios",
  usuariosRoutes
);

app.use(
  "/perfil",
  perfilUserRoutes
);

app.use(
  "/salvos",
  postsSalvosRoutes
);

app.use(
  "/frases",
  frasesRoutes
);

app.use(
  "/preferencias",
  preferenciasRoutes
);

app.use(
  "/push",
  pushRoutes
);

app.use(
  "/notificacoes",
  notificacoesRoutes
);

app.use(
  "/novidades",
  novidadesRoutes
);

app.use(
  "/parcerias",
  parceriasRouter
);


/*
|--------------------------------------------------------------------------
| SITEMAP.XML
|--------------------------------------------------------------------------
|
| Sitemap dinâmico utilizando somente as URLs novas.
|
|--------------------------------------------------------------------------
*/

app.get(
  "/sitemap.xml",
  async (req, res) => {

    try {

      /*
      |--------------------------------------------------------------------------
      | BUSCAR POSTS PUBLICADOS
      |--------------------------------------------------------------------------
      */

      const resultado =
        await db.query(`
          SELECT
            id,
            slug,
            criado_em
          FROM posts
          WHERE status = 'publicado'
            AND slug IS NOT NULL
            AND TRIM(slug) <> ''
          ORDER BY criado_em DESC
        `);


      const posts =
        resultado.rows;


      /*
      |--------------------------------------------------------------------------
      | ESCAPE XML
      |--------------------------------------------------------------------------
      */

      function escaparXml(valor = "") {

        return String(valor)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      }


      /*
      |--------------------------------------------------------------------------
      | FORMATAR DATA
      |--------------------------------------------------------------------------
      */

      function formatarDataSitemap(data) {

        if (!data) {
          return null;
        }


        const objetoData =
          new Date(data);


        if (
          Number.isNaN(
            objetoData.getTime()
          )
        ) {

          return null;

        }


        return objetoData.toISOString();

      }


      /*
      |--------------------------------------------------------------------------
      | PÁGINAS FIXAS
      |--------------------------------------------------------------------------
      */

      const paginasFixas = [

        {
          loc:
            "https://psifacilblog.com.br/"
        },

        {
          loc:
            "https://psifacilblog.com.br/conteudo.html"
        },

        {
          loc:
            "https://psifacilblog.com.br/ebooks.html"
        },

        {
          loc:
            "https://psifacilblog.com.br/escuta.html"
        }

      ];


      /*
      |--------------------------------------------------------------------------
      | ARTIGOS
      |--------------------------------------------------------------------------
      */

      const urlsPosts =
        posts.map(
          (post) => {

            const slug =
              String(
                post.slug
              ).trim();


            const url =
              `https://psifacilblog.com.br/artigos/${encodeURIComponent(
                slug
              )}`;


            const lastmod =
              formatarDataSitemap(
                post.criado_em
              );


            return {
              loc: url,
              lastmod
            };

          }
        );


      /*
      |--------------------------------------------------------------------------
      | JUNTAR TODAS AS URLs
      |--------------------------------------------------------------------------
      */

      const todasUrls = [
        ...paginasFixas,
        ...urlsPosts
      ];


      /*
      |--------------------------------------------------------------------------
      | GERAR XML
      |--------------------------------------------------------------------------
      */

      const urlsXml =
        todasUrls

          .map(
            (item) => {

              const loc =
                escaparXml(
                  item.loc
                );


              const lastmod =
                item.lastmod
                  ? `
    <lastmod>${escaparXml(
      item.lastmod
    )}</lastmod>`
                  : "";


              return `  <url>
    <loc>${loc}</loc>${lastmod}
  </url>`;

            }
          )

          .join("\n");


      /*
      |--------------------------------------------------------------------------
      | SITEMAP FINAL
      |--------------------------------------------------------------------------
      */

      const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
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

        "Content-Type":
          "application/xml; charset=utf-8",

        "Cache-Control":
          "public, max-age=3600"

      });


      return res.send(
        sitemap
      );

    } catch (error) {

      console.error(
        "ERRO AO GERAR SITEMAP:",
        error
      );


      return res
        .status(500)
        .type("text/plain")
        .send(
          "Erro ao gerar sitemap."
        );

    }

  }
);


/*
|--------------------------------------------------------------------------
| ROBOTS.TXT
|--------------------------------------------------------------------------
*/

app.get(
  "/robots.txt",
  (req, res) => {

    res.status(200);


    res.set({

      "Content-Type":
        "text/plain; charset=utf-8",

      "Cache-Control":
        "public, max-age=3600"

    });


    return res.send(
`User-agent: *
Allow: /

Sitemap: https://psifacilblog.com.br/sitemap.xml
`
    );

  }
);


/*
|--------------------------------------------------------------------------
| ARTIGOS COM URL AMIGÁVEL + SEO SERVER-SIDE
|--------------------------------------------------------------------------
|
| Exemplo:
|
| /artigos/sintomas-crises-e-quando-procurar-ajuda
|
|--------------------------------------------------------------------------
*/

app.get(
  "/artigos/:slug",
  async (req, res) => {

    try {

      /*
      |--------------------------------------------------------------------------
      | SLUG
      |--------------------------------------------------------------------------
      */

      const {
        slug
      } = req.params;


      /*
      |--------------------------------------------------------------------------
      | BUSCAR ARTIGO
      |--------------------------------------------------------------------------
      */

      const resultado =
        await db.query(
          `
            SELECT *
            FROM posts
            WHERE slug = $1
              AND status = 'publicado'
            LIMIT 1
          `,
          [
            slug
          ]
        );


      /*
      |--------------------------------------------------------------------------
      | ARTIGO NÃO ENCONTRADO
      |--------------------------------------------------------------------------
      */

      if (
        resultado.rows.length === 0
      ) {

        return res
          .status(404)
          .type("html")
          .send(
`<!DOCTYPE html>

<html lang="pt-BR">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="robots"
    content="noindex, follow"
  >

  <title>
    Artigo não encontrado | PsiFácil
  </title>

</head>

<body>

  <h1>
    Artigo não encontrado
  </h1>

  <p>
    O conteúdo que você tentou acessar não está disponível.
  </p>

  <a href="/">
    Voltar para o PsiFácil
  </a>

</body>

</html>`
          );

      }


      /*
      |--------------------------------------------------------------------------
      | POST
      |--------------------------------------------------------------------------
      */

      const post =
        resultado.rows[0];


      /*
      |--------------------------------------------------------------------------
      | GERAR HTML SERVER-SIDE
      |--------------------------------------------------------------------------
      */

      const html =
        renderPost(
          post
        );


      /*
      |--------------------------------------------------------------------------
      | HEADERS
      |--------------------------------------------------------------------------
      */

      res.set({

        "Content-Type":
          "text/html; charset=utf-8",

        "Cache-Control":
          "no-cache"

      });


      /*
      |--------------------------------------------------------------------------
      | ENVIAR HTML
      |--------------------------------------------------------------------------
      */

      return res
        .status(200)
        .send(
          html
        );

    } catch (error) {

      console.error(
        "ERRO AO RENDERIZAR ARTIGO:",
        error
      );


      return res
        .status(500)
        .type("text/plain")
        .send(
          "Erro ao carregar artigo."
        );

    }

  }
);


/*
|--------------------------------------------------------------------------
| PÁGINA INICIAL
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  (req, res) => {

    return res.sendFile(
      path.join(
        __dirname,
        "../frontend/psifacil.html"
      )
    );

  }
);


/*
|--------------------------------------------------------------------------
| ROTA NÃO ENCONTRADA
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {

    return res
      .status(404)
      .json({
        erro:
          "Rota não encontrada."
      });

  }
);


/*
|--------------------------------------------------------------------------
| TRATAMENTO GLOBAL DE ERROS
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "ERRO GLOBAL DO SERVIDOR:",
      error
    );


    if (
      res.headersSent
    ) {

      return next(
        error
      );

    }


    return res
      .status(500)
      .json({
        erro:
          "Erro interno do servidor."
      });

  }
);


/*
|--------------------------------------------------------------------------
| INICIAR SERVIDOR
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT ||
  3000;


app.listen(
  PORT,
  () => {

    console.log(
      `Servidor rodando na porta ${PORT}`
    );

  }
);