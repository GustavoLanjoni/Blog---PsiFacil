const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


/* =========================================
   CADASTRO
   ROTA PÚBLICA
   ========================================= */

router.post("/cadastro", async (req, res) => {

  const { nome, email, senha } = req.body;


  if (!nome || !email || !senha) {

    return res.status(400).json({
      erro: "Preencha todos os campos"
    });

  }


  try {

    const usuarioExistente =
      await db.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );


    if (
      usuarioExistente.rows.length > 0
    ) {

      return res.status(400).json({
        erro: "Email já cadastrado"
      });

    }


    const senhaHash =
      await bcrypt.hash(
        senha,
        10
      );


    const resultado =
      await db.query(
        `INSERT INTO usuarios (nome, email, senha)
         VALUES ($1, $2, $3)
         RETURNING id, nome, email`,
        [
          nome,
          email,
          senhaHash
        ]
      );


    res.status(201).json(
      resultado.rows[0]
    );


  } catch (error) {

    console.error(
      "ERRO NO CADASTRO:",
      error
    );


    res.status(500).json({
      erro: "Erro no cadastro"
    });

  }

});


/* =========================================
   LOGIN
   ROTA PÚBLICA
   ========================================= */

router.post("/login", async (req, res) => {

  const { email, senha } = req.body;


  if (!email || !senha) {

    return res.status(400).json({
      erro: "E-mail e senha são obrigatórios"
    });

  }


  try {

    const resultado =
      await db.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );


    if (
      resultado.rows.length === 0
    ) {

      return res.status(400).json({
        erro: "Usuário não encontrado"
      });

    }


    const usuario =
      resultado.rows[0];


    const senhaValida =
      await bcrypt.compare(
        senha,
        usuario.senha
      );


    if (!senhaValida) {

      return res.status(400).json({
        erro: "Senha inválida"
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


    const token =
      jwt.sign(
        {
          id: usuario.id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );


    res.json({

      token,

      usuario: {

        id:
          usuario.id,

        nome:
          usuario.nome,

        email:
          usuario.email

      }

    });


  } catch (error) {

    console.error(
      "ERRO NO LOGIN:",
      error
    );


    res.status(500).json({
      erro: "Erro no login"
    });

  }

});


module.exports = router;