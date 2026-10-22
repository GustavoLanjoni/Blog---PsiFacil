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


/* =========================================================
   GERENCIADOR DE PUBLICAÇÕES - FILTROS
========================================================= */

const pesquisaPostsAdmin =
    document.getElementById("pesquisaPostsAdmin");

const filtroStatusPostsAdmin =
    document.getElementById("filtroStatusPostsAdmin");

const ordenacaoPostsAdmin =
    document.getElementById("ordenacaoPostsAdmin");

const quantidadePostsFiltrados =
    document.getElementById("quantidadePostsFiltrados");

// Armazena os artigos carregados da API para filtrar
// sem precisar consultar o servidor a cada pesquisa.
let todosPostsAdmin = [];


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
   ELEMENTOS - PARCERIAS
========================================================= */

const totalParceriasNovas =
    document.getElementById("totalParceriasNovas");

const listaParceriasAdmin =
    document.getElementById("listaParceriasAdmin");

const parceriasTotal =
    document.getElementById("parceriasTotal");

const parceriasNovas =
    document.getElementById("parceriasNovas");

const parceriasAnalise =
    document.getElementById("parceriasAnalise");

const parceriasFechadas =
    document.getElementById("parceriasFechadas");

const btnAtualizarParcerias =
    document.getElementById("btnAtualizarParcerias");


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


/* =========================================================
   TINYMCE - EDITORES DO PAINEL ADMINISTRATIVO
========================================================= */

