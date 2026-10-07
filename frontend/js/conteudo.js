/* =========================================================
   PSIFÁCIL
   PÁGINA DE CONTEÚDOS
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const apiPosts = "/posts";
const apiInteracoes = "/interacoes";

const tokenUsuario =
    localStorage.getItem("tokenUsuario");

const imagemPadrao =
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80";


/* =========================================================
   ELEMENTOS
========================================================= */

const todosPosts =
    document.getElementById("todosPosts");

const pesquisaConteudos =
    document.getElementById("pesquisaConteudos");

const limparPesquisa =
    document.getElementById("limparPesquisa");

const categoriasConteudos =
    document.getElementById("categoriasConteudos");

const quantidadeConteudos =
    document.getElementById("quantidadeConteudos");

const textoQuantidadeConteudos =
    document.getElementById("textoQuantidadeConteudos");

const tituloResultados =
    document.getElementById("tituloResultados");

const conteudosLoading =
    document.getElementById("conteudosLoading");

const conteudosVazio =
    document.getElementById("conteudosVazio");

const limparFiltros =
    document.getElementById("limparFiltros");

const anoAtual =
    document.getElementById("anoAtual");


/* =========================================================
   ESTADO
========================================================= */

let posts = [];

let categoriaSelecionada = "Todos";

let termoPesquisa = "";


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHtml(texto = "") {

    return String(texto)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   LIMPAR HTML DO TEXTO

   Exemplo:

   <p><strong>Ansiedade</strong></p>

   vira:

   Ansiedade
========================================================= */

function limparTexto(texto = "") {

    const div =
        document.createElement("div");

    div.innerHTML =
        String(texto || "");

    return (

        div.textContent ||

        div.innerText ||

        ""

    )
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   LIMITAR TEXTO
========================================================= */

function limitarTexto(
    texto,
    limite = 150
) {

    const textoLimpo =
        limparTexto(texto);

    if (!textoLimpo) {

        return "Clique para ler este conteúdo completo.";

    }

    if (
        textoLimpo.length <= limite
    ) {

        return textoLimpo;

    }

    return (
        textoLimpo
            .substring(
                0,
                limite
            )
            .trim() +
        "..."
    );

}


/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

function normalizarTexto(valor) {

    return String(valor || "")

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .trim();

}


/* =========================================================
   FORMATAR DATA
========================================================= */

function formatarData(data) {

    if (!data) {

        return "";

    }

    const objetoData =
        new Date(data);

    if (
        Number.isNaN(
            objetoData.getTime()
        )
    ) {

        return "";

    }

    return objetoData
        .toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",

                month: "short",

                year: "numeric"
            }
        )
        .replace(".", "");

}


/* =========================================================
   TEMPO DE LEITURA

   Mesmo cálculo usado na página do artigo:
   aproximadamente 200 palavras por minuto.
========================================================= */

function calcularTempoLeitura(texto) {

    const textoLimpo =
        limparTexto(texto);

    const palavras =
        textoLimpo
            .split(/\s+/)
            .filter(Boolean)
            .length;

    return (
        Math.ceil(
            palavras / 200
        ) || 1
    );

}


/* =========================================================
   URL DO ARTIGO
========================================================= */

function obterUrlArtigo(post) {

    if (post.slug) {

        return (
            `/artigos/${encodeURIComponent(
                post.slug
            )}`
        );

    }

    return (
        `/post.html?id=${encodeURIComponent(
            post.id
        )}`
    );

}


/* =========================================================
   VERIFICAR CURTIDA LOCAL
========================================================= */

function artigoFoiCurtido(id) {

    if (!id) {

        return false;

    }

    return Boolean(

        localStorage.getItem(
            `curtiu_post_${id}`
        )

    );

}


/* =========================================================
   CRIAR CARD
========================================================= */

