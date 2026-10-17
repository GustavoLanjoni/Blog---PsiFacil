
/* =========================================================
   PSIFÁCIL - PÁGINA DE CONTEÚDOS

   Filtros principais + Mais categorias
   Pesquisa, curtidas, salvos e cards
========================================================= */

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const apiPosts = "/posts";
const apiInteracoes = "/interacoes";

const tokenUsuario = localStorage.getItem("tokenUsuario");

const imagemPadrao =
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80";

/* =========================================================
   ELEMENTOS DA PÁGINA
========================================================= */

const todosPosts = document.getElementById("todosPosts");
const pesquisaConteudos = document.getElementById("pesquisaConteudos");
const limparPesquisa = document.getElementById("limparPesquisa");
const categoriasConteudos = document.getElementById("categoriasConteudos");
const quantidadeConteudos = document.getElementById("quantidadeConteudos");
const textoQuantidadeConteudos = document.getElementById("textoQuantidadeConteudos");
const tituloResultados = document.getElementById("tituloResultados");
const conteudosLoading = document.getElementById("conteudosLoading");
const conteudosVazio = document.getElementById("conteudosVazio");
const limparFiltros = document.getElementById("limparFiltros");
const anoAtual = document.getElementById("anoAtual");

/* =========================================================
   ESTADO
========================================================= */

let posts = [];
let categoriaSelecionada = "Todos";
let termoPesquisa = "";
let temporizadorPesquisa = null;
let painelCategoriasAberto = false;

/* =========================================================
   TEMAS PRINCIPAIS

   As categorias específicas permanecem no banco.
   Estes temas servem para agrupar a navegação.
========================================================= */

const temasPaginaInicial = [
    "Ansiedade",
    "Autoestima",
    "Relacionamentos",
    "Autoconhecimento",
    "Saúde Mental"
];

/* =========================================================
   FUNÇÕES UTILITÁRIAS
========================================================= */

function escaparHtml(texto = "") {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function limparTexto(texto = "") {
    const div = document.createElement("div");

    div.innerHTML = String(texto || "");

    return (
        div.textContent ||
        div.innerText ||
        ""
    )
        .replace(/\s+/g, " ")
        .trim();
}

function limitarTexto(texto, limite = 150) {
    const textoLimpo = limparTexto(texto);

    if (!textoLimpo) {
        return "Clique para ler este conteúdo completo.";
    }

    if (textoLimpo.length <= limite) {
        return textoLimpo;
    }

    return textoLimpo.substring(0, limite).trim() + "...";
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/* =========================================================
   DATAS E TEMPO DE LEITURA
========================================================= */

function formatarData(data) {
    if (!data) return "";

    const objetoData = new Date(data);

    if (Number.isNaN(objetoData.getTime())) {
        return "";
    }

    return objetoData.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/Sao_Paulo"
    }).replace(".", "");
}

function calcularTempoLeitura(texto) {
    const palavras = limparTexto(texto)
        .split(/\s+/)
        .filter(Boolean)
        .length;

    return Math.ceil(palavras / 200) || 1;
}

/* =========================================================
   URL DO ARTIGO
========================================================= */

function obterUrlArtigo(post) {
    if (post.slug) {
        return `/artigos/${encodeURIComponent(post.slug)}`;
    }

    return `/post.html?id=${encodeURIComponent(post.id)}`;
}

/* =========================================================
   CURTIDA LOCAL
========================================================= */

function artigoFoiCurtido(id) {
    if (!id) return false;

    return Boolean(
        localStorage.getItem(`curtiu_post_${id}`)
    );
}

/* =========================================================
   CRIAR CARD DO ARTIGO
========================================================= */

