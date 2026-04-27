const express = require("express");
const router = express.Router();
const db = require("../db");

/* LISTAR TODOS */
router.get("/", async (req, res) => {
  try {
    const resultado = await db.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar posts" });
  }
});

/* BUSCAR UM POST */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.query(
      "SELECT * FROM posts WHERE id = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Post não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar post" });
  }
});

/* CRIAR */
router.post("/", async (req, res) => {
  const { titulo, categoria, resumo, conteudo, imagem } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({
      erro: "Título e conteúdo são obrigatórios"
    });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO posts 
      (titulo, categoria, resumo, conteudo, imagem)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [titulo, categoria, resumo, conteudo, imagem]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar post" });
  }
});

/* EDITAR */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, categoria, resumo, conteudo, imagem } = req.body;

  try {
    const resultado = await db.query(
      `UPDATE posts
       SET titulo = $1,
           categoria = $2,
           resumo = $3,
           conteudo = $4,
           imagem = $5
       WHERE id = $6
       RETURNING *`,
      [titulo, categoria, resumo, conteudo, imagem, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Post não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar post" });
  }
});

/* EXCLUIR */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Post não encontrado" });
    }

    res.json({ mensagem: "Post excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir post" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.query(
      "SELECT * FROM posts WHERE id = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Post não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar post" });
  }
});

module.exports = router;