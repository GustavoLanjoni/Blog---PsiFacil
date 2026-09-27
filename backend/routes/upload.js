const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const autenticarAdmin = require("../middleware/authAdmin");
const supabase = require("../supabase");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de imagem não permitido."));
    }
  }
});


/* ================================
   UPLOAD DE IMAGEM
   SOMENTE ADMINISTRADOR
================================ */

router.post(
  "/",
  autenticarAdmin,
  upload.single("imagem"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          erro: "Nenhuma imagem foi enviada."
        });
      }

      const extensao = path
        .extname(req.file.originalname)
        .toLowerCase();

      const nomeArquivo =
        `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extensao}`;

      const caminhoArquivo = `posts/${nomeArquivo}`;


      const { error } = await supabase.storage
        .from("post-images")
        .upload(
          caminhoArquivo,
          req.file.buffer,
          {
            contentType: req.file.mimetype,
            upsert: false
          }
        );


      if (error) {

        console.error(
          "ERRO NO UPLOAD SUPABASE:",
          error
        );

        return res.status(500).json({
          erro: "Erro ao enviar imagem para o Supabase."
        });
      }


      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(caminhoArquivo);


      res.json({
        sucesso: true,
        url: data.publicUrl
      });

    } catch (error) {

      console.error(
        "ERRO NO UPLOAD:",
        error
      );

      res.status(500).json({
        erro: "Erro interno ao enviar imagem."
      });
    }
  }
);


module.exports = router;