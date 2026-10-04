/* =========================================================
   PSIFÁCIL
   ROTA DE PARCERIAS

   PÚBLICO:
   POST /parcerias

   ADMIN:
   GET    /parcerias
   PATCH  /parcerias/:id/status
   DELETE /parcerias/:id
========================================================= */

const express = require("express");
const { Resend } = require("resend");
const pool = require("../db");
const autenticarAdmin = require("../middleware/authAdmin");

const router = express.Router();

const resend = new Resend(
  process.env.RESEND_API_KEY
);


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const EMAIL_PARCERIAS =
  process.env.EMAIL_PARCERIAS ||
  "contato.psifacil@gmail.com";


const EMAIL_REMETENTE =
  process.env.EMAIL_REMETENTE ||
  "PsiFácil Parcerias <parcerias@psifacilblog.com.br>";


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor = "") {

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   VALIDAR E-MAIL
========================================================= */

function emailValido(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

}


/* =========================================================
   TIPOS DE PARCERIA PERMITIDOS
========================================================= */

const tiposPermitidos = {

  clinica:
    "Clínica",

  profissional:
    "Psicólogo / Profissional",

  editora:
    "Editora / Autor",

  marca:
    "Marca / Empresa",

  conteudo:
    "Conteúdo em parceria",

  outro:
    "Outro"

};


/* =========================================================
   STATUS PERMITIDOS
========================================================= */

const statusPermitidos = [

  "nova",

  "em_analise",

  "respondida",

  "fechada",

  "recusada"

];


/* =========================================================
   POST /parcerias

   ROTA PÚBLICA

   Fluxo:
   1. Recebe a proposta
   2. Valida
   3. Salva no banco
   4. Envia o e-mail
   5. Atualiza email_enviado
========================================================= */

router.post("/", async (req, res) => {

  let parceriaSalva = null;


  try {

    /* =====================================================
       RECEBER DADOS
    ===================================================== */

    let {

      nome,

      empresa,

      email,

      whatsapp,

      tipo,

      mensagem

    } = req.body || {};


    /* =====================================================
       NORMALIZAÇÃO
    ===================================================== */

    nome =
      String(nome || "")
        .trim();


    empresa =
      String(empresa || "")
        .trim();


    email =
      String(email || "")
        .trim()
        .toLowerCase();


    whatsapp =
      String(whatsapp || "")
        .trim();


    tipo =
      String(tipo || "")
        .trim();


    mensagem =
      String(mensagem || "")
        .trim();


    /* =====================================================
       CAMPOS OBRIGATÓRIOS
    ===================================================== */

    if (
      !nome ||
      !empresa ||
      !email ||
      !tipo ||
      !mensagem
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "Preencha todos os campos obrigatórios."

      });

    }


    /* =====================================================
       NOME
    ===================================================== */

    if (
      nome.length < 2 ||
      nome.length > 100
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "Informe um nome válido."

      });

    }


    /* =====================================================
       EMPRESA
    ===================================================== */

    if (
      empresa.length > 150
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "O nome da clínica, empresa ou projeto ultrapassa o limite permitido."

      });

    }


    /* =====================================================
       E-MAIL
    ===================================================== */

    if (
      email.length > 150 ||
      !emailValido(email)
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "Informe um endereço de e-mail válido."

      });

    }


    /* =====================================================
       WHATSAPP
    ===================================================== */

    if (
      whatsapp.length > 20
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "O WhatsApp informado ultrapassa o limite permitido."

      });

    }


    /* =====================================================
       TIPO
    ===================================================== */

    if (
      tipo.length > 50 ||
      !tiposPermitidos[tipo]
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "Selecione um tipo de parceria válido."

      });

    }


    /* =====================================================
       MENSAGEM
    ===================================================== */

    if (
      mensagem.length < 20 ||
      mensagem.length > 2000
    ) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          mensagem.length < 20
            ? "Conte um pouco mais sobre sua proposta."
            : "A proposta ultrapassa o limite de 2000 caracteres."

      });

    }


    /* =====================================================
       SALVAR PRIMEIRO NO BANCO

       A proposta é salva ANTES do Resend.

       Se o serviço de e-mail falhar,
       a proposta continuará registrada.
    ===================================================== */

    const resultadoBanco =
      await pool.query(

        `
          INSERT INTO parcerias (

            nome,
            empresa,
            email,
            whatsapp,
            tipo,
            mensagem,
            status,
            email_enviado

          )

          VALUES (

            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            'nova',
            false

          )

          RETURNING

            id,
            nome,
            empresa,
            email,
            whatsapp,
            tipo,
            mensagem,
            status,
            email_enviado,
            criado_em,
            atualizado_em
        `,

        [

          nome,

          empresa,

          email,

          whatsapp || null,

          tipo,

          mensagem

        ]

      );


    parceriaSalva =
      resultadoBanco.rows[0];


    console.log(
      "Proposta de parceria salva:",
      parceriaSalva.id
    );


    /* =====================================================
       PREPARAR DADOS DO E-MAIL
    ===================================================== */

    const tipoFormatado =
      tiposPermitidos[tipo];


    const nomeSeguro =
      escaparHTML(nome);


    const empresaSegura =
      escaparHTML(empresa);


    const emailSeguro =
      escaparHTML(email);


    const whatsappSeguro =
      escaparHTML(
        whatsapp ||
        "Não informado"
      );


    const tipoSeguro =
      escaparHTML(
        tipoFormatado
      );


    const mensagemSegura =
      escaparHTML(mensagem)
        .replace(
          /\n/g,
          "<br>"
        );


    /* =====================================================
       ENVIO PELO RESEND
    ===================================================== */

    const {
      data,
      error
    } =
      await resend.emails.send({

        from:
          EMAIL_REMETENTE,

        to:
          [
            EMAIL_PARCERIAS
          ],

        replyTo:
          email,

        subject:
          `Nova proposta de parceria — ${empresa}`,

        html: `
          <!DOCTYPE html>

          <html lang="pt-BR">

          <head>

            <meta charset="UTF-8">

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            >

          </head>


          <body
            style="
              margin:0;
              padding:0;
              background:#f5f3f2;
              font-family:Arial,Helvetica,sans-serif;
              color:#292524;
            "
          >


            <div
              style="
                width:100%;
                padding:35px 15px;
                box-sizing:border-box;
              "
            >


              <div
                style="
                  max-width:650px;
                  margin:0 auto;
                  background:#ffffff;
                  border-radius:16px;
                  overflow:hidden;
                  border:1px solid #e9e3df;
                "
              >


                <!-- CABEÇALHO -->

                <div
                  style="
                    background:#7a5c58;
                    padding:28px 30px;
                    color:#ffffff;
                  "
                >

                  <div
                    style="
                      font-size:13px;
                      font-weight:bold;
                      opacity:.8;
                      margin-bottom:7px;
                    "
                  >
                    PSIFÁCIL
                  </div>


                  <div
                    style="
                      font-size:25px;
                      font-weight:bold;
                      line-height:1.3;
                    "
                  >
                    Nova proposta de parceria
                  </div>

                </div>


                <!-- CONTEÚDO -->

                <div
                  style="
                    padding:30px;
                  "
                >


                  <p
                    style="
                      margin:0 0 25px;
                      color:#6f6763;
                      font-size:14px;
                      line-height:1.6;
                    "
                  >

                    Uma nova solicitação de parceria
                    foi enviada através do site
                    PsiFácil.

                  </p>


                  <!-- IDENTIFICADOR -->

                  <div
                    style="
                      padding:15px 0;
                      border-bottom:1px solid #eee9e6;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:5px;
                      "
                    >
                      PROPOSTA Nº
                    </div>

                    <div
                      style="
                        font-size:15px;
                        font-weight:bold;
                      "
                    >
                      #${parceriaSalva.id}
                    </div>

                  </div>


                  <!-- RESPONSÁVEL -->

                  <div
                    style="
                      padding:15px 0;
                      border-bottom:1px solid #eee9e6;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:5px;
                      "
                    >
                      RESPONSÁVEL
                    </div>

                    <div
                      style="
                        font-size:15px;
                        font-weight:bold;
                      "
                    >
                      ${nomeSeguro}
                    </div>

                  </div>


                  <!-- EMPRESA -->

                  <div
                    style="
                      padding:15px 0;
                      border-bottom:1px solid #eee9e6;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:5px;
                      "
                    >
                      CLÍNICA / EMPRESA / PROJETO
                    </div>

                    <div
                      style="
                        font-size:15px;
                        font-weight:bold;
                      "
                    >
                      ${empresaSegura}
                    </div>

                  </div>


                  <!-- TIPO -->

                  <div
                    style="
                      padding:15px 0;
                      border-bottom:1px solid #eee9e6;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:5px;
                      "
                    >
                      TIPO DE PARCERIA
                    </div>

                    <div
                      style="
                        font-size:14px;
                      "
                    >
                      ${tipoSeguro}
                    </div>

                  </div>


                  <!-- E-MAIL -->

                  <div
                    style="
                      padding:15px 0;
                      border-bottom:1px solid #eee9e6;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:5px;
                      "
                    >
                      E-MAIL
                    </div>

                    <div
                      style="
                        font-size:14px;
                        word-break:break-word;
                      "
                    >
                      ${emailSeguro}
                    </div>

                  </div>


                  <!-- WHATSAPP -->

                  <div
                    style="
                      padding:15px 0;
                      border-bottom:1px solid #eee9e6;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:5px;
                      "
                    >
                      WHATSAPP
                    </div>

                    <div
                      style="
                        font-size:14px;
                      "
                    >
                      ${whatsappSeguro}
                    </div>

                  </div>


                  <!-- PROPOSTA -->

                  <div
                    style="
                      margin-top:25px;
                    "
                  >

                    <div
                      style="
                        color:#958b86;
                        font-size:11px;
                        font-weight:bold;
                        margin-bottom:10px;
                      "
                    >
                      PROPOSTA
                    </div>


                    <div
                      style="
                        padding:18px;
                        background:#f8f5f3;
                        border-radius:10px;
                        color:#514b48;
                        font-size:14px;
                        line-height:1.7;
                        word-break:break-word;
                      "
                    >

                      ${mensagemSegura}

                    </div>

                  </div>


                  <!-- STATUS -->

                  <div
                    style="
                      margin-top:20px;
                      padding:14px 16px;
                      background:#f7f1ed;
                      border-radius:10px;
                      font-size:13px;
                      color:#604744;
                    "
                  >

                    <strong>Status:</strong>
                    Nova proposta

                  </div>


                  <!-- AVISO -->

                  <div
                    style="
                      margin-top:25px;
                      padding-top:20px;
                      border-top:1px solid #eee9e6;
                      color:#958b86;
                      font-size:11px;
                      line-height:1.6;
                    "
                  >

                    Ao responder este e-mail,
                    a resposta será direcionada para
                    ${emailSeguro}.

                  </div>


                </div>


              </div>


            </div>


          </body>

          </html>
        `

      });


    /* =====================================================
       RESEND RETORNOU ERRO

       NÃO apagamos a proposta.

       Ela permanece no banco:
       email_enviado = false
    ===================================================== */

    if (error) {

      console.error(
        "Erro Resend:",
        error
      );


      return res.status(202).json({

        sucesso: true,

        emailEnviado: false,

        propostaId:
          parceriaSalva.id,

        mensagem:
          "Sua proposta foi recebida com sucesso. Nossa equipe irá analisá-la em breve."

      });

    }


    /* =====================================================
       E-MAIL ENVIADO

       Atualizar registro no banco.
    ===================================================== */

    try {

      await pool.query(

        `
          UPDATE parcerias

          SET
            email_enviado = true,
            resend_id = $1,
            atualizado_em = NOW()

          WHERE id = $2
        `,

        [

          data?.id || null,

          parceriaSalva.id

        ]

      );


      parceriaSalva.email_enviado =
        true;


    } catch (erroAtualizacao) {

      /*
       * O e-mail já foi enviado.
       *
       * Uma falha ao atualizar o registro
       * não deve fazer o formulário público
       * informar que a proposta falhou.
       */

      console.error(
        "E-mail enviado, mas houve erro ao atualizar o registro da parceria:",
        erroAtualizacao
      );

    }


    /* =====================================================
       LOG DE SUCESSO

       Não registramos dados pessoais completos.
    ===================================================== */

    console.log(
      "Proposta enviada com sucesso:",
      {

        id:
          parceriaSalva.id,

        emailEnviado:
          true,

        resendId:
          data?.id || null

      }
    );


    /* =====================================================
       RESPOSTA
    ===================================================== */

    return res.status(201).json({

      sucesso: true,

      emailEnviado: true,

      propostaId:
        parceriaSalva.id,

      mensagem:
        "Sua proposta foi enviada com sucesso. Obrigado pelo interesse em construir uma parceria com o PsiFácil."

    });


  } catch (erro) {

    /* =====================================================
       ERRO GERAL
    ===================================================== */

    console.error(
      "Erro ao processar parceria:",
      erro
    );


    return res.status(500).json({

      sucesso: false,

      mensagem:
        "Não foi possível registrar sua proposta neste momento. Tente novamente mais tarde."

    });

  }

});


