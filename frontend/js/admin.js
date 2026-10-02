const apiPosts = "/posts";

/* =========================================================
   ELEMENTOS - POSTS
========================================================= */

const formPost = document.getElementById("formPost");
const titulo = document.getElementById("titulo");
const categoria = document.getElementById("categoria");
const resumo = document.getElementById("resumo");
const conteudo = document.getElementById("conteudo");
const imagem = document.getElementById("imagem");
const imagemArquivo = document.getElementById("imagemArquivo");
const statusUploadImagem = document.getElementById("statusUploadImagem");
const fontes = document.getElementById("fontes");
const statusPost = document.getElementById("status");
const agendadoPara = document.getElementById("agendadoPara");
const grupoAgendamento = document.getElementById("grupoAgendamento");

const previewTitulo = document.getElementById("previewTitulo");
const previewCategoria = document.getElementById("previewCategoria");
const previewResumo = document.getElementById("previewResumo");
const previewImagem = document.getElementById("previewImagem");

const listaPostsAdmin = document.getElementById("listaPostsAdmin");
const listaPostsRecentes = document.getElementById("listaPostsRecentes");

const totalPosts = document.getElementById("totalPosts");
const totalLeads = document.getElementById("totalLeads");
const totalNotificacoesAtivas =
    document.getElementById("totalNotificacoesAtivas");


/* =========================================================
   ELEMENTOS - PAINEL
========================================================= */

const adminPages =
    document.querySelectorAll(".admin-page");

const adminNavButtons =
    document.querySelectorAll("[data-admin-page]");

const adminGoButtons =
    document.querySelectorAll("[data-admin-go]");

const adminSidebarOverlay =
    document.getElementById("adminSidebarOverlay");

const adminMenuButton =
    document.getElementById("adminMenuButton");

const adminSidebarClose =
    document.getElementById("adminSidebarClose");


/* =========================================================
   ELEMENTOS - NOVIDADES
========================================================= */

const formNovidade =
    document.getElementById("formNovidade");

const novidadeTitulo =
    document.getElementById("novidadeTitulo");

const novidadeMensagem =
    document.getElementById("novidadeMensagem");

const novidadeUrl =
    document.getElementById("novidadeUrl");

const btnEnviarNovidade =
    document.getElementById("btnEnviarNovidade");

const previewNovidadeTitulo =
    document.getElementById("previewNovidadeTitulo");

const previewNovidadeMensagem =
    document.getElementById("previewNovidadeMensagem");


/* =========================================================
   ELEMENTOS - FEEDBACK
========================================================= */

const toast =
    document.getElementById("toast");

const modalConfirmacao =
    document.getElementById("modalConfirmacao");

const modalTexto =
    document.getElementById("modalTexto");

const btnCancelarModal =
    document.getElementById("btnCancelarModal");

const btnConfirmarModal =
    document.getElementById("btnConfirmarModal");


let postEditandoId = null;

let acaoConfirmada = null;


/* =========================================================
   HELPERS
========================================================= */

function obterTokenAdmin() {

    return localStorage.getItem(
        "tokenAdmin"
    );

}


function renderizarIcones() {

    if (window.lucide) {

        lucide.createIcons();

    }

}


function escaparHtmlAdmin(valor) {

    const div =
        document.createElement("div");

    div.textContent =
        valor == null
            ? ""
            : String(valor);

    return div.innerHTML;

}


function limitarTextoAdmin(
    texto,
    limite = 130
) {

    const valor =
        String(texto || "")
            .trim();

    if (valor.length <= limite) {

        return valor;

    }

    return (
        valor
            .slice(0, limite)
            .trim() +
        "..."
    );

}


function pegarConteudoEditor(id) {

    const editor =
        window.tinymce
            ? tinymce.get(id)
            : null;

    const elemento =
        document.getElementById(id);

    return editor
        ? editor.getContent().trim()
        : elemento
            ? elemento.value.trim()
            : "";

}


function setarConteudoEditor(
    id,
    valor
) {

    const editor =
        window.tinymce
            ? tinymce.get(id)
            : null;

    const elemento =
        document.getElementById(id);

    if (editor) {

        editor.setContent(
            valor || ""
        );

        return;

    }

    if (elemento) {

        elemento.value =
            valor || "";

    }

}


function limparHtmlVazio(html) {

    if (!html) {

        return "";

    }

    return html
        .replace(
            /<p>\s*(<br\s*\/?>)?\s*<\/p>/gi,
            ""
        )
        .replace(
            /<p>\s*&nbsp;\s*<\/p>/gi,
            ""
        )
        .replace(
            /(<br\s*\/?>\s*){2,}/gi,
            "<br>"
        )
        .trim();

}


function pegarTextoLimpo(html) {

    const div =
        document.createElement("div");

    div.innerHTML =
        html || "";

    return (
        div.textContent ||
        div.innerText ||
        ""
    ).trim();

}


function formatarDataAdmin(data) {

    if (!data) {

        return "";

    }

    const dataObjeto =
        new Date(data);

    if (
        Number.isNaN(
            dataObjeto.getTime()
        )
    ) {

        return "";

    }

    return dataObjeto.toLocaleString(
        "pt-BR",
        {
            timeZone:
                "America/Sao_Paulo",

            dateStyle:
                "short",

            timeStyle:
                "short"
        }
    );

}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
    mensagem,
    tipo = "success"
) {

    if (!toast) {

        console.log(mensagem);

        return;

    }

    toast.textContent =
        mensagem;

    toast.className =
        `toast show ${tipo}`;

    setTimeout(() => {

        toast.className =
            "toast";

    }, 3000);

}


/* =========================================================
   MODAL
========================================================= */

function abrirModalConfirmacao(
    texto,
    callback
) {

    if (
        !modalConfirmacao ||
        !modalTexto
    ) {

        if (
            typeof callback ===
            "function"
        ) {

            callback();

        }

        return;

    }

    modalTexto.textContent =
        texto;

    modalConfirmacao.classList.add(
        "show"
    );

    acaoConfirmada =
        callback;

}


