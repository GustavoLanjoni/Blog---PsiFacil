const express = require("express");
const router = express.Router();
const db = require("../db");

/* LISTAR POSTS PÚBLICOS */
/* Mostra posts publicados ou agendados que já chegaram na data */
router.get("/", async (req, res) => {
  try {
    await db.query(`
      UPDATE posts
      SET status = 'publicado'
      WHERE status = 'agendado'
      AND agendado_para <= NOW()
    `);

    const resultado = await db.query(`
      SELECT *
      FROM posts
      WHERE status = 'publicado'
      ORDER BY id DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("ERRO AO BUSCAR POSTS:", error);
    res.status(500).json({ erro: "Erro ao buscar posts" });
  }
});

/* LISTAR TODOS NO ADMIN */
router.get("/admin/todos", async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT *
      FROM posts
      ORDER BY id DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("ERRO AO BUSCAR POSTS ADMIN:", error);
    res.status(500).json({ erro: "Erro ao buscar posts do admin" });
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
    console.error("ERRO AO BUSCAR POST:", error);
    res.status(500).json({ erro: "Erro ao buscar post" });
  }
});

/* CRIAR */
router.post("/", async (req, res) => {
  const {
    titulo,
    categoria,
    resumo,
    conteudo,
    imagem,
    status,
    agendado_para
  } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({
      erro: "Título e conteúdo são obrigatórios"
    });
  }

  const statusFinal = status === "agendado" ? "agendado" : "publicado";
  const agendamentoFinal = statusFinal === "agendado" ? agendado_para : null;

  if (statusFinal === "agendado" && !agendamentoFinal) {
    return res.status(400).json({
      erro: "Escolha a data e hora do agendamento."
    });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO posts 
      (titulo, categoria, resumo, conteudo, imagem, status, agendado_para)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        titulo,
        categoria,
        resumo,
        conteudo,
        imagem,
        statusFinal,
        agendamentoFinal
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("ERRO AO CRIAR POST:", error);
    res.status(500).json({ erro: "Erro ao criar post" });
  }
});

/* EDITAR */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    titulo,
    categoria,
    resumo,
    conteudo,
    imagem,
    status,
    agendado_para
  } = req.body;

  const statusFinal = status === "agendado" ? "agendado" : "publicado";
  const agendamentoFinal = statusFinal === "agendado" ? agendado_para : null;

  if (statusFinal === "agendado" && !agendamentoFinal) {
    return res.status(400).json({
      erro: "Escolha a data e hora do agendamento."
    });
  }

  try {
    const resultado = await db.query(
      `UPDATE posts
       SET titulo = $1,
           categoria = $2,
           resumo = $3,
           conteudo = $4,
           imagem = $5,
           status = $6,
           agendado_para = $7
       WHERE id = $8
       RETURNING *`,
      [
        titulo,
        categoria,
        resumo,
        conteudo,
        imagem,
        statusFinal,
        agendamentoFinal,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Post não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR POST:", error);
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
    console.error("ERRO AO EXCLUIR POST:", error);
    res.status(500).json({ erro: "Erro ao excluir post" });
  }
});

module.exports = router;