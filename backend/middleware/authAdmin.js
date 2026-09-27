const jwt = require("jsonwebtoken");
require("dotenv").config();

function autenticarAdmin(req, res, next) {
  try {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
      return res.status(401).json({
        erro: "Acesso não autorizado."
      });
    }

    const token = cabecalho.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    next();

  } catch (error) {
    console.error("ERRO NA AUTENTICAÇÃO:", error);

    return res.status(401).json({
      erro: "Token inválido ou expirado."
    });
  }
}

module.exports = autenticarAdmin;