function criarCardPost(post) {
    const id = post.id;

    const titulo = escaparHtml(
        limparTexto(post.titulo || "Conteúdo PsiFácil")
    );

    const categoria = escaparHtml(
        limparTexto(post.categoria || "Conteúdo")
    );

    const resumo = escaparHtml(
        limitarTexto(
            post.resumo || post.conteudo || "",
            155
        )
    );

    const imagem = escaparHtml(
        post.imagem || imagemPadrao
    );

    const url = escaparHtml(obterUrlArtigo(post));

    const data = formatarData(
        post.publicado_em ||
        post.criado_em ||
        post.created_at
    );

    const tempoLeitura = calcularTempoLeitura(
        post.conteudo || post.resumo || ""
    );

    const curtido = artigoFoiCurtido(id);

    return `
        <article
            class="post-card"
            data-post-id="${escaparHtml(id)}"
        >

            <a
                href="${url}"
                class="post-card-image"
                aria-label="Ler ${titulo}"
            >
                <img
                    src="${imagem}"
                    alt="${titulo}"
                    loading="lazy"
                    decoding="async"
                >
            </a>

            <div class="post-content">

                <div class="post-top-meta">

                    <span class="category">
                        ${categoria}
                    </span>

                    ${data ? `
                        <span class="post-date">
                            ${escaparHtml(data)}
                        </span>
                    ` : ""}

                </div>

                <h3>
                    <a href="${url}">
                        ${titulo}
                    </a>
                </h3>

                <p class="post-resumo">
                    ${resumo}
                </p>

                <div class="post-reading">
                    <i data-lucide="clock-3"></i>

                    <span>
                        ${tempoLeitura} min de leitura
                    </span>
                </div>

                <div class="post-card-footer">

                    <a href="${url}" class="read-more">
                        Ler artigo
                        <span aria-hidden="true">→</span>
                    </a>

                    <div class="post-card-actions">

                        <button
                            type="button"
                            class="post-like ${curtido ? "curtido" : ""}"
                            data-post-id="${escaparHtml(id)}"
                            aria-label="Curtir artigo"
                            title="Curtir artigo"
                        >
                            <i data-lucide="heart"></i>

                            <span
                                class="post-like-count"
                                data-curtidas-id="${escaparHtml(id)}"
                            >0</span>
                        </button>

                        <button
                            type="button"
                            class="post-save"
                            data-post-id="${escaparHtml(id)}"
                            aria-label="Salvar artigo"
                            title="Salvar artigo"
                        >
                            <i data-lucide="bookmark"></i>
                        </button>

                    </div>
                </div>
            </div>
        </article>
    `;
}

/* =========================================================
   TODAS AS CATEGORIAS ORIGINAIS

   São obtidas automaticamente dos artigos da API.
   Nenhuma categoria é excluída do Supabase.
========================================================= */

