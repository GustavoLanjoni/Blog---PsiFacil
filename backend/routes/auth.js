const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: "E-mail e senha são obrigatórios"
    });
  }

  try {
    const resultado = await db.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos"
      });
    }

    const admin = resultado.rows[0];

    if (senha !== admin.senha) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos"
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      token
    });

  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({
      erro: "Erro ao fazer login"
    });
  }
});

module.exports = router;