const express = require("express");
const router = express.Router();
const db = require("../db");

/* SALVAR LEAD */
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
      mensagem: "Cadastro realizado com sucesso",
      lead: resultado.rows[0]
    });

  } catch (error) {
    console.error("ERRO AO CADASTRAR LEAD:", error);

    res.status(500).json({
      erro: "Erro ao cadastrar lead"
    });
  }
});

/* LISTAR LEADS */
router.get("/", async (req, res) => {
  try {
    const resultado = await db.query(
      "SELECT * FROM leads ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error("ERRO AO BUSCAR LEADS:", error);

    res.status(500).json({
      erro: "Erro ao buscar leads"
    });
  }
});

/* CHECK DE ENVIO */
router.patch("/:id/enviado", async (req, res) => {
  const { id } = req.params;
  const { enviado } = req.body;

  try {
    const resultado = await db.query(
      `UPDATE leads
       SET enviado = $1
       WHERE id = $2
       RETURNING *`,
      [enviado, id]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error("ERRO AO ATUALIZAR LEAD:", error);

    res.status(500).json({
      erro: "Erro ao atualizar lead"
    });
  }
});

module.exports = router;