function fecharModalConfirmacao() {

    if (modalConfirmacao) {

        modalConfirmacao.classList.remove(
            "show"
        );

    }

    acaoConfirmada =
        null;

}


if (btnCancelarModal) {

    btnCancelarModal.addEventListener(
        "click",
        fecharModalConfirmacao
    );

}


if (btnConfirmarModal) {

    btnConfirmarModal.addEventListener(
        "click",
        async () => {

            const callback =
                acaoConfirmada;

            fecharModalConfirmacao();

            if (
                typeof callback ===
                "function"
            ) {

                await callback();

            }

        }
    );

}


/* =========================================================
   TINYMCE
========================================================= */

if (window.tinymce) {

    tinymce.init({

        selector:
            "#resumo",

        height:
            190,

        menubar:
            false,

        branding:
            false,

        plugins:
            "lists link wordcount",

        toolbar:
            "bold italic underline | bullist numlist | link | removeformat",

        placeholder:
            "Resumo que aparecerá no card do artigo",

        setup:
            (editor) => {

                editor.on(
                    "keyup change input setcontent",
                    atualizarPreview
                );

            },

        content_style: `
            body {
                font-family: Inter, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.6;
                color: #2f2a28;
            }

            p {
                margin: 0 0 10px;
            }
        `

    });


    tinymce.init({

        selector:
            "#conteudo",

        height:
            540,

        menubar:
            false,

        branding:
            false,

        plugins:
            "lists link table code wordcount",

        toolbar:
            "undo redo | blocks | bold italic underline strikethrough | " +
            "bullist numlist | blockquote link | alignleft aligncenter alignright | " +
            "table | code | removeformat",

        placeholder:
            "Escreva o artigo completo aqui",

        content_style: `
            body {
                font-family: Inter, Arial, sans-serif;
                font-size: 17px;
                line-height: 1.8;
                color: #2f2a28;
                padding: 18px;
            }

            h1,
            h2,
            h3 {
                color: #2f2a28;
                line-height: 1.25;
                margin: 24px 0 12px;
            }

            p {
                margin: 0 0 16px;
            }

            ul,
            ol {
                margin: 12px 0 18px 24px;
            }

            blockquote {
                border-left: 4px solid #7a5c58;
                padding: 12px 16px;
                background: #f8f4ef;
                border-radius: 10px;
            }
        `

    });

}


/* =========================================================
   AGENDAMENTO
========================================================= */

function controlarAgendamento() {

    if (
        !statusPost ||
        !grupoAgendamento ||
        !agendadoPara
    ) {

        return;

    }

    if (
        statusPost.value ===
        "agendado"
    ) {

        grupoAgendamento.style.display =
            "block";

    } else {

        grupoAgendamento.style.display =
            "none";

        agendadoPara.value =
            "";

    }

}


/* =========================================================
   PREVIEW DO ARTIGO
========================================================= */

function atualizarPreview() {

    if (
        !previewTitulo ||
        !previewCategoria ||
        !previewResumo ||
        !previewImagem
    ) {

        return;

    }

    const resumoHtml =
        pegarConteudoEditor(
            "resumo"
        );

    const resumoTexto =
        pegarTextoLimpo(
            resumoHtml
        );

    previewTitulo.textContent =
        titulo &&
        titulo.value.trim()
            ? titulo.value.trim()
            : "Título do artigo";

    previewCategoria.textContent =
        categoria &&
        categoria.value.trim()
            ? categoria.value.trim()
            : "Categoria";

    previewResumo.textContent =
        resumoTexto ||
        "O resumo do artigo aparecerá aqui para visualizar como ficará no blog.";

    if (
        imagem &&
        imagem.value.trim()
    ) {

        const urlImagem =
            escaparHtmlAdmin(
                imagem.value.trim()
            );

        previewImagem.innerHTML = `
            <img
                src="${urlImagem}"
                alt="Pré-visualização da imagem"
            >
        `;

    } else {

        previewImagem.innerHTML = `
            <i data-lucide="image"></i>
        `;

        renderizarIcones();

    }

}


/* =========================================================
   UPLOAD DE IMAGEM
========================================================= */

async function enviarImagem() {

    if (
        !imagemArquivo ||
        !imagemArquivo.files.length
    ) {

        return true;

    }

    const arquivo =
        imagemArquivo.files[0];

    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (
        !tiposPermitidos.includes(
            arquivo.type
        )
    ) {

        mostrarToast(
            "Formato de imagem não permitido. Use JPG, PNG, WEBP ou GIF.",
            "error"
        );

        imagemArquivo.value =
            "";

        return false;

    }

    const tamanhoMaximo =
        5 * 1024 * 1024;

    if (
        arquivo.size >
        tamanhoMaximo
    ) {

        mostrarToast(
            "A imagem deve ter no máximo 5 MB.",
            "error"
        );

        imagemArquivo.value =
            "";

        return false;

    }

    try {

        if (statusUploadImagem) {

            statusUploadImagem.textContent =
                "Enviando imagem...";

        }

        const formData =
            new FormData();

        formData.append(
            "imagem",
            arquivo
        );

        const tokenAdmin =
            obterTokenAdmin();

        if (!tokenAdmin) {

            throw new Error(
                "Sessão administrativa não encontrada. Faça login novamente."
            );

        }

        const resposta =
            await fetch(
                "/upload",
                {
                    method:
                        "POST",

                    headers: {
                        Authorization:
                            `Bearer ${tokenAdmin}`
                    },

                    body:
                        formData
                }
            );

        const resultado =
            await resposta
                .json()
                .catch(() => ({}));

        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao enviar imagem."
            );

        }

        if (imagem) {

            imagem.value =
                resultado.url || "";

        }

        atualizarPreview();

        if (statusUploadImagem) {

            statusUploadImagem.textContent =
                "✓ Imagem enviada com sucesso.";

        }

        return true;

    } catch (error) {

        console.error(
            "Erro no upload da imagem:",
            error
        );

        if (statusUploadImagem) {

            statusUploadImagem.textContent =
                "";

        }

        mostrarToast(
            error.message ||
            "Erro ao enviar imagem.",
            "error"
        );

        return false;

    }

}


