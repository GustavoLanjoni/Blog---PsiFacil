const express = require("express");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");
const db = require("../db");
require("dotenv").config();

const router = express.Router();


// =====================================================
// CONFIGURAÇÃO WEB PUSH
// =====================================================

webpush.setVapidDetails(
    "mailto:contato@psifacilblog.com.br",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);


// =====================================================
// MIDDLEWARE - SOMENTE ADMIN
// =====================================================

async function autenticarAdmin(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            erro: "Token não informado."
        });
    }

    const partes = authorization.split(" ");

    if (
        partes.length !== 2 ||
        partes[0] !== "Bearer" ||
        !partes[1]
    ) {
        return res.status(401).json({
            erro: "Token inválido."
        });
    }

    const token = partes[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Confirma que o ID do token realmente pertence
        // a um administrador existente.
        const resultadoAdmin = await db.query(
            `
            SELECT id, email
            FROM admins
            WHERE id = $1
            LIMIT 1
            `,
            [decoded.id]
        );

        if (resultadoAdmin.rows.length === 0) {
            return res.status(403).json({
                erro: "Acesso não autorizado."
            });
        }

        req.admin = resultadoAdmin.rows[0];

        next();

    } catch (error) {

        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });

    }

}


// =====================================================
// POST /novidades
// ENVIA UMA NOVIDADE PARA OS USUÁRIOS
// =====================================================

router.post("/", autenticarAdmin, async (req, res) => {

    const {
        titulo,
        mensagem,
        url
    } = req.body;


    // =================================================
    // VALIDAÇÃO
    // =================================================

    if (!titulo || !titulo.trim()) {
        return res.status(400).json({
            erro: "Informe o título da novidade."
        });
    }

    if (!mensagem || !mensagem.trim()) {
        return res.status(400).json({
            erro: "Informe a mensagem da novidade."
        });
    }

    const tituloLimpo = titulo.trim();
    const mensagemLimpa = mensagem.trim();
    const urlLimpa = url?.trim() || null;


    if (tituloLimpo.length > 150) {
        return res.status(400).json({
            erro: "O título deve ter no máximo 150 caracteres."
        });
    }


    try {

        // =================================================
        // 1. BUSCAR USUÁRIOS QUE ACEITARAM NOVIDADES
        // =================================================

        const usuariosResultado = await db.query(
            `
            SELECT usuario_id
            FROM preferencias_notificacoes
            WHERE novidades = TRUE
            `
        );

        const usuarios = usuariosResultado.rows;


        if (usuarios.length === 0) {

            return res.json({
                sucesso: true,
                mensagem: "Nenhum usuário ativou notificações de novidades.",
                usuarios: 0,
                notificacoesInternas: 0,
                pushesEnviados: 0
            });

        }


        // =================================================
        // 2. CRIAR NOTIFICAÇÕES INTERNAS
        // =================================================

        const notificacoesResultado = await db.query(
            `
            INSERT INTO notificacoes (
                usuario_id,
                tipo,
                titulo,
                mensagem,
                url
            )

            SELECT
                usuario_id,
                'novidade',
                $1,
                $2,
                $3

            FROM preferencias_notificacoes

            WHERE novidades = TRUE

            RETURNING id
            `,
            [
                tituloLimpo,
                mensagemLimpa,
                urlLimpa
            ]
        );


        // =================================================
        // 3. BUSCAR PUSH SUBSCRIPTIONS
        // =================================================

        const subscriptionsResultado = await db.query(
            `
            SELECT
                ps.id,
                ps.usuario_id,
                ps.endpoint,
                ps.p256dh,
                ps.auth

            FROM push_subscriptions ps

            INNER JOIN preferencias_notificacoes pn
                ON pn.usuario_id = ps.usuario_id

            WHERE pn.novidades = TRUE
            `
        );

        const subscriptions = subscriptionsResultado.rows;


        // =================================================
        // 4. PREPARAR PUSH
        // =================================================

        const payload = JSON.stringify({

            titulo: tituloLimpo,

            mensagem: mensagemLimpa,

            url: urlLimpa || "/perfil.html",

            tag: `psifacil-novidade-${Date.now()}`

        });

        let pushesEnviados = 0;
        let subscriptionsRemovidas = 0;


        // =================================================
        // 5. ENVIAR WEB PUSH
        // =================================================

        for (const subscription of subscriptions) {

            try {

                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,

                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth
                        }
                    },
                    payload
                );

                pushesEnviados++;


            } catch (error) {

                console.error(
                    `ERRO AO ENVIAR PUSH PARA USUÁRIO ${subscription.usuario_id}:`,
                    error.statusCode || error.message
                );


                // =========================================
                // SUBSCRIPTION EXPIRADA / INVÁLIDA
                // =========================================

                if (
                    error.statusCode === 404 ||
                    error.statusCode === 410
                ) {

                    try {

                        await db.query(
                            `
                            DELETE FROM push_subscriptions
                            WHERE id = $1
                            `,
                            [subscription.id]
                        );

                        subscriptionsRemovidas++;

                    } catch (erroDelete) {

                        console.error(
                            "ERRO AO REMOVER SUBSCRIPTION:",
                            erroDelete
                        );

                    }

                }

            }

        }


        // =================================================
        // 6. RESPOSTA
        // =================================================

        return res.json({

            sucesso: true,

            mensagem: "Novidade enviada com sucesso.",

            usuarios: usuarios.length,

            notificacoesInternas:
                notificacoesResultado.rowCount,

            pushesEnviados,

            subscriptionsRemovidas

        });


    } catch (error) {

        console.error(
            "ERRO AO ENVIAR NOVIDADE:",
            error
        );

        return res.status(500).json({
            erro: "Não foi possível enviar a novidade."
        });

    }

});


module.exports = router;