const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const webpush = require("web-push");
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
   GET /push/public-key

   ENVIAR CHAVE PÚBLICA VAPID PARA O FRONTEND
========================================================= */

router.get(
    "/public-key",
    (req, res) => {

        const chavePublica =
            process.env.VAPID_PUBLIC_KEY;


        if (!chavePublica) {

            return res.status(500).json({

                erro:
                    "Chave pública VAPID não configurada."

            });

        }


        return res.status(200).json({

            publicKey:
                chavePublica

        });

    }
);


/* =========================================================
   POST /push/subscribe

   SALVAR DISPOSITIVO DO USUÁRIO
========================================================= */

router.post(
    "/subscribe",
    async (req, res) => {

        try {

            const usuarioId =
                obterUsuarioDoToken(req);


            /* =============================================
               AUTENTICAÇÃO
            ============================================= */

            if (!usuarioId) {

                return res.status(401).json({

                    erro:
                        "Usuário não autenticado."

                });

            }


            /* =============================================
               RECEBER INSCRIÇÃO
            ============================================= */

            const subscription =
                req.body.subscription;


            if (
                !subscription ||
                !subscription.endpoint ||
                !subscription.keys ||
                !subscription.keys.p256dh ||
                !subscription.keys.auth
            ) {

                return res.status(400).json({

                    erro:
                        "Inscrição Push inválida."

                });

            }


            const endpoint =
                subscription.endpoint;


            const p256dh =
                subscription.keys.p256dh;


            const auth =
                subscription.keys.auth;


            /* =============================================
               SALVAR / ATUALIZAR

               endpoint é UNIQUE no banco.

               Se o navegador já estiver cadastrado,
               apenas atualizamos os dados.
            ============================================= */

            await db.query(
                `
                INSERT INTO push_subscriptions (
                    usuario_id,
                    endpoint,
                    p256dh,
                    auth
                )

                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )

                ON CONFLICT (endpoint)

                DO UPDATE SET

                    usuario_id =
                        EXCLUDED.usuario_id,

                    p256dh =
                        EXCLUDED.p256dh,

                    auth =
                        EXCLUDED.auth,

                    atualizado_em =
                        NOW()
                `,
                [
                    usuarioId,
                    endpoint,
                    p256dh,
                    auth
                ]
            );


            return res.status(200).json({

                mensagem:
                    "Dispositivo registrado para notificações."

            });


        } catch (error) {

            console.error(
                "Erro ao registrar Push:",
                error
            );


            return res.status(500).json({

                erro:
                    "Não foi possível registrar o dispositivo."

            });

        }

    }
);


/* =========================================================
   DELETE /push/subscribe

   REMOVER INSCRIÇÃO DESTE DISPOSITIVO
========================================================= */

router.delete(
    "/subscribe",
    async (req, res) => {

        try {

            const usuarioId =
                obterUsuarioDoToken(req);


            if (!usuarioId) {

                return res.status(401).json({

                    erro:
                        "Usuário não autenticado."

                });

            }


            const endpoint =
                req.body.endpoint;


            if (!endpoint) {

                return res.status(400).json({

                    erro:
                        "Endpoint não informado."

                });

            }


            await db.query(
                `
                DELETE FROM push_subscriptions

                WHERE
                    usuario_id = $1
                    AND endpoint = $2
                `,
                [
                    usuarioId,
                    endpoint
                ]
            );


            return res.status(200).json({

                mensagem:
                    "Dispositivo removido das notificações."

            });


        } catch (error) {

            console.error(
                "Erro ao remover Push:",
                error
            );


            return res.status(500).json({

                erro:
                    "Não foi possível remover o dispositivo."

            });

        }

    }
);

/* =========================================================
   CONFIGURAR WEB PUSH
========================================================= */

if (
    !process.env.VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.VAPID_EMAIL
) {

    console.warn(
        "⚠️ Configuração VAPID incompleta."
    );

} else {

    webpush.setVapidDetails(
        process.env.VAPID_EMAIL,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

}

/* =========================================================
   POST /push/teste

   ENVIAR PUSH DE TESTE PARA O USUÁRIO LOGADO
========================================================= */

router.post(
    "/teste",
    async (req, res) => {

        try {

            const usuarioId =
                obterUsuarioDoToken(req);


            if (!usuarioId) {

                return res.status(401).json({

                    erro:
                        "Usuário não autenticado."

                });

            }


            /* =============================================
               BUSCAR DISPOSITIVOS DO USUÁRIO
            ============================================= */

            const resultado =
                await db.query(
                    `
                    SELECT
                        id,
                        endpoint,
                        p256dh,
                        auth

                    FROM push_subscriptions

                    WHERE usuario_id = $1
                    `,
                    [
                        usuarioId
                    ]
                );


            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({

                    erro:
                        "Nenhum dispositivo registrado para notificações."

                });

            }


            /* =============================================
               CONTEÚDO DA NOTIFICAÇÃO
            ============================================= */

            const payload =
                JSON.stringify({

                    titulo:
                        "PsiFácil 🔔",

                    mensagem:
                        "Sua primeira notificação Push está funcionando!",

                    url:
                        "/perfil.html",

                    tag:
                        "psifacil-teste"

                });


            let enviados = 0;
            let removidos = 0;
            let erros = 0;


            /* =============================================
               ENVIAR PARA CADA DISPOSITIVO
            ============================================= */

            for (
                const dispositivo
                of resultado.rows
            ) {

                const subscription = {

                    endpoint:
                        dispositivo.endpoint,

                    keys: {

                        p256dh:
                            dispositivo.p256dh,

                        auth:
                            dispositivo.auth

                    }

                };


                try {

                    await webpush.sendNotification(
                        subscription,
                        payload
                    );


                    enviados++;


                } catch (error) {

                    console.error(
                        "Erro ao enviar Push:",
                        error.statusCode ||
                        error.message
                    );


                    /* =====================================
                       INSCRIÇÃO EXPIRADA OU INVÁLIDA
                    ===================================== */

                    if (
                        error.statusCode === 404 ||
                        error.statusCode === 410
                    ) {

                        await db.query(
                            `
                            DELETE FROM push_subscriptions
                            WHERE id = $1
                            `,
                            [
                                dispositivo.id
                            ]
                        );


                        removidos++;

                    } else {

                        erros++;

                    }

                }

            }


            /* =============================================
               RESULTADO
            ============================================= */

            return res.status(200).json({

                mensagem:
                    "Teste de notificação concluído.",

                enviados:
                    enviados,

                removidos:
                    removidos,

                erros:
                    erros

            });


        } catch (error) {

            console.error(
                "Erro no teste de Push:",
                error
            );


            return res.status(500).json({

                erro:
                    "Não foi possível enviar a notificação de teste."

            });

        }

    }
);


module.exports = router;