
/* =====================================================
   BIBLIOTECA PSIFÁCIL - LIVROS NA HOME
   Mantém o design original dos cards
===================================================== */

(() => {
    "use strict";

    const LIMITE_LIVROS = 4;

    function criarElemento(tag, classe, texto) {
        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function validarUrl(url) {
        if (typeof url !== "string" || !url.trim()) {
            return null;
        }

        try {
            const endereco = new URL(
                url.trim(),
                window.location.origin
            );

            if (
                endereco.protocol !== "https:" &&
                endereco.protocol !== "http:"
            ) {
                return null;
            }

            return endereco.href;

        } catch {
            return null;
        }
    }

    function criarIcone(nome) {
        const icone = document.createElement("i");
        icone.setAttribute("data-lucide", nome);
        return icone;
    }

    /* =====================================================
       CRIAR CARD COM AS CLASSES ORIGINAIS
    ===================================================== */

    function criarCardLivro(livro) {
        const card = criarElemento(
            "article",
            "biblioteca-livro"
        );

        // CAPA
        const areaImagem = criarElemento(
            "div",
            "biblioteca-livro-imagem"
        );

        const imagem = document.createElement("img");

        const urlImagem = validarUrl(livro.imagem);

        if (urlImagem) {
            imagem.src = urlImagem;
        }

        imagem.alt = `Capa do livro ${livro.titulo || ""}`;
        imagem.loading = "lazy";

        areaImagem.appendChild(imagem);

        // INFORMAÇÕES
        const info = criarElemento(
            "div",
            "biblioteca-livro-info"
        );

        const categoria = criarElemento(
            "span",
            "biblioteca-categoria",
            livro.categoria || "Leitura"
        );

        const titulo = criarElemento(
            "h3",
            "",
            livro.titulo || "Livro sem título"
        );

        const autor = criarElemento(
            "p",
            "biblioteca-autor",
            livro.autor || ""
        );

        const descricao = criarElemento(
            "p",
            "biblioteca-descricao",
            livro.descricao || ""
        );

        // BOTÃO AMAZON
        const botaoAmazon = criarElemento(
            "a",
            "biblioteca-botao-amazon"
        );

        const textoBotao = document.createTextNode(
            "Ver na Amazon "
        );

        botaoAmazon.appendChild(textoBotao);
        botaoAmazon.appendChild(
            criarIcone("arrow-up-right")
        );

        const linkAmazon = validarUrl(livro.link_amazon);

        if (linkAmazon) {
            botaoAmazon.href = linkAmazon;
            botaoAmazon.target = "_blank";
            botaoAmazon.rel =
                "sponsored noopener noreferrer";

            botaoAmazon.setAttribute(
                "aria-label",
                `Ver ${livro.titulo} na Amazon`
            );
        } else {
            botaoAmazon.setAttribute(
                "aria-disabled",
                "true"
            );

            botaoAmazon.style.pointerEvents = "none";
            botaoAmazon.style.opacity = ".5";
        }

        info.append(
            categoria,
            titulo,
            autor,
            descricao,
            botaoAmazon
        );

        card.append(
            areaImagem,
            info
        );

        return card;
    }

    /* =====================================================
       CARREGAR LIVROS DO BACKEND
    ===================================================== */

    async function carregarLivrosHome() {
        const container = document.getElementById(
            "livrosHome"
        );

        if (!container) return;

        try {
            const resposta = await fetch("/livros");

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao carregar livros: ${resposta.status}`
                );
            }

            const resultado = await resposta.json();

            if (!resultado.sucesso) {
                throw new Error(
                    "A API não retornou os livros corretamente."
                );
            }

            const livros = Array.isArray(resultado.livros)
                ? resultado.livros
                : [];

            // Somente livros marcados como destaque
            const destaques = livros
                .filter((livro) => livro.destaque === true)
                .slice(0, LIMITE_LIVROS);

            container.replaceChildren();

            if (destaques.length === 0) {
                const mensagem = criarElemento(
                    "p",
                    "biblioteca-carregando",
                    "Em breve, novas recomendações de leitura."
                );

                container.appendChild(mensagem);
                return;
            }

            destaques.forEach((livro) => {
                container.appendChild(
                    criarCardLivro(livro)
                );
            });

            // Atualizar ícones Lucide
            if (window.lucide?.createIcons) {
                window.lucide.createIcons();
            }

        } catch (erro) {
            console.error(
                "ERRO AO CARREGAR BIBLIOTECA:",
                erro
            );

            container.replaceChildren();

            const mensagem = criarElemento(
                "p",
                "biblioteca-carregando",
                "Não foi possível carregar os livros no momento."
            );

            container.appendChild(mensagem);
        }
    }

    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            carregarLivrosHome
        );
    } else {
        carregarLivrosHome();
    }

})();