/* =========================================================
   EVENTOS DO FORMULÁRIO
========================================================= */

if (titulo) {

    titulo.addEventListener(
        "input",
        atualizarPreview
    );

}


if (categoria) {

    categoria.addEventListener(
        "input",
        atualizarPreview
    );

}


if (imagem) {

    imagem.addEventListener(
        "input",
        atualizarPreview
    );

}


if (imagemArquivo) {

    imagemArquivo.addEventListener(
        "change",
        async () => {

            await enviarImagem();

        }
    );

}


if (statusPost) {

    statusPost.addEventListener(
        "change",
        controlarAgendamento
    );

}

/* =========================================================
   LIMPAR FORMULÁRIO DO POST
========================================================= */

function limparFormularioPost() {

    postEditandoId = null;

    if (formPost) {

        formPost.reset();

    }

    if (titulo) {
        titulo.value = "";
    }

    if (categoria) {
        categoria.value = "";
    }

    if (imagem) {
        imagem.value = "";
    }

    if (imagemArquivo) {
        imagemArquivo.value = "";
    }

    if (fontes) {
        fontes.value = "";
    }

    if (statusPost) {
        statusPost.value = "publicado";
    }

    if (agendadoPara) {
        agendadoPara.value = "";
    }

    if (statusUploadImagem) {
        statusUploadImagem.textContent = "";
    }


    /* -------------------------
       LIMPAR EDITORES
    ------------------------- */

    setarConteudoEditor(
        "resumo",
        ""
    );

    setarConteudoEditor(
        "conteudo",
        ""
    );


    /* -------------------------
       RESTAURAR BOTÃO
    ------------------------- */

    const btnPublicar =
        formPost
            ? formPost.querySelector(
                ".btn-publicar"
            )
            : null;


    if (btnPublicar) {

        btnPublicar.innerHTML = `
            <i data-lucide="send"></i>
            Publicar artigo
        `;

        btnPublicar.disabled =
            false;

    }


    controlarAgendamento();

    atualizarPreview();

    renderizarIcones();

}


/* =========================================================
   BOTÃO LIMPAR
========================================================= */

if (formPost) {

    formPost.addEventListener(
        "reset",
        () => {

            setTimeout(
                limparFormularioPost,
                0
            );

        }
    );

}


/* =========================================================
   PREPARAR DADOS DO POST
========================================================= */

function montarDadosPost() {

    const tituloValor =
        titulo
            ? titulo.value.trim()
            : "";

    const categoriaValor =
        categoria
            ? categoria.value.trim()
            : "";

    const resumoValor =
        limparHtmlVazio(
            pegarConteudoEditor(
                "resumo"
            )
        );

    const conteudoValor =
        limparHtmlVazio(
            pegarConteudoEditor(
                "conteudo"
            )
        );

    const imagemValor =
        imagem
            ? imagem.value.trim()
            : "";

    const fontesValor =
        fontes
            ? fontes.value.trim()
            : "";

    const statusValor =
        statusPost
            ? statusPost.value
            : "publicado";

    const agendadoValor =
        agendadoPara &&
        agendadoPara.value
            ? agendadoPara.value
            : null;


    return {

        titulo:
            tituloValor,

        categoria:
            categoriaValor,

        resumo:
            resumoValor,

        conteudo:
            conteudoValor,

        imagem:
            imagemValor,

        fontes:
            fontesValor,

        status:
            statusValor,

        agendado_para:
            statusValor === "agendado"
                ? agendadoValor
                : null

    };

}


/* =========================================================
   VALIDAR POST
========================================================= */

function validarPost(dados) {

    if (!dados.titulo) {

        mostrarToast(
            "Digite o título do artigo.",
            "error"
        );

        if (titulo) {
            titulo.focus();
        }

        return false;

    }


    if (!dados.categoria) {

        mostrarToast(
            "Digite a categoria do artigo.",
            "error"
        );

        if (categoria) {
            categoria.focus();
        }

        return false;

    }


    if (!dados.resumo) {

        mostrarToast(
            "Digite o resumo do artigo.",
            "error"
        );

        return false;

    }


    if (!dados.conteudo) {

        mostrarToast(
            "Digite o conteúdo do artigo.",
            "error"
        );

        return false;

    }


    if (
        dados.status === "agendado" &&
        !dados.agendado_para
    ) {

        mostrarToast(
            "Escolha a data e a hora da publicação.",
            "error"
        );

        if (agendadoPara) {
            agendadoPara.focus();
        }

        return false;

    }


    if (
        dados.status === "agendado"
    ) {

        const dataAgendada =
            new Date(
                dados.agendado_para
            );

        if (
            Number.isNaN(
                dataAgendada.getTime()
            )
        ) {

            mostrarToast(
                "A data de agendamento é inválida.",
                "error"
            );

            return false;

        }


        if (
            dataAgendada.getTime() <=
            Date.now()
        ) {

            mostrarToast(
                "Escolha uma data futura para agendar o artigo.",
                "error"
            );

            return false;

        }

    }


    return true;

}


/* =========================================================
   ESTADO DO BOTÃO DE PUBLICAÇÃO
========================================================= */

function definirEstadoBotaoPost(
    carregando
) {

    if (!formPost) {
        return;
    }


    const botao =
        formPost.querySelector(
            ".btn-publicar"
        );


    if (!botao) {
        return;
    }


    botao.disabled =
        carregando;


    if (carregando) {

        botao.innerHTML = `

            <i data-lucide="loader-circle"></i>

            ${
                postEditandoId
                    ? "Salvando..."
                    : "Publicando..."
            }

        `;

        botao.classList.add(
            "is-loading"
        );


    } else {

        botao.innerHTML = `

            <i data-lucide="${
                postEditandoId
                    ? "save"
                    : "send"
            }"></i>

            ${
                postEditandoId
                    ? "Salvar alterações"
                    : "Publicar artigo"
            }

        `;

        botao.classList.remove(
            "is-loading"
        );

    }


    renderizarIcones();

}


