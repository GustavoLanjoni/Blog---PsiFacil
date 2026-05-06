const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

/* AUTENTICAR USUÁRIO */
function autenticarUsuario(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo");
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

/* SALVAR POST */
router.post("/:postId", autenticarUsuario, async (req, res) => {
  const { postId } = req.params;
  const usuarioId = req.usuarioId;

  try {
    await db.query(
      `INSERT INTO posts_salvos (usuario_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [usuarioId, postId]
    );

    res.json({ mensagem: "Post salvo" });

  } catch (error) {
    console.error("ERRO AO SALVAR POST:", error);
    res.status(500).json({ erro: "Erro ao salvar post" });
  }
});

/* REMOVER SALVO */
router.delete("/:postId", autenticarUsuario, async (req, res) => {
  const { postId } = req.params;
  const usuarioId = req.usuarioId;

  try {
    await db.query(
      "DELETE FROM posts_salvos WHERE usuario_id = $1 AND post_id = $2",
      [usuarioId, postId]
    );

    res.json({ mensagem: "Removido dos salvos" });

  } catch (error) {
    console.error("ERRO AO REMOVER SALVO:", error);
    res.status(500).json({ erro: "Erro ao remover" });
  }
});

/* LISTAR MEUS SALVOS */
router.get("/", autenticarUsuario, async (req, res) => {
  const usuarioId = req.usuarioId;

  try {
    const resultado = await db.query(
      `SELECT p.*
       FROM posts_salvos ps
       JOIN posts p ON p.id = ps.post_id
       WHERE ps.usuario_id = $1
       ORDER BY ps.criado_em DESC`,
      [usuarioId]
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error("ERRO AO BUSCAR SALVOS:", error);
    res.status(500).json({ erro: "Erro ao buscar salvos" });
  }
});

/* VERIFICAR SE ESTÁ SALVO */
router.get("/:postId/status", autenticarUsuario, async (req, res) => {
  const { postId } = req.params;
  const usuarioId = req.usuarioId;

  try {
    const resultado = await db.query(
      `SELECT 1 
       FROM posts_salvos 
       WHERE usuario_id = $1 
       AND post_id = $2`,
      [usuarioId, postId]
    );

    res.json({ salvo: resultado.rows.length > 0 });

  } catch (error) {
    console.error("ERRO AO VERIFICAR SALVO:", error);
    res.status(500).json({ erro: "Erro ao verificar" });
  }
});

module.exports = router;