function criarCardPost(post) {

    const id =
        post.id;

    const titulo =
        escaparHtml(
            limparTexto(
                post.titulo ||
                "Conteúdo PsiFácil"
            )
        );

    const categoria =
        escaparHtml(
            limparTexto(
                post.categoria ||
                "Conteúdo"
            )
        );

    /*
    ---------------------------------------------------------
    CORREÇÃO DO PROBLEMA DAS TAGS HTML
    ---------------------------------------------------------
    */

    const resumo =
        escaparHtml(
            limitarTexto(
                post.resumo ||
                post.conteudo ||
                "",
                155
            )
        );

    const imagem =
        escaparHtml(
            post.imagem ||
            imagemPadrao
        );

    const url =
        obterUrlArtigo(post);

    const data =
        formatarData(
            post.criado_em ||
            post.created_at
        );

    const tempoLeitura =
        calcularTempoLeitura(
            post.conteudo ||
            post.resumo ||
            ""
        );

    const curtido =
        artigoFoiCurtido(id);


    return `

        <article
            class="post-card"
            data-post-id="${escaparHtml(id)}"
        >


            <!-- =============================================
                 IMAGEM
            ============================================== -->

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


            <!-- =============================================
                 CONTEÚDO
            ============================================== -->

            <div class="post-content">


                <!-- =========================================
                     CATEGORIA + DATA
                ========================================== -->

                <div class="post-top-meta">

                    <span class="category">
                        ${categoria}
                    </span>

                    ${
                        data
                            ? `
                                <span class="post-date">
                                    ${escaparHtml(data)}
                                </span>
                            `
                            : ""
                    }

                </div>


                <!-- =========================================
                     TÍTULO
                ========================================== -->

                <h3>

                    <a href="${url}">

                        ${titulo}

                    </a>

                </h3>


                <!-- =========================================
                     RESUMO
                ========================================== -->

                <p class="post-resumo">

                    ${resumo}

                </p>


                <!-- =========================================
                     TEMPO DE LEITURA
                ========================================== -->

                <div class="post-reading">

                    <i data-lucide="clock-3"></i>

                    <span>

                        ${tempoLeitura}
                        min de leitura

                    </span>

                </div>


                <!-- =========================================
                     RODAPÉ DO CARD
                ========================================== -->

                <div class="post-card-footer">


                    <!-- LER ARTIGO -->

                    <a
                        href="${url}"
                        class="read-more"
                    >

                        Ler artigo

                        <span aria-hidden="true">
                            →
                        </span>

                    </a>


                    <!-- AÇÕES -->

                    <div class="post-card-actions">


                        <!-- CURTIR -->

                        <button
                            type="button"
                            class="post-like ${
                                curtido
                                    ? "curtido"
                                    : ""
                            }"
                            data-post-id="${escaparHtml(id)}"
                            aria-label="Curtir artigo"
                            title="Curtir artigo"
                        >

                            <i data-lucide="heart"></i>

                            <span
                                class="post-like-count"
                                data-curtidas-id="${escaparHtml(id)}"
                            >
                                0
                            </span>

                        </button>


                        <!-- SALVAR -->

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
   CATEGORIAS
========================================================= */

function obterCategorias() {

    const categorias =
        posts

            .map(
                (post) =>
                    limparTexto(
                        post.categoria ||
                        "Conteúdo"
                    )
            )

            .filter(Boolean);


    const categoriasUnicas =
        [
            ...new Set(
                categorias
            )
        ];


    categoriasUnicas.sort(

        (a, b) =>
            a.localeCompare(
                b,
                "pt-BR"
            )

    );


    return categoriasUnicas;

}


/* =========================================================
   RENDERIZAR CATEGORIAS
========================================================= */

function renderizarCategorias() {

    if (!categoriasConteudos) {

        return;

    }


    const categorias = [

        "Todos",

        ...obterCategorias()

    ];


    categoriasConteudos.innerHTML =
        categorias

            .map(
                (categoria) => {

                    const ativo =
                        categoria ===
                        categoriaSelecionada;

                    return `

                        <button
                            type="button"
                            class="categoria-filtro ${
                                ativo
                                    ? "categoria-filtro-ativo"
                                    : ""
                            }"
                            data-categoria="${escaparHtml(categoria)}"
                        >

                            ${escaparHtml(categoria)}

                        </button>

                    `;

                }
            )

            .join("");


    categoriasConteudos
        .querySelectorAll(
            ".categoria-filtro"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        categoriaSelecionada =
                            botao.dataset.categoria;

                        renderizarCategorias();

                        aplicarFiltros();

                    }
                );

            }
        );

}


/* =========================================================
   FILTRAR POSTS
========================================================= */

function filtrarPosts() {

    const pesquisa =
        normalizarTexto(
            termoPesquisa
        );


    return posts.filter(
        (post) => {

            const categoria =
                limparTexto(
                    post.categoria ||
                    "Conteúdo"
                );


            const correspondeCategoria =

                categoriaSelecionada ===
                    "Todos"

                ||

                normalizarTexto(
                    categoria
                ) ===
                normalizarTexto(
                    categoriaSelecionada
                );


            /*
            -------------------------------------------------
            PESQUISA SOMENTE TEXTO LIMPO
            -------------------------------------------------
            */

            const textoPesquisa =
                normalizarTexto(

                    `${

                        limparTexto(
                            post.titulo ||
                            ""
                        )

                    } ${

                        limparTexto(
                            post.resumo ||
                            ""
                        )

                    } ${

                        categoria

                    }`

                );


            const correspondePesquisa =

                !pesquisa ||

                textoPesquisa.includes(
                    pesquisa
                );


            return (

                correspondeCategoria &&

                correspondePesquisa

            );

        }
    );

}


/* =========================================================
   CONTADOR
========================================================= */

function atualizarContador(
    quantidade
) {

    if (quantidadeConteudos) {

        quantidadeConteudos.textContent =
            quantidade;

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

    if (!tituloResultados) {

        return;

    }


    tituloResultados.textContent =

        categoriaSelecionada ===
            "Todos"

            ? "Todos os artigos"

            : categoriaSelecionada;

}


/* =========================================================
   RENDERIZAR POSTS
========================================================= */

function renderizarPosts(
    listaPosts
) {

    if (!todosPosts) {

        return;

    }


    todosPosts.innerHTML =
        "";


    if (
        listaPosts.length === 0
    ) {

        if (conteudosVazio) {

            conteudosVazio.hidden =
                false;

        }

        atualizarContador(0);

        return;

    }


    if (conteudosVazio) {

        conteudosVazio.hidden =
            true;

    }


    todosPosts.innerHTML =
        listaPosts

            .map(
                criarCardPost
            )

            .join("");


    atualizarContador(
        listaPosts.length
    );


    /*
    ---------------------------------------------------------
    RECRIAR ÍCONES LUCIDE
    ---------------------------------------------------------
    */

    if (window.lucide) {

        window.lucide.createIcons();

    }


    /*
    ---------------------------------------------------------
    CARREGAR ESTADO DAS INTERAÇÕES
    ---------------------------------------------------------
    */

    carregarInteracoesCards(
        listaPosts
    );

}


/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    const postsFiltrados =
        filtrarPosts();


    atualizarTituloResultados();


    renderizarPosts(
        postsFiltrados
    );

}


/* =========================================================
   CURTIDAS
========================================================= */

async function carregarCurtidasCard(
    id
) {

    const contador =
        document.querySelector(
            `[data-curtidas-id="${id}"]`
        );


    if (!contador) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `${apiInteracoes}/curtidas/${id}`
            );


        if (!resposta.ok) {

            return;

        }


        const dados =
            await resposta.json();


        contador.textContent =
            dados.total ?? 0;

    }

    catch (error) {

        console.error(
            `Erro ao carregar curtidas do artigo ${id}:`,
            error
        );

    }

}


/* =========================================================
   CURTIR ARTIGO
========================================================= */

async function curtirArtigo(
    botao
) {

    const id =
        botao.dataset.postId;


    if (!id) {

        return;

    }


    const chave =
        `curtiu_post_${id}`;


    /*
    ---------------------------------------------------------
    JÁ CURTIU
    ---------------------------------------------------------
    */

    if (
        localStorage.getItem(
            chave
        )
    ) {

        return;

    }


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                `${apiInteracoes}/curtidas`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            post_id:
                                id

                        })

                }
            );


        if (!resposta.ok) {

            console.error(
                "Não foi possível registrar a curtida."
            );

            return;

        }


        localStorage.setItem(
            chave,
            "true"
        );


        botao.classList.add(
            "curtido"
        );


        await carregarCurtidasCard(
            id
        );

    }

    catch (error) {

        console.error(
            "Erro ao curtir artigo:",
            error
        );

    }

    finally {

        botao.disabled =
            false;

    }

}


/* =========================================================
   ATUALIZAR VISUAL DO BOTÃO SALVAR
========================================================= */

function atualizarBotaoSalvarCard(
    botao,
    salvo
) {

    if (!botao) {

        return;

    }


    botao.classList.toggle(
        "salvo",
        salvo
    );


    botao.innerHTML =

        salvo

            ? `
                <i data-lucide="bookmark-check"></i>
            `

            : `
                <i data-lucide="bookmark"></i>
            `;


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
   VERIFICAR SE ARTIGO ESTÁ SALVO
========================================================= */

async function verificarSalvoCard(
    id
) {

    if (
        !tokenUsuario ||
        !id
    ) {

        return;

    }


    const botao =
        document.querySelector(
            `.post-save[data-post-id="${id}"]`
        );


    if (!botao) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `/salvos/${id}/status`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${tokenUsuario}`

                    }

                }
            );


        if (!resposta.ok) {

            return;

        }


        const dados =
            await resposta.json();


        atualizarBotaoSalvarCard(
            botao,
            Boolean(
                dados.salvo
            )
        );

    }

    catch (error) {

        console.error(
            `Erro ao verificar artigo salvo ${id}:`,
            error
        );

    }

}