/* =========================================================
   PUBLICAR / EDITAR POST
========================================================= */

async function salvarPost() {

    const dados =
        montarDadosPost();


    if (
        !validarPost(dados)
    ) {

        return;

    }


    const tokenAdmin =
        obterTokenAdmin();


    if (!tokenAdmin) {

        mostrarToast(
            "Sua sessão administrativa expirou. Faça login novamente.",
            "error"
        );

        return;

    }


    try {

        definirEstadoBotaoPost(
            true
        );


        /*
           Caso o usuário tenha escolhido
           uma imagem e ela ainda não tenha
           sido enviada, tentamos enviar agora.
        */

        if (
            imagemArquivo &&
            imagemArquivo.files.length &&
            (!imagem || !imagem.value)
        ) {

            const uploadOk =
                await enviarImagem();


            if (!uploadOk) {

                definirEstadoBotaoPost(
                    false
                );

                return;

            }


            dados.imagem =
                imagem
                    ? imagem.value.trim()
                    : "";

        }


        const editando =
            Boolean(
                postEditandoId
            );


        const url =
            editando
                ? `${apiPosts}/${postEditandoId}`
                : apiPosts;


        const metodo =
            editando
                ? "PUT"
                : "POST";


        const resposta =
            await fetch(
                url,
                {
                    method:
                        metodo,

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    },

                    body:
                        JSON.stringify(
                            dados
                        )
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(() => ({}));


        if (!resposta.ok) {

            if (
                resposta.status === 401 ||
                resposta.status === 403
            ) {

                throw new Error(
                    resultado.erro ||
                    "Sua sessão administrativa expirou."
                );

            }


            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                (
                    editando
                        ? "Não foi possível atualizar o artigo."
                        : "Não foi possível publicar o artigo."
                )
            );

        }


        mostrarToast(
            editando
                ? "Artigo atualizado com sucesso!"
                : (
                    dados.status === "agendado"
                        ? "Artigo agendado com sucesso!"
                        : "Artigo publicado com sucesso!"
                ),
            "success"
        );


        limparFormularioPost();


        await carregarPostsAdmin();


        abrirPaginaAdmin(
            "posts"
        );


    } catch (error) {

        console.error(
            "Erro ao salvar post:",
            error
        );


        mostrarToast(
            error.message ||
            "Erro ao salvar artigo.",
            "error"
        );


    } finally {

        definirEstadoBotaoPost(
            false
        );

    }

}


/* =========================================================
   SUBMIT DO POST
========================================================= */

if (formPost) {

    formPost.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const dados =
                montarDadosPost();


            if (
                !validarPost(dados)
            ) {

                return;

            }


            const mensagem =
                postEditandoId
                    ? "Deseja salvar as alterações deste artigo?"
                    : (
                        dados.status === "agendado"
                            ? "Deseja agendar este artigo para a data selecionada?"
                            : "Deseja publicar este artigo agora?"
                    );


            abrirModalConfirmacao(

                mensagem,

                async () => {

                    await salvarPost();

                }

            );

        }
    );

}


/* =========================================================
   STATUS DO POST
========================================================= */

function obterStatusAdmin(post) {

    const agora =
        new Date();


    const dataAgendada =
        post.agendado_para
            ? new Date(
                post.agendado_para
            )
            : null;


    if (
        post.status === "agendado" &&
        dataAgendada &&
        dataAgendada > agora
    ) {

        return {

            texto:
                `Agendado para ${formatarDataAdmin(
                    post.agendado_para
                )}`,

            classe:
                "status-agendado"

        };

    }


    return {

        texto:
            "Publicado",

        classe:
            "status-publicado"

    };

}


/* =========================================================
   RENDERIZAR POSTS NO GERENCIAMENTO
========================================================= */

function renderizarPostsAdmin(posts) {

    if (!listaPostsAdmin) {
        return;
    }


    if (
        !Array.isArray(posts) ||
        posts.length === 0
    ) {

        listaPostsAdmin.innerHTML = `

            <div class="empty-posts">

                <i data-lucide="inbox"></i>

                <p>
                    Nenhum post criado ainda.
                </p>

            </div>

        `;


        renderizarIcones();

        return;

    }


    listaPostsAdmin.innerHTML =
        posts
            .map((post) => {

                const statusInfo =
                    obterStatusAdmin(post);


                const resumoTexto =
                    limitarTextoAdmin(

                        pegarTextoLimpo(
                            post.resumo || ""
                        ),

                        180

                    );


                return `

                    <article class="post-admin-card">

                        <div class="post-admin-top">

                            <span
                                class="post-status ${statusInfo.classe}"
                            >
                                ${escaparHtmlAdmin(
                                    statusInfo.texto
                                )}
                            </span>

                        </div>


                        <h3>

                            ${escaparHtmlAdmin(
                                post.titulo ||
                                "Artigo sem título"
                            )}

                        </h3>


                        <p>

                            ${escaparHtmlAdmin(
                                resumoTexto ||
                                "Sem resumo cadastrado."
                            )}

                        </p>


                        <div class="post-admin-actions">

                            <button
                                type="button"
                                class="btn-editar"
                                onclick="prepararEdicao(${Number(
                                    post.id
                                )})"
                            >

                                Editar

                            </button>


                            <button
                                type="button"
                                class="btn-excluir"
                                onclick="confirmarExclusaoPost(${Number(
                                    post.id
                                )})"
                            >

                                Excluir

                            </button>

                        </div>

                    </article>

                `;

            })
            .join("");


    renderizarIcones();

}


/* =========================================================
   POSTS RECENTES - DASHBOARD
========================================================= */