if (window.tinymce) {

    /* =====================================================
       FONTES E CRÉDITOS
    ===================================================== */

    tinymce.init({

        selector: "#fontes",

        height: 300,

        menubar: false,

        branding: false,

        plugins: "lists link table code wordcount",

        toolbar:
            "undo redo | blocks | " +
            "bold italic underline strikethrough | " +
            "bullist numlist | " +
            "link unlink | " +
            "alignleft aligncenter alignright | " +
            "table | code | removeformat",

        toolbar_mode: "wrap",

        paste_as_text: false,

        paste_data_images: false,

        convert_urls: false,

        link_default_target: "_blank",

        placeholder:
            "Cole ou escreva aqui suas fontes, referências e créditos.",

        content_style: `
            body {
                font-family: Inter, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #2f2a28;
                padding: 12px;
            }

            p {
                margin: 0 0 12px;
            }

            h2, h3, h4 {
                color: #2f2a28;
                margin: 16px 0 10px;
            }

            a {
                color: #286b58;
                text-decoration: underline;
            }

            ul, ol {
                margin: 12px 0 16px 24px;
            }

            blockquote {
                border-left: 4px solid #7a5c58;
                padding: 10px 14px;
                background: #f8f4ef;
                border-radius: 8px;
            }
        `

    });


    /* =====================================================
       RESUMO CURTO - EDITOR COMPLETO
    ===================================================== */

    tinymce.init({

        selector: "#resumo",

        height: 280,

        menubar: false,

        branding: false,

        plugins: "lists link table code wordcount",

        toolbar:
            "undo redo | blocks | " +
            "bold italic underline strikethrough | " +
            "bullist numlist | " +
            "link unlink | " +
            "alignleft aligncenter alignright | " +
            "table | code | removeformat",

        toolbar_mode: "wrap",

        paste_as_text: false,

        paste_data_images: false,

        convert_urls: false,

        link_default_target: "_blank",

        placeholder:
            "Escreva ou cole aqui o resumo do artigo.",

        setup: (editor) => {

            editor.on(
                "keyup change input setcontent",
                atualizarPreview
            );

        },

        content_style: `
            body {
                font-family: Inter, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #2f2a28;
                padding: 12px;
            }

            p {
                margin: 0 0 12px;
            }

            h2, h3, h4 {
                color: #2f2a28;
                margin: 16px 0 10px;
            }

            a {
                color: #286b58;
                text-decoration: underline;
            }

            ul, ol {
                margin: 12px 0 16px 24px;
            }

            blockquote {
                border-left: 4px solid #7a5c58;
                padding: 10px 14px;
                background: #f8f4ef;
                border-radius: 8px;
            }
        `

    });


    /* =====================================================
       CONTEÚDO COMPLETO
       Mantido com suas configurações originais
    ===================================================== */

    tinymce.init({

        selector: "#conteudo",

        height: 540,

        menubar: false,

        branding: false,

        plugins: "lists link table code wordcount",

        toolbar:
            "undo redo | blocks | " +
            "bold italic underline strikethrough | " +
            "bullist numlist | blockquote link | " +
            "alignleft aligncenter alignright | " +
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

    setarConteudoEditor(
        "fontes",
        ""
    );

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
        limparHtmlVazio(
            pegarConteudoEditor("fontes")
        );

    const statusValor =
        statusPost
            ? statusPost.value
            : "publicado";


    const agendadoValor =
        agendadoPara &&
            agendadoPara.value
            ? converterHorarioBrasiliaParaISO(
                agendadoPara.value
            )
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

            ${postEditandoId
                ? "Salvando..."
                : "Publicando..."
            }

        `;

        botao.classList.add(
            "is-loading"
        );


    } else {

        botao.innerHTML = `

            <i data-lucide="${postEditandoId
                ? "save"
                : "send"
            }"></i>

            ${postEditandoId
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
   STATUS REAL DO ARTIGO
========================================================= */

function obterStatusAdmin(post) {

    if (post.status === "publicado") {
        return {
            texto: "Publicado",
            classe: "status-publicado"
        };
    }

    if (post.status === "agendado") {

        const dataAgendada = post.agendado_para
            ? new Date(post.agendado_para)
            : null;

        if (
            dataAgendada &&
            !Number.isNaN(dataAgendada.getTime())
        ) {

            if (dataAgendada.getTime() <= Date.now()) {
                return {
                    texto: "Agendamento vencido",
                    classe: "status-agendado"
                };
            }

            return {
                texto: `Agendado para ${formatarDataAdmin(post.agendado_para)}`,
                classe: "status-agendado"
            };
        }

        return {
            texto: "Agendamento sem data válida",
            classe: "status-agendado"
        };
    }

    if (post.status === "rascunho") {
        return {
            texto: "Rascunho",
            classe: "status-rascunho"
        };
    }

    return {
        texto: post.status || "Status desconhecido",
        classe: "status-agendado"
    };
}


/* =========================================================
   RENDERIZAR POSTS NO GERENCIAMENTO
========================================================= */


/* =========================================================
   GERENCIADOR DE PUBLICAÇÕES - TABELA
========================================================= */

function renderizarPostsAdmin(posts) {
    if (!listaPostsAdmin) return;

    todosPostsAdmin = Array.isArray(posts) ? posts : [];

    function dataValida(valor) {
        if (!valor) return null;

        const data = new Date(valor);
        return Number.isNaN(data.getTime()) ? null : data;
    }

    function mostrarData(valor) {
        const data = dataValida(valor);

        if (!data) {
            return '<span class="admin-post-date">—</span>';
        }

        const dia = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(data);

        const hora = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).format(data);

        return `
            <div class="admin-post-date">
                <strong>${dia}</strong>
                <span>${hora} • Brasília</span>
            </div>
        `;
    }

    function atualizarTabela() {
        const pesquisa = (
            pesquisaPostsAdmin?.value || ""
        ).trim().toLocaleLowerCase("pt-BR");

        const statusSelecionado =
            filtroStatusPostsAdmin?.value || "todos";

        const ordenacao =
            ordenacaoPostsAdmin?.value || "recentes";

        const filtrados = todosPostsAdmin.filter(post => {
            const texto = [
                post.titulo || "",
                post.categoria || ""
            ].join(" ").toLocaleLowerCase("pt-BR");

            const correspondePesquisa =
                !pesquisa || texto.includes(pesquisa);

            const correspondeStatus =
                statusSelecionado === "todos" ||
                post.status === statusSelecionado;

            return correspondePesquisa && correspondeStatus;
        });

        const dataReferencia = post =>
            dataValida(
                post.publicado_em ||
                post.agendado_para ||
                post.criado_em
            )?.getTime() || 0;

        filtrados.sort((a, b) => {
            if (ordenacao === "titulo") {
                return (a.titulo || "").localeCompare(
                    b.titulo || "", "pt-BR"
                );
            }

            if (ordenacao === "antigos") {
                return dataReferencia(a) - dataReferencia(b);
            }

            return dataReferencia(b) - dataReferencia(a);
        });

        if (quantidadePostsFiltrados) {
            quantidadePostsFiltrados.textContent =
                `${filtrados.length} de ${todosPostsAdmin.length} artigos`;
        }

        if (filtrados.length === 0) {
            listaPostsAdmin.innerHTML = `
                <div class="empty-posts">
                    <i data-lucide="inbox"></i>
                    <p>Nenhum artigo encontrado.</p>
                </div>
            `;

            renderizarIcones();
            return;
        }

        listaPostsAdmin.innerHTML = `
            <div class="admin-posts-table-wrapper">
                <table class="admin-posts-table">
                    <thead>

<tr>
    <th>Artigo</th>
    <th>Status</th>
    <th>Publicação</th>
    <th>Agendamento</th>
    <th>Última edição</th>
    <th>Ações</th>
</tr>

                    </thead>

                    <tbody>
                        ${filtrados.map(post => {
            const id = Number(post.id);
            const status = obterStatusAdmin(post);

            const dataPublicacao =
                post.status === "agendado"
                    ? post.agendado_para
                    : post.status === "publicado"
                        ? post.publicado_em
                        : null;

            return `
                                <tr>
                                    <td>
                                        <strong class="admin-post-title">
                                            ${escaparHtmlAdmin(
                post.titulo || "Sem título"
            )}
                                        </strong>

                                        <span class="admin-post-category">
                                            ${escaparHtmlAdmin(
                String(post.categoria || "Sem categoria")
            )}
                                        </span>
                                    </td>

                                    <td>
                                        <span class="post-status ${status.classe}">
                                            ${escaparHtmlAdmin(status.texto)}
                                        </span>
                                    </td>

<td>
    ${mostrarData(
                post.status === "publicado"
                    ? post.publicado_em
                    : null
            )}
</td>

<td>
    ${mostrarData(
                post.status === "agendado"
                    ? post.agendado_para
                    : null
            )}
</td>
<td>
    ${mostrarData(post.atualizado_em)}
</td>

<td>
    <div class="admin-post-actions">
                                            <button
                                                type="button"
                                                class="admin-post-action-btn"
                                                onclick="prepararEdicao(${id})"
                                                title="Editar artigo"
                                                aria-label="Editar artigo"
                                            >
                                                <i data-lucide="pencil"></i>
                                            </button>

                                            
<button
    type="button"
    class="admin-post-action-btn visualizar"
    onclick="visualizarPostAdmin(${id})"
    title="Visualizar artigo"
    aria-label="Visualizar artigo"
>
    <i data-lucide="eye"></i>
</button>


                                            <button
                                                type="button"
                                                class="admin-post-action-btn excluir"
                                                onclick="confirmarExclusaoPost(${id})"
                                                title="Excluir artigo"
                                                aria-label="Excluir artigo"
                                            >
                                                <i data-lucide="trash-2"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
        }).join("")}
                    </tbody>
                </table>
            </div>
        `;

        renderizarIcones();
    }

    // Conecta os filtros uma única vez.
    if (!listaPostsAdmin.dataset.filtrosAtivos) {
        pesquisaPostsAdmin?.addEventListener(
            "input", () => atualizarTabela()
        );

        filtroStatusPostsAdmin?.addEventListener(
            "change", () => atualizarTabela()
        );

        ordenacaoPostsAdmin?.addEventListener(
            "change", () => atualizarTabela()
        );

        listaPostsAdmin.dataset.filtrosAtivos = "true";
    }

    // Disponibiliza a atualização para os filtros.
    listaPostsAdmin.atualizarTabela = atualizarTabela;

    atualizarTabela();
}



/* =========================================================
   GERENCIADOR - VISUALIZAR ARTIGO
========================================================= */

function visualizarPostAdmin(id) {
    const post = todosPostsAdmin.find(
        artigo => Number(artigo.id) === Number(id)
    );

    if (!post) {
        alert("Artigo não encontrado.");
        return;
    }

    if (post.status !== "publicado") {
        alert(
            "Este artigo ainda não está publicado. " +
            "Use a opção Editar para visualizar seu conteúdo."
        );
        return;
    }

    // Usa o identificador de URL, quando disponível.
    if (!post.slug) {
        alert(
            "Não foi possível identificar o endereço público " +
            "deste artigo."
        );
        return;
    }

    const url = `/artigos/${encodeURIComponent(post.slug)}`;

    window.open(url, "_blank", "noopener,noreferrer");
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
   DASHBOARD - PRÓXIMAS PUBLICAÇÕES
========================================================= */

function renderizarProximasPublicacoes(posts) {

    const lista = document.getElementById(
        "listaProximasPublicacoes"
    );

    if (!lista) return;

    const agendados = posts
        .filter(post =>
            post.status === "agendado" &&
            post.agendado_para &&
            !Number.isNaN(
                new Date(post.agendado_para).getTime()
            ) &&
            new Date(post.agendado_para).getTime() > Date.now()
        )
        .sort((a, b) =>
            new Date(a.agendado_para) -
            new Date(b.agendado_para)
        )
        .slice(0, 5);

    if (agendados.length === 0) {

        lista.innerHTML = `
            <div class="admin-empty-state">
                <i data-lucide="calendar-check"></i>

                <strong>Nenhuma publicação agendada</strong>

                <span>
                    Quando você agendar um artigo,
                    ele aparecerá aqui.
                </span>
            </div>
        `;

        renderizarIcones();
        return;
    }

    lista.innerHTML = agendados.map(post => `

        <article class="admin-recent-post-item">

            <div class="admin-recent-post-main">

                <span class="post-status status-agendado">
                    Agendado
                </span>

                <h3>
                    ${escaparHtmlAdmin(post.titulo || "Sem título")}
                </h3>

                <p>
                    Publicação prevista:
                    ${escaparHtmlAdmin(
        formatarDataAdmin(post.agendado_para)
    )}
                    (Brasília)
                </p>

            </div>

            <div class="admin-recent-post-actions">

                <button
                    type="button"
                    class="admin-recent-edit"
                    onclick="prepararEdicao(${Number(post.id)})"
                >
                    <i data-lucide="pencil"></i>
                    Editar
                </button>

            </div>

        </article>

    `).join("");

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


        // DASHBOARD INTELIGENTE - CONTADORES DE ARTIGOS

        const quantidadePublicados = posts.filter(
            post => post.status === "publicado"
        ).length;

        const quantidadeAgendados = posts.filter(
            post => post.status === "agendado"
        ).length;

        if (totalPosts) {
            totalPosts.textContent = posts.length;
        }

        const totalPublicados = document.getElementById("totalPublicados");
        const totalAgendados = document.getElementById("totalAgendados");

        if (totalPublicados) {
            totalPublicados.textContent = quantidadePublicados;
        }

        if (totalAgendados) {
            totalAgendados.textContent = quantidadeAgendados;
        }


        renderizarPostsAdmin(
            posts
        );


        renderizarPostsRecentes(
            posts
        );

        renderizarProximasPublicacoes(
            posts
        );

        renderizarCalendarioEditorial(posts);

    } catch (error) {

        console.error(
            "Erro ao carregar posts:",
            error
        );


        if (totalPosts) {

            totalPosts.textContent =
                "—";

        }

        // DASHBOARD - LIMPAR INDICADORES EM CASO DE ERRO

        const totalPublicados = document.getElementById("totalPublicados");
        const totalAgendados = document.getElementById("totalAgendados");

        if (totalPublicados) {
            totalPublicados.textContent = "—";
        }

        if (totalAgendados) {
            totalAgendados.textContent = "—";
        }

        // DASHBOARD - ERRO NA AGENDA EDITORIAL

        const listaProximasPublicacoes = document.getElementById(
            "listaProximasPublicacoes"
        );

        if (listaProximasPublicacoes) {
            listaProximasPublicacoes.innerHTML = `
        <div class="admin-empty-state">
            <i data-lucide="circle-alert"></i>

            <strong>Não foi possível carregar a agenda</strong>

            <span>
                Atualize a página e tente novamente.
            </span>
        </div>
    `;
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


function obterPartesDataBrasilia(data) {

    const partes = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        }
    ).formatToParts(data);

    return Object.fromEntries(
        partes.map(parte => [parte.type, parte.value])
    );

}


function converterHorarioBrasiliaParaISO(valor) {

    if (!valor) return null;

    const resultado =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(valor);

    if (!resultado) return null;

    const [, ano, mes, dia, hora, minuto] = resultado.map(Number);

    const utcBase = Date.UTC(ano, mes - 1, dia, hora, minuto);
    let instante = utcBase;

    for (let tentativa = 0; tentativa < 3; tentativa++) {

        const partes = obterPartesDataBrasilia(new Date(instante));

        const horarioBrasiliaComoUTC = Date.UTC(
            Number(partes.year),
            Number(partes.month) - 1,
            Number(partes.day),
            Number(partes.hour),
            Number(partes.minute),
            Number(partes.second)
        );

        instante += utcBase - horarioBrasiliaComoUTC;

    }

    const conferencia = obterPartesDataBrasilia(new Date(instante));

    const horarioConferido =
        `${conferencia.year}-${conferencia.month}-${conferencia.day}` +
        `T${conferencia.hour}:${conferencia.minute}`;

    if (horarioConferido !== valor) return null;

    return new Date(instante).toISOString();

}


function converterParaDatetimeLocal(data) {

    if (!data) return "";

    const dataObjeto = new Date(data);

    if (Number.isNaN(dataObjeto.getTime())) return "";

    const partes = obterPartesDataBrasilia(dataObjeto);

    return (
        `${partes.year}-${partes.month}-${partes.day}T` +
        `${partes.hour}:${partes.minute}`
    );

}



/* =========================================================
   PREPARAR EDIÇÃO
========================================================= */


/* =========================================================
   PREPARAR EDIÇÃO
========================================================= */

async function prepararEdicao(id) {

    const tokenAdmin = obterTokenAdmin();

    if (!tokenAdmin) {
        mostrarToast(
            "Sua sessão administrativa expirou. Faça login novamente.",
            "error"
        );
        return;
    }

    try {

        // Primeiro procura nos artigos já carregados no painel.
        let post = todosPostsAdmin.find(
            item => Number(item.id) === Number(id)
        );

        // Se não estiver na memória, consulta a lista administrativa.
        if (!post) {

            const resposta = await fetch(
                "/posts/admin/todos",
                {
                    headers: {
                        Authorization: `Bearer ${tokenAdmin}`
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível carregar o artigo."
                );
            }

            const resultado = await resposta.json();

            const posts = Array.isArray(resultado)
                ? resultado
                : Array.isArray(resultado.posts)
                    ? resultado.posts
                    : [];

            post = posts.find(
                item => Number(item.id) === Number(id)
            );
        }

        if (!post) {
            throw new Error("Artigo não encontrado.");
        }

        // Abre o editor somente depois de encontrar o artigo.
        abrirPaginaAdmin("criar-post");

        // Mantém o ID para salvar por PUT, sem criar outro artigo.
        postEditandoId = Number(post.id);

        if (titulo) {
            titulo.value = post.titulo || "";
        }

        if (categoria) {
            categoria.value = post.categoria || "";
        }

        if (imagem) {
            imagem.value = post.imagem || "";
        }

        if (imagemArquivo) {
            imagemArquivo.value = "";
        }

        if (statusUploadImagem) {
            statusUploadImagem.textContent = "";
        }

        setarConteudoEditor(
            "fontes",
            post.fontes || ""
        );

        setarConteudoEditor(
            "resumo",
            post.resumo || ""
        );

        setarConteudoEditor(
            "conteudo",
            post.conteudo || ""
        );

        if (statusPost) {
            statusPost.value =
                post.status === "agendado"
                    ? "agendado"
                    : "publicado";
        }

        if (agendadoPara) {
            agendadoPara.value =
                post.status === "agendado"
                    ? converterParaDatetimeLocal(
                        post.agendado_para
                    )
                    : "";
        }

        controlarAgendamento();
        atualizarPreview();

        const botao = formPost
            ? formPost.querySelector(".btn-publicar")
            : null;

        if (botao) {
            botao.disabled = false;
            botao.classList.remove("is-loading");

            botao.innerHTML = `
                <i data-lucide="save"></i>
                Salvar alterações
            `;
        }

        renderizarIcones();

        setTimeout(() => {
            if (formPost) {
                formPost.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
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
   CONFIRMAR EXCLUSÃO DO POST
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
        "login.html"
}


/* =========================================================
   PÁGINA INICIAL DO PAINEL
========================================================= */

function definirPaginaInicialAdmin() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();


    /*
       IMPORTANTE:
       "parcerias" foi incluída aqui para permitir:
       admin.html#parcerias
    */

    const paginasPermitidas = [

        "dashboard",

        "criar-post",

        "posts",

        "parcerias",

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
   PARCERIAS - PAINEL ADMINISTRATIVO
========================================================= */


/* =========================================================
   NOMES DOS STATUS
========================================================= */

function obterNomeStatusParceria(status) {

    const nomes = {

        nova:
            "Nova",

        em_analise:
            "Em análise",

        respondida:
            "Respondida",

        fechada:
            "Fechada",

        recusada:
            "Recusada"

    };


    return nomes[status] || "Nova";

}


/* =========================================================
   VALIDAR CLASSE DO STATUS
========================================================= */

function obterClasseStatusParceria(status) {

    const permitidos = [

        "nova",

        "em_analise",

        "respondida",

        "fechada",

        "recusada"

    ];


    return permitidos.includes(status)
        ? status
        : "nova";

}


/* =========================================================
   WHATSAPP
========================================================= */

function montarLinkWhatsAppParceria(numero) {

    const somenteNumeros =
        String(numero || "")
            .replace(
                /\D/g,
                ""
            );


    if (!somenteNumeros) {

        return "";

    }


    /*
        Se o número possuir até 11 dígitos,
        consideramos um número brasileiro
        sem o código do país.

        Exemplo:

        17999999999

        vira:

        5517999999999
    */

    const numeroCompleto =
        somenteNumeros.length <= 11
            ? `55${somenteNumeros}`
            : somenteNumeros;


    return (
        `https://wa.me/${numeroCompleto}`
    );

}