/* =========================================================
   GET /parcerias

   ADMINISTRATIVO
   PROTEGIDO POR JWT

   Lista todas as propostas.
========================================================= */

router.get(
  "/",
  autenticarAdmin,
  async (req, res) => {

    try {

      const resultado =
        await pool.query(`
          SELECT

            id,
            nome,
            empresa,
            email,
            whatsapp,
            tipo,
            mensagem,
            status,
            email_enviado,
            resend_id,
            criado_em,
            atualizado_em

          FROM parcerias

          ORDER BY
            criado_em DESC,
            id DESC
        `);


      return res.status(200).json({

        sucesso: true,

        parcerias:
          resultado.rows

      });


    } catch (erro) {

      console.error(
        "Erro ao listar parcerias:",
        erro
      );


      return res.status(500).json({

        sucesso: false,

        mensagem:
          "Não foi possível carregar as propostas de parceria."

      });

    }

  }
);


/* =========================================================
   PATCH /parcerias/:id/status

   ADMINISTRATIVO
   PROTEGIDO POR JWT

   Altera o status da proposta.
========================================================= */

router.patch(
  "/:id/status",
  autenticarAdmin,
  async (req, res) => {

    try {

      /* ===================================================
         VALIDAR ID
      =================================================== */

      const id =
        Number(
          req.params.id
        );


      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({

          sucesso: false,

          mensagem:
            "Identificador da parceria inválido."

        });

      }


      /* ===================================================
         RECEBER STATUS
      =================================================== */

      const status =
        String(
          req.body?.status || ""
        )
          .trim()
          .toLowerCase();


      /* ===================================================
         VALIDAR STATUS
      =================================================== */

      if (
        !statusPermitidos.includes(
          status
        )
      ) {

        return res.status(400).json({

          sucesso: false,

          mensagem:
            "Status de parceria inválido."

        });

      }


      /* ===================================================
         ATUALIZAR NO BANCO
      =================================================== */

      const resultado =
        await pool.query(

          `
            UPDATE parcerias

            SET

              status = $1,

              atualizado_em = NOW()

            WHERE id = $2

            RETURNING

              id,
              nome,
              empresa,
              email,
              whatsapp,
              tipo,
              mensagem,
              status,
              email_enviado,
              resend_id,
              criado_em,
              atualizado_em
          `,

          [

            status,

            id

          ]

        );


      /* ===================================================
         NÃO ENCONTRADA
      =================================================== */

      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({

          sucesso: false,

          mensagem:
            "Proposta de parceria não encontrada."

        });

      }


      /* ===================================================
         SUCESSO
      =================================================== */

      return res.status(200).json({

        sucesso: true,

        mensagem:
          "Status da parceria atualizado com sucesso.",

        parceria:
          resultado.rows[0]

      });


    } catch (erro) {

      console.error(
        "Erro ao atualizar status da parceria:",
        erro
      );


      return res.status(500).json({

        sucesso: false,

        mensagem:
          "Não foi possível atualizar o status da parceria."

      });

    }

  }
);