function renderizarPostsRecentes(posts) {

    if (!listaPostsRecentes) {
        return;
    }


    if (
        !Array.isArray(posts) ||
        posts.length === 0
    ) {

        listaPostsRecentes.innerHTML = `

            <div class="admin-empty-state">

                <i data-lucide="inbox"></i>

                <strong>
                    Nenhum artigo cadastrado
                </strong>

                <span>
                    Os artigos mais recentes aparecerão aqui.
                </span>

            </div>

        `;


        renderizarIcones();

        return;

    }


    const postsRecentes =
        posts.slice(
            0,
            5
        );


    listaPostsRecentes.innerHTML =
        postsRecentes
            .map((post) => {

                const statusInfo =
                    obterStatusAdmin(post);


                const resumoTexto =
                    limitarTextoAdmin(

                        pegarTextoLimpo(
                            post.resumo || ""
                        ),

                        110

                    );


                return `

                    <article class="admin-recent-post-item">

                        <div class="admin-recent-post-main">

                            <span
                                class="post-status ${statusInfo.classe}"
                            >

                                ${escaparHtmlAdmin(
                                    statusInfo.texto
                                )}

                            </span>


                            <h3>

                                ${escaparHtmlAdmin(
                                    post.titulo ||
                                    "Artigo sem título"
                                )}

                            </h3>


                            <p>

                                ${escaparHtmlAdmin(
                                    resumoTexto ||
                                    "Sem resumo cadastrado."
                                )}

                            </p>

                        </div>


                        <div class="admin-recent-post-actions">

                            <button
                                type="button"
                                class="admin-recent-edit"
                                onclick="prepararEdicao(${Number(
                                    post.id
                                )})"
                            >

                                <i data-lucide="pencil"></i>

                                Editar

                            </button>

                        </div>

                    </article>

                `;

            })
            .join("");


    renderizarIcones();

}


/* =========================================================
   CARREGAR POSTS
========================================================= */

async function carregarPostsAdmin() {

    const tokenAdmin =
        obterTokenAdmin();


    if (!tokenAdmin) {

        return;

    }


    try {

        const resposta =
            await fetch(
                "/posts/admin/todos",
                {
                    headers: {

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    }
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os artigos."
            );

        }


        const resultado =
            await resposta.json();


        /*
           Normalizamos a resposta para funcionar
           caso a API retorne diretamente um array
           ou um objeto contendo "posts".
        */

        const posts =
            Array.isArray(resultado)
                ? resultado
                : (
                    Array.isArray(
                        resultado.posts
                    )
                        ? resultado.posts
                        : []
                );


        if (totalPosts) {

            totalPosts.textContent =
                posts.length;

        }


        renderizarPostsAdmin(
            posts
        );


        renderizarPostsRecentes(
            posts
        );


    } catch (error) {

        console.error(
            "Erro ao carregar posts:",
            error
        );


        if (totalPosts) {

            totalPosts.textContent =
                "—";

        }


        if (listaPostsAdmin) {

            listaPostsAdmin.innerHTML = `

                <div class="empty-posts">

                    <i data-lucide="circle-alert"></i>

                    <p>
                        Não foi possível carregar os artigos.
                    </p>

                </div>

            `;

        }


        if (listaPostsRecentes) {

            listaPostsRecentes.innerHTML = `

                <div class="admin-empty-state">

                    <i data-lucide="circle-alert"></i>

                    <strong>
                        Não foi possível carregar os artigos
                    </strong>

                    <span>
                        Atualize a página e tente novamente.
                    </span>

                </div>

            `;

        }


        renderizarIcones();

    }

}


/* =========================================================
   FORMATAR DATA PARA DATETIME-LOCAL
========================================================= */

function converterParaDatetimeLocal(
    data
) {

    if (!data) {

        return "";

    }


    const d =
        new Date(data);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "";

    }


    const pad =
        (numero) =>
            String(numero)
                .padStart(
                    2,
                    "0"
                );


    return (
        `${d.getFullYear()}-` +
        `${pad(d.getMonth() + 1)}-` +
        `${pad(d.getDate())}T` +
        `${pad(d.getHours())}:` +
        `${pad(d.getMinutes())}`
    );

}


/* =========================================================
   PREPARAR EDIÇÃO
========================================================= */

async function prepararEdicao(id) {

    const tokenAdmin =
        obterTokenAdmin();


    if (!tokenAdmin) {

        mostrarToast(
            "Sua sessão administrativa expirou. Faça login novamente.",
            "error"
        );

        return;

    }


    /*
       Primeiro abrimos a página do editor.
       Essa é justamente a parte que faltava
       na versão que causou o erro anterior.
    */

    abrirPaginaAdmin(
        "criar-post"
    );


    try {

        const resposta =
            await fetch(
                `/posts/admin/${id}`,
                {
                    headers: {

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    }
                }
            );


        /*
           Caso sua API não possua
           /posts/admin/:id, tentamos
           encontrar o post pela lista
           administrativa completa.
        */

        let post = null;


        if (resposta.ok) {

            const resultado =
                await resposta.json();


            post =
                resultado.post ||
                resultado;


        } else {

            const respostaTodos =
                await fetch(
                    "/posts/admin/todos",
                    {
                        headers: {

                            Authorization:
                                `Bearer ${tokenAdmin}`

                        }
                    }
                );


            if (!respostaTodos.ok) {

                throw new Error(
                    "Não foi possível carregar o artigo."
                );

            }


            const resultadoTodos =
                await respostaTodos.json();


            const posts =
                Array.isArray(
                    resultadoTodos
                )
                    ? resultadoTodos
                    : (
                        Array.isArray(
                            resultadoTodos.posts
                        )
                            ? resultadoTodos.posts
                            : []
                    );


            post =
                posts.find(
                    (item) =>
                        Number(item.id) ===
                        Number(id)
                );

        }


        if (!post) {

            throw new Error(
                "Artigo não encontrado."
            );

        }


        postEditandoId =
            Number(post.id);


        if (titulo) {

            titulo.value =
                post.titulo || "";

        }


        if (categoria) {

            categoria.value =
                post.categoria || "";

        }


        if (imagem) {

            imagem.value =
                post.imagem || "";

        }


        if (fontes) {

            fontes.value =
                post.fontes || "";

        }


        if (statusPost) {

            statusPost.value =
                post.status === "agendado"
                    ? "agendado"
                    : "publicado";

        }


        if (agendadoPara) {

            agendadoPara.value =
                converterParaDatetimeLocal(
                    post.agendado_para
                );

        }


        setarConteudoEditor(
            "resumo",
            post.resumo || ""
        );


        setarConteudoEditor(
            "conteudo",
            post.conteudo || ""
        );


        controlarAgendamento();

        atualizarPreview();


        /* -------------------------
           BOTÃO EM MODO EDIÇÃO
        ------------------------- */

        const botao =
            formPost
                ? formPost.querySelector(
                    ".btn-publicar"
                )
                : null;


        if (botao) {

            botao.innerHTML = `

                <i data-lucide="save"></i>

                Salvar alterações

            `;

        }


        renderizarIcones();


        setTimeout(() => {

            if (formPost) {

                formPost.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });

            }

        }, 120);


    } catch (error) {

        console.error(
            "Erro ao preparar edição:",
            error
        );


        mostrarToast(
            error.message ||
            "Não foi possível abrir o artigo para edição.",
            "error"
        );

    }

}


