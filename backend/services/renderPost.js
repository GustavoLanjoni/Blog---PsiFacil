
const sanitizeHtml = require("sanitize-html");

/* =====================================================
   PSIFÁCIL — FUNÇÕES AUXILIARES
===================================================== */

function escaparHtml(valor = "") {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =====================================================
   SANITIZAÇÃO DO HTML DO TINYMCE
===================================================== */

function sanitizarConteudoHtml(html = "") {
    return sanitizeHtml(String(html || ""), {
        allowedTags: [
            "p", "br", "div", "span",
            "strong", "b", "em", "i", "u", "s",
            "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li",
            "a", "blockquote",
            "table", "thead", "tbody",
            "tfoot", "tr", "td", "th",
            "hr"
        ],
        allowedAttributes: {
            a: ["href", "title", "target", "rel"],
            td: ["colspan", "rowspan"],
            th: ["colspan", "rowspan"]
        },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
            a: (tagName, attribs) => ({
                tagName: "a",
                attribs: {
                    ...attribs,
                    target: "_blank",
                    rel: "noopener noreferrer"
                }
            })
        }
    });
}

function limparHtml(valor = "") {
    return String(valor)
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function criarDescricao(post) {
    const resumo = limparHtml(post.resumo || "");
    const conteudo = limparHtml(post.conteudo || "");

    const descricao =
        resumo ||
        conteudo ||
        "Conteúdo informativo sobre psicologia e bem-estar no PsiFácil.";

    if (descricao.length <= 160) {
        return descricao;
    }

    const trecho = descricao.slice(0, 157);
    const ultimoEspaco = trecho.lastIndexOf(" ");

    return (
        ultimoEspaco > 100
            ? trecho.slice(0, ultimoEspaco)
            : trecho
    ).trimEnd() + "...";
}

function calcularTempoLeitura(conteudo = "") {
    const texto = limparHtml(conteudo);

    const palavras = texto
        .split(/\s+/)
        .filter(Boolean)
        .length;

    return Math.max(1, Math.ceil(palavras / 200));
}

function formatarData(data) {
    if (!data) {
        return "";
    }

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) {
        return "";
    }

    return valor.toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo"
    });
}

function normalizarImagem(imagem = "") {
    const valor = String(imagem || "").trim();

    if (!valor) {
        return "";
    }

    try {
        const url = new URL(
            valor,
            "https://psifacilblog.com.br"
        );

        if (
            !["http:", "https:"].includes(url.protocol) ||
            valor.startsWith("//") ||
            (
                !/^https?:\/\//i.test(valor) &&
                !valor.startsWith("/")
            )
        ) {
            return "";
        }

        return url.href;
    } catch (error) {
        return "";
    }
}

/* =====================================================
   FONTES E CRÉDITOS FORMATADOS
   Compatível com TinyMCE e artigos antigos
===================================================== */

function gerarFontesCreditos(fontes = "") {
    const valor = String(fontes || "").trim();

    if (!valor) {
        return "";
    }

    const possuiHtml = /<\/?[a-z][^>]*>/i.test(valor);

    let conteudoHtml = "";

    if (possuiHtml) {
        conteudoHtml = sanitizarConteudoHtml(valor);
    } else {
        const linhas = valor
            .split(/\r?\n/)
            .map(linha => linha.trim())
            .filter(Boolean);

        if (!linhas.length) {
            return "";
        }

        const itens = linhas.map(linha => {
            const partes = linha.split(
                /(https?:\/\/[^\s]+)/g
            );

            const conteudo = partes.map(parte => {
                if (/^https?:\/\//i.test(parte)) {
                    const urlLimpa = parte.replace(
                        /[),.;]+$/,
                        ""
                    );

                    const finalLinha = parte.slice(
                        urlLimpa.length
                    );

                    return `
                        <a
                            href="${escaparHtml(urlLimpa)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >${escaparHtml(urlLimpa)}</a>${escaparHtml(finalLinha)}
                    `;
                }

                return escaparHtml(parte);
            }).join("");

            return `<li>${conteudo}</li>`;
        }).join("");

        conteudoHtml = `<ul>${itens}</ul>`;
    }

    if (!conteudoHtml.trim()) {
        return "";
    }

    return `
        <section class="fontes-creditos">
            <h2>Fontes e créditos</h2>

            <div class="fontes-creditos-conteudo">
                ${conteudoHtml}
            </div>
        </section>
    `;
}