function obterCategorias() {
    const categorias = posts
        .map(post => limparTexto(post.categoria || "Conteúdo"))
        .filter(Boolean);

    const categoriasUnicas = new Map();

    categorias.forEach(categoria => {
        const chave = normalizarTexto(categoria);

        if (!categoriasUnicas.has(chave)) {
            categoriasUnicas.set(chave, categoria);
        }
    });

    return [...categoriasUnicas.values()]
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/* =========================================================
   CLASSIFICAR TEMA PRINCIPAL

   Utilizado para os filtros gerais.

   Os filtros específicos utilizam a categoria
   original, sem alterar os dados dos artigos.
========================================================= */

function obterTemaPrincipal(post) {
    const categoria = normalizarTexto(
        limparTexto(post.categoria || "")
    );

    const titulo = normalizarTexto(
        limparTexto(post.titulo || "")
    );

    if (
        categoria.includes("ansiedade") ||
        categoria.includes("estresse")
    ) {
        return "Ansiedade";
    }

    if (
        categoria.includes("autoestima") ||
        categoria.includes("autocuidado")
    ) {
        return "Autoestima";
    }

    if (categoria.includes("relacionamento")) {
        return "Relacionamentos";
    }

    if (categoria.includes("autoconhecimento")) {
        return "Autoconhecimento";
    }

    if (
        titulo.includes("ansiedade") ||
        titulo.includes("panico") ||
        titulo.includes("estresse")
    ) {
        return "Ansiedade";
    }

    if (
        titulo.includes("autoestima") ||
        titulo.includes("autocuidado") ||
        titulo.includes("autoconfianca")
    ) {
        return "Autoestima";
    }

    if (
        titulo.includes("relacionamento") ||
        titulo.includes("dependencia emocional") ||
        titulo.includes("solidao")
    ) {
        return "Relacionamentos";
    }

    if (
        titulo.includes("autoconhecimento") ||
        titulo.includes("perfeccionismo") ||
        titulo.includes("procrastinacao")
    ) {
        return "Autoconhecimento";
    }

    if (
        categoria.includes("comportamento") ||
        categoria.includes("emocoes")
    ) {
        return "Autoconhecimento";
    }

    return "Saúde Mental";
}

/* =========================================================
   LER CATEGORIA DA URL

   Exemplos:

   conteudo.html?categoria=ansiedade
   conteudo.html?categoria=autoestima
   conteudo.html?categoria=relacionamentos

   Categorias específicas também são aceitas.
========================================================= */

function obterCategoriaDaUrl() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const valor = parametros.get("categoria");

    if (!valor) return "Todos";

    const categoriaUrl = normalizarTexto(valor)
        .replace(/-/g, " ");

    const tema = temasPaginaInicial.find(
        item => normalizarTexto(item) === categoriaUrl
    );

    if (tema) {
        return `tema:${tema}`;
    }

    const categoriaExata = obterCategorias().find(
        categoria =>
            normalizarTexto(categoria) === categoriaUrl
    );

    return categoriaExata || "Todos";
}

/* =========================================================
   ATUALIZAR URL DO FILTRO
========================================================= */

function atualizarUrlCategoria() {
    const url = new URL(window.location.href);

    if (categoriaSelecionada === "Todos") {
        url.searchParams.delete("categoria");
    } else {
        const valor = categoriaSelecionada.startsWith("tema:")
            ? categoriaSelecionada.slice(5)
            : categoriaSelecionada;

        url.searchParams.set(
            "categoria",
            normalizarTexto(valor).replace(/\s+/g, "-")
        );
    }

    window.history.replaceState({}, "", url);
}

/* =========================================================
   SELECIONAR CATEGORIA

   Funciona para temas principais e específicos.
========================================================= */

function selecionarCategoria(categoria) {
    categoriaSelecionada = categoria;

    painelCategoriasAberto = false;

    atualizarUrlCategoria();
    renderizarCategorias();
    aplicarFiltros();
}

/* =========================================================
   CRIAR BOTÃO DE CATEGORIA
========================================================= */

function criarBotaoCategoria(nome, valor) {
    const ativo = categoriaSelecionada === valor;

    return `
        <button
            type="button"
            class="psifacil-categoria-btn ${ativo ? "ativo" : ""}"
            data-categoria="${escaparHtml(valor)}"
            aria-pressed="${ativo}"
        >
            ${escaparHtml(nome)}
        </button>
    `;
}

/* =========================================================
   RENDERIZAR FILTROS

   DESKTOP:
   Temas principais e botão Mais categorias.

   CELULAR:
   Faixa horizontal deslizante.

   CATEGORIAS EXTRAS:
   Painel expansível com categorias originais.
========================================================= */