/* =========================================================
   CONFIRMAR EXCLUSÃO
========================================================= */

function confirmarExclusaoPost(id) {

    abrirModalConfirmacao(

        "Deseja realmente excluir este artigo? Esta ação não poderá ser desfeita.",

        async () => {

            await excluirPost(id);

        }

    );

}


/* =========================================================
   EXCLUIR POST
========================================================= */

async function excluirPost(id) {

    const tokenAdmin =
        obterTokenAdmin();


    if (!tokenAdmin) {

        mostrarToast(
            "Sua sessão administrativa expirou. Faça login novamente.",
            "error"
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                `${apiPosts}/${id}`,
                {
                    method:
                        "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    }
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(() => ({}));


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                "Não foi possível excluir o artigo."
            );

        }


        mostrarToast(
            "Artigo excluído com sucesso!",
            "success"
        );


        if (
            Number(postEditandoId) ===
            Number(id)
        ) {

            limparFormularioPost();

        }


        await carregarPostsAdmin();


    } catch (error) {

        console.error(
            "Erro ao excluir artigo:",
            error
        );


        mostrarToast(
            error.message ||
            "Erro ao excluir artigo.",
            "error"
        );

    }

}

/* =========================================================
   NAVEGAÇÃO DO NOVO PAINEL
========================================================= */

function abrirPaginaAdmin(nomePagina = "dashboard") {

    const paginaDestino =
        document.querySelector(
            `[data-page="${nomePagina}"]`
        );


    if (!paginaDestino) {

        console.warn(
            `Página administrativa "${nomePagina}" não encontrada.`
        );

        return;

    }


    /* -------------------------
       ESCONDER TODAS AS PÁGINAS
    ------------------------- */

    adminPages.forEach((pagina) => {

        pagina.classList.remove(
            "active"
        );

    });


    /* -------------------------
       MOSTRAR PÁGINA
    ------------------------- */

    paginaDestino.classList.add(
        "active"
    );


    /* -------------------------
       ATUALIZAR MENU
    ------------------------- */

    adminNavButtons.forEach((botao) => {

        botao.classList.remove(
            "active"
        );


        if (
            botao.dataset.adminPage ===
            nomePagina
        ) {

            botao.classList.add(
                "active"
            );

        }

    });


    /* -------------------------
       FECHAR MENU MOBILE
    ------------------------- */

    fecharMenuAdmin();


    /* -------------------------
       ATUALIZAR HASH
    ------------------------- */

    try {

        history.replaceState(
            null,
            "",
            `#${nomePagina}`
        );

    } catch (error) {

        console.warn(
            "Não foi possível atualizar a URL.",
            error
        );

    }


    /* -------------------------
       TOPO
    ------------------------- */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    /* -------------------------
       ÍCONES
    ------------------------- */

    renderizarIcones();

}


/* =========================================================
   CLIQUES NO MENU
========================================================= */

adminNavButtons.forEach((botao) => {

    botao.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            const pagina =
                botao.dataset.adminPage;


            if (!pagina) {
                return;
            }


            abrirPaginaAdmin(
                pagina
            );

        }
    );

});


/* =========================================================
   AÇÕES RÁPIDAS
========================================================= */

adminGoButtons.forEach((botao) => {

    botao.addEventListener(
        "click",
        () => {

            const pagina =
                botao.dataset.adminGo;


            if (!pagina) {
                return;
            }


            abrirPaginaAdmin(
                pagina
            );

        }
    );

});


/* =========================================================
   MENU RESPONSIVO
========================================================= */

function abrirMenuAdmin() {

    document.body.classList.add(
        "admin-menu-open"
    );

}


function fecharMenuAdmin() {

    document.body.classList.remove(
        "admin-menu-open"
    );

}


if (adminMenuButton) {

    adminMenuButton.addEventListener(
        "click",
        abrirMenuAdmin
    );

}


if (adminSidebarClose) {

    adminSidebarClose.addEventListener(
        "click",
        fecharMenuAdmin
    );

}


if (adminSidebarOverlay) {

    adminSidebarOverlay.addEventListener(
        "click",
        fecharMenuAdmin
    );

}


/* =========================================================
   ESC FECHA O MENU
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            fecharMenuAdmin();

        }

    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 1100
        ) {

            fecharMenuAdmin();

        }

    }
);


/* =========================================================
   TOTAL DE LEADS
========================================================= */

