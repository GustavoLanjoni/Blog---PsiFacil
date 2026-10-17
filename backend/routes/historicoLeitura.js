
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

/* =====================================================
   AUTENTICAÇÃO DO USUÁRIO
===================================================== */


function autenticarUsuario(req, res, next) {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            erro: "É necessário entrar na sua conta."
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET não configurado.");

        return res.status(500).json({
            erro: "Erro de configuração do servidor."
        });
    }

    try {
        const token = authorization.slice(7).trim();

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        // Aceita tokens antigos e novos dos leitores.
        // Bloqueia tokens administrativos.

        if (
            !decoded ||
            !/^[1-9]\d*$/.test(String(decoded.id || "")) ||
            (
                decoded.role !== undefined &&
                decoded.role !== "usuario"
            ) ||
            (
                decoded.role === undefined &&
                decoded.email !== undefined
            )
        ) {
            return res.status(403).json({
                erro: "Acesso permitido apenas para usuários."
            });
        }

        req.usuarioId = String(decoded.id);

        return next();

    } catch (error) {
        return res.status(401).json({
            erro: "Sessão inválida ou expirada."
        });
    }
}


/* =====================================================
   CONSULTAR PREFERÊNCIA DO HISTÓRICO
   GET /historico/preferencia
===================================================== */

router.get(
    "/preferencia",
    autenticarUsuario,
    async (req, res) => {
        try {
            const resultado = await db.query(
                `SELECT historico_ativo
                 FROM public.usuarios
                 WHERE id = $1`,
                [req.usuarioId]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });
            }

            return res.json({
                historico_ativo:
                    resultado.rows[0].historico_ativo === true
            });

        } catch (error) {
            console.error(
                "Erro ao consultar preferência:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível consultar sua preferência."
            });
        }
    }
);

/* =====================================================
   ATIVAR OU DESATIVAR HISTÓRICO
   PUT /historico/preferencia
===================================================== */

router.put(
    "/preferencia",
    autenticarUsuario,
    async (req, res) => {
        try {
            const { historico_ativo } = req.body || {};

            if (typeof historico_ativo !== "boolean") {
                return res.status(400).json({
                    erro: "A preferência informada é inválida."
                });
            }

            const resultado = await db.query(
                `UPDATE public.usuarios
                 SET historico_ativo = $2
                 WHERE id = $1
                 RETURNING historico_ativo`,
                [
                    req.usuarioId,
                    historico_ativo
                ]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });
            }

            const ativo =
                resultado.rows[0].historico_ativo === true;

            return res.json({
                mensagem: ativo
                    ? "Histórico de leitura ativado."
                    : "Histórico de leitura desativado.",
                historico_ativo: ativo
            });

        } catch (error) {
            console.error(
                "Erro ao atualizar preferência:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível atualizar sua preferência."
            });
        }
    }
);

/* =====================================================
   LISTAR OS ÚLTIMOS 10 ARTIGOS
   GET /historico
===================================================== */

router.get(
    "/",
    autenticarUsuario,
    async (req, res) => {
        try {
            const resultado = await db.query(
                `SELECT
                    h.post_id,
                    h.progresso,
                    h.ultima_leitura,
                    p.titulo,
                    p.slug,
                    p.resumo,
                    p.categoria,
                    p.imagem
                 FROM public.historico_leitura h
                 INNER JOIN public.posts p
                    ON p.id = h.post_id
                 WHERE h.usuario_id = $1
                   AND p.status = 'publicado'
                 ORDER BY h.ultima_leitura DESC
                 LIMIT 10`,
                [req.usuarioId]
            );

            return res.json(resultado.rows);

        } catch (error) {
            console.error(
                "Erro ao consultar histórico:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível carregar seu histórico."
            });
        }
    }
);

/* =====================================================
   REGISTRAR OU ATUALIZAR LEITURA
   POST /historico

   Somente usuários que autorizaram o histórico
   podem registrar leituras.
===================================================== */

