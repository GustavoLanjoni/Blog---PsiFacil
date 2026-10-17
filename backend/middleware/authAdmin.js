
const jwt = require("jsonwebtoken");
const db = require("../db");

require("dotenv").config();

async function autenticarAdmin(req, res, next) {
  try {
    const cabecalho = req.headers.authorization;

    if (
      !cabecalho ||
      !cabecalho.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        erro: "Acesso não autorizado."
      });
    }

    const token = cabecalho.slice(7).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        erro: "Sessão inválida."
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        erro: "Token inválido."
      });
    }

    /*
      NOVOS TOKENS:

      Precisam declarar explicitamente
      a função de administrador.
    */

    if (
      decoded.role !== undefined &&
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        erro: "Permissão administrativa necessária."
      });
    }

    /*
      TOKENS ANTIGOS:

      O login administrativo antigo gera
      tokens com id e email, mas sem role.

      Para manter compatibilidade, exigimos
      o email do token antigo.
    */

    if (
      decoded.role === undefined &&
      !decoded.email
    ) {
      return res.status(403).json({
        erro: "Permissão administrativa necessária."
      });
    }

    /*
      Confirmar a identidade diretamente
      na tabela de administradores.

      Nunca confiar apenas em informações
      enviadas pelo navegador.
    */

    const resultado = await db.query(
      `
        SELECT id, email
        FROM admins
        WHERE id = $1
        LIMIT 1
      `,
      [decoded.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(403).json({
        erro: "Administrador não autorizado."
      });
    }

    const admin = resultado.rows[0];

    /*
      O email precisa corresponder também,
      inclusive para tokens antigos.

      Isso impede confundir IDs iguais
      das tabelas usuarios e admins.
    */

    if (
      !decoded.email ||
      String(decoded.email).toLowerCase() !==
        String(admin.email).toLowerCase()
    ) {
      return res.status(403).json({
        erro: "Administrador não autorizado."
      });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: "admin"
    };

    return next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        erro: "Token inválido ou expirado."
      });
    }

    console.error(
      "ERRO NA AUTENTICAÇÃO ADMIN:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao validar acesso administrativo."
    });
  }
}

module.exports = autenticarAdmin;