function renderizarCategorias() {
    if (!categoriasConteudos) return;

    const categorias = obterCategorias();

    /*
       As categorias com nome exatamente igual
       aos temas principais não precisam aparecer
       duas vezes.

       Categorias compostas continuam disponíveis.
    */

    const categoriasExtras = categorias.filter(categoria => {
        return !temasPaginaInicial.some(
            tema =>
                normalizarTexto(tema) ===
                normalizarTexto(categoria)
        );
    });

    const categoriaExtraSelecionada =
        categoriaSelecionada !== "Todos" &&
        !categoriaSelecionada.startsWith("tema:");

    const botoesPrincipais = [
        criarBotaoCategoria("Todos", "Todos"),

        ...temasPaginaInicial.map(tema =>
            criarBotaoCategoria(tema, `tema:${tema}`)
        )
    ].join("");

    const botoesExtras = categoriasExtras
        .map(categoria =>
            criarBotaoCategoria(categoria, categoria)
        )
        .join("");

    categoriasConteudos.innerHTML = `

        <div class="psifacil-filtros">

            <!-- CATEGORIAS PRINCIPAIS -->

            <div class="psifacil-filtros-linha">

                ${botoesPrincipais}

                <button
                    type="button"
                    class="psifacil-mais-categorias"
                    id="botaoMaisCategorias"
                    aria-expanded="${painelCategoriasAberto}"
                    aria-controls="painelCategoriasExtras"
                >
                    <span>Mais categorias</span>

                    <span aria-hidden="true">
                        ${painelCategoriasAberto ? "−" : "+"}
                    </span>
                </button>

            </div>

            <!-- CATEGORIAS ESPECÍFICAS -->

            <div
                class="psifacil-categorias-extras"
                id="painelCategoriasExtras"
                ${painelCategoriasAberto ? "" : "hidden"}
            >

                <div class="psifacil-extras-cabecalho">

                    <strong>
                        Explore outros assuntos
                    </strong>

                    <button
                        type="button"
                        class="psifacil-fechar-extras"
                        id="fecharCategoriasExtras"
                        aria-label="Fechar categorias"
                        title="Fechar categorias"
                    >
                        &times;
                    </button>

                </div>

                <div class="psifacil-extras-lista">

                    ${botoesExtras || `
                        <p>
                            Nenhuma categoria adicional disponível.
                        </p>
                    `}

                </div>

            </div>

        </div>
    `;

    /*
       MOSTRAR CATEGORIA ESPECÍFICA SELECIONADA

       Isso evita que o usuário perca a referência
       do filtro após fechar o painel.
    */

    const painel = document.getElementById(
        "painelCategoriasExtras"
    );

    const botaoMais = document.getElementById(
        "botaoMaisCategorias"
    );

    /*
       BOTÕES DE CATEGORIA
    */

    categoriasConteudos
        .querySelectorAll(".psifacil-categoria-btn")
        .forEach(botao => {
            botao.addEventListener("click", () => {
                selecionarCategoria(
                    botao.dataset.categoria
                );
            });
        });

    /*
       ABRIR / FECHAR MAIS CATEGORIAS
    */

    if (botaoMais) {
        botaoMais.addEventListener("click", () => {
            painelCategoriasAberto = !painelCategoriasAberto;

            if (painel) {
                painel.hidden = !painelCategoriasAberto;
            }

            botaoMais.setAttribute(
                "aria-expanded",
                String(painelCategoriasAberto)
            );

            const indicador = botaoMais.querySelector(
                "span:last-child"
            );

            if (indicador) {
                indicador.textContent =
                    painelCategoriasAberto ? "−" : "+";
            }
        });
    }

    /*
       FECHAR PAINEL
    */

    const fecharExtras = document.getElementById(
        "fecharCategoriasExtras"
    );

    if (fecharExtras) {
        fecharExtras.addEventListener("click", () => {
            painelCategoriasAberto = false;

            if (painel) {
                painel.hidden = true;
            }

            if (botaoMais) {
                botaoMais.setAttribute(
                    "aria-expanded",
                    "false"
                );

                const indicador = botaoMais.querySelector(
                    "span:last-child"
                );

                if (indicador) {
                    indicador.textContent = "+";
                }

                botaoMais.focus();
            }
        });
    }

    /*
       Se houver uma categoria específica selecionada,
       o título dos resultados mostrará seu nome.
    */

    if (categoriaExtraSelecionada) {
        atualizarTituloResultados();
    }
}

/* =========================================================
   PESQUISA E FILTRAGEM
========================================================= */