/* =========================================================
   CONTADORES
========================================================= */

function atualizarContadoresParcerias(
    lista = []
) {

    const total =
        lista.length;


    const novas =
        lista.filter(
            parceria =>
                parceria.status ===
                "nova"
        ).length;


    const emAnalise =
        lista.filter(
            parceria =>
                parceria.status ===
                "em_analise"
        ).length;


    const fechadas =
        lista.filter(
            parceria =>
                parceria.status ===
                "fechada"
        ).length;


    /*
       CONTADOR DO DASHBOARD
    */

    if (totalParceriasNovas) {

        totalParceriasNovas.textContent =
            novas;

    }


    /*
       CONTADORES DA PÁGINA
       PARCERIAS
    */

    if (parceriasTotal) {

        parceriasTotal.textContent =
            total;

    }


    if (parceriasNovas) {

        parceriasNovas.textContent =
            novas;

    }


    if (parceriasAnalise) {

        parceriasAnalise.textContent =
            emAnalise;

    }


    if (parceriasFechadas) {

        parceriasFechadas.textContent =
            fechadas;

    }

}


/* =========================================================
   RENDERIZAR PARCERIAS
========================================================= */

function renderizarParceriasAdmin(
    lista = []
) {

    if (!listaParceriasAdmin) {

        return;

    }


    /*
       GARANTIR ARRAY
    */

    if (!Array.isArray(lista)) {

        lista = [];

    }


    /*
       ATUALIZAR CONTADORES
    */

    atualizarContadoresParcerias(
        lista
    );


    /*
       LISTA VAZIA
    */

    if (lista.length === 0) {

        listaParceriasAdmin.innerHTML = `

            <div class="admin-empty-state">

                <i data-lucide="inbox"></i>

                <strong>
                    Nenhuma proposta recebida
                </strong>

                <span>
                    Quando uma nova proposta de parceria for enviada,
                    ela aparecerá aqui.
                </span>

            </div>

        `;


        renderizarIcones();


        return;

    }


    /* =====================================================
       GERAR CARDS
    ===================================================== */

    listaParceriasAdmin.innerHTML =
        lista
            .map(
                parceria => {

                    const id =
                        Number(
                            parceria.id
                        );


                    const nome =
                        escaparHtmlAdmin(
                            parceria.nome
                        );


                    const empresa =
                        escaparHtmlAdmin(
                            parceria.empresa
                        );


                    const email =
                        escaparHtmlAdmin(
                            parceria.email
                        );


                    const whatsapp =
                        escaparHtmlAdmin(
                            parceria.whatsapp ||
                            "Não informado"
                        );


                    const tipo =
                        escaparHtmlAdmin(
                            parceria.tipo
                        );


                    const mensagem =
                        escaparHtmlAdmin(
                            parceria.mensagem
                        );


                    const status =
                        obterClasseStatusParceria(
                            parceria.status
                        );


                    const data =
                        formatarDataAdmin(
                            parceria.criado_em
                        );


                    const linkWhatsApp =
                        montarLinkWhatsAppParceria(
                            parceria.whatsapp
                        );


                    const emailEnviado =
                        parceria.email_enviado ===
                        true;


                    /* =====================================
                       CARD
                    ===================================== */

                    return `

                        <article
                            class="parceria-admin-card"
                            data-parceria-id="${id}"
                        >


                            <!-- =========================
                                 CABEÇALHO
                            ========================== -->

                            <div class="parceria-admin-top">


                                <div class="parceria-admin-identidade">


                                    <span
                                        class="
                                            parceria-status
                                            ${status}
                                        "
                                    >
                                        ${obterNomeStatusParceria(
                        status
                    )}
                                    </span>


                                    <h3>
                                        ${nome}
                                    </h3>


                                    <p>
                                        ${empresa}
                                    </p>


                                </div>


                                <div class="parceria-admin-data">

                                    <i data-lucide="calendar-days"></i>

                                    <span>
                                        ${escaparHtmlAdmin(
                        data ||
                        "Data não informada"
                    )}
                                    </span>

                                </div>


                            </div>


                            <!-- =========================
                                 INFORMAÇÕES
                            ========================== -->

                            <div class="parceria-admin-grid">


                                <div class="parceria-admin-info">

                                    <span>
                                        E-mail
                                    </span>

                                    <strong>
                                        ${email}
                                    </strong>

                                </div>


                                <div class="parceria-admin-info">

                                    <span>
                                        WhatsApp
                                    </span>

                                    <strong>
                                        ${whatsapp}
                                    </strong>

                                </div>


                                <div class="parceria-admin-info">

                                    <span>
                                        Tipo de parceria
                                    </span>

                                    <strong>
                                        ${tipo}
                                    </strong>

                                </div>


                                <div class="parceria-admin-info">

                                    <span>
                                        Aviso por e-mail
                                    </span>

                                    <strong
                                        class="
                                            parceria-email-status
                                            ${emailEnviado
                            ? "enviado"
                            : "pendente"
                        }
                                        "
                                    >

                                        ${emailEnviado
                            ? "Enviado"
                            : "Não enviado"
                        }

                                    </strong>

                                </div>


                            </div>


                            <!-- =========================
                                 MENSAGEM
                            ========================== -->

                            <div class="parceria-admin-mensagem">

                                <span>
                                    Mensagem
                                </span>

                                <p>
                                    ${mensagem}
                                </p>

                            </div>


                            <!-- =========================
                                 RODAPÉ
                            ========================== -->

                            <div class="parceria-admin-footer">


                                <!-- STATUS -->

                                <div class="parceria-status-control">


                                    <label
                                        for="statusParceria-${id}"
                                    >
                                        Status
                                    </label>


                                    <select
                                        id="statusParceria-${id}"
                                        onchange="
                                            alterarStatusParceria(
                                                ${id},
                                                this.value
                                            )
                                        "
                                    >


                                        <option
                                            value="nova"
                                            ${status ===
                            "nova"
                            ? "selected"
                            : ""
                        }
                                        >
                                            Nova
                                        </option>


                                        <option
                                            value="em_analise"
                                            ${status ===
                            "em_analise"
                            ? "selected"
                            : ""
                        }
                                        >
                                            Em análise
                                        </option>


                                        <option
                                            value="respondida"
                                            ${status ===
                            "respondida"
                            ? "selected"
                            : ""
                        }
                                        >
                                            Respondida
                                        </option>


                                        <option
                                            value="fechada"
                                            ${status ===
                            "fechada"
                            ? "selected"
                            : ""
                        }
                                        >
                                            Fechada
                                        </option>


                                        <option
                                            value="recusada"
                                            ${status ===
                            "recusada"
                            ? "selected"
                            : ""
                        }
                                        >
                                            Recusada
                                        </option>


                                    </select>


                                </div>


                                <!-- AÇÕES -->

                                <div class="parceria-admin-actions">


                                    <!-- E-MAIL -->

                                    <a
                                        href="mailto:${email}"
                                        class="parceria-action-button"
                                    >

                                        <i data-lucide="mail"></i>

                                        E-mail

                                    </a>


                                    <!-- WHATSAPP -->

                                    ${linkWhatsApp
                            ? `

                                                <a
                                                    href="${linkWhatsApp}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="parceria-action-button"
                                                >

                                                    <i data-lucide="message-circle"></i>

                                                    WhatsApp

                                                </a>

                                            `
                            : ""
                        }


                                    <!-- EXCLUIR -->

                                    <button
                                        type="button"
                                        class="
                                            parceria-action-button
                                            danger
                                        "
                                        onclick="
                                            confirmarExclusaoParceria(
                                                ${id}
                                            )
                                        "
                                    >

                                        <i data-lucide="trash-2"></i>

                                        Excluir

                                    </button>


                                </div>


                            </div>


                        </article>

                    `;

                }
            )
            .join("");


    renderizarIcones();

}

