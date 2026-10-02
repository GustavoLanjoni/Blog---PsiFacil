const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();


/* =========================================================
   PEGAR USUÁRIO PELO TOKEN
========================================================= */

function obterUsuarioDoToken(req) {

    const authHeader =
        req.headers.authorization;


    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return null;

    }


    const token =
        authHeader.split(" ")[1];


    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        return decoded.id;


    } catch (error) {

        return null;

    }

}


/* =========================================================
   GET /preferencias

   BUSCAR PREFERÊNCIAS DO USUÁRIO
========================================================= */

router.get("/", async (req, res) => {

    try {

        const usuarioId =
            obterUsuarioDoToken(req);


        /* =================================================
           VERIFICAR AUTENTICAÇÃO
        ================================================= */

        if (!usuarioId) {

            return res.status(401).json({

                erro:
                    "Usuário não autenticado."

            });

        }


        /* =================================================
           GARANTIR QUE O USUÁRIO TENHA PREFERÊNCIAS

           Se já existir:
           não cria outra linha.

           Se não existir:
           cria com tudo desligado.
        ================================================= */

        await db.query(
            `
            INSERT INTO preferencias_notificacoes (
                usuario_id,
                novos_artigos,
                novidades
            )

            VALUES (
                $1,
                FALSE,
                FALSE
            )

            ON CONFLICT (usuario_id)
            DO NOTHING
            `,
            [usuarioId]
        );


        /* =================================================
           BUSCAR PREFERÊNCIAS
        ================================================= */

        const resultado =
            await db.query(
                `
                SELECT
                    novos_artigos,
                    novidades

                FROM preferencias_notificacoes

                WHERE usuario_id = $1

                LIMIT 1
                `,
                [usuarioId]
            );


        /* =================================================
           SEGURANÇA EXTRA
        ================================================= */

        if (resultado.rows.length === 0) {

            return res.status(404).json({

                erro:
                    "Preferências não encontradas."

            });

        }


        /* =================================================
           RETORNAR
        ================================================= */

        return res.status(200).json(
            resultado.rows[0]
        );


    } catch (error) {

        console.error(
            "Erro ao buscar preferências:",
            error
        );


        return res.status(500).json({

            erro:
                "Não foi possível carregar suas preferências."

        });

    }

});


/* =========================================================
   PUT /preferencias

   SALVAR PREFERÊNCIAS DO USUÁRIO
========================================================= */

router.put("/", async (req, res) => {

    try {

        const usuarioId =
            obterUsuarioDoToken(req);


        /* =================================================
           VERIFICAR AUTENTICAÇÃO
        ================================================= */

        if (!usuarioId) {

            return res.status(401).json({

                erro:
                    "Usuário não autenticado."

            });

        }


        /* =================================================
           RECEBER DADOS
        ================================================= */

        const {
            novosArtigos,
            novidades
        } = req.body;


        /* =================================================
           VALIDAR
        ================================================= */

        if (
            typeof novosArtigos !== "boolean" ||
            typeof novidades !== "boolean"
        ) {

            return res.status(400).json({

                erro:
                    "Preferências inválidas."

            });

        }


        /* =================================================
           INSERT OU UPDATE

           Se não existir:
           cria.

           Se já existir:
           atualiza.
        ================================================= */

        const resultado =
            await db.query(
                `
                INSERT INTO preferencias_notificacoes (
                    usuario_id,
                    novos_artigos,
                    novidades
                )

                VALUES (
                    $1,
                    $2,
                    $3
                )

                ON CONFLICT (usuario_id)

                DO UPDATE SET

                    novos_artigos =
                        EXCLUDED.novos_artigos,

                    novidades =
                        EXCLUDED.novidades,

                    atualizado_em =
                        NOW()

                RETURNING
                    novos_artigos,
                    novidades
                `,
                [
                    usuarioId,
                    novosArtigos,
                    novidades
                ]
            );


        /* =================================================
           SUCESSO
        ================================================= */

        return res.status(200).json({

            mensagem:
                "Preferências atualizadas com sucesso.",

            preferencias:
                resultado.rows[0]

        });


    } catch (error) {

        console.error(
            "Erro ao salvar preferências:",
            error
        );


        return res.status(500).json({

            erro:
                "Não foi possível salvar suas preferências."

        });

    }

});


module.exports = router;