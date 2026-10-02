const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();


/* =========================================
   AUTENTICAR USUÁRIO
========================================= */

function autenticarUsuario(req, res, next) {

  const authHeader =
    req.headers.authorization;


  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      erro: "Token não enviado"
    });

  }


  const token =
    authHeader.split(" ")[1];


  if (!token) {

    return res.status(401).json({
      erro: "Token não enviado"
    });

  }


  if (!process.env.JWT_SECRET) {

    console.error(
      "JWT_SECRET não configurado no ambiente."
    );


    return res.status(500).json({
      erro:
        "Erro de configuração do servidor."
    });

  }


  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    if (!decoded.id) {

      return res.status(401).json({
        erro: "Token inválido"
      });

    }


    req.usuarioId =
      decoded.id;


    next();


  } catch (error) {

    console.error(
      "ERRO NA AUTENTICAÇÃO DO USUÁRIO:",
      error
    );


    return res.status(401).json({
      erro:
        "Token inválido ou expirado"
    });

  }

}


/* =========================================
   FRASE DO DIA
========================================= */

router.get(
  "/dia",
  async (req, res) => {

    try {

      const totalResult =
        await db.query(`
          SELECT COUNT(*)::int AS total
          FROM frases
          WHERE ativa = TRUE
        `);


      const total =
        totalResult.rows[0].total;


      if (total === 0) {

        return res.status(404).json({
          erro:
            "Nenhuma frase disponível."
        });

      }


      const hoje =
        new Date();


      const inicio =
        new Date(
          "2026-01-01T00:00:00Z"
        );


      const diferencaMs =
        Date.UTC(
          hoje.getUTCFullYear(),
          hoje.getUTCMonth(),
          hoje.getUTCDate()
        ) -
        inicio.getTime();


      const diasPassados =
        Math.floor(
          diferencaMs /
          (1000 * 60 * 60 * 24)
        );


      const posicao =
        ((diasPassados % total) + total)
        % total;


      const fraseResult =
        await db.query(
          `
            SELECT
              id,
              texto,
              tipo,
              autor,
              ordem
            FROM frases
            WHERE ativa = TRUE
            ORDER BY ordem ASC
            LIMIT 1
            OFFSET $1
          `,
          [posicao]
        );


      const frase =
        fraseResult.rows[0];


      res.json({
        id: frase.id,
        texto: frase.texto,
        tipo: frase.tipo,
        autor: frase.autor,
        ordem: frase.ordem
      });


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR FRASE DO DIA:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao buscar frase do dia."
      });

    }

  }
);


/* =========================================
   SALVAR FRASE
========================================= */

router.post(
  "/:fraseId/salvar",
  autenticarUsuario,
  async (req, res) => {

    const { fraseId } =
      req.params;

    const usuarioId =
      req.usuarioId;


    try {

      /*
       * Primeiro verificamos se a frase
       * realmente existe e está ativa.
       */

      const fraseExiste =
        await db.query(
          `
            SELECT id
            FROM frases
            WHERE id = $1
            AND ativa = TRUE
          `,
          [fraseId]
        );


      if (
        fraseExiste.rows.length === 0
      ) {

        return res.status(404).json({
          erro:
            "Frase não encontrada."
        });

      }


      await db.query(
        `
          INSERT INTO frases_salvas
          (
            usuario_id,
            frase_id
          )
          VALUES ($1, $2)
          ON CONFLICT
          (usuario_id, frase_id)
          DO NOTHING
        `,
        [
          usuarioId,
          fraseId
        ]
      );


      res.json({
        salvo: true,
        mensagem:
          "Frase salva com sucesso."
      });


    } catch (error) {

      console.error(
        "ERRO AO SALVAR FRASE:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao salvar frase."
      });

    }

  }
);


/* =========================================
   REMOVER FRASE SALVA
========================================= */

router.delete(
  "/:fraseId/salvar",
  autenticarUsuario,
  async (req, res) => {

    const { fraseId } =
      req.params;

    const usuarioId =
      req.usuarioId;


    try {

      await db.query(
        `
          DELETE FROM frases_salvas
          WHERE usuario_id = $1
          AND frase_id = $2
        `,
        [
          usuarioId,
          fraseId
        ]
      );


      res.json({
        salvo: false,
        mensagem:
          "Frase removida dos salvos."
      });


    } catch (error) {

      console.error(
        "ERRO AO REMOVER FRASE SALVA:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao remover frase."
      });

    }

  }
);


/* =========================================
   LISTAR MINHAS FRASES SALVAS
========================================= */

router.get(
  "/salvas",
  autenticarUsuario,
  async (req, res) => {

    const usuarioId =
      req.usuarioId;


    try {

      const resultado =
        await db.query(
          `
            SELECT
              f.id,
              f.texto,
              f.tipo,
              f.autor,
              f.ordem,
              fs.criado_em AS salvo_em

            FROM frases_salvas fs

            JOIN frases f
              ON f.id = fs.frase_id

            WHERE fs.usuario_id = $1

            ORDER BY
              fs.criado_em DESC
          `,
          [usuarioId]
        );


      res.json(
        resultado.rows
      );


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR FRASES SALVAS:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao buscar frases salvas."
      });

    }

  }
);


/* =========================================
   VERIFICAR SE FRASE ESTÁ SALVA
========================================= */

router.get(
  "/:fraseId/status",
  autenticarUsuario,
  async (req, res) => {

    const { fraseId } =
      req.params;

    const usuarioId =
      req.usuarioId;


    try {

      const resultado =
        await db.query(
          `
            SELECT 1
            FROM frases_salvas
            WHERE usuario_id = $1
            AND frase_id = $2
          `,
          [
            usuarioId,
            fraseId
          ]
        );


      res.json({
        salvo:
          resultado.rows.length > 0
      });


    } catch (error) {

      console.error(
        "ERRO AO VERIFICAR FRASE SALVA:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao verificar frase."
      });

    }

  }
);


module.exports = router;