async function carregarTotalLeadsAdmin() {

    if (!totalLeads) {
        return;
    }


    const tokenAdmin =
        obterTokenAdmin();


    if (!tokenAdmin) {

        totalLeads.textContent =
            "—";

        return;

    }


    try {

        const resposta =
            await fetch(
                "/leads",
                {
                    headers: {

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    }
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar os leads."
            );

        }


        const resultado =
            await resposta.json();


        /* -------------------------
           ARRAY DIRETO
        ------------------------- */

        if (
            Array.isArray(
                resultado
            )
        ) {

            totalLeads.textContent =
                resultado.length;

            return;

        }


        /* -------------------------
           { leads: [] }
        ------------------------- */

        if (
            Array.isArray(
                resultado.leads
            )
        ) {

            totalLeads.textContent =
                resultado.leads.length;

            return;

        }


        /* -------------------------
           { dados: [] }
        ------------------------- */

        if (
            Array.isArray(
                resultado.dados
            )
        ) {

            totalLeads.textContent =
                resultado.dados.length;

            return;

        }


        /* -------------------------
           { total: 10 }
        ------------------------- */

        if (
            resultado.total !== undefined &&
            !Number.isNaN(
                Number(
                    resultado.total
                )
            )
        ) {

            totalLeads.textContent =
                Number(
                    resultado.total
                );

            return;

        }


        totalLeads.textContent =
            "—";


    } catch (error) {

        console.error(
            "Erro ao carregar total de leads:",
            error
        );


        totalLeads.textContent =
            "—";

    }

}


/* =========================================================
   NOTIFICAÇÕES ATIVAS
========================================================= */

/*
   Por enquanto não existe uma rota administrativa
   específica para contar quantos usuários possuem
   notificações habilitadas.

   Portanto NÃO inventamos esse número.
*/

function carregarTotalNotificacoesAtivas() {

    if (!totalNotificacoesAtivas) {
        return;
    }


    totalNotificacoesAtivas.textContent =
        "—";

}


/* =========================================================
   PREVIEW DA NOVIDADE
========================================================= */

function atualizarPreviewNovidade() {

    if (
        !previewNovidadeTitulo ||
        !previewNovidadeMensagem
    ) {

        return;

    }


    const tituloValor =
        novidadeTitulo
            ? novidadeTitulo.value.trim()
            : "";


    const mensagemValor =
        novidadeMensagem
            ? novidadeMensagem.value.trim()
            : "";


    previewNovidadeTitulo.textContent =
        tituloValor ||
        "Novidade no PsiFácil ✨";


    previewNovidadeMensagem.textContent =
        mensagemValor ||
        "Sua mensagem aparecerá aqui antes do envio.";

}


/* =========================================================
   EVENTOS DO PREVIEW DA NOVIDADE
========================================================= */

if (novidadeTitulo) {

    novidadeTitulo.addEventListener(
        "input",
        atualizarPreviewNovidade
    );

}


if (novidadeMensagem) {

    novidadeMensagem.addEventListener(
        "input",
        atualizarPreviewNovidade
    );

}


/* =========================================================
   RESET DA NOVIDADE
========================================================= */

if (formNovidade) {

    formNovidade.addEventListener(
        "reset",
        () => {

            setTimeout(
                atualizarPreviewNovidade,
                0
            );

        }
    );

}


/* =========================================================
   BOTÃO DE ENVIO DA NOVIDADE
========================================================= */

function definirEstadoEnvioNovidade(
    enviando
) {

    if (!btnEnviarNovidade) {
        return;
    }


    btnEnviarNovidade.disabled =
        enviando;


    if (enviando) {

        btnEnviarNovidade.innerHTML = `

            <i data-lucide="loader-circle"></i>

            Enviando...

        `;


        btnEnviarNovidade.classList.add(
            "is-loading"
        );


    } else {

        btnEnviarNovidade.innerHTML = `

            <i data-lucide="send"></i>

            Enviar novidade

        `;


        btnEnviarNovidade.classList.remove(
            "is-loading"
        );

    }


    renderizarIcones();

}


/* =========================================================
   VALIDAR URL INTERNA DA NOVIDADE
========================================================= */

function normalizarUrlNovidade(
    valor
) {

    const url =
        String(
            valor || ""
        ).trim();


    if (!url) {

        return "/perfil.html";

    }


    /*
       Aceitamos:
       /perfil.html
       /post.html?id=10

       Também aceitamos URLs completas
       http:// ou https://
    */

    if (
        url.startsWith("/") ||
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {

        return url;

    }


    /*
       Se o admin digitar:
       perfil.html

       transformamos em:
       /perfil.html
    */

    return `/${url}`;

}


/* =========================================================
   ENVIAR NOVIDADE
========================================================= */

async function enviarNovidadeAdmin() {

    const tituloValor =
        novidadeTitulo
            ? novidadeTitulo.value.trim()
            : "";


    const mensagemValor =
        novidadeMensagem
            ? novidadeMensagem.value.trim()
            : "";


    const urlValor =
        normalizarUrlNovidade(
            novidadeUrl
                ? novidadeUrl.value
                : ""
        );


    /* -------------------------
       VALIDAÇÃO
    ------------------------- */

    if (!tituloValor) {

        mostrarToast(
            "Digite o título da novidade.",
            "error"
        );


        if (novidadeTitulo) {

            novidadeTitulo.focus();

        }


        return;

    }


    if (!mensagemValor) {

        mostrarToast(
            "Digite a mensagem da novidade.",
            "error"
        );


        if (novidadeMensagem) {

            novidadeMensagem.focus();

        }


        return;

    }


    if (
        tituloValor.length > 150
    ) {

        mostrarToast(
            "O título deve ter no máximo 150 caracteres.",
            "error"
        );

        return;

    }


    const tokenAdmin =
        obterTokenAdmin();


    if (!tokenAdmin) {

        mostrarToast(
            "Sua sessão administrativa expirou. Faça login novamente.",
            "error"
        );

        return;

    }


    try {

        definirEstadoEnvioNovidade(
            true
        );


        const resposta =
            await fetch(
                "/novidades",
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    },

                    body:
                        JSON.stringify({

                            titulo:
                                tituloValor,

                            mensagem:
                                mensagemValor,

                            url:
                                urlValor

                        })
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(
                    () => ({})
                );


        if (!resposta.ok) {

            if (
                resposta.status === 401 ||
                resposta.status === 403
            ) {

                throw new Error(
                    resultado.erro ||
                    "Sua sessão administrativa não é válida. Faça login novamente."
                );

            }


            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                "Não foi possível enviar a novidade."
            );

        }


        /* -------------------------
           SUCESSO
        ------------------------- */

        mostrarToast(
            resultado.mensagem ||
            "Novidade enviada com sucesso!",
            "success"
        );


        console.log(
            "Resultado do envio da novidade:",
            resultado
        );


        if (formNovidade) {

            formNovidade.reset();

        }


        atualizarPreviewNovidade();


    } catch (error) {

        console.error(
            "Erro ao enviar novidade:",
            error
        );


        mostrarToast(
            error.message ||
            "Erro ao enviar novidade.",
            "error"
        );


    } finally {

        definirEstadoEnvioNovidade(
            false
        );

    }

}