router.post(
    "/",
    autenticarUsuario,
    async (req, res) => {
        try {
            const {
                post_id,
                progresso = 0
            } = req.body || {};

            const id = String(post_id || "");

            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({
                    erro: "Artigo inválido."
                });
            }

            if (
                !Number.isInteger(progresso) ||
                progresso < 0 ||
                progresso > 100
            ) {
                return res.status(400).json({
                    erro: "O progresso deve estar entre 0 e 100."
                });
            }

            /*
             * O INSERT verifica o consentimento
             * diretamente no banco de dados.
             */

            const resultado = await db.query(
                `INSERT INTO public.historico_leitura (
                    usuario_id,
                    post_id,
                    progresso,
                    ultima_leitura
                 )
                 SELECT
                    u.id,
                    p.id,
                    $3,
                    NOW()
                 FROM public.usuarios u
                 CROSS JOIN public.posts p
                 WHERE u.id = $1
                   AND u.historico_ativo = TRUE
                   AND p.id = $2
                   AND p.status = 'publicado'
                 ON CONFLICT (usuario_id, post_id)
                 DO UPDATE SET
                    progresso = GREATEST(
                        historico_leitura.progresso,
                        EXCLUDED.progresso
                    ),
                    ultima_leitura = NOW()
                 WHERE EXISTS (
                    SELECT 1
                    FROM public.usuarios u
                    WHERE u.id = historico_leitura.usuario_id
                      AND u.historico_ativo = TRUE
                 )
                 RETURNING
                    post_id,
                    progresso,
                    ultima_leitura`,
                [
                    req.usuarioId,
                    id,
                    progresso
                ]
            );

            if (resultado.rows.length === 0) {
                const verificacao = await db.query(
                    `SELECT
                        u.historico_ativo,
                        EXISTS (
                            SELECT 1
                            FROM public.posts p
                            WHERE p.id = $2
                              AND p.status = 'publicado'
                        ) AS artigo_existe
                     FROM public.usuarios u
                     WHERE u.id = $1`,
                    [
                        req.usuarioId,
                        id
                    ]
                );

                if (verificacao.rows.length === 0) {
                    return res.status(404).json({
                        erro: "Usuário não encontrado."
                    });
                }

                if (!verificacao.rows[0].historico_ativo) {
                    return res.status(403).json({
                        erro: "Ative o histórico nas preferências para registrar leituras."
                    });
                }

                if (!verificacao.rows[0].artigo_existe) {
                    return res.status(404).json({
                        erro: "Artigo não encontrado."
                    });
                }

                return res.status(409).json({
                    erro: "Não foi possível registrar esta leitura."
                });
            }

            return res.json({
                mensagem: "Leitura registrada.",
                historico: resultado.rows[0]
            });

        } catch (error) {
            console.error(
                "Erro ao registrar leitura:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível registrar a leitura."
            });
        }
    }
);

/* =====================================================
   REMOVER UM ARTIGO
   DELETE /historico/:postId
===================================================== */

router.delete(
    "/:postId",
    autenticarUsuario,
    async (req, res) => {
        try {
            const id = String(req.params.postId || "");

            if (!/^[1-9]\d*$/.test(id)) {
                return res.status(400).json({
                    erro: "Artigo inválido."
                });
            }

            await db.query(
                `DELETE FROM public.historico_leitura
                 WHERE usuario_id = $1
                   AND post_id = $2`,
                [
                    req.usuarioId,
                    id
                ]
            );

            return res.json({
                mensagem: "Artigo removido do histórico."
            });

        } catch (error) {
            console.error(
                "Erro ao remover artigo do histórico:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível remover o artigo."
            });
        }
    }
);

/* =====================================================
   LIMPAR TODO O HISTÓRICO
   DELETE /historico
===================================================== */

router.delete(
    "/",
    autenticarUsuario,
    async (req, res) => {
        try {
            await db.query(
                `DELETE FROM public.historico_leitura
                 WHERE usuario_id = $1`,
                [req.usuarioId]
            );

            return res.json({
                mensagem: "Histórico de leitura apagado."
            });

        } catch (error) {
            console.error(
                "Erro ao limpar histórico:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível limpar o histórico."
            });
        }
    }
);

/* =====================================================
   EXPORTAÇÃO DAS ROTAS
===================================================== */

module.exports = router;