/* =========================================================
   CARREGAR PARCERIAS
========================================================= */

async function carregarParceriasAdmin() {

    if (!listaParceriasAdmin) {

        return;

    }


    const tokenAdmin =
        obterTokenAdmin();


    /* =====================================================
       SEM TOKEN
    ===================================================== */

    if (!tokenAdmin) {

        atualizarContadoresParcerias(
            []
        );


        return;

    }


    /* =====================================================
       LOADING
    ===================================================== */

    listaParceriasAdmin.innerHTML = `
        <div class="admin-empty-state">

            <i data-lucide="loader-circle"></i>

            <strong>
                Carregando propostas...
            </strong>

            <span>
                Aguarde enquanto buscamos as parcerias.
            </span>

        </div>
    `;


    renderizarIcones();


    try {


        /* =================================================
           API
        ================================================= */

        const resposta =
            await fetch(
                "/parcerias",
                {

                    method:
                        "GET",

                    headers: {

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    }

                }
            );


        /* =================================================
           TOKEN INVÁLIDO
        ================================================= */

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            localStorage.removeItem(
                "tokenAdmin"
            );


            window.location.href =
                "login.html"

            return;

        }


        const resultado =
            await resposta
                .json()
                .catch(
                    () => []
                );


        /* =================================================
           ERRO DA API
        ================================================= */

        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                resultado.erro ||
                "Não foi possível carregar as propostas."
            );

        }


        /* =================================================
           ACEITAR DOIS FORMATOS

           [
             {...}
           ]

           OU

           {
             parcerias: [...]
           }
        ================================================= */

        const lista =
            Array.isArray(resultado)
                ? resultado
                : Array.isArray(
                    resultado.parcerias
                )
                    ? resultado.parcerias
                    : [];


        renderizarParceriasAdmin(
            lista
        );


    } catch (erro) {


        console.error(
            "Erro ao carregar parcerias:",
            erro
        );


        atualizarContadoresParcerias(
            []
        );


        listaParceriasAdmin.innerHTML = `
            <div class="admin-empty-state">

                <i data-lucide="triangle-alert"></i>

                <strong>
                    Não foi possível carregar as propostas
                </strong>

                <span>
                    ${escaparHtmlAdmin(
            erro.message ||
            "Tente novamente em instantes."
        )}
                </span>

            </div>
        `;


        renderizarIcones();

    }

}


