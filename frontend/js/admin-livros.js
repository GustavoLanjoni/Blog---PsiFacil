
/* =========================================================
   PSIFÁCIL - ADMINISTRAÇÃO DE LIVROS
   ARQUIVO: js/admin-livros.js

   Cadastro, edição, upload, preview, listagem,
   pesquisa, filtros, visualização e exclusão.
========================================================= */

(() => {
    "use strict";

    const API_LIVROS = "/livros";
    const API_UPLOAD = "/upload";

    let livrosAdmin = [];
    let livroEditandoId = null;
    let uploadEmAndamento = false;
    let salvandoLivro = false;
    let excluindoLivro = false;
    let livroPendenteExclusao = null;
    let previewLocal = null;
    let versaoUpload = 0;
    let focoAntesModal = null;

    const $ = (id) => document.getElementById(id);

    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

    function tokenAdmin() {
        if (typeof obterTokenAdmin === "function") {
            return obterTokenAdmin();
        }

        return localStorage.getItem("tokenAdmin");
    }

    function texto(id) {
        return $(id)?.value?.trim() || "";
    }

    function definirTexto(id, valor) {
        const elemento = $(id);

        if (elemento) {
            elemento.textContent = String(valor ?? "");
        }
    }

    function escaparHtml(valor) {
        const elemento = document.createElement("div");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
    }

    function atualizarIcones() {
        if (typeof renderizarIcones === "function") {
            renderizarIcones();
        } else if (window.lucide?.createIcons) {
            window.lucide.createIcons();
        }
    }

    function notificar(mensagem, tipo = "success") {
        if (typeof mostrarToast === "function") {
            mostrarToast(mensagem, tipo);
            return;
        }

        let container = $("livrosNotificacoes");

        if (!container) {
            container = document.createElement("div");
            container.id = "livrosNotificacoes";
            container.className = "livros-notificacoes";
            container.setAttribute("aria-live", "polite");
            document.body.appendChild(container);
        }

        const aviso = document.createElement("div");
        aviso.className =
            "livros-notificacao " +
            (tipo === "error" ? "erro" : "sucesso");

        aviso.textContent = mensagem;
        container.appendChild(aviso);

        setTimeout(() => aviso.remove(), 4500);
    }

    function validarUrl(url, permitirRelativa = false) {
        if (!url || typeof url !== "string") return null;

        try {
            const endereco = permitirRelativa
                ? new URL(url, window.location.origin)
                : new URL(url);

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

    function liberarPreviewLocal() {
        if (previewLocal) {
            URL.revokeObjectURL(previewLocal);
            previewLocal = null;
        }
    }

    async function requisicaoLivros(url, opcoes = {}) {
        const token = tokenAdmin();

        if (!token) {
            throw new Error(
                "Sua sessão expirou. Faça login novamente."
            );
        }

        const resposta = await fetch(url, {
            ...opcoes,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(opcoes.headers || {})
            }
        });

        const resultado = await resposta
            .json()
            .catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                `Não foi possível concluir a operação (${resposta.status}).`
            );
        }

        return resultado;
    }

    /* =====================================================
       ABAS DO PAINEL
    ===================================================== */

    function abrirAbaLivros(aba) {
        const cadastrar = aba === "cadastrar";

        const painelCadastrar = $("painelCadastrarLivro");
        const painelListar = $("painelListarLivros");

        if (painelCadastrar) {
            painelCadastrar.style.display =
                cadastrar ? "block" : "none";
        }

        if (painelListar) {
            painelListar.style.display =
                cadastrar ? "none" : "block";
        }

        $("abaCadastrarLivro")?.classList.toggle(
            "ativo",
            cadastrar
        );

        $("abaListarLivros")?.classList.toggle(
            "ativo",
            !cadastrar
        );

        $("abaCadastrarLivro")?.setAttribute(
            "aria-selected",
            String(cadastrar)
        );

        $("abaListarLivros")?.setAttribute(
            "aria-selected",
            String(!cadastrar)
        );

        if (!cadastrar) {
            carregarLivrosAdmin();
        }
    }

    function mostrarFormularioLivro() {
        abrirAbaLivros("cadastrar");

        if ($("areaFormularioLivro")) {
            $("areaFormularioLivro").style.display = "block";
        }

        if ($("mensagemNovoLivro")) {
            $("mensagemNovoLivro").style.display = "none";
        }

        atualizarPreviewLivro();

        $("areaFormularioLivro")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function esconderFormularioLivro() {
        if ($("areaFormularioLivro")) {
            $("areaFormularioLivro").style.display = "none";
        }

        if ($("mensagemNovoLivro")) {
            $("mensagemNovoLivro").style.display = "block";
        }
    }

    /* =====================================================
       LIMPAR FORMULÁRIO
    ===================================================== */

    function limparFormularioLivro() {
        versaoUpload++;

        $("formLivro")?.reset();

        livroEditandoId = null;
        uploadEmAndamento = false;

        liberarPreviewLocal();

        if ($("livroImagem")) {
            $("livroImagem").value = "";
        }

        if ($("livroImagemArquivo")) {
            $("livroImagemArquivo").value = "";
        }

        definirTexto(
            "livroStatusImagem",
            "Nenhuma imagem selecionada."
        );

        definirTexto(
            "tituloFormularioLivro",
            "Cadastrar novo livro"
        );

        const botao = $("btnSalvarLivro");

        if (botao) {
            botao.disabled = false;
            botao.textContent = "Salvar livro";
        }

        atualizarPreviewLivro();
    }

    /* =====================================================
       PREVIEW EM TEMPO REAL
    ===================================================== */

    function atualizarPreviewLivro() {
        const titulo = texto("livroTitulo");
        const autor = texto("livroAutor");
        const categoria = texto("livroCategoria");
        const descricao = texto("livroDescricao");
        const imagem = texto("livroImagem");
        const linkAmazon = texto("livroLinkAmazon");
        const status = $("livroStatus")?.value;
        const destaque = $("livroDestaque")?.value === "sim";

        definirTexto(
            "previewLivroTitulo",
            titulo || "Título do livro"
        );

        definirTexto(
            "previewLivroAutor",
            autor || "Nome do autor"
        );

        definirTexto(
            "previewLivroCategoria",
            categoria || "Categoria"
        );

        definirTexto(
            "previewLivroDescricao",
            descricao ||
            "A descrição do livro aparecerá aqui enquanto você preenche o formulário."
        );

        definirTexto(
            "previewLivroStatus",
            status === "publicado"
                ? "Publicado"
                : "Rascunho"
        );

        definirTexto(
            "previewLivroDestaque",
            destaque
                ? "Destaque na página inicial"
                : "Sem destaque na página inicial"
        );

        const capa = $("previewLivroCapa");

        if (capa) {
            capa.replaceChildren();

            const urlCapa =
                previewLocal || validarUrl(imagem, true);

            if (urlCapa) {
                const img = document.createElement("img");

                img.src = urlCapa;
                img.alt = titulo
                    ? `Capa do livro ${titulo}`
                    : "Prévia da capa";

                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "contain";

                capa.appendChild(img);
            } else {
                const mensagem = document.createElement("span");
                mensagem.textContent = "Capa do livro";
                capa.appendChild(mensagem);
            }
        }

        const botaoAmazon = $("previewLivroAmazon");

        if (botaoAmazon) {
            const url = validarUrl(linkAmazon);

            if (url) {
                botaoAmazon.href = url;
                botaoAmazon.target = "_blank";
                botaoAmazon.rel =
                    "sponsored noopener noreferrer";

                botaoAmazon.style.pointerEvents = "auto";
                botaoAmazon.style.opacity = "1";
            } else {
                botaoAmazon.removeAttribute("href");
                botaoAmazon.style.pointerEvents = "none";
                botaoAmazon.style.opacity = ".6";
            }
        }
    }

    /* =====================================================
       UPLOAD DA CAPA
    ===================================================== */

    async function enviarCapaLivro(arquivo, versaoAtual) {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
            throw new Error(
                "Formato inválido. Use JPG, PNG ou WEBP."
            );
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            throw new Error(
                "A capa deve ter no máximo 5 MB."
            );
        }

        const token = tokenAdmin();

        if (!token) {
            throw new Error(
                "Sua sessão expirou. Faça login novamente."
            );
        }

        const dados = new FormData();
        dados.append("imagem", arquivo);

        const resposta = await fetch(API_UPLOAD, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: dados
        });

        const resultado = await resposta
            .json()
            .catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível enviar a capa."
            );
        }

        if (!resultado.url) {
            throw new Error(
                "O servidor não retornou a URL da capa."
            );
        }

        if (versaoAtual !== versaoUpload) {
            return;
        }

        $("livroImagem").value = resultado.url;

        definirTexto(
            "livroStatusImagem",
            "Capa enviada com sucesso!"
        );

        atualizarPreviewLivro();

        notificar(
            "Capa enviada com sucesso!",
            "success"
        );
    }

    function prepararUploadCapa() {
        const input = $("livroImagemArquivo");

        if (!input) return;

        input.addEventListener("change", async () => {
            const arquivo = input.files?.[0];
            const versaoAtual = ++versaoUpload;

            liberarPreviewLocal();

            if ($("livroImagem")) {
                $("livroImagem").value = "";
            }

            if (!arquivo) {
                definirTexto(
                    "livroStatusImagem",
                    "Nenhuma imagem selecionada."
                );

                atualizarPreviewLivro();
                return;
            }

            previewLocal = URL.createObjectURL(arquivo);
            atualizarPreviewLivro();

            uploadEmAndamento = true;

            const botao = $("btnSalvarLivro");

            if (botao) {
                botao.disabled = true;
                botao.textContent = "Enviando capa...";
            }

            definirTexto(
                "livroStatusImagem",
                "Enviando capa..."
            );

            try {
                await enviarCapaLivro(
                    arquivo,
                    versaoAtual
                );
            } catch (erro) {
                if (versaoAtual !== versaoUpload) return;

                if ($("livroImagem")) {
                    $("livroImagem").value = "";
                }

                liberarPreviewLocal();
                atualizarPreviewLivro();

                definirTexto(
                    "livroStatusImagem",
                    erro.message
                );

                notificar(erro.message, "error");
            } finally {
                if (versaoAtual === versaoUpload) {
                    uploadEmAndamento = false;

                    if (botao) {
                        botao.disabled = salvandoLivro;
                        botao.textContent = livroEditandoId
                            ? "Salvar alterações"
                            : "Salvar livro";
                    }
                }
            }
        });
    }

    /* =====================================================
       SALVAR OU EDITAR LIVRO
    ===================================================== */

    async function salvarLivro(evento) {
        evento.preventDefault();

        if (salvandoLivro) return;

        if (uploadEmAndamento) {
            notificar(
                "Aguarde o envio da capa terminar.",
                "error"
            );
            return;
        }

        const dadosLivro = {
            titulo: texto("livroTitulo"),
            autor: texto("livroAutor"),
            categoria: texto("livroCategoria"),
            descricao: texto("livroDescricao"),
            imagem: texto("livroImagem"),
            link_amazon: texto("livroLinkAmazon"),
            status: $("livroStatus")?.value || "rascunho",
            destaque:
                $("livroDestaque")?.value === "sim"
        };

        if (
            !dadosLivro.titulo ||
            !dadosLivro.autor ||
            !dadosLivro.categoria ||
            !dadosLivro.descricao ||
            !dadosLivro.link_amazon
        ) {
            notificar(
                "Preencha todos os campos obrigatórios.",
                "error"
            );
            return;
        }

        if (!dadosLivro.imagem) {
            notificar(
                "Envie a capa do livro antes de salvar.",
                "error"
            );
            return;
        }

        const editando = livroEditandoId !== null;

        const url = editando
            ? `${API_LIVROS}/${livroEditandoId}`
            : API_LIVROS;

        const metodo = editando ? "PUT" : "POST";

        const botao = $("btnSalvarLivro");

        salvandoLivro = true;

        if (botao) {
            botao.disabled = true;
            botao.textContent = editando
                ? "Salvando alterações..."
                : "Salvando livro...";
        }

        try {
            await requisicaoLivros(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosLivro)
            });

            notificar(
                editando
                    ? "Livro atualizado com sucesso!"
                    : "Livro cadastrado com sucesso!",
                "success"
            );

            limparFormularioLivro();
            esconderFormularioLivro();

            abrirAbaLivros("listar");

        } catch (erro) {
            notificar(erro.message, "error");

        } finally {
            salvandoLivro = false;

            if (botao) {
                botao.disabled = uploadEmAndamento;
                botao.textContent = livroEditandoId
                    ? "Salvar alterações"
                    : "Salvar livro";
            }
        }
    }

    /* =====================================================
       CARREGAR LIVROS DO POSTGRESQL
    ===================================================== */

    async function carregarLivrosAdmin() {
        const lista = $("listaLivrosAdmin");

        if (!lista) return;

        lista.innerHTML = `
            <div class="admin-empty-state">
                <p>Carregando livros...</p>
            </div>
        `;

        try {
            const resultado = await requisicaoLivros(
                `${API_LIVROS}/admin/todos`
            );

            livrosAdmin = Array.isArray(resultado.livros)
                ? resultado.livros
                : [];

            renderizarLivrosAdmin();

        } catch (erro) {
            lista.replaceChildren();

            const estado = document.createElement("div");
            estado.className = "admin-empty-state";

            const titulo = document.createElement("strong");
            titulo.textContent =
                "Não foi possível carregar os livros";

            const descricao = document.createElement("p");
            descricao.textContent = erro.message;

            estado.append(titulo, descricao);
            lista.appendChild(estado);
        }
    }

    /* =====================================================
       PESQUISA, FILTROS E LISTAGEM
    ===================================================== */

    function renderizarLivrosAdmin() {
        const lista = $("listaLivrosAdmin");

        if (!lista) return;

        const pesquisa = texto(
            "pesquisaLivrosAdmin"
        ).toLocaleLowerCase("pt-BR");

        const statusFiltro =
            $("filtroStatusLivrosAdmin")?.value || "todos";

        const ordenacao =
            $("ordenacaoLivrosAdmin")?.value || "recentes";

        const filtrados = livrosAdmin.filter((livro) => {
            const conteudo = [
                livro.titulo,
                livro.autor,
                livro.categoria
            ].join(" ").toLocaleLowerCase("pt-BR");

            const correspondePesquisa =
                !pesquisa || conteudo.includes(pesquisa);

            const correspondeStatus =
                statusFiltro === "todos" ||
                livro.status === statusFiltro;

            return correspondePesquisa && correspondeStatus;
        });

        filtrados.sort((a, b) => {
            if (ordenacao === "titulo") {
                return String(a.titulo || "").localeCompare(
                    String(b.titulo || ""),
                    "pt-BR"
                );
            }

            const dataA =
                new Date(a.criado_em || 0).getTime() || 0;

            const dataB =
                new Date(b.criado_em || 0).getTime() || 0;

            return ordenacao === "antigos"
                ? dataA - dataB
                : dataB - dataA;
        });

        definirTexto(
            "quantidadeLivrosFiltrados",
            `${filtrados.length} de ${livrosAdmin.length} livros`
        );

        if (!filtrados.length) {
            lista.innerHTML = `
                <div class="admin-empty-state">
                    <strong>Nenhum livro encontrado</strong>
                    <p>Cadastre um livro ou ajuste os filtros.</p>
                </div>
            `;
            return;
        }

        lista.replaceChildren();

        filtrados.forEach((livro) => {
            const artigo = document.createElement("article");
            artigo.className = "admin-livro-item";

            const capa = document.createElement("div");
            capa.className = "admin-livro-item-capa";

            const urlImagem = validarUrl(livro.imagem, true);

            if (urlImagem) {
                const imagem = document.createElement("img");
                imagem.src = urlImagem;
                imagem.alt = `Capa de ${livro.titulo}`;
                imagem.loading = "lazy";
                capa.appendChild(imagem);
            }

            const info = document.createElement("div");
            info.className = "admin-livro-item-info";

            const categoria = document.createElement("span");
            categoria.className = "admin-livro-item-categoria";
            categoria.textContent = livro.categoria || "";

            const titulo = document.createElement("h3");
            titulo.textContent = livro.titulo || "";

            const autor = document.createElement("p");
            autor.textContent = livro.autor || "";

            const status = document.createElement("span");
            status.className =
                "post-status " +
                (livro.status === "publicado"
                    ? "status-publicado"
                    : "status-rascunho");

            status.textContent = livro.status === "publicado"
                ? "Publicado"
                : "Rascunho";

            info.append(categoria, titulo, autor, status);

            if (livro.destaque) {
                const destaque = document.createElement("span");
                destaque.className = "admin-livro-destaque";
                destaque.textContent = "Destaque";
                info.appendChild(destaque);
            }

            const acoes = document.createElement("div");
            acoes.className = "admin-livro-item-acoes";

            const botoes = [
                ["visualizar", "eye", "Visualizar"],
                ["editar", "pencil", "Editar"],
                ["excluir", "trash-2", "Excluir"]
            ];

            botoes.forEach(([acao, icone, rotulo]) => {
                const botao = document.createElement("button");

                botao.type = "button";
                botao.className = "admin-text-button";
                botao.dataset.acaoLivro = acao;
                botao.dataset.livroId = livro.id;

                const elementoIcone = document.createElement("i");
                elementoIcone.setAttribute("data-lucide", icone);

                botao.append(
                    elementoIcone,
                    document.createTextNode(` ${rotulo}`)
                );

                acoes.appendChild(botao);
            });

            artigo.append(capa, info, acoes);
            lista.appendChild(artigo);
        });

        atualizarIcones();
    }

    /* =====================================================
       EDITAR LIVRO
    ===================================================== */

    function editarLivro(id) {
        const livro = livrosAdmin.find(
            (item) => Number(item.id) === Number(id)
        );

        if (!livro) {
            notificar("Livro não encontrado.", "error");
            return;
        }

        limparFormularioLivro();

        livroEditandoId = Number(livro.id);

        const campos = {
            livroTitulo: livro.titulo,
            livroAutor: livro.autor,
            livroCategoria: livro.categoria,
            livroDescricao: livro.descricao,
            livroImagem: livro.imagem,
            livroLinkAmazon: livro.link_amazon,
            livroStatus: livro.status,
            livroDestaque: livro.destaque ? "sim" : "nao"
        };

        Object.entries(campos).forEach(([idCampo, valor]) => {
            if ($(idCampo)) {
                $(idCampo).value = valor ?? "";
            }
        });

        definirTexto(
            "tituloFormularioLivro",
            "Editar livro"
        );

        definirTexto(
            "livroStatusImagem",
            "Capa atual carregada. Selecione outra para substituir."
        );

        if ($("btnSalvarLivro")) {
            $("btnSalvarLivro").textContent =
                "Salvar alterações";
        }

        mostrarFormularioLivro();
        atualizarPreviewLivro();
    }

    /* =====================================================
       VISUALIZAR LIVRO NO SITE PÚBLICO
    ===================================================== */

    function visualizarLivro(id) {
        const livro = livrosAdmin.find(
            (item) => Number(item.id) === Number(id)
        );

        if (!livro) {
            notificar("Livro não encontrado.", "error");
            return;
        }

        if (livro.status !== "publicado") {
            notificar(
                "Este livro está como rascunho. Publique-o para visualizá-lo no site.",
                "error"
            );
            return;
        }

        const url = new URL(
            "livros.html",
            window.location.href
        );

        url.searchParams.set("livro", String(id));

        window.open(
            url.href,
            "_blank",
            "noopener,noreferrer"
        );
    }

    /* =====================================================
       MODAL PROFISSIONAL DE EXCLUSÃO
    ===================================================== */

    function criarModalExclusao() {
        if ($("modalExcluirLivro")) return;

        const overlay = document.createElement("div");

        overlay.id = "modalExcluirLivro";
        overlay.className = "livros-modal-overlay";
        overlay.hidden = true;

        overlay.innerHTML = `
            <div
                class="livros-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modalExcluirLivroTitulo"
                aria-describedby="modalExcluirLivroDescricao"
                tabindex="-1"
            >
                <div class="livros-modal-icon">
                    <i data-lucide="trash-2"></i>
                </div>

                <h2 id="modalExcluirLivroTitulo">
                    Excluir livro?
                </h2>

                <p id="modalExcluirLivroDescricao">
                    Você está prestes a excluir permanentemente
                    este livro da Biblioteca PsiFácil.
                </p>

                <div
                    class="livros-modal-livro"
                    id="modalExcluirLivroNome"
                ></div>

                <p class="livros-modal-aviso">
                    Esta ação não poderá ser desfeita.
                </p>

                <div class="livros-modal-acoes">
                    <button
                        type="button"
                        id="btnCancelarExclusaoLivro"
                        class="livros-modal-cancelar"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        id="btnConfirmarExclusaoLivro"
                        class="livros-modal-confirmar"
                    >
                        <i data-lucide="trash-2"></i>
                        Excluir livro
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        $("btnCancelarExclusaoLivro").addEventListener(
            "click",
            fecharModalExclusao
        );

        $("btnConfirmarExclusaoLivro").addEventListener(
            "click",
            confirmarExclusaoLivro
        );

        overlay.addEventListener("click", (evento) => {
            if (evento.target === overlay) {
                fecharModalExclusao();
            }
        });

        overlay.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                evento.preventDefault();
                fecharModalExclusao();
                return;
            }

            if (evento.key !== "Tab") return;

            const botoes = [
                $("btnCancelarExclusaoLivro"),
                $("btnConfirmarExclusaoLivro")
            ].filter((botao) => botao && !botao.disabled);

            if (!botoes.length) return;

            const primeiro = botoes[0];
            const ultimo = botoes[botoes.length - 1];

            if (
                evento.shiftKey &&
                document.activeElement === primeiro
            ) {
                evento.preventDefault();
                ultimo.focus();
            } else if (
                !evento.shiftKey &&
                document.activeElement === ultimo
            ) {
                evento.preventDefault();
                primeiro.focus();
            }
        });

        atualizarIcones();
    }

    function excluirLivro(id) {
        const livro = livrosAdmin.find(
            (item) => Number(item.id) === Number(id)
        );

        if (!livro) {
            notificar("Livro não encontrado.", "error");
            return;
        }

        criarModalExclusao();

        livroPendenteExclusao = Number(id);
        focoAntesModal = document.activeElement;

        definirTexto(
            "modalExcluirLivroNome",
            livro.titulo
        );

        $("modalExcluirLivro").hidden = false;

        $("btnCancelarExclusaoLivro")?.focus();
    }

    function fecharModalExclusao() {
        if (excluindoLivro) return;

        const overlay = $("modalExcluirLivro");

        if (overlay) {
            overlay.hidden = true;
        }

        livroPendenteExclusao = null;

        if (focoAntesModal?.isConnected) {
            focoAntesModal.focus();
        }

        focoAntesModal = null;
    }

    async function confirmarExclusaoLivro() {
        if (
            excluindoLivro ||
            livroPendenteExclusao === null
        ) {
            return;
        }

        const id = livroPendenteExclusao;
        const botao = $("btnConfirmarExclusaoLivro");

        excluindoLivro = true;

        if (botao) {
            botao.disabled = true;
            botao.textContent = "Excluindo...";
        }

        try {
            await requisicaoLivros(
                `${API_LIVROS}/${id}`,
                { method: "DELETE" }
            );

            excluindoLivro = false;
            fecharModalExclusao();

            notificar(
                "Livro excluído com sucesso!",
                "success"
            );

            await carregarLivrosAdmin();

        } catch (erro) {
            notificar(erro.message, "error");

        } finally {
            excluindoLivro = false;

            if (botao) {
                botao.disabled = false;
                botao.innerHTML = `
                    <i data-lucide="trash-2"></i>
                    Excluir livro
                `;
            }

            atualizarIcones();
        }
    }

    /* =====================================================
       INICIALIZAÇÃO DO PAINEL
    ===================================================== */

    function iniciarAdminLivros() {
        if (!$("formLivro")) return;

        criarModalExclusao();

        $("btnNovoLivro")?.addEventListener(
            "click",
            () => {
                limparFormularioLivro();
                mostrarFormularioLivro();
            }
        );

        $("btnCancelarLivro")?.addEventListener(
            "click",
            () => {
                limparFormularioLivro();
                esconderFormularioLivro();
            }
        );

        $("abaCadastrarLivro")?.addEventListener(
            "click",
            () => abrirAbaLivros("cadastrar")
        );

        $("abaListarLivros")?.addEventListener(
            "click",
            () => abrirAbaLivros("listar")
        );

        const camposPreview = [
            "livroTitulo",
            "livroAutor",
            "livroCategoria",
            "livroDescricao",
            "livroLinkAmazon",
            "livroStatus",
            "livroDestaque"
        ];

        camposPreview.forEach((id) => {
            $(id)?.addEventListener(
                "input",
                atualizarPreviewLivro
            );

            $(id)?.addEventListener(
                "change",
                atualizarPreviewLivro
            );
        });

        $("formLivro").addEventListener(
            "submit",
            salvarLivro
        );

        prepararUploadCapa();

        const camposFiltro = [
            "pesquisaLivrosAdmin",
            "filtroStatusLivrosAdmin",
            "ordenacaoLivrosAdmin"
        ];

        camposFiltro.forEach((id) => {
            $(id)?.addEventListener(
                "input",
                renderizarLivrosAdmin
            );

            $(id)?.addEventListener(
                "change",
                renderizarLivrosAdmin
            );
        });

        $("listaLivrosAdmin")?.addEventListener(
            "click",
            (evento) => {
                const botao = evento.target.closest(
                    "[data-acao-livro]"
                );

                if (!botao) return;

                const id = Number(
                    botao.dataset.livroId
                );

                const acao =
                    botao.dataset.acaoLivro;

                if (acao === "editar") {
                    editarLivro(id);
                } else if (acao === "visualizar") {
                    visualizarLivro(id);
                } else if (acao === "excluir") {
                    excluirLivro(id);
                }
            }
        );

        // Deixar o formulário aberto automaticamente
        limparFormularioLivro();

        const formulario = document.getElementById("areaFormularioLivro");
        const mensagem = document.getElementById("mensagemNovoLivro");

        if (formulario) {
            formulario.style.display = "block";
        }

        if (mensagem) {
            mensagem.style.display = "none";
        }

        atualizarPreviewLivro();
        atualizarIcones();

        carregarLivrosAdmin();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarAdminLivros
        );
    } else {
        iniciarAdminLivros();
    }

})();
