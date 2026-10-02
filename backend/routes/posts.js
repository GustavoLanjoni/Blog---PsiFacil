const express = require("express");
const router = express.Router();
const db = require("../db");
const autenticarAdmin = require("../middleware/authAdmin");
const webpush = require("web-push");


/* =========================================================
   CONFIGURAR WEB PUSH
========================================================= */

webpush.setVapidDetails(
    "mailto:contato@psifacilblog.com.br",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);


/* =========================================================
   NOTIFICAR NOVO ARTIGO
========================================================= */

async function notificarNovoArtigo(post) {

  try {

    /* =====================================================
       VERIFICAR SE ESTE POST JÁ FOI NOTIFICADO
    ===================================================== */

    const verificacao =
      await db.query(
        `
        SELECT notificacao_enviada
        FROM posts
        WHERE id = $1
        LIMIT 1
        `,
        [
          post.id
        ]
      );


    if (
      verificacao.rows.length === 0
    ) {

      return false;

    }


    if (
      verificacao.rows[0].notificacao_enviada === true
    ) {

      return true;

    }


    /* =====================================================
       BUSCAR DISPOSITIVOS DOS USUÁRIOS QUE ATIVARAM
       "NOVOS ARTIGOS"
    ===================================================== */

    const dispositivos =
      await db.query(
        `
        SELECT
          ps.id,
          ps.usuario_id,
          ps.endpoint,
          ps.p256dh,
          ps.auth

        FROM push_subscriptions ps

        INNER JOIN preferencias_notificacoes pn
          ON pn.usuario_id = ps.usuario_id

        WHERE pn.novos_artigos = TRUE
        `
      );


    /* =====================================================
       CRIAR NOTIFICAÇÃO INTERNA
    ===================================================== */

    await db.query(
      `
      INSERT INTO notificacoes (
        usuario_id,
        tipo,
        titulo,
        mensagem,
        url
      )

      SELECT
        usuario_id,
        'novo_artigo',
        $1,
        $2,
        $3

      FROM preferencias_notificacoes

      WHERE novos_artigos = TRUE
      `,
      [
        "Novo artigo no PsiFácil",
        post.titulo,
        `/post.html?id=${post.id}`
      ]
    );


    /* =====================================================
       PAYLOAD DA NOTIFICAÇÃO PUSH
    ===================================================== */

    const payload =
      JSON.stringify({

        titulo:
          "Novo artigo no PsiFácil 📖",

        mensagem:
          post.titulo,

        url:
          `/post.html?id=${post.id}`,

        tag:
          `novo-artigo-${post.id}`

      });


    /* =====================================================
       ENVIAR PARA CADA DISPOSITIVO
    ===================================================== */

    for (
      const dispositivo
      of dispositivos.rows
    ) {

      const subscription = {

        endpoint:
          dispositivo.endpoint,

        keys: {

          p256dh:
            dispositivo.p256dh,

          auth:
            dispositivo.auth

        }

      };


      try {

        await webpush.sendNotification(
          subscription,
          payload
        );


      } catch (error) {

        console.error(
          `ERRO AO ENVIAR PUSH PARA USUÁRIO ${dispositivo.usuario_id}:`,
          error.statusCode ||
          error.message
        );


        /* =================================================
           REMOVER INSCRIÇÃO EXPIRADA / INVÁLIDA
        ================================================= */

        if (
          error.statusCode === 404 ||
          error.statusCode === 410
        ) {

          await db.query(
            `
            DELETE FROM push_subscriptions
            WHERE id = $1
            `,
            [
              dispositivo.id
            ]
          );

        }

      }

    }


    /* =====================================================
       MARCAR POST COMO NOTIFICADO
    ===================================================== */

    await db.query(
      `
      UPDATE posts
      SET notificacao_enviada = TRUE
      WHERE id = $1
      `,
      [
        post.id
      ]
    );


    console.log(
      `NOTIFICAÇÃO DO POST ${post.id} PROCESSADA.`
    );


    return true;


  } catch (error) {

    /*
     * Erro no sistema de notificações não deve
     * impedir a publicação do artigo.
     *
     * Como notificacao_enviada continua FALSE,
     * o sistema poderá tentar novamente depois.
     */

    console.error(
      `ERRO AO NOTIFICAR POST ${post.id}:`,
      error
    );


    return false;

  }

}


