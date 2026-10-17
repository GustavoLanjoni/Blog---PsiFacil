const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");


/* =========================================
   UPLOAD DE FOTO
========================================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
      null,
      "uploads/perfis"
    );

  },

  filename: (req, file, cb) => {

    const nomeArquivo =
      Date.now() +
      path.extname(
        file.originalname
      );

    cb(
      null,
      nomeArquivo
    );

  }

});


const upload =
  multer({
    storage
  });


/* =========================================
   MIDDLEWARE DE AUTENTICAÇÃO
   USUÁRIO
========================================= */


function autenticarUsuario(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Token não enviado"
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      erro: "Token não enviado"
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      erro: "Erro de configuração do servidor."
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Aceita usuários comuns, inclusive tokens antigos.
    // Bloqueia tokens administrativos.

    if (
      !decoded ||
      !decoded.id ||
      (
        decoded.role !== undefined &&
        decoded.role !== "usuario"
      ) ||
      (
        decoded.role === undefined &&
        decoded.email !== undefined
      )
    ) {
      return res.status(403).json({
        erro: "Acesso permitido apenas para usuários."
      });
    }

    req.usuarioId = decoded.id;

    return next();

  } catch (error) {
    return res.status(401).json({
      erro: "Token inválido ou expirado."
    });
  }
}


/* =========================================
   BUSCAR PERFIL
   PROTEGIDA
========================================= */

router.get(
  "/",
  autenticarUsuario,
  async (req, res) => {

    try {

      const resultado =
        await db.query(
          `SELECT
             id,
             nome,
             email,
             foto,
             bio,
             criado_em
           FROM usuarios
           WHERE id = $1`,
          [req.usuarioId]
        );


      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({
          erro:
            "Usuário não encontrado"
        });

      }


      res.json(
        resultado.rows[0]
      );


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR PERFIL:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao buscar perfil"
      });

    }

  }
);


/* =========================================
   ATUALIZAR PERFIL
   PROTEGIDA
========================================= */

router.put(
  "/",
  autenticarUsuario,
  upload.single("foto"),
  async (req, res) => {

    const {
      nome,
      bio
    } = req.body;


    const foto =
      req.file
        ? `/uploads/perfis/${req.file.filename}`
        : req.body.fotoAtual;


    try {

      const resultado =
        await db.query(
          `UPDATE usuarios
           SET nome = $1,
               foto = $2,
               bio = $3
           WHERE id = $4
           RETURNING
             id,
             nome,
             email,
             foto,
             bio`,
          [
            nome,
            foto,
            bio,
            req.usuarioId
          ]
        );


      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({
          erro:
            "Usuário não encontrado"
        });

      }


      res.json(
        resultado.rows[0]
      );


    } catch (error) {

      console.error(
        "ERRO AO ATUALIZAR PERFIL:",
        error
      );


      res.status(500).json({
        erro:
          "Erro ao atualizar perfil"
      });

    }

  }
);


module.exports = router;