/* =====================================================
   PSIFÁCIL — AVISO PERMANENTE DE SAÚDE MENTAL

   - Exibido em todos os artigos renderizados
   - Não é armazenado no banco de dados
   - Não depende do conteúdo do TinyMCE
===================================================== */

function gerarAvisoSaudeMental() {
    return `
        <section
            class="aviso-saude-mental"
            aria-labelledby="avisoSaudeMentalTitulo"
        >
            <h2 id="avisoSaudeMentalTitulo">
                ⚠️ Um lembrete importante do PsiFácil
            </h2>

            <p>
                Os conteúdos publicados aqui
                <strong>
                    não substituem uma avaliação, diagnóstico
                    ou acompanhamento realizado por um psicólogo,
                    psiquiatra ou outro profissional de saúde
                    qualificado
                </strong>.
            </p>

            <p>
                Identificar-se com determinados sinais,
                sentimentos ou características apresentados
                em um artigo
                <strong>
                    não significa necessariamente ter um
                    transtorno ou condição psicológica
                </strong>.
                Somente um profissional habilitado pode
                realizar uma avaliação adequada, considerando
                a história, as circunstâncias e as necessidades
                de cada pessoa.
            </p>

            <p>
                O PsiFácil tem como objetivo oferecer
                informações educativas sobre psicologia,
                comportamento e saúde mental, sempre com
                respeito, acolhimento e responsabilidade.
            </p>

            <p>
                Se você estiver passando por um sofrimento
                persistente ou perceber que suas emoções
                estão interferindo na sua rotina, procure
                orientação de um profissional de saúde
                qualificado.
            </p>

            <p>
                <strong>
                    Você merece informação responsável,
                    cuidado e acolhimento.
                </strong>
            </p>
        </section>
    `;
}

/* =====================================================
   PSIFÁCIL — RENDERIZAÇÃO COMPLETA DO ARTIGO
===================================================== */