/* =========================================================
   SALVAR / REMOVER ARTIGO
========================================================= */

async function alternarSalvarArtigo(
    botao
) {

    const id =
        botao.dataset.postId;


    if (!id) {

        return;

    }


    /*
    ---------------------------------------------------------
    NÃO ESTÁ LOGADO
    ---------------------------------------------------------
    */

    if (!tokenUsuario) {

        window.location.href =
            "/login-usuario.html";

        return;

    }


    const salvo =
        botao.classList.contains(
            "salvo"
        );


    const metodo =
        salvo
            ? "DELETE"
            : "POST";


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                `/salvos/${id}`,
                {

                    method:
                        metodo,

                    headers: {

                        Authorization:
                            `Bearer ${tokenUsuario}`

                    }

                }
            );


        /*
        -----------------------------------------------------
        SESSÃO INVÁLIDA
        -----------------------------------------------------
        */

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            localStorage.removeItem(
                "tokenUsuario"
            );


            window.location.href =
                "/login-usuario.html";


            return;

        }


        if (!resposta.ok) {

            console.error(
                "Não foi possível alterar o artigo salvo."
            );

            return;

        }


        atualizarBotaoSalvarCard(
            botao,
            !salvo
        );

    }

    catch (error) {

        console.error(
            "Erro ao salvar artigo:",
            error
        );

    }

    finally {

        botao.disabled =
            false;

    }

}


