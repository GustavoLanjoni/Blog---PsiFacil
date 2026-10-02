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

  const {
    nome,
    email,
    senha
  } = req.body;


  if (
    !nome ||
    !email ||
    !senha
  ) {

    return res.status(400).json({
      erro: "Preencha todos os campos"
    });

  }


  try {

    const usuarioExistente =
      await db.query(
        `
          SELECT *
          FROM usuarios
          WHERE email = $1
        `,
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
        `
          INSERT INTO usuarios
          (
            nome,
            email,
            senha
          )
          VALUES ($1, $2, $3)

          RETURNING
            id,
            nome,
            email
        `,
        [
          nome,
          email,
          senhaHash
        ]
      );


    return res.status(201).json(
      resultado.rows[0]
    );


  } catch (error) {

    console.error(
      "ERRO NO CADASTRO:",
      error
    );


    return res.status(500).json({
      erro: "Erro no cadastro"
    });

  }

});


/* =========================================
   LOGIN
   ROTA PÚBLICA
========================================= */

router.post("/login", async (req, res) => {

  const {
    email,
    senha
  } = req.body;


  if (
    !email ||
    !senha
  ) {

    return res.status(400).json({
      erro:
        "E-mail e senha são obrigatórios"
    });

  }


  try {

    const resultado =
      await db.query(
        `
          SELECT *
          FROM usuarios
          WHERE email = $1
        `,
        [email]
      );


    if (
      resultado.rows.length === 0
    ) {

      return res.status(400).json({
        erro:
          "Usuário não encontrado"
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
        erro:
          "Senha inválida"
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


    return res.json({

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


    return res.status(500).json({
      erro: "Erro no login"
    });

  }

});


/* =========================================
   ALTERAR SENHA
   ROTA PROTEGIDA
========================================= */

router.put("/senha", async (req, res) => {

  /* =======================================
     PEGAR TOKEN
  ======================================= */

  const authHeader =
    req.headers.authorization;


  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      erro:
        "Token não enviado"
    });

  }


  const token =
    authHeader.split(" ")[1];


  if (!token) {

    return res.status(401).json({
      erro:
        "Token não enviado"
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


  /* =======================================
     DADOS DA SENHA
  ======================================= */

  const {
    senhaAtual,
    novaSenha,
    confirmarSenha
  } = req.body;


  if (
    !senhaAtual ||
    !novaSenha ||
    !confirmarSenha
  ) {

    return res.status(400).json({
      erro:
        "Preencha todos os campos."
    });

  }


  /* =======================================
     VALIDAR TAMANHO
  ======================================= */

  if (
    novaSenha.length < 8
  ) {

    return res.status(400).json({
      erro:
        "A nova senha deve ter pelo menos 8 caracteres."
    });

  }


  /* =======================================
     CONFIRMAR NOVA SENHA
  ======================================= */

  if (
    novaSenha !== confirmarSenha
  ) {

    return res.status(400).json({
      erro:
        "A confirmação da nova senha não confere."
    });

  }


  /* =======================================
     SENHA NOVA NÃO PODE SER IGUAL
  ======================================= */

  if (
    senhaAtual === novaSenha
  ) {

    return res.status(400).json({
      erro:
        "A nova senha deve ser diferente da senha atual."
    });

  }


  try {

    /* =====================================
       VALIDAR TOKEN
    ===================================== */

    let decoded;


    try {

      decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );


    } catch (error) {

      return res.status(401).json({
        erro:
          "Token inválido ou expirado"
      });

    }


    if (
      !decoded ||
      !decoded.id
    ) {

      return res.status(401).json({
        erro:
          "Token inválido"
      });

    }


    const usuarioId =
      decoded.id;


    /* =====================================
       BUSCAR USUÁRIO
    ===================================== */

    const resultado =
      await db.query(
        `
          SELECT
            id,
            senha
          FROM usuarios
          WHERE id = $1
        `,
        [usuarioId]
      );


    if (
      resultado.rows.length === 0
    ) {

      return res.status(404).json({
        erro:
          "Usuário não encontrado."
      });

    }


    const usuario =
      resultado.rows[0];


    /* =====================================
       VERIFICAR SENHA ATUAL
    ===================================== */

    const senhaAtualValida =
      await bcrypt.compare(
        senhaAtual,
        usuario.senha
      );


    if (!senhaAtualValida) {

      return res.status(400).json({
        erro:
          "A senha atual está incorreta."
      });

    }


    /* =====================================
       IMPEDIR REUTILIZAÇÃO DA SENHA ATUAL
    ===================================== */

    const novaSenhaIgualAtual =
      await bcrypt.compare(
        novaSenha,
        usuario.senha
      );


    if (novaSenhaIgualAtual) {

      return res.status(400).json({
        erro:
          "A nova senha deve ser diferente da senha atual."
      });

    }


    /* =====================================
       GERAR NOVO HASH
    ===================================== */

    const novaSenhaHash =
      await bcrypt.hash(
        novaSenha,
        10
      );


    /* =====================================
       ATUALIZAR NO BANCO
    ===================================== */

    await db.query(
      `
        UPDATE usuarios
        SET senha = $1
        WHERE id = $2
      `,
      [
        novaSenhaHash,
        usuarioId
      ]
    );


    /* =====================================
       SUCESSO
    ===================================== */

    return res.json({
      mensagem:
        "Senha alterada com sucesso."
    });


  } catch (error) {

    console.error(
      "ERRO AO ALTERAR SENHA:",
      error
    );


    return res.status(500).json({
      erro:
        "Erro ao alterar senha."
    });

  }

});

/* =========================================================
   EXCLUIR CONTA
========================================================= */

router.delete("/conta", async (req, res) => {

  try {

    /* =====================================================
       TOKEN
    ====================================================== */

    const authHeader = req.headers.authorization;


    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        erro: "Usuário não autenticado."
      });

    }


    const token = authHeader.split(" ")[1];


    /* =====================================================
       VALIDAR TOKEN
    ====================================================== */

    let decoded;


    try {

      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    } catch (error) {

      return res.status(401).json({
        erro: "Sessão inválida ou expirada."
      });

    }


    const usuarioId = decoded.id;


    if (!usuarioId) {

      return res.status(401).json({
        erro: "Sessão inválida."
      });

    }


    /* =====================================================
       SENHA RECEBIDA
    ====================================================== */

    const { senha } = req.body;


    if (
      !senha ||
      typeof senha !== "string"
    ) {

      return res.status(400).json({
        erro: "Digite sua senha atual para continuar."
      });

    }


    /* =====================================================
       BUSCAR USUÁRIO
    ====================================================== */

    const resultadoUsuario = await db.query(
      `
                SELECT
                    id,
                    senha
                FROM usuarios
                WHERE id = $1
                LIMIT 1
            `,
      [usuarioId]
    );


    if (resultadoUsuario.rows.length === 0) {

      return res.status(404).json({
        erro: "Usuário não encontrado."
      });

    }


    const usuario = resultadoUsuario.rows[0];


    /* =====================================================
       CONFERIR SENHA
    ====================================================== */

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );


    if (!senhaCorreta) {

      return res.status(400).json({
        erro: "Senha atual incorreta."
      });

    }


    /* =====================================================
       EXCLUIR USUÁRIO
    ====================================================== */

    const resultadoExclusao = await db.query(
      `
                DELETE FROM usuarios
                WHERE id = $1
                RETURNING id
            `,
      [usuarioId]
    );


    if (resultadoExclusao.rows.length === 0) {

      return res.status(404).json({
        erro: "Usuário não encontrado."
      });

    }


    /* =====================================================
       SUCESSO
    ====================================================== */

    return res.status(200).json({
      mensagem: "Conta excluída com sucesso."
    });


  } catch (error) {

    console.error(
      "Erro ao excluir conta:",
      error
    );


    return res.status(500).json({
      erro: "Não foi possível excluir sua conta."
    });

  }

});


module.exports = router;