/* =========================================================
   PROCESSAR POSTS AGENDADOS
========================================================= */

async function processarPostsAgendados() {

  try {

    /*
     * Publicamos somente posts cujo horário chegou
     * e que ainda estavam como "agendado".
     *
     * RETURNING devolve exatamente os posts que
     * acabaram de mudar para "publicado".
     */

    const resultado =
      await db.query(
        `
        UPDATE posts

        SET status = 'publicado'

        WHERE status = 'agendado'
          AND agendado_para <= NOW()

        RETURNING *
        `
      );


    if (
      resultado.rows.length === 0
    ) {

      return;

    }


    console.log(
      `${resultado.rows.length} POST(S) AGENDADO(S) PUBLICADO(S).`
    );


    /* =====================================================
       NOTIFICAR CADA POST QUE ACABOU DE SER PUBLICADO
    ===================================================== */

    for (
      const post
      of resultado.rows
    ) {

      if (
        post.notificacao_enviada !== true
      ) {

        await notificarNovoArtigo(
          post
        );

      }

    }


  } catch (error) {

    console.error(
      "ERRO AO PROCESSAR POSTS AGENDADOS:",
      error
    );

  }

}


/* =========================================================
   LISTAR POSTS PÚBLICOS
========================================================= */

router.get(
  "/",
  async (req, res) => {

    try {

      /*
       * Enquanto não adicionarmos o gatilho automático
       * periódico, esta chamada também processa qualquer
       * agendamento cujo horário já tenha chegado.
       */

      await processarPostsAgendados();


      const resultado =
        await db.query(
          `
          SELECT *
          FROM posts
          WHERE status = 'publicado'
          ORDER BY id DESC
          `
        );


      res.json(
        resultado.rows
      );


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR POSTS:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao buscar posts"
      });

    }

  }
);


/* =========================================================
   LISTAR TODOS OS POSTS NO ADMIN
========================================================= */

router.get(
  "/admin/todos",
  autenticarAdmin,
  async (req, res) => {

    try {

      const resultado =
        await db.query(
          `
          SELECT *
          FROM posts
          ORDER BY id DESC
          `
        );


      res.json(
        resultado.rows
      );


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR POSTS ADMIN:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao buscar posts do admin"
      });

    }

  }
);

/* =========================================================
   PROCESSAR AGENDAMENTOS AUTOMATICAMENTE
========================================================= */

router.post(
  "/processar-agendados",
  async (req, res) => {

    try {

      const segredoRecebido =
        req.headers["x-cron-secret"];

      if (
        !process.env.CRON_SECRET ||
        segredoRecebido !== process.env.CRON_SECRET
      ) {

        return res.status(401).json({
          erro: "Não autorizado"
        });

      }

      await processarPostsAgendados();

      return res.json({
        sucesso: true,
        mensagem: "Posts agendados processados."
      });

    } catch (error) {

      console.error(
        "ERRO AO PROCESSAR AGENDAMENTOS:",
        error
      );

      return res.status(500).json({
        erro: "Erro ao processar posts agendados."
      });

    }

  }
);



/* =========================================================
   BUSCAR UM POST
========================================================= */

router.get(
  "/:id",
  async (req, res) => {

    const { id } =
      req.params;


    try {

      const resultado =
        await db.query(
          `
          SELECT *
          FROM posts
          WHERE id = $1
          `,
          [
            id
          ]
        );


      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({
          erro:
            "Post não encontrado"
        });

      }


      res.json(
        resultado.rows[0]
      );


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR POST:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao buscar post"
      });

    }

  }
);


/* =========================================================
   CRIAR POST
========================================================= */