/* =========================================================
   EVENTOS DOS CARDS

   Usamos delegação de eventos porque os cards são
   reconstruídos quando o usuário pesquisa ou filtra.
========================================================= */

if (todosPosts) {

    todosPosts.addEventListener(
        "click",
        async (event) => {


            /*
            -------------------------------------------------
            CURTIR
            -------------------------------------------------
            */

            const botaoCurtir =
                event.target.closest(
                    ".post-like"
                );


            if (botaoCurtir) {

                event.preventDefault();

                event.stopPropagation();


                await curtirArtigo(
                    botaoCurtir
                );


                return;

            }


            /*
            -------------------------------------------------
            SALVAR
            -------------------------------------------------
            */

            const botaoSalvar =
                event.target.closest(
                    ".post-save"
                );


            if (botaoSalvar) {

                event.preventDefault();

                event.stopPropagation();


                await alternarSalvarArtigo(
                    botaoSalvar
                );

            }

        }
    );

}


/* =========================================================
   CARREGAR INTERAÇÕES DOS CARDS
========================================================= */

function carregarInteracoesCards(
    listaPosts
) {

    listaPosts.forEach(
        (post) => {

            if (!post.id) {

                return;

            }


            /*
            -------------------------------------------------
            CURTIDAS
            -------------------------------------------------
            */

            carregarCurtidasCard(
                post.id
            );


            /*
            -------------------------------------------------
            SALVOS
            -------------------------------------------------
            */

            if (tokenUsuario) {

                verificarSalvoCard(
                    post.id
                );

            }

        }
    );

}


