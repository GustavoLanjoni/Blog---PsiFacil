
const express = require("express");
const router = express.Router();

const db = require("../db");
const autenticarAdmin = require("../middleware/authAdmin");

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function texto(valor) {
    return typeof valor === "string"
        ? valor.trim()
        : "";
}

function validarLinkAmazon(link) {
    try {
        const url = new URL(link);

        const dominiosPermitidos = [
            "amazon.com.br",
            "www.amazon.com.br",
            "amazon.com",
            "www.amazon.com",
            "amzn.to",
            "www.amzn.to",
            "a.co",
            "www.a.co",
            "link.amazon"
        ];

        if (
            url.protocol !== "https:" ||
            !dominiosPermitidos.includes(
                url.hostname.toLowerCase()
            )
        ) {
            return null;
        }

        return url.href;
    } catch {
        return null;
    }
}

function prepararDadosLivro(body) {
    const titulo = texto(body.titulo);
    const autor = texto(body.autor);
    const categoria = texto(body.categoria);
    const descricao = texto(body.descricao);
    const imagem = texto(body.imagem);
    const linkAmazon = texto(body.link_amazon);

    if (
        !titulo ||
        !autor ||
        !categoria ||
        !descricao ||
        !imagem ||
        !linkAmazon
    ) {
        return {
            erro: "Preencha todos os campos e envie a capa do livro."
        };
    }

    if (
        titulo.length > 200 ||
        autor.length > 255 ||
        categoria.length > 100 ||
        descricao.length > 500
    ) {
        return {
            erro: "Um ou mais campos ultrapassaram o limite permitido."
        };
    }

    const urlAmazon = validarLinkAmazon(linkAmazon);

    if (!urlAmazon) {
        return {
            erro: "Informe um link HTTPS válido da Amazon."
        };
    }

    return {
        dados: {
            titulo,
            autor,
            categoria,
            descricao,
            imagem,
            link_amazon: urlAmazon,
            status:
                body.status === "publicado"
                    ? "publicado"
                    : "rascunho",
            destaque:
                body.destaque === true ||
                body.destaque === "sim"
        }
    };
}

function validarId(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({
            sucesso: false,
            erro: "ID do livro inválido."
        });

        return null;
    }

    return id;
}

/* =========================================
   TESTE DA API
========================================= */

router.get("/teste", (req, res) => {
    return res.status(200).json({
        sucesso: true,
        mensagem: "API de livros do PsiFácil funcionando!"
    });
});

/* =========================================
   LISTAR LIVROS PUBLICADOS - PÚBLICO
========================================= */

router.get("/", async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT
                id,
                titulo,
                autor,
                categoria,
                descricao,
                imagem,
                link_amazon,
                destaque,
                criado_em
            FROM livros
            WHERE status = 'publicado'
            ORDER BY destaque DESC, criado_em DESC, id DESC
        `);

        return res.status(200).json({
            sucesso: true,
            livros: resultado.rows
        });

    } catch (erro) {
        console.error("ERRO AO LISTAR LIVROS:", erro);

        return res.status(500).json({
            sucesso: false,
            erro: "Não foi possível carregar os livros."
        });
    }
});

/* =========================================
   LISTAR TODOS OS LIVROS - ADMIN
   Inclui publicados e rascunhos
========================================= */

router.get(
    "/admin/todos",
    autenticarAdmin,
    async (req, res) => {
        try {
            const resultado = await db.query(`
                SELECT
                    id,
                    titulo,
                    autor,
                    categoria,
                    descricao,
                    imagem,
                    link_amazon,
                    status,
                    destaque,
                    criado_em,
                    atualizado_em
                FROM livros
                ORDER BY criado_em DESC, id DESC
            `);

            return res.status(200).json({
                sucesso: true,
                total: resultado.rows.length,
                livros: resultado.rows
            });

        } catch (erro) {
            console.error(
                "ERRO AO LISTAR LIVROS ADMIN:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                erro: "Não foi possível carregar os livros cadastrados."
            });
        }
    }
);

/* =========================================
   CADASTRAR LIVRO - ADMIN
========================================= */

router.post(
    "/",
    autenticarAdmin,
    async (req, res) => {
        try {
            const validacao = prepararDadosLivro(
                req.body || {}
            );

            if (validacao.erro) {
                return res.status(400).json({
                    sucesso: false,
                    erro: validacao.erro
                });
            }

            const livro = validacao.dados;

            const resultado = await db.query(
                `INSERT INTO livros (
                    titulo,
                    autor,
                    categoria,
                    descricao,
                    imagem,
                    link_amazon,
                    status,
                    destaque
                )
                VALUES (
                    $1, $2, $3, $4,
                    $5, $6, $7, $8
                )
                RETURNING *`,
                [
                    livro.titulo,
                    livro.autor,
                    livro.categoria,
                    livro.descricao,
                    livro.imagem,
                    livro.link_amazon,
                    livro.status,
                    livro.destaque
                ]
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Livro cadastrado com sucesso!",
                livro: resultado.rows[0]
            });

        } catch (erro) {
            console.error(
                "ERRO AO CADASTRAR LIVRO:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                erro: "Não foi possível cadastrar o livro."
            });
        }
    }
);

/* =========================================
   EDITAR LIVRO - ADMIN
========================================= */

router.put(
    "/:id",
    autenticarAdmin,
    async (req, res) => {
        try {
            const id = validarId(req, res);

            if (id === null) return;

            const validacao = prepararDadosLivro(
                req.body || {}
            );

            if (validacao.erro) {
                return res.status(400).json({
                    sucesso: false,
                    erro: validacao.erro
                });
            }

            const livro = validacao.dados;

            const resultado = await db.query(
                `UPDATE livros
                 SET
                    titulo = $1,
                    autor = $2,
                    categoria = $3,
                    descricao = $4,
                    imagem = $5,
                    link_amazon = $6,
                    status = $7,
                    destaque = $8,
                    atualizado_em = CURRENT_TIMESTAMP
                 WHERE id = $9
                 RETURNING *`,
                [
                    livro.titulo,
                    livro.autor,
                    livro.categoria,
                    livro.descricao,
                    livro.imagem,
                    livro.link_amazon,
                    livro.status,
                    livro.destaque,
                    id
                ]
            );

            if (resultado.rowCount === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: "Livro não encontrado."
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Livro atualizado com sucesso!",
                livro: resultado.rows[0]
            });

        } catch (erro) {
            console.error(
                "ERRO AO EDITAR LIVRO:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                erro: "Não foi possível atualizar o livro."
            });
        }
    }
);

/* =========================================
   EXCLUIR LIVRO - ADMIN
========================================= */

router.delete(
    "/:id",
    autenticarAdmin,
    async (req, res) => {
        try {
            const id = validarId(req, res);

            if (id === null) return;

            const resultado = await db.query(
                `DELETE FROM livros
                 WHERE id = $1
                 RETURNING id, titulo`,
                [id]
            );

            if (resultado.rowCount === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: "Livro não encontrado."
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Livro excluído com sucesso!",
                livro: resultado.rows[0]
            });

        } catch (erro) {
            console.error(
                "ERRO AO EXCLUIR LIVRO:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                erro: "Não foi possível excluir o livro."
            });
        }
    }
);

module.exports = router;
