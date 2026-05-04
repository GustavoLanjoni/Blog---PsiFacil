const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/perfis");
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

/* MIDDLEWARE DE AUTENTICAÇÃO */
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

/* BUSCAR PERFIL */
router.get("/", autenticarUsuario, async (req, res) => {
  try {
    const resultado = await db.query(
      "SELECT id, nome, email, foto, bio, criado_em FROM usuarios WHERE id = $1",
      [req.usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar perfil" });
  }
});

/* ATUALIZAR PERFIL */
router.put("/", autenticarUsuario, upload.single("foto"), async (req, res) => {
  const { nome, bio } = req.body;

  const foto = req.file ? `/uploads/perfis/${req.file.filename}` : req.body.fotoAtual;

  try {
    const resultado = await db.query(
      `UPDATE usuarios
       SET nome = $1,
           foto = $2,
           bio = $3
       WHERE id = $4
       RETURNING id, nome, email, foto, bio`,
      [nome, foto, bio, req.usuarioId]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar perfil" });
  }
});

module.exports = router;