/* =========================================================
   DELETE /parcerias/:id

   ADMINISTRATIVO
   PROTEGIDO POR JWT

   Exclui uma proposta.
========================================================= */

router.delete(
  "/:id",
  autenticarAdmin,
  async (req, res) => {

    try {

      /* ===================================================
         VALIDAR ID
      =================================================== */

      const id =
        Number(
          req.params.id
        );


      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({

          sucesso: false,

          mensagem:
            "Identificador da parceria inválido."

        });

      }


      /* ===================================================
         EXCLUIR DO BANCO
      =================================================== */

      const resultado =
        await pool.query(

          `
            DELETE FROM parcerias

            WHERE id = $1

            RETURNING

              id,
              nome,
              empresa
          `,

          [
            id
          ]

        );


      /* ===================================================
         NÃO ENCONTRADA
      =================================================== */

      if (
        resultado.rows.length === 0
      ) {

        return res.status(404).json({

          sucesso: false,

          mensagem:
            "Proposta de parceria não encontrada."

        });

      }


      /* ===================================================
         SUCESSO
      =================================================== */

      return res.status(200).json({

        sucesso: true,

        mensagem:
          "Proposta de parceria excluída com sucesso.",

        parceria: {

          id:
            resultado.rows[0].id,

          nome:
            resultado.rows[0].nome,

          empresa:
            resultado.rows[0].empresa

        }

      });


    } catch (erro) {

      console.error(
        "Erro ao excluir parceria:",
        erro
      );


      return res.status(500).json({

        sucesso: false,

        mensagem:
          "Não foi possível excluir a proposta de parceria."

      });

    }

  }
);


/* =========================================================
   EXPORTAR ROUTER
========================================================= */

module.exports = router;