/* =========================================================
   ALTERAR STATUS
========================================================= */

async function alterarStatusParceria(
    id,
    novoStatus
) {

    const tokenAdmin =
        obterTokenAdmin();


    /* =====================================================
       VERIFICAR LOGIN
    ===================================================== */

    if (!tokenAdmin) {

        window.location.href =
            "login.html";


        return;

    }


    /* =====================================================
       STATUS PERMITIDOS
    ===================================================== */

    const permitidos = [

        "nova",

        "em_analise",

        "respondida",

        "fechada",

        "recusada"

    ];


    if (
        !permitidos.includes(
            novoStatus
        )
    ) {

        mostrarToast(
            "Status de parceria inválido.",
            "error"
        );


        return;

    }


    try {


        /* =================================================
           API
        ================================================= */

        const resposta =
            await fetch(
                `/parcerias/${id}/status`,
                {

                    method:
                        "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${tokenAdmin}`

                    },

                    body:
                        JSON.stringify({

                            status:
                                novoStatus

                        })

                }
            );


        const resultado =
            await resposta
                .json()
                .catch(
                    () => ({})
                );


        /* =================================================
           LOGIN EXPIRADO
        ================================================= */

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            localStorage.removeItem(
                "tokenAdmin"
            );


            window.location.href =
                "login.html";


            return;

        }


        /* =================================================
           ERRO
        ================================================= */

        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                resultado.erro ||
                "Não foi possível alterar o status."
            );

        }


        /* =================================================
           SUCESSO
        ================================================= */

        mostrarToast(
            "Status da parceria atualizado com sucesso."
        );


        await carregarParceriasAdmin();


    } catch (erro) {


        console.error(
            "Erro ao alterar status da parceria:",
            erro
        );


        mostrarToast(
            erro.message ||
            "Não foi possível alterar o status.",
            "error"
        );


        /*
            Recarregamos para devolver o select
            ao valor verdadeiro do banco.
        */

        await carregarParceriasAdmin();

    }

}


