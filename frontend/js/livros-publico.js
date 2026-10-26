
/* ==========================================
   PSIFÁCIL — BIBLIOTECA PÚBLICA
   Arquivo: js/livros-publico.js
   Versão corrigida
========================================== */

(() => {
  "use strict";

  const API = "/livros";

  const $ = (id) => document.getElementById(id);

  let livros = [];
  let categoriaAtual = "Todas";
  let ultimoFoco = null;
  let idDetalheAberto = null;

  /* ==========================================
     UTILITÁRIOS
  ========================================== */

  function urlSegura(valor, permitirRelativa = false) {
    if (typeof valor !== "string" || !valor.trim()) {
      return null;
    }

    try {
      const url = permitirRelativa
        ? new URL(valor, window.location.origin)
        : new URL(valor);

      if (!["http:", "https:"].includes(url.protocol)) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  function criar(tag, classe = "", conteudo) {
    const elemento = document.createElement(tag);

    if (classe) {
      elemento.className = classe;
    }

    if (conteudo !== undefined) {
      elemento.textContent = String(conteudo);
    }

    return elemento;
  }

  /* ==========================================
     CAPAS DOS LIVROS
  ========================================== */

  function capaLivro(livro, classe = "") {
    const imagem = urlSegura(livro.imagem, true);

    if (!imagem) {
      return criar(
        "div",
        `book-placeholder ${classe}`,
        "✳"
      );
    }

    const img = criar("img", classe);

    img.src = imagem;
    img.alt = `Capa do livro ${livro.titulo || "sem título"}`;
    img.loading = "lazy";
    img.decoding = "async";

    img.addEventListener("error", () => {
      img.replaceWith(
        criar("div", "book-placeholder", "✳")
      );
    });

    return img;
  }

  /* ==========================================
     PESQUISA E FILTROS
  ========================================== */

  function livrosFiltrados() {
    const busca = (
      $("pesquisaLivros")?.value || ""
    ).trim().toLocaleLowerCase("pt-BR");

    return livros.filter((livro) => {
      const correspondeCategoria =
        categoriaAtual === "Todas" ||
        livro.categoria === categoriaAtual;

      const conteudo = [
        livro.titulo,
        livro.autor,
        livro.categoria,
        livro.descricao
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return (
        correspondeCategoria &&
        (!busca || conteudo.includes(busca))
      );
    });
  }

  /* ==========================================
     CATEGORIAS
  ========================================== */

  function renderizarCategorias() {
    const container = $("categoriasLivros");

    if (!container) return;

    container.replaceChildren();

    const categorias = [
      "Todas",
      ...new Set(
        livros
          .map((livro) =>
            String(livro.categoria || "").trim()
          )
          .filter(Boolean)
      )
    ];

    categorias.sort((a, b) => {
      if (a === "Todas") return -1;
      if (b === "Todas") return 1;

      return a.localeCompare(b, "pt-BR");
    });

    if (!categorias.includes(categoriaAtual)) {
      categoriaAtual = "Todas";
    }

    categorias.forEach((categoria) => {
      const ativo = categoria === categoriaAtual;

      const botao = criar(
        "button",
        `category-filter${ativo ? " active" : ""}`,
        categoria === "Todas"
          ? "Todos os livros"
          : categoria
      );

      botao.type = "button";

      botao.setAttribute(
        "aria-pressed",
        String(ativo)
      );

      botao.addEventListener("click", () => {
        categoriaAtual = categoria;

        renderizarCategorias();
        renderizarLivros();
      });

      container.appendChild(botao);
    });
  }

  /* ==========================================
     CRIAR LIVROS DO CATÁLOGO
  ========================================== */

  function criarCard(livro) {
    const card = criar("article", "book-card");

    const imagemBotao = criar(
      "button",
      "book-image"
    );

    imagemBotao.type = "button";

    imagemBotao.setAttribute(
      "aria-label",
      `Ver detalhes de ${livro.titulo || "este livro"}`
    );

    imagemBotao.appendChild(
      capaLivro(livro)
    );

    const destaque =
      livro.destaque === true ||
      livro.destaque === 1 ||
      livro.destaque === "1";

    if (destaque) {
      imagemBotao.appendChild(
        criar(
          "span",
          "featured-label",
          "✦ Destaque"
        )
      );
    }

    imagemBotao.addEventListener("click", () => {
      abrirDetalhe(livro);
    });

    const conteudo = criar(
      "div",
      "book-content"
    );

    const categoria = criar(
      "span",
      "book-category",
      livro.categoria || "Leitura"
    );

    const titulo = criar(
      "h3",
      "book-title",
      livro.titulo || "Livro sem título"
    );

    const autor = criar(
      "p",
      "book-author",
      livro.autor || "Autor não informado"
    );

    const descricao = criar(
      "p",
      "book-excerpt",
      livro.descricao ||
        "Conheça mais sobre esta leitura."
    );

    const acoes = criar(
      "div",
      "book-actions"
    );

    const detalhes = criar(
      "button",
      "details-button",
      "Conhecer livro ↗"
    );

    detalhes.type = "button";

    detalhes.addEventListener("click", () => {
      abrirDetalhe(livro);
    });

    acoes.appendChild(detalhes);

    /* LINK DA AMAZON */

    const amazon = urlSegura(
      livro.link_amazon
    );

    if (amazon) {
      const link = criar(
        "a",
        "amazon-button",
        "Amazon ↗"
      );

      link.href = amazon;
      link.target = "_blank";
      link.rel = "sponsored noopener noreferrer";

      link.setAttribute(
        "aria-label",
        `Ver ${livro.titulo || "o livro"} na Amazon`
      );

      acoes.appendChild(link);
    }

    conteudo.append(
      categoria,
      titulo,
      autor,
      descricao,
      acoes
    );

    card.append(
      imagemBotao,
      conteudo
    );

    return card;
  }

  /* ==========================================
     EXIBIR LIVROS
  ========================================== */

  function renderizarLivros() {
    const grade = $("gradeLivros");

    if (!grade) return;

    const filtrados = livrosFiltrados();

    grade.replaceChildren();

    filtrados.forEach((livro) => {
      grade.appendChild(criarCard(livro));
    });

    const contador = $("contadorLivros");

    if (contador) {
      contador.textContent =
        `${filtrados.length} ${
          filtrados.length === 1
            ? "livro encontrado"
            : "livros encontrados"
        }`;
    }

    const estadoVazio = $("estadoVazio");
    const estadoErro = $("estadoErro");

    if (estadoVazio) {
      estadoVazio.hidden = filtrados.length !== 0;
    }

    if (estadoErro) {
      estadoErro.hidden = true;
    }
  }

  /* ==========================================
     MODAL DE DETALHES
  ========================================== */

  function abrirDetalhe(livro, atualizarUrl = true) {
    if (!livro) return;

    const overlay = $("detalheOverlay");

    if (!overlay) return;

    if (overlay.hidden) {
      ultimoFoco = document.activeElement;
    }

    idDetalheAberto = String(livro.id);

    const detalheCategoria = $("detalheCategoria");
    const detalheTitulo = $("detalheTitulo");
    const detalheAutor = $("detalheAutor");
    const detalheDescricao = $("detalheDescricao");
    const detalheImagem = $("detalheImagem");
    const linkAmazon = $("detalheAmazon");

    if (detalheCategoria) {
      detalheCategoria.textContent =
        livro.categoria || "Leitura";
    }

    if (detalheTitulo) {
      detalheTitulo.textContent =
        livro.titulo || "Livro sem título";
    }

    if (detalheAutor) {
      detalheAutor.textContent = livro.autor
        ? `Por ${livro.autor}`
        : "Autor não informado";
    }

    if (detalheDescricao) {
      detalheDescricao.textContent =
        livro.descricao || "Descrição não disponível.";
    }

    if (detalheImagem) {
      detalheImagem.replaceChildren(
        capaLivro(livro)
      );
    }

    if (linkAmazon) {
      const amazon = urlSegura(
        livro.link_amazon
      );

      linkAmazon.hidden = !amazon;

      if (amazon) {
        linkAmazon.href = amazon;
      } else {
        linkAmazon.removeAttribute("href");
      }
    }

    overlay.hidden = false;

    document.body.classList.add("modal-open");

    $("fecharDetalhe")?.focus();

    if (atualizarUrl) {
      const url = new URL(window.location.href);

      url.searchParams.set(
        "livro",
        String(livro.id)
      );

      window.history.pushState(
        { livro: String(livro.id) },
        "",
        url
      );
    }
  }

  /* ==========================================
     FECHAR MODAL
  ========================================== */

  function fecharDetalhe(atualizarUrl = true) {
    const overlay = $("detalheOverlay");

    if (!overlay || overlay.hidden) return;

    overlay.hidden = true;

    document.body.classList.remove("modal-open");

    idDetalheAberto = null;

    if (atualizarUrl) {
      const url = new URL(window.location.href);

      url.searchParams.delete("livro");

      window.history.pushState({}, "", url);
    }

    if (ultimoFoco?.isConnected) {
      ultimoFoco.focus();
    } else {
      $("pesquisaLivros")?.focus();
    }
  }

  /* ==========================================
     CARREGAR LIVROS DA API
  ========================================== */

  async function carregarLivros() {
    const grade = $("gradeLivros");

    if (!grade) {
      console.error(
        "PsiFácil: elemento #gradeLivros não encontrado."
      );
      return;
    }

    const estadoErro = $("estadoErro");
    const estadoVazio = $("estadoVazio");
    const contador = $("contadorLivros");

    if (estadoErro) estadoErro.hidden = true;
    if (estadoVazio) estadoVazio.hidden = true;
    if (contador) contador.textContent = "Carregando...";

    grade.replaceChildren();

    const carregamento = criar(
      "div",
      "loading-state"
    );

    const spinner = criar(
      "div",
      "spinner"
    );

    const mensagem = criar(
      "p",
      "",
      "Preparando sua biblioteca..."
    );

    carregamento.append(spinner, mensagem);
    grade.appendChild(carregamento);

    try {
      const resposta = await fetch(API, {
        headers: {
          Accept: "application/json"
        }
      });

      if (!resposta.ok) {
        throw new Error(
          `Erro HTTP ${resposta.status}`
        );
      }

      const dados = await resposta.json();

      const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.livros)
          ? dados.livros
          : Array.isArray(dados.data)
            ? dados.data
            : null;

      if (!lista) {
        throw new Error(
          "Formato de resposta inesperado da API."
        );
      }

      /* MOSTRAR APENAS LIVROS PUBLICADOS */

      livros = lista.filter((livro) => {
        return (
          livro &&
          (
            livro.status == null ||
            livro.status === "publicado"
          )
        );
      });

      renderizarCategorias();
      renderizarLivros();

      /* ABRIR UM LIVRO PELA URL */

      const parametros = new URLSearchParams(
        window.location.search
      );

      const id = parametros.get("livro");

      if (id) {
        const livro = livros.find(
          (item) => String(item.id) === id
        );

        if (livro) {
          abrirDetalhe(livro, false);
        } else if (contador) {
          contador.textContent +=
            " • Livro solicitado não encontrado";
        }
      }

    } catch (erro) {
      console.error(
        "Erro ao carregar biblioteca:",
        erro
      );

      grade.replaceChildren();

      if (contador) {
        contador.textContent = "Indisponível";
      }

      if (estadoErro) {
        estadoErro.hidden = false;
      }

      if (estadoVazio) {
        estadoVazio.hidden = true;
      }
    }
  }

  /* ==========================================
     INICIALIZAÇÃO
  ========================================== */

  function iniciar() {

    /* ANO DO FOOTER — CORRIGIDO */

    const anoAtual = $("anoAtual");

    if (anoAtual) {
      anoAtual.textContent =
        new Date().getFullYear();
    }

    /* PESQUISA */

    $("pesquisaLivros")?.addEventListener(
      "input",
      renderizarLivros
    );

    /* LIMPAR FILTROS */

    $("limparFiltros")?.addEventListener(
      "click",
      () => {
        const pesquisa = $("pesquisaLivros");

        if (pesquisa) {
          pesquisa.value = "";
        }

        categoriaAtual = "Todas";

        renderizarCategorias();
        renderizarLivros();
      }
    );

    /* TENTAR NOVAMENTE */

    $("tentarNovamente")?.addEventListener(
      "click",
      carregarLivros
    );

    /* FECHAR DETALHES */

    $("fecharDetalhe")?.addEventListener(
      "click",
      () => fecharDetalhe()
    );

    document
      .querySelector("[data-fechar-detalhe]")
      ?.addEventListener(
        "click",
        () => fecharDetalhe()
      );

    /* TECLADO */

    document.addEventListener(
      "keydown",
      (evento) => {
        const overlay = $("detalheOverlay");

        if (!overlay || overlay.hidden) return;

        if (evento.key === "Escape") {
          fecharDetalhe();
          return;
        }

        if (evento.key === "Tab") {
          const elementos = [
            ...overlay.querySelectorAll(
              'button:not([disabled]), a[href]'
            )
          ].filter(
            (elemento) =>
              elemento.getClientRects().length
          );

          if (!elementos.length) return;

          const primeiro = elementos[0];
          const ultimo = elementos[elementos.length - 1];

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
        }
      }
    );

    /* NAVEGAÇÃO DO NAVEGADOR */

    window.addEventListener(
      "popstate",
      () => {
        const parametros = new URLSearchParams(
          window.location.search
        );

        const id = parametros.get("livro");

        if (!id) {
          fecharDetalhe(false);
          return;
        }

        const livro = livros.find(
          (item) => String(item.id) === id
        );

        if (
          livro &&
          idDetalheAberto !== id
        ) {
          abrirDetalhe(livro, false);
        }
      }
    );

    /* CARREGAR CATÁLOGO */

    carregarLivros();
  }

  /* ==========================================
     EXECUTAR APÓS CARREGAR O HTML
  ========================================== */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciar
    );
  } else {
    iniciar();
  }

})();