function filtrarPosts() {
    const palavras = normalizarTexto(termoPesquisa)
        .split(/\s+/)
        .filter(Boolean);

    const categoriaAtiva = normalizarTexto(
        categoriaSelecionada
    );

    return posts
        .map((post, indice) => {
            const categoria = normalizarTexto(
                limparTexto(post.categoria || "Conteúdo")
            );

            let correspondeCategoria = true;

            /*
               FILTRO GERAL
            */

            if (categoriaSelecionada !== "Todos") {
                if (
                    categoriaSelecionada.startsWith("tema:")
                ) {
                    const tema = categoriaSelecionada.slice(5);

                    correspondeCategoria =
                        obterTemaPrincipal(post) === tema;
                } else {
                    /*
                       FILTRO ESPECÍFICO
                    */

                    correspondeCategoria =
                        categoria === categoriaAtiva;
                }
            }

            if (!correspondeCategoria) {
                return null;
            }

            /*
               CAMPOS PESQUISÁVEIS
            */

            const titulo = normalizarTexto(
                limparTexto(post.titulo || "")
            );

            const resumo = normalizarTexto(
                limparTexto(post.resumo || "")
            );

            const conteudo = normalizarTexto(
                limparTexto(post.conteudo || "")
            );

            const temaPrincipal = normalizarTexto(
                obterTemaPrincipal(post)
            );

            const textoCompleto = [
                titulo,
                resumo,
                categoria,
                temaPrincipal,
                conteudo
            ].join(" ");

            /*
               TODAS AS PALAVRAS PRECISAM EXISTIR
            */

            const correspondePesquisa = palavras.every(
                palavra => textoCompleto.includes(palavra)
            );

            if (!correspondePesquisa) {
                return null;
            }

            /*
               RELEVÂNCIA
            */

            const pontuacao = palavras.reduce(
                (total, palavra) => {
                    if (titulo.includes(palavra)) {
                        total += 8;
                    }

                    if (categoria.includes(palavra)) {
                        total += 4;
                    }

                    if (resumo.includes(palavra)) {
                        total += 2;
                    }

                    if (conteudo.includes(palavra)) {
                        total += 1;
                    }

                    return total;
                },
                0
            );

            return {
                post,
                indice,
                pontuacao
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            if (palavras.length === 0) {
                return a.indice - b.indice;
            }

            return (
                b.pontuacao - a.pontuacao ||
                a.indice - b.indice
            );
        })
        .map(resultado => resultado.post);
}

/* =========================================================
   CONTADOR
========================================================= */

function atualizarContador(quantidade) {
    if (quantidadeConteudos) {
        quantidadeConteudos.textContent = quantidade;
    }

    if (textoQuantidadeConteudos) {
        textoQuantidadeConteudos.textContent =
            quantidade === 1
                ? "artigo encontrado"
                : "artigos encontrados";
    }
}

/* =========================================================
   TÍTULO DOS RESULTADOS
========================================================= */

function atualizarTituloResultados() {
    if (!tituloResultados) return;

    if (categoriaSelecionada === "Todos") {
        tituloResultados.textContent = "Todos os artigos";
        return;
    }

    if (categoriaSelecionada.startsWith("tema:")) {
        tituloResultados.textContent =
            categoriaSelecionada.slice(5);

        return;
    }

    tituloResultados.textContent = categoriaSelecionada;
}

/* =========================================================
   RENDERIZAR ARTIGOS
========================================================= */

function renderizarPosts(listaPosts) {
    if (!todosPosts) return;

    todosPosts.innerHTML = "";

    if (listaPosts.length === 0) {
        if (conteudosVazio) {
            conteudosVazio.hidden = false;
        }

        atualizarContador(0);
        return;
    }

    if (conteudosVazio) {
        conteudosVazio.hidden = true;
    }

    todosPosts.innerHTML = listaPosts
        .map(criarCardPost)
        .join("");

    atualizarContador(listaPosts.length);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    carregarInteracoesCards(listaPosts);
}

/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {
    const postsFiltrados = filtrarPosts();

    atualizarTituloResultados();
    renderizarPosts(postsFiltrados);
}

/* =========================================================
   CARREGAR CURTIDAS
========================================================= */

async function carregarCurtidasCard(id) {
    const contador = document.querySelector(
        `[data-curtidas-id="${id}"]`
    );

    if (!contador) return;

    try {
        const resposta = await fetch(
            `${apiInteracoes}/curtidas/${id}`
        );

        if (!resposta.ok) return;

        const dados = await resposta.json();

        contador.textContent = dados.total ?? 0;

    } catch (error) {
        console.error(
            `Erro ao carregar curtidas do artigo ${id}:`,
            error
        );
    }
}

/* =========================================================
   CURTIR ARTIGO
========================================================= */

async function curtirArtigo(botao) {
    const id = botao.dataset.postId;

    if (!id) return;

    const chave = `curtiu_post_${id}`;

    if (localStorage.getItem(chave)) {
        return;
    }

    botao.disabled = true;

    try {
        const resposta = await fetch(
            `${apiInteracoes}/curtidas`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    post_id: id
                })
            }
        );

        if (!resposta.ok) {
            console.error(
                "Não foi possível registrar a curtida."
            );

            return;
        }

        localStorage.setItem(chave, "true");

        botao.classList.add("curtido");

        await carregarCurtidasCard(id);

    } catch (error) {
        console.error(
            "Erro ao curtir artigo:",
            error
        );

    } finally {
        botao.disabled = false;
    }
}