function renderPost(post) {

    /* ================================================
       DADOS PRINCIPAIS
    ================================================= */

    const tituloOriginal =
        String(post.titulo || "Artigo").trim();

    const titulo = escaparHtml(tituloOriginal);

    const categoria = escaparHtml(
        post.categoria || "Psicologia"
    );

    const descricaoOriginal = criarDescricao(post);
    const descricao = escaparHtml(descricaoOriginal);

    const slug = encodeURIComponent(post.slug || "");

    const url =
        `https://psifacilblog.com.br/artigos/${slug}`;

    const imagemOriginal = normalizarImagem(
        post.imagem
    );

    const imagem = imagemOriginal
        ? escaparHtml(imagemOriginal)
        : "";

    /* ================================================
       DATA REAL DE PUBLICAÇÃO — CORRIGIDO

       Prioriza a data em que o artigo foi publicado.
       Mantém criado_em como alternativa para artigos
       antigos que ainda não possuem publicado_em.
    ================================================= */

    const dataEfetivaPublicacao =
        post.publicado_em ||
        post.criado_em;

    const dataPublicacaoISO = dataEfetivaPublicacao
        ? new Date(dataEfetivaPublicacao).toISOString()
        : "";

    const dataModificacaoISO = post.atualizado_em
        ? new Date(post.atualizado_em).toISOString()
        : dataPublicacaoISO;

    const dataPublicacao = formatarData(
        dataEfetivaPublicacao
    );

    const tempoLeitura = calcularTempoLeitura(
        post.conteudo || ""
    );

    // Conteúdo principal sanitizado.
    const conteudoHtml = sanitizarConteudoHtml(
        post.conteudo || ""
    );

    // Fontes formatadas e sanitizadas.
    const fontesHtml = gerarFontesCreditos(
        post.fontes || ""
    );

    // Aviso fixo para todos os artigos.
    const avisoSaudeMentalHtml = gerarAvisoSaudeMental();

    /* ================================================
       STRUCTURED DATA
    ================================================= */

    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: tituloOriginal,
        description: descricaoOriginal,
        url,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url
        },
        author: {
            "@type": "Organization",
            name: "PsiFácil",
            url: "https://psifacilblog.com.br/"
        },
        publisher: {
            "@type": "Organization",
            name: "PsiFácil",
            url: "https://psifacilblog.com.br/"
        }
    };

    if (dataPublicacaoISO) {
        schema.datePublished = dataPublicacaoISO;
    }

    if (dataModificacaoISO) {
        schema.dateModified = dataModificacaoISO;
    }

    if (imagemOriginal) {
        schema.image = [imagemOriginal];
    }

    const schemaJson = JSON.stringify(schema)
        .replace(/</g, "\\u003c");

    const dadosPostJson = JSON.stringify({
        id: post.id,
        slug: post.slug,
        url
    }).replace(/</g, "\\u003c");

    /* ================================================
       HTML COMPLETO
    ================================================= */

    return `
<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <!-- GOOGLE ANALYTICS -->
    <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-QXHLZFTYTN">
    </script>

    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag("js", new Date());

        gtag("config", "G-QXHLZFTYTN");
    </script>

    <!-- CONFIGURAÇÕES -->
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    >

    <!-- SEO -->
    <title>${titulo} | PsiFácil</title>

    <meta
        name="description"
        content="${descricao}"
    >

    <meta
        name="robots"
        content="index, follow, max-image-preview:large"
    >

    <!-- CANONICAL -->
    <link
        rel="canonical"
        href="${escaparHtml(url)}"
    >

    <!-- OPEN GRAPH -->
    <meta
        property="og:type"
        content="article"
    >

    <meta
        property="og:title"
        content="${titulo}"
    >

    <meta
        property="og:description"
        content="${descricao}"
    >

    <meta
        property="og:url"
        content="${escaparHtml(url)}"
    >

    <meta
        property="og:site_name"
        content="PsiFácil"
    >

    <meta
        property="og:locale"
        content="pt_BR"
    >

    ${imagem ? `
    <meta
        property="og:image"
        content="${imagem}"
    >
    ` : ""}

    <!-- TWITTER / X -->
    <meta
        name="twitter:card"
        content="${imagem ? "summary_large_image" : "summary"}"
    >

    <meta
        name="twitter:title"
        content="${titulo}"
    >

    <meta
        name="twitter:description"
        content="${descricao}"
    >

    ${imagem ? `
    <meta
        name="twitter:image"
        content="${imagem}"
    >
    ` : ""}

    <!-- DATAS DO ARTIGO -->
    ${dataPublicacaoISO ? `
    <meta
        property="article:published_time"
        content="${escaparHtml(dataPublicacaoISO)}"
    >
    ` : ""}

    ${dataModificacaoISO ? `
    <meta
        property="article:modified_time"
        content="${escaparHtml(dataModificacaoISO)}"
    >
    ` : ""}

    <!-- STRUCTURED DATA -->
    <script type="application/ld+json">
        ${schemaJson}
    </script>

    <!-- FAVICON -->
    <link
        rel="icon"
        type="image/svg+xml"
        href="/img/favicon.svg"
    >

    <!-- FONTES -->
    <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
    >

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap"
        rel="stylesheet"
    >

    <!-- CSS -->
    <link
        rel="stylesheet"
        href="/css/post.css"
    >

</head>

<body>

    <!-- PROGRESSO DA LEITURA -->
    <div
        class="reading-progress"
        aria-hidden="true"
    >
        <div
            class="reading-progress-bar"
            id="readingBar">
        </div>
    </div>

    <!-- TOPO -->
    <header class="post-topbar">
        <div class="post-topbar-container">

            <a
                href="/"
                class="post-brand"
                aria-label="Voltar para a página inicial do PsiFácil"
            >
                <img
                    src="/img/favicon.svg"
                    alt=""
                    class="post-brand-icon"
                >

                <span>PsiFácil</span>
            </a>

            <a
                href="/"
                class="post-back-link"
            >
                <i data-lucide="arrow-left"></i>
                <span>Voltar ao início</span>
            </a>

        </div>
    </header>

    <!-- PÁGINA -->
    <main class="post-page">

        <div class="post-layout">

            <!-- ARTIGO -->
            <article
                class="post-detail"
                id="postDetalhe"
            >

                <span class="category">
                    ${categoria}
                </span>

                <h1>${titulo}</h1>

                <div class="post-meta">

                    ${dataPublicacao ? `
                    <span>
                        Publicado em
                        ${escaparHtml(dataPublicacao)}
                    </span>

                    <span class="dot"></span>
                    ` : ""}

                    <span>
                        ${tempoLeitura} min de leitura
                    </span>

                </div>

                ${imagem ? `
                <img
                    src="${imagem}"
                    alt="${titulo}"
                    class="post-banner"
                >
                ` : `
                <img
                    src="https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80"
                    alt=""
                    class="post-banner"
                >
                `}

                <!-- CONTEÚDO FORMATADO -->
                <div class="post-text">
                    ${conteudoHtml}
                </div>

                <!-- FONTES E CRÉDITOS -->
                ${fontesHtml}

                <!-- AVISO PERMANENTE DE SAÚDE MENTAL -->
                ${avisoSaudeMentalHtml}

                <a
                    href="/"
                    class="back-link"
                >
                    ← Voltar para o blog
                </a>

            </article>

            <!-- SIDEBAR -->
            <aside
                class="post-sidebar"
                aria-label="Opções do artigo"
            >

                <!-- AÇÕES -->
                <div class="post-actions">

                    <!-- CURTIR -->
                    <button
                        id="btnCurtir"
                        class="action-btn like-btn"
                        type="button"
                        aria-label="Curtir este artigo"
                    >
                        <span class="action-icon">
                            <i data-lucide="heart"></i>
                        </span>

                        <span class="action-text">
                            <span class="label">
                                Curtir
                            </span>

                            <span
                                id="totalCurtidas"
                                class="count"
                            >
                                0
                            </span>
                        </span>
                    </button>

                    <!-- COMPARTILHAR -->
                    <button
                        id="btnCompartilhar"
                        class="action-btn share-btn"
                        type="button"
                        aria-label="Compartilhar este artigo"
                    >
                        <span class="action-icon">
                            <i data-lucide="share-2"></i>
                        </span>

                        <span class="action-text">
                            <span class="label">
                                Compartilhar
                            </span>

                            <span class="sub">
                                Enviar
                            </span>
                        </span>
                    </button>

                    <!-- SALVAR -->
                    <button
                        id="btnSalvar"
                        class="action-btn salvar-btn"
                        type="button"
                        aria-label="Salvar artigo para ler depois"
                    >
                        <span class="action-icon">
                            <i data-lucide="bookmark"></i>
                        </span>

                        <span class="action-text">
                            <span class="label">
                                Salvar
                            </span>

                            <span class="sub">
                                Ler depois
                            </span>
                        </span>
                    </button>

                    <!-- REDES SOCIAIS -->
                    <div class="social-box">

                        <span class="social-title">
                            Acompanhe o PsiFácil
                        </span>

                        <div class="social-icons">

                            <!-- INSTAGRAM -->
                            <a
                                href="https://www.instagram.com/psifacil.oficial/"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="social-btn instagram"
                                aria-label="PsiFácil no Instagram"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M7.5 2C4.46 2 2 4.46 2 7.5v9C2 19.54 4.46 22 7.5 22h9c3.04 0 5.5-2.46 5.5-5.5v-9C22 4.46 19.54 2 16.5 2h-9zm0 2h9c1.93 0 3.5 1.57 3.5 3.5v9c0 1.93-1.57 3.5-3.5 3.5h-9C5.57 20 4 18.43 4 16.5v-9C4 5.57 5.57 4 7.5 4zm9.75 1a.75.75 0 100 1.5.75.75 0 000-1.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"
                                    />
                                </svg>
                            </a>

                            <!-- YOUTUBE -->
                            <a
                                href="https://www.youtube.com/@PSIFACIL.OFICIAL"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="social-btn youtube"
                                aria-label="PsiFácil no YouTube"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1C17.5 2.6 12 2.6 12 2.6h0s-5.5 0-8.6.3c-.5.1-1.3.1-2.1 1C.7 4.6.5 6.2.5 6.2S.2 8 .2 9.8v1.4c0 1.8.3 3.6.3 3.6s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.3.3 7.3.3s5.5 0 8.6-.3c.5-.1 1.3-.1 2.1-1 .6-.7.8-2.3.8-2.3s.3-1.8.3-3.6V9.8c0-1.8-.3-3.6-.3-3.6zM9.8 14.7V7.8l6 3.5-6 3.4z"
                                    />
                                </svg>
                            </a>

                        </div>
                    </div>

                </div>

                <!-- COMENTÁRIOS -->
                <section
                    class="comentarios-section"
                    aria-labelledby="comentariosTitulo"
                >

                    <div class="comentarios-header">

                        <span class="comentarios-icon">
                            <i data-lucide="message-circle"></i>
                        </span>

                        <div>
                            <span class="comentarios-label">
                                Comunidade
                            </span>

                            <h2 id="comentariosTitulo">
                                Comentários
                            </h2>
                        </div>

                    </div>

                    <form id="formComentario">

                        <div class="comentario-field">
                            <label for="nomeComentario">
                                Seu nome
                            </label>

                            <input
                                type="text"
                                id="nomeComentario"
                                name="nome"
                                placeholder="Como podemos chamar você?"
                                autocomplete="name"
                                maxlength="80"
                                required
                            >
                        </div>

                        <div class="comentario-field">
                            <label for="textoComentario">
                                Comentário
                            </label>

                            <textarea
                                id="textoComentario"
                                name="comentario"
                                placeholder="Compartilhe sua opinião sobre este conteúdo..."
                                maxlength="1000"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            class="comentario-submit"
                        >
                            <i data-lucide="send"></i>

                            <span>
                                Enviar comentário
                            </span>
                        </button>

                    </form>

                    <div
                        id="listaComentarios"
                        class="lista-comentarios"
                        aria-live="polite"
                    ></div>

                </section>

            </aside>

            <!-- ARTIGOS RELACIONADOS -->
            <section
                class="relacionados-section"
                aria-labelledby="relacionadosTitulo"
            >

                <div class="relacionados-header">

                    <span class="tag">
                        Continue lendo
                    </span>

                    <h2 id="relacionadosTitulo">
                        Você também pode gostar
                    </h2>

                    <p>
                        Outros conteúdos do PsiFácil para continuar sua leitura.
                    </p>

                </div>

                <div
                    class="relacionados-grid"
                    id="postsRelacionados"
                ></div>

            </section>

        </div>
    </main>

    <!-- RODAPÉ -->
    <footer class="post-footer">

        <div class="post-footer-container">

            <a
                href="/"
                class="post-footer-brand"
            >
                PsiFácil
            </a>

            <p>
                Conteúdo para informar, refletir e cuidar melhor de si.
            </p>

        </div>

    </footer>

    <!-- DADOS DO POST PARA O JAVASCRIPT -->
    <script>
        window.PSIFACIL_POST = ${dadosPostJson};
    </script>

    <!-- LUCIDE -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <script>
        if (window.lucide) {
            lucide.createIcons();
        }
    </script>

    <!-- DOMPURIFY -->
    <script
        src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.6/purify.min.js"
        referrerpolicy="no-referrer">
    </script>

    <!-- JAVASCRIPT DO ARTIGO -->
    <script src="/js/post.js"></script>

</body>
</html>
`;
}

module.exports = renderPost;