/* =========================================================
   SUBMIT DA NOVIDADE
========================================================= */

if (formNovidade) {

    formNovidade.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const tituloValor =
                novidadeTitulo
                    ? novidadeTitulo.value.trim()
                    : "";


            const mensagemValor =
                novidadeMensagem
                    ? novidadeMensagem.value.trim()
                    : "";


            /*
               Validamos antes de abrir o modal.
            */

            if (!tituloValor) {

                mostrarToast(
                    "Digite o título da novidade.",
                    "error"
                );


                if (novidadeTitulo) {

                    novidadeTitulo.focus();

                }


                return;

            }


            if (!mensagemValor) {

                mostrarToast(
                    "Digite a mensagem da novidade.",
                    "error"
                );


                if (novidadeMensagem) {

                    novidadeMensagem.focus();

                }


                return;

            }


            abrirModalConfirmacao(

                "Deseja enviar esta novidade agora para os usuários que ativaram as notificações de novidades do PsiFácil?",

                async () => {

                    await enviarNovidadeAdmin();

                }

            );

        }
    );

}


/* =========================================================
   SAIR DO ADMIN
========================================================= */

function sairAdmin() {

    localStorage.removeItem(
        "tokenAdmin"
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   PÁGINA INICIAL DO PAINEL
========================================================= */

function definirPaginaInicialAdmin() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();


    const paginasPermitidas = [
        "dashboard",
        "criar-post",
        "posts",
        "novidade"
    ];


    if (
        hash &&
        paginasPermitidas.includes(
            hash
        )
    ) {

        abrirPaginaAdmin(
            hash
        );

        return;

    }


    abrirPaginaAdmin(
        "dashboard"
    );

}


/* =========================================================
   CSS COMPLEMENTAR
   POSTS RECENTES + LOADER
========================================================= */

function adicionarEstilosComplementaresAdmin() {

    if (
        document.getElementById(
            "adminEstilosComplementares"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "adminEstilosComplementares";


    style.textContent = `

        .admin-recent-post-item {
            min-width: 0;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 18px;

            padding: 15px 17px;

            border-bottom:
                1px solid
                var(--admin-border-soft);
        }


        .admin-recent-post-item:last-child {
            border-bottom: 0;
        }


        .admin-recent-post-main {
            min-width: 0;

            flex: 1;
        }


        .admin-recent-post-main .post-status {
            margin-bottom: 7px;
        }


        .admin-recent-post-main h3 {
            margin-bottom: 3px;

            color:
                var(--admin-text);

            font-size: 12px;

            line-height: 1.4;

            overflow-wrap: anywhere;
        }


        .admin-recent-post-main p {
            max-width: 720px;

            color:
                var(--admin-muted);

            font-size: 10px;

            line-height: 1.5;

            overflow-wrap: anywhere;
        }


        .admin-recent-post-actions {
            flex-shrink: 0;
        }


        .admin-recent-edit {
            min-height: 34px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            gap: 6px;

            padding: 7px 10px;

            color:
                var(--admin-primary-dark);

            background:
                var(--admin-primary-soft);

            border-radius: 8px;

            font-size: 9px;

            font-weight: 650;

            cursor: pointer;
        }


        .admin-recent-edit svg {
            width: 13px;
            height: 13px;
        }


        .admin-recent-edit:hover {
            background: #e2efe9;
        }


        .btn-publicar.is-loading svg {
            animation:
                adminSpin
                0.8s
                linear
                infinite;
        }


        @keyframes adminSpin {

            to {
                transform:
                    rotate(360deg);
            }

        }


        @media (max-width: 520px) {

            .admin-recent-post-item {
                align-items:
                    flex-start;

                flex-direction:
                    column;

                gap: 11px;

                padding: 14px;
            }


            .admin-recent-post-actions {
                width: 100%;
            }


            .admin-recent-edit {
                width: 100%;

                min-height: 38px;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   GARANTIR FUNÇÕES PARA ONCLICK
========================================================= */

/*
   Como os cards dos posts usam onclick no HTML
   gerado dinamicamente, deixamos essas funções
   explicitamente disponíveis no window.
*/

window.prepararEdicao =
    prepararEdicao;

window.confirmarExclusaoPost =
    confirmarExclusaoPost;

window.excluirPost =
    excluirPost;

window.sairAdmin =
    sairAdmin;

window.abrirPaginaAdmin =
    abrirPaginaAdmin;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarPainelAdmin() {

    const tokenAdmin =
        obterTokenAdmin();


    /* -------------------------
       SEGURANÇA
    ------------------------- */

    if (!tokenAdmin) {

        window.location.href =
            "login.html";

        return;

    }


    /* -------------------------
       CSS COMPLEMENTAR
    ------------------------- */

    adicionarEstilosComplementaresAdmin();


    /* -------------------------
       AGENDAMENTO
    ------------------------- */

    controlarAgendamento();


    /* -------------------------
       PREVIEWS
    ------------------------- */

    atualizarPreview();

    atualizarPreviewNovidade();


    /* -------------------------
       PÁGINA INICIAL
    ------------------------- */

    definirPaginaInicialAdmin();


    /* -------------------------
       DADOS
    ------------------------- */

    await Promise.allSettled([

        carregarPostsAdmin(),

        carregarTotalLeadsAdmin()

    ]);


    /* -------------------------
       NOTIFICAÇÕES
    ------------------------- */

    carregarTotalNotificacoesAtivas();


    /* -------------------------
       ÍCONES
    ------------------------- */

    renderizarIcones();

}


/* =========================================================
   INICIAR
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPainelAdmin
    );

} else {

    iniciarPainelAdmin();

}