/* =========================================================
   CONFIRMAR EXCLUSÃO
========================================================= */

function confirmarExclusaoParceria(id) {

    abrirModalConfirmacao(

        "Deseja realmente excluir esta proposta de parceria? Esta ação não poderá ser desfeita.",

        async () => {

            await excluirParceria(
                id
            );

        }

    );

}


/* =========================================================
   EXCLUIR PARCERIA
========================================================= */

async function excluirParceria(id) {

    const tokenAdmin =
        obterTokenAdmin();


    /* =====================================================
       VERIFICAR LOGIN
    ===================================================== */

    if (!tokenAdmin) {

        window.location.href =
            "login.html";


        return;

    }


    try {


        /* =================================================
           API
        ================================================= */

        const resposta =
            await fetch(
                `/parcerias/${id}`,
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
                .catch(
                    () => ({})
                );


        /* =================================================
           LOGIN EXPIRADO
        ================================================= */

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            localStorage.removeItem(
                "tokenAdmin"
            );


            window.location.href =
                "login.html";


            return;

        }


        /* =================================================
           ERRO
        ================================================= */

        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                resultado.erro ||
                "Não foi possível excluir a proposta."
            );

        }


        /* =================================================
           SUCESSO
        ================================================= */

        mostrarToast(
            "Proposta de parceria excluída com sucesso."
        );


        await carregarParceriasAdmin();


    } catch (erro) {


        console.error(
            "Erro ao excluir parceria:",
            erro
        );


        mostrarToast(
            erro.message ||
            "Não foi possível excluir a proposta.",
            "error"
        );

    }

}


