const express = require("express");
const router = express.Router();
const db = require("../db");
const autenticarAdmin = require("../middleware/authAdmin");


/* =========================================
   SALVAR LEAD
   ROTA PÚBLICA
   ========================================= */

router.post("/", async (req, res) => {

  const { nome, email } = req.body;


  if (!nome || !email) {

    return res.status(400).json({
      erro: "Nome e e-mail são obrigatórios"
    });

  }


  try {

    const resultado = await db.query(
      `INSERT INTO leads (nome, email)
       VALUES ($1, $2)
       RETURNING *`,
      [nome, email]
    );


    res.status(201).json({

      mensagem:
        "Cadastro realizado com sucesso",

      lead:
        resultado.rows[0]

    });


  } catch (error) {

    console.error(
      "ERRO AO CADASTRAR LEAD:",
      error
    );


    res.status(500).json({
      erro: "Erro ao cadastrar lead"
    });

  }

});


/* =========================================
   LISTAR LEADS
   PROTEGIDA
   ========================================= */

router.get(
  "/",
  autenticarAdmin,
  async (req, res) => {

    try {

      const resultado =
        await db.query(
          "SELECT * FROM leads ORDER BY id DESC"
        );


      res.json(
        resultado.rows
      );


    } catch (error) {

      console.error(
        "ERRO AO BUSCAR LEADS:",
        error
      );


      res.status(500).json({
        erro: "Erro ao buscar leads"
      });

    }

  }
);


/* =========================================
   CHECK DE ENVIO
   PROTEGIDA
   ========================================= */

router.patch(
  "/:id/enviado",
  autenticarAdmin,
  async (req, res) => {

    const { id } =
      req.params;

    const { enviado } =
      req.body;


    try {

      const resultado =
        await db.query(
          `UPDATE leads
           SET enviado = $1
           WHERE id = $2
           RETURNING *`,
          [enviado, id]
        );


      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({
          erro: "Lead não encontrado"
        });

      }


      res.json(
        resultado.rows[0]
      );


    } catch (error) {

      console.error(
        "ERRO AO ATUALIZAR LEAD:",
        error
      );


      res.status(500).json({
        erro: "Erro ao atualizar lead"
      });

    }

  }
);


module.exports = router;