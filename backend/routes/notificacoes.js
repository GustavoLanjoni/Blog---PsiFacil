const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();


/* =========================================================
   AUTENTICAR USUÁRIO
========================================================= */

function autenticarUsuario(req, res, next) {

    const authorization =
        req.headers.authorization;


    if (
        !authorization ||
        !authorization.startsWith("Bearer ")
    ) {

        return res.status(401).json({
            erro: "Token não fornecido."
        });

    }


    const token =
        authorization.split(" ")[1];


    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.usuarioId =
            decoded.id;


        next();


    } catch (error) {

        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });

    }

}


/* =========================================================
   LISTAR NOTIFICAÇÕES DO USUÁRIO
========================================================= */

router.get(
    "/",
    autenticarUsuario,
    async (req, res) => {

        try {

            const resultado =
                await db.query(
                    `
                    SELECT
                        id,
                        tipo,
                        titulo,
                        mensagem,
                        url,
                        lida,
                        criado_em

                    FROM notificacoes

                    WHERE usuario_id = $1

                    ORDER BY criado_em DESC

                    LIMIT 50
                    `,
                    [
                        req.usuarioId
                    ]
                );


            return res.json(
                resultado.rows
            );


        } catch (error) {

            console.error(
                "ERRO AO BUSCAR NOTIFICAÇÕES:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao buscar notificações."
            });

        }

    }
);


/* =========================================================
   QUANTIDADE DE NÃO LIDAS
========================================================= */

router.get(
    "/nao-lidas",
    autenticarUsuario,
    async (req, res) => {

        try {

            const resultado =
                await db.query(
                    `
                    SELECT COUNT(*)::int AS total

                    FROM notificacoes

                    WHERE usuario_id = $1
                      AND lida = FALSE
                    `,
                    [
                        req.usuarioId
                    ]
                );


            return res.json({
                total:
                    resultado.rows[0].total
            });


        } catch (error) {

            console.error(
                "ERRO AO CONTAR NOTIFICAÇÕES:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao contar notificações."
            });

        }

    }
);


/* =========================================================
   MARCAR UMA NOTIFICAÇÃO COMO LIDA
========================================================= */

router.patch(
    "/:id/lida",
    autenticarUsuario,
    async (req, res) => {

        const { id } =
            req.params;


        try {

            const resultado =
                await db.query(
                    `
                    UPDATE notificacoes

                    SET lida = TRUE

                    WHERE id = $1
                      AND usuario_id = $2

                    RETURNING *
                    `,
                    [
                        id,
                        req.usuarioId
                    ]
                );


            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    erro:
                        "Notificação não encontrada."
                });

            }


            return res.json({
                sucesso: true,
                notificacao:
                    resultado.rows[0]
            });


        } catch (error) {

            console.error(
                "ERRO AO MARCAR NOTIFICAÇÃO COMO LIDA:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao atualizar notificação."
            });

        }

    }
);


/* =========================================================
   MARCAR TODAS COMO LIDAS
========================================================= */

router.patch(
    "/marcar-todas/lidas",
    autenticarUsuario,
    async (req, res) => {

        try {

            const resultado =
                await db.query(
                    `
                    UPDATE notificacoes

                    SET lida = TRUE

                    WHERE usuario_id = $1
                      AND lida = FALSE

                    RETURNING id
                    `,
                    [
                        req.usuarioId
                    ]
                );


            return res.json({
                sucesso: true,
                atualizadas:
                    resultado.rowCount
            });


        } catch (error) {

            console.error(
                "ERRO AO MARCAR TODAS COMO LIDAS:",
                error
            );


            return res.status(500).json({
                erro:
                    "Erro ao atualizar notificações."
            });

        }

    }
);


module.exports = router;