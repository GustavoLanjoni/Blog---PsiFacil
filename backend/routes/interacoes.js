const express = require("express");
const router = express.Router();
const db = require("../db");

/* COMENTÁRIOS */
router.get("/comentarios/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const resultado = await db.query(
      "SELECT * FROM comentarios WHERE post_id = $1 ORDER BY id DESC",
      [postId]
    );

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar comentários" });
  }
});

router.post("/comentarios", async (req, res) => {
  const { post_id, nome, comentario } = req.body;

  if (!post_id || !nome || !comentario) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO comentarios (post_id, nome, comentario)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [post_id, nome, comentario]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao comentar" });
  }
});

/* CURTIDAS */
router.get("/curtidas/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const resultado = await db.query(
      "SELECT COUNT(*) FROM curtidas WHERE post_id = $1",
      [postId]
    );

    res.json({ total: Number(resultado.rows[0].count) });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar curtidas" });
  }
});

router.post("/curtidas", async (req, res) => {
  const { post_id } = req.body;

  if (!post_id) {
    return res.status(400).json({ erro: "Post obrigatório" });
  }

  try {
    await db.query(
      "INSERT INTO curtidas (post_id) VALUES ($1)",
      [post_id]
    );

    res.status(201).json({ mensagem: "Curtida registrada" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao curtir" });
  }
});

module.exports = router;