/* =========================================================
   PESQUISA
========================================================= */

if (pesquisaConteudos) {

    pesquisaConteudos.addEventListener(
        "input",
        (event) => {

            termoPesquisa =
                event.target.value;


            if (limparPesquisa) {

                limparPesquisa.hidden =
                    !termoPesquisa.trim();

            }


            aplicarFiltros();

        }
    );

}


/* =========================================================
   LIMPAR PESQUISA
========================================================= */

if (limparPesquisa) {

    limparPesquisa.addEventListener(
        "click",
        () => {

            termoPesquisa =
                "";

            pesquisaConteudos.value =
                "";

            limparPesquisa.hidden =
                true;

            pesquisaConteudos.focus();


            aplicarFiltros();

        }
    );

}


/* =========================================================
   LIMPAR TODOS OS FILTROS
========================================================= */

if (limparFiltros) {

    limparFiltros.addEventListener(
        "click",
        () => {

            termoPesquisa =
                "";

            categoriaSelecionada =
                "Todos";


            if (pesquisaConteudos) {

                pesquisaConteudos.value =
                    "";

                pesquisaConteudos.focus();

            }


            if (limparPesquisa) {

                limparPesquisa.hidden =
                    true;

            }


            renderizarCategorias();

            aplicarFiltros();

        }
    );

}


/* =========================================================
   CARREGAR POSTS
========================================================= */

async function carregarTodosPosts() {

    try {


        /* -------------------------------------------------
           LOADING
        ------------------------------------------------- */

        if (conteudosLoading) {

            conteudosLoading.hidden =
                false;

        }


        /* -------------------------------------------------
           API
        ------------------------------------------------- */

        const resposta =
            await fetch(
                apiPosts
            );


        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );

        }


        const dados =
            await resposta.json();


        posts =
            Array.isArray(dados)

                ? dados

                : [];


        /* -------------------------------------------------
           ESCONDER LOADING
        ------------------------------------------------- */

        if (conteudosLoading) {

            conteudosLoading.hidden =
                true;

        }


        /* -------------------------------------------------
           CATEGORIAS
        ------------------------------------------------- */

        renderizarCategorias();


        /* -------------------------------------------------
           POSTS
        ------------------------------------------------- */

        aplicarFiltros();


        /* -------------------------------------------------
           ÍCONES
        ------------------------------------------------- */

        if (window.lucide) {

            window.lucide.createIcons();

        }

    }

    catch (error) {

        console.error(
            "Erro ao carregar conteúdos:",
            error
        );


        if (conteudosLoading) {

            conteudosLoading.hidden =
                true;

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


            const tentarNovamente =
                document.getElementById(
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

    anoAtual.textContent =
        new Date().getFullYear();

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarTodosPosts();


        if (window.lucide) {

            window.lucide.createIcons();

        }

    }
);