router.post(
  "/",
  autenticarAdmin,
  async (req, res) => {

    const {
      titulo,
      categoria,
      resumo,
      conteudo,
      imagem,
      fontes,
      status,
      agendado_para
    } = req.body;


    /* =====================================================
       VALIDAÇÃO
    ===================================================== */

    if (
      !titulo ||
      !conteudo
    ) {

      return res.status(400).json({
        erro:
          "Título e conteúdo são obrigatórios"
      });

    }


    /* =====================================================
       DEFINIR PUBLICAÇÃO / AGENDAMENTO
    ===================================================== */

    const statusFinal =
      status === "agendado"
        ? "agendado"
        : "publicado";


    const agendamentoFinal =
      statusFinal === "agendado"
        ? agendado_para
        : null;


    if (
      statusFinal === "agendado" &&
      !agendamentoFinal
    ) {

      return res.status(400).json({
        erro:
          "Escolha a data e hora do agendamento."
      });

    }


    try {

      /* ===================================================
         SALVAR POST
      =================================================== */

      const resultado =
        await db.query(
          `
          INSERT INTO posts (
            titulo,
            categoria,
            resumo,
            conteudo,
            imagem,
            fontes,
            status,
            agendado_para,
            notificacao_enviada
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            FALSE
          )

          RETURNING *
          `,
          [
            titulo,
            categoria,
            resumo,
            conteudo,
            imagem,
            fontes,
            statusFinal,
            agendamentoFinal
          ]
        );


      const postCriado =
        resultado.rows[0];


      /* ===================================================
         PUBLICAÇÃO IMEDIATA
      =================================================== */

      if (
        postCriado.status === "publicado"
      ) {

        await notificarNovoArtigo(
          postCriado
        );

      }


      res.status(201).json(
        postCriado
      );


    } catch (error) {

      console.error(
        "ERRO AO CRIAR POST:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao criar post"
      });

    }

  }
);


/* =========================================================
   EDITAR POST
========================================================= */

router.put(
  "/:id",
  autenticarAdmin,
  async (req, res) => {

    const { id } =
      req.params;


    const {
      titulo,
      categoria,
      resumo,
      conteudo,
      imagem,
      fontes,
      status,
      agendado_para
    } = req.body;


    const statusFinal =
      status === "agendado"
        ? "agendado"
        : "publicado";


    const agendamentoFinal =
      statusFinal === "agendado"
        ? agendado_para
        : null;


    if (
      statusFinal === "agendado" &&
      !agendamentoFinal
    ) {

      return res.status(400).json({
        erro:
          "Escolha a data e hora do agendamento."
      });

    }


    try {

      /* ===================================================
         BUSCAR ESTADO ANTERIOR
      =================================================== */

      const anterior =
        await db.query(
          `
          SELECT
            status,
            notificacao_enviada

          FROM posts

          WHERE id = $1
          `,
          [
            id
          ]
        );


      if (
        anterior.rows.length === 0
      ) {

        return res.status(404).json({
          erro:
            "Post não encontrado"
        });

      }


      const postAnterior =
        anterior.rows[0];


      /* ===================================================
         ATUALIZAR POST
      =================================================== */

      const resultado =
        await db.query(
          `
          UPDATE posts

          SET
            titulo = $1,
            categoria = $2,
            resumo = $3,
            conteudo = $4,
            imagem = $5,
            fontes = $6,
            status = $7,
            agendado_para = $8

          WHERE id = $9

          RETURNING *
          `,
          [
            titulo,
            categoria,
            resumo,
            conteudo,
            imagem,
            fontes,
            statusFinal,
            agendamentoFinal,
            id
          ]
        );


      const postAtualizado =
        resultado.rows[0];


      /* ===================================================
         SE ERA AGENDADO E FOI PUBLICADO MANUALMENTE,
         ENVIAR A NOTIFICAÇÃO
      =================================================== */

      if (
        postAnterior.status === "agendado" &&
        postAtualizado.status === "publicado" &&
        postAtualizado.notificacao_enviada !== true
      ) {

        await notificarNovoArtigo(
          postAtualizado
        );

      }


      res.json(
        postAtualizado
      );


    } catch (error) {

      console.error(
        "ERRO AO ATUALIZAR POST:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao atualizar post"
      });

    }

  }
);


/* =========================================================
   EXCLUIR POST
========================================================= */

router.delete(
  "/:id",
  autenticarAdmin,
  async (req, res) => {

    const { id } =
      req.params;


    try {

      const resultado =
        await db.query(
          `
          DELETE FROM posts
          WHERE id = $1
          RETURNING *
          `,
          [
            id
          ]
        );


      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({
          erro:
            "Post não encontrado"
        });

      }


      res.json({
        mensagem:
          "Post excluído com sucesso"
      });


    } catch (error) {

      console.error(
        "ERRO AO EXCLUIR POST:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao excluir post"
      });

    }

  }
);


/* =========================================================
   EXPORTAR
========================================================= */

module.exports = router;