/* =========================================================
   BOTÃO ATUALIZAR
========================================================= */

if (btnAtualizarParcerias) {

    btnAtualizarParcerias.addEventListener(
        "click",
        async () => {

            await carregarParceriasAdmin();

        }
    );

}




/* ==========================================
   PSIFÁCIL - CALENDÁRIO EDITORIAL
========================================== */

let postsCalendarioEditorial = [];
let mesCalendarioEditorial = null;
let dataSelecionadaCalendario = null;

const fusoCalendario = "America/Sao_Paulo";

const formatadorPartesCalendario = new Intl.DateTimeFormat(
    "en-US",
    {
        timeZone: fusoCalendario,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }
);

const formatadorHoraCalendario = new Intl.DateTimeFormat(
    "pt-BR",
    {
        timeZone: fusoCalendario,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }
);

function chaveDataCalendario(valor) {
    if (!valor) return null;

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return null;

    const partes = formatadorPartesCalendario.formatToParts(data);
    const obter = tipo =>
        partes.find(parte => parte.type === tipo)?.value;

    return `${obter("year")}-${obter("month")}-${obter("day")}`;
}

function hojeCalendarioEditorial() {
    return chaveDataCalendario(new Date());
}

function escaparTextoCalendario(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caractere]));
}

function formatarChaveCalendario(data) {
    const [ano, mes, dia] = data.split("-").map(Number);

    return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(Date.UTC(ano, mes - 1, dia)));
}

function eventosCalendarioEditorial() {
    const eventos = new Map();

    postsCalendarioEditorial.forEach(post => {
        let data = null;

        if (post.status === "agendado") {
            data = chaveDataCalendario(post.agendado_para);
        } else if (post.status === "publicado") {
            data = chaveDataCalendario(post.publicado_em);
        }

        if (!data) return;

        if (!eventos.has(data)) {
            eventos.set(data, []);
        }

        eventos.get(data).push(post);
    });

    return eventos;
}

function renderizarCalendarioEditorial(posts) {
    postsCalendarioEditorial = Array.isArray(posts) ? posts : [];

    const hoje = hojeCalendarioEditorial();

    if (!mesCalendarioEditorial) {
        mesCalendarioEditorial = hoje.slice(0, 7);
    }

    if (!dataSelecionadaCalendario) {
        dataSelecionadaCalendario = hoje;
    }

    desenharCalendarioEditorial();
}

function desenharCalendarioEditorial() {
    const grade = document.getElementById("calendarioDias");
    const titulo = document.getElementById("calendarioMesAno");

    if (!grade || !titulo || !mesCalendarioEditorial) return;

    const [ano, mes] = mesCalendarioEditorial.split("-").map(Number);
    const primeiroDia = new Date(Date.UTC(ano, mes - 1, 1));
    const deslocamento = primeiroDia.getUTCDay();
    const quantidadeDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();

    titulo.textContent = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(primeiroDia);

    const eventos = eventosCalendarioEditorial();
    const hoje = hojeCalendarioEditorial();

    
    /* ==========================================
       RESUMO MENSAL DO CALENDÁRIO
    ========================================== */

    let publicadosNoMes = 0;
    let agendadosNoMes = 0;

    eventos.forEach((artigos, data) => {

        // Considerar apenas o mês exibido.
        if (!data.startsWith(mesCalendarioEditorial + "-")) {
            return;
        }

        artigos.forEach(post => {

            if (post.status === "publicado") {
                publicadosNoMes++;
            }

            if (post.status === "agendado") {
                agendadosNoMes++;
            }

        });

    });

    // Atualizar os indicadores do HTML.
    const indicadorPublicados = document.getElementById(
        "calendarioTotalPublicados"
    );

    const indicadorAgendados = document.getElementById(
        "calendarioTotalAgendados"
    );

    if (indicadorPublicados) {
        indicadorPublicados.textContent = publicadosNoMes;
    }

    if (indicadorAgendados) {
        indicadorAgendados.textContent = agendadosNoMes;
    }

    
    grade.innerHTML = "";

    for (let i = 0; i < deslocamento; i++) {
        const vazio = document.createElement("div");
        vazio.setAttribute("aria-hidden", "true");
        grade.appendChild(vazio);
    }

    for (let dia = 1; dia <= quantidadeDias; dia++) {
        const chave = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        const artigos = eventos.get(chave) || [];

        const publicados = artigos.filter(
            post => post.status === "publicado"
        ).length;

        const agendados = artigos.filter(
            post => post.status === "agendado"
        ).length;

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "calendario-dia";

        if (chave === hoje) botao.classList.add("hoje");

        if (chave === dataSelecionadaCalendario) {
            botao.classList.add("selecionado");
        }

        botao.setAttribute(
            "aria-label",
            `${formatarChaveCalendario(chave)}, ${artigos.length} artigos`
        );

        botao.setAttribute(
            "aria-pressed",
            String(chave === dataSelecionadaCalendario)
        );

        botao.innerHTML = `
            <span class="calendario-dia-numero">${dia}</span>

            <span class="calendario-dia-eventos">
                ${publicados ? '<i class="calendario-ponto publicado"></i>' : ""}
                ${agendados ? '<i class="calendario-ponto agendado"></i>' : ""}
            </span>

            ${artigos.length
                ? `<span class="calendario-dia-contagem">
                    ${artigos.length} ${artigos.length === 1 ? "artigo" : "artigos"}
                   </span>`
                : ""}
        `;

        botao.addEventListener("click", () => {
            dataSelecionadaCalendario = chave;
            desenharCalendarioEditorial();
        });

        grade.appendChild(botao);
    }

    mostrarArtigosDiaCalendario(eventos);
}

function mostrarArtigosDiaCalendario(eventos) {
    const titulo = document.getElementById("calendarioDataSelecionada");
    const lista = document.getElementById("calendarioArtigosDia");

    if (!titulo || !lista || !dataSelecionadaCalendario) return;

    titulo.textContent = formatarChaveCalendario(
        dataSelecionadaCalendario
    );

    const artigos = eventos.get(dataSelecionadaCalendario) || [];

    if (!artigos.length) {
        lista.innerHTML = `
            <p>Nenhuma publicação encontrada nesta data.</p>
        `;
        return;
    }

    lista.innerHTML = "";

    artigos.forEach(post => {
        const agendado = post.status === "agendado";
        const valorData = agendado
            ? post.agendado_para
            : post.publicado_em;

        const hora = formatadorHoraCalendario.format(
            new Date(valorData)
        );

        const item = document.createElement("div");
        item.className = "calendario-artigo";

        item.innerHTML = `
            <div class="calendario-artigo-info">
                <strong>${escaparTextoCalendario(post.titulo)}</strong>
                <span>
                    ${agendado ? "Agendado" : "Publicado"}
                    • ${hora} (Brasília)
                </span>
            </div>

            <div class="calendario-artigo-acoes">
                <button type="button">
                    Editar artigo
                </button>
            </div>
        `;

        item.querySelector("button").addEventListener("click", () => {
            if (typeof prepararEdicao === "function") {
                prepararEdicao(post.id);
            }
        });

        lista.appendChild(item);
    });
}

function mudarMesCalendario(diferenca) {
    if (!mesCalendarioEditorial) return;

    const [ano, mes] = mesCalendarioEditorial.split("-").map(Number);
    const novoMes = new Date(Date.UTC(ano, mes - 1 + diferenca, 1));

    mesCalendarioEditorial = [
        novoMes.getUTCFullYear(),
        String(novoMes.getUTCMonth() + 1).padStart(2, "0")
    ].join("-");

    dataSelecionadaCalendario = `${mesCalendarioEditorial}-01`;

    desenharCalendarioEditorial();
}

document.getElementById("calendarioMesAnterior")
    ?.addEventListener("click", () => mudarMesCalendario(-1));

document.getElementById("calendarioProximoMes")
    ?.addEventListener("click", () => mudarMesCalendario(1));

document.getElementById("calendarioHoje")
    ?.addEventListener("click", () => {
        dataSelecionadaCalendario = hojeCalendarioEditorial();
        mesCalendarioEditorial = dataSelecionadaCalendario.slice(0, 7);
        desenharCalendarioEditorial();
    });




/* =========================================================
   GARANTIR FUNÇÕES PARA ONCLICK
========================================================= */

/*
   Os cards são criados dinamicamente.

   Por isso as funções usadas em onclick/onchange
   precisam ficar disponíveis no window.
*/


/* POSTS */

window.prepararEdicao =
    prepararEdicao;

window.confirmarExclusaoPost =
    confirmarExclusaoPost;

window.excluirPost =
    excluirPost;


/* PARCERIAS */

window.alterarStatusParceria =
    alterarStatusParceria;

window.confirmarExclusaoParceria =
    confirmarExclusaoParceria;

window.excluirParceria =
    excluirParceria;


/* PAINEL */

window.sairAdmin =
    sairAdmin;

window.abrirPaginaAdmin =
    abrirPaginaAdmin;





/* ==========================================
   CRIAR ARTIGO A PARTIR DO CALENDÁRIO
========================================== */


function criarArtigoPeloCalendario() {

    if (!dataSelecionadaCalendario) {
        mostrarToast("Selecione uma data no calendário.");
        return;
    }

    // Garantir que estamos criando um novo artigo.
    postEditandoId = null;


    const formulario = document.getElementById("formPost");

    // Limpar os campos sem disparar o evento "reset",
    // que apagaria o agendamento escolhido no calendário.
    if (titulo) {
        titulo.value = "";
    }

    if (categoria) {
        categoria.value = "";
    }

    if (imagemArquivo) {
        imagemArquivo.value = "";
    }

    if (statusPost) {
        statusPost.value = "publicado";
    }

    if (agendadoPara) {
        agendadoPara.value = "";
    }


    // Limpar os editores de texto.
    if (typeof tinymce !== "undefined") {
        ["fontes", "resumo", "conteudo"].forEach(id => {
            const editor = tinymce.get(id);

            if (editor) {
                editor.setContent("");
            }
        });
    }

    // Limpar imagem anterior.
    const campoImagem = document.getElementById("imagem");

    if (campoImagem) {
        campoImagem.value = "";
    }

    const statusUpload = document.getElementById(
        "statusUploadImagem"
    );

    if (statusUpload) {
        statusUpload.textContent = "";
    }

    // Restaurar botão de criação.
    const botaoPublicar = formulario?.querySelector(
        'button[type="submit"]'
    );

    if (botaoPublicar) {
        botaoPublicar.innerHTML = `
            <i data-lucide="send"></i>
            Publicar artigo
        `;
    }

    // Abrir a página Criar artigo.
    abrirPaginaAdmin("criar-post");

    // Localizar os campos do formulário.
    const campoStatus = document.getElementById("status");
    const campoData = document.getElementById("agendadoPara");
    const grupoAgendamento = document.getElementById(
        "grupoAgendamento"
    );

    // Selecionar Agendar publicação.
    if (campoStatus) {
        campoStatus.value = "agendado";

        campoStatus.dispatchEvent(
            new Event("change", { bubbles: true })
        );
    }

    // Atualizar a visibilidade do agendamento.
    if (typeof controlarAgendamento === "function") {
        controlarAgendamento();
    }

    if (grupoAgendamento) {
        grupoAgendamento.style.display = "";
    }

    // Preencher a data escolhida no calendário.
    // 09:00 é apenas um horário sugerido.
    if (campoData) {
        campoData.value =
            `${dataSelecionadaCalendario}T09:00`;

        campoData.dispatchEvent(
            new Event("change", { bubbles: true })
        );
    }

    // Atualizar a prévia.
    if (typeof atualizarPreview === "function") {
        atualizarPreview();
    }

    renderizarIcones();
}

document.getElementById("btnCriarArtigoCalendario")
    ?.addEventListener("click", criarArtigoPeloCalendario);

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
            "login.html"
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
       DADOS DO PAINEL
    ------------------------- */

    await Promise.allSettled([

        carregarPostsAdmin(),

        carregarTotalLeadsAdmin(),

        carregarParceriasAdmin()

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