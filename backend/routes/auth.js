
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

require("dotenv").config();

const router = express.Router();

function gerarToken(dados, duracao) {
  return jwt.sign(
    dados,
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: duracao
    }
  );
}

function senhaEhHashBcrypt(senha) {
  return (
    typeof senha === "string" &&
    /^\$2[aby]\$\d{2}\$/.test(senha)
  );
}

async function verificarSenha(senhaInformada, senhaArmazenada) {
  if (
    typeof senhaInformada !== "string" ||
    typeof senhaArmazenada !== "string"
  ) {
    return false;
  }

  if (senhaEhHashBcrypt(senhaArmazenada)) {
    return bcrypt.compare(
      senhaInformada,
      senhaArmazenada
    );
  }

  // Compatibilidade temporária com senhas
  // administrativas antigas em texto simples.
  return senhaInformada === senhaArmazenada;
}

/* =========================================
   LOGIN ADMINISTRATIVO ANTIGO
   MANTIDO DURANTE A TRANSIÇÃO
========================================= */

router.post("/login", async (req, res) => {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({
      erro: "E-mail e senha são obrigatórios."
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        erro: "Erro de configuração do servidor."
      });
    }

    const resultado = await db.query(
      `
        SELECT id, email, senha
        FROM admins
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [String(email).trim()]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    const admin = resultado.rows[0];

    const senhaValida = await verificarSenha(
      senha,
      admin.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    const token = gerarToken(
      {
        id: admin.id,
        email: admin.email,
        role: "admin"
      },
      "2h"
    );

    return res.json({
      mensagem: "Login realizado com sucesso.",
      token
    });

  } catch (error) {
    console.error("ERRO NO LOGIN ADMIN:", error);

    return res.status(500).json({
      erro: "Erro ao fazer login."
    });
  }
});

/* =========================================
   NOVO LOGIN ÚNICO
========================================= */

router.post("/login-unico", async (req, res) => {
  const { email, senha } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof senha !== "string" ||
    !email.trim() ||
    !senha
  ) {
    return res.status(400).json({
      erro: "Preencha e-mail e senha."
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      erro: "Erro de configuração do servidor."
    });
  }

  const emailNormalizado = email.trim();

  try {
    /*
      Primeiro, consultar a conta administrativa.

      O acesso de administrador só será
      concedido quando a senha administrativa
      for validada corretamente.
    */

    const resultadoAdmin = await db.query(
      `
        SELECT id, email, senha
        FROM admins
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [emailNormalizado]
    );

    if (resultadoAdmin.rows.length > 0) {
      const admin = resultadoAdmin.rows[0];

      const senhaAdminValida = await verificarSenha(
        senha,
        admin.senha
      );

      if (senhaAdminValida) {
        const token = gerarToken(
          {
            id: admin.id,
            email: admin.email,
            role: "admin"
          },
          "2h"
        );

        return res.json({
          mensagem: "Login realizado com sucesso.",
          token,
          tipo: "admin",
          usuario: {
            id: admin.id,
            email: admin.email,
            role: "admin"
          }
        });
      }
    }

    /*
      Se não autenticou como administrador,
      verificar a conta comum.

      Isso também permite que o mesmo e-mail
      exista nas duas tabelas, desde que
      cada senha seja validada corretamente.
    */

    const resultadoUsuario = await db.query(
      `
        SELECT id, nome, email, senha
        FROM usuarios
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [emailNormalizado]
    );

    if (resultadoUsuario.rows.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    const usuario = resultadoUsuario.rows[0];

    const senhaUsuarioValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaUsuarioValida) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    const token = gerarToken(
      {
        id: usuario.id,
        role: "usuario"
      },
      "7d"
    );

    return res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      tipo: "usuario",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: "usuario"
      }
    });

  } catch (error) {
    console.error("ERRO NO LOGIN ÚNICO:", error);

    return res.status(500).json({
      erro: "Erro ao realizar login."
    });
  }
});

module.exports = router;