/* =========================================================
   VISUAL DO BOTÃO SALVAR
========================================================= */

function atualizarBotaoSalvarCard(botao, salvo) {
    if (!botao) return;

    botao.classList.toggle("salvo", salvo);

    botao.innerHTML = salvo
        ? '<i data-lucide="bookmark-check"></i>'
        : '<i data-lucide="bookmark"></i>';

    botao.setAttribute(
        "aria-label",
        salvo
            ? "Remover artigo dos salvos"
            : "Salvar artigo"
    );

    botao.setAttribute(
        "title",
        salvo
            ? "Artigo salvo"
            : "Salvar artigo"
    );

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/* =========================================================
   VERIFICAR ARTIGO SALVO
========================================================= */

async function verificarSalvoCard(id) {
    if (!tokenUsuario || !id) return;

    const botao = document.querySelector(
        `.post-save[data-post-id="${id}"]`
    );

    if (!botao) return;

    try {
        const resposta = await fetch(
            `/salvos/${id}/status`,
            {
                headers: {
                    Authorization: `Bearer ${tokenUsuario}`
                }
            }
        );

        if (!resposta.ok) return;

        const dados = await resposta.json();

        atualizarBotaoSalvarCard(
            botao,
            Boolean(dados.salvo)
        );

    } catch (error) {
        console.error(
            `Erro ao verificar artigo salvo ${id}:`,
            error
        );
    }
}

/* =========================================================
   SALVAR / REMOVER ARTIGO
========================================================= */

async function alternarSalvarArtigo(botao) {
    const id = botao.dataset.postId;

    if (!id) return;

    if (!tokenUsuario) {
        window.location.href = "/login-usuario.html";
        return;
    }

    const salvo = botao.classList.contains("salvo");

    const metodo = salvo ? "DELETE" : "POST";

    botao.disabled = true;

    try {
        const resposta = await fetch(
            `/salvos/${id}`,
            {
                method: metodo,
                headers: {
                    Authorization: `Bearer ${tokenUsuario}`
                }
            }
        );

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {
            localStorage.removeItem("tokenUsuario");

            window.location.href = "/login-usuario.html";
            return;
        }

        if (!resposta.ok) {
            console.error(
                "Não foi possível alterar o artigo salvo."
            );

            return;
        }

        atualizarBotaoSalvarCard(botao, !salvo);

    } catch (error) {
        console.error(
            "Erro ao salvar artigo:",
            error
        );

    } finally {
        botao.disabled = false;
    }
}

/* =========================================================
   EVENTOS DOS CARDS
========================================================= */

if (todosPosts) {
    todosPosts.addEventListener("click", async event => {
        const botaoCurtir = event.target.closest(
            ".post-like"
        );

        if (botaoCurtir) {
            event.preventDefault();
            event.stopPropagation();

            await curtirArtigo(botaoCurtir);
            return;
        }

        const botaoSalvar = event.target.closest(
            ".post-save"
        );

        if (botaoSalvar) {
            event.preventDefault();
            event.stopPropagation();

            await alternarSalvarArtigo(botaoSalvar);
        }
    });
}

/* =========================================================
   INTERAÇÕES DOS CARDS
========================================================= */

function carregarInteracoesCards(listaPosts) {
    listaPosts.forEach(post => {
        if (!post.id) return;

        carregarCurtidasCard(post.id);

        if (tokenUsuario) {
            verificarSalvoCard(post.id);
        }
    });
}

/* =========================================================
   PESQUISA EM TEMPO REAL
========================================================= */

if (pesquisaConteudos) {
    pesquisaConteudos.addEventListener("input", event => {
        termoPesquisa = event.target.value;

        if (limparPesquisa) {
            limparPesquisa.hidden = !termoPesquisa.trim();
        }

        clearTimeout(temporizadorPesquisa);

        temporizadorPesquisa = setTimeout(() => {
            aplicarFiltros();
        }, 180);
    });
}

/* =========================================================
   LIMPAR PESQUISA
========================================================= */

if (limparPesquisa) {
    limparPesquisa.addEventListener("click", () => {
        clearTimeout(temporizadorPesquisa);

        termoPesquisa = "";

        if (pesquisaConteudos) {
            pesquisaConteudos.value = "";
            pesquisaConteudos.focus();
        }

        limparPesquisa.hidden = true;

        aplicarFiltros();
    });
}

/* =========================================================
   LIMPAR TODOS OS FILTROS
========================================================= */

if (limparFiltros) {
    limparFiltros.addEventListener("click", () => {
        clearTimeout(temporizadorPesquisa);

        termoPesquisa = "";
        categoriaSelecionada = "Todos";
        painelCategoriasAberto = false;

        if (pesquisaConteudos) {
            pesquisaConteudos.value = "";
            pesquisaConteudos.focus();
        }

        if (limparPesquisa) {
            limparPesquisa.hidden = true;
        }

        atualizarUrlCategoria();
        renderizarCategorias();
        aplicarFiltros();
    });
}

/* =========================================================
   CARREGAR ARTIGOS DA API
========================================================= */

async function carregarTodosPosts() {
    try {
        if (conteudosLoading) {
            conteudosLoading.hidden = false;
        }

        const resposta = await fetch(apiPosts);

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        posts = Array.isArray(dados) ? dados : [];

        categoriaSelecionada = obterCategoriaDaUrl();

        painelCategoriasAberto = false;

        if (conteudosLoading) {
            conteudosLoading.hidden = true;
        }

        renderizarCategorias();
        aplicarFiltros();

        if (window.lucide) {
            window.lucide.createIcons();
        }

    } catch (error) {
        console.error(
            "Erro ao carregar conteúdos:",
            error
        );

        if (conteudosLoading) {
            conteudosLoading.hidden = true;
        }

        if (todosPosts) {
            todosPosts.innerHTML = `
                <div class="conteudos-erro">
                    <h3>
                        Não foi possível carregar os conteúdos.
                    </h3>

                    <p>
                        Tente novamente em alguns instantes.
                    </p>

                    <button
                        type="button"
                        id="tentarNovamenteConteudos"
                    >
                        Tentar novamente
                    </button>
                </div>
            `;

            const tentarNovamente = document.getElementById(
                "tentarNovamenteConteudos"
            );

            if (tentarNovamente) {
                tentarNovamente.addEventListener(
                    "click",
                    carregarTodosPosts
                );
            }
        }
    }
}

/* =========================================================
   ANO DO RODAPÉ
========================================================= */

if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
}

/* =========================================================
   INICIAR PÁGINA
========================================================= */

function iniciarPaginaConteudos() {
    carregarTodosPosts();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarPaginaConteudos
    );
} else {
    iniciarPaginaConteudos();
}
