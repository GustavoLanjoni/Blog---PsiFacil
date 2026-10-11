
/* =====================================================
   PSIFÁCIL — HISTÓRICO DE LEITURA
   Configurações > Preferências

   Preferência sincronizada com Supabase
   Histórico individual por usuário
===================================================== */

(() => {
  "use strict";

  const API = "/historico";
  const CHAVE_PREFERENCIA = "psifacil_historico_ativo";

  const toggle = document.getElementById("preferenciaHistorico");
  const lista = document.getElementById("listaHistoricoLeitura");
  const acoes = document.getElementById("historicoAcoes");
  const btnLimpar = document.getElementById("btnLimparHistorico");
  const mensagem = document.getElementById("mensagemHistorico");

  if (!toggle || !lista) {
    console.warn("Elementos do histórico não encontrados.");
    return;
  }

  let historicoAtivo = false;
  let carregamentoId = 0;

  /* =====================================================
     AUTENTICAÇÃO
  ===================================================== */

  function obterToken() {
    return localStorage.getItem("tokenUsuario");
  }

  /* =====================================================
     MENSAGENS
  ===================================================== */

  function informar(texto) {
    if (mensagem) {
      mensagem.textContent = texto;
    }
  }

  function mostrarEstado(texto) {
    lista.replaceChildren();

    const paragrafo = document.createElement("p");
    paragrafo.textContent = texto;

    lista.appendChild(paragrafo);
  }

  /* =====================================================
     REQUISIÇÕES À API
  ===================================================== */

  async function requisicao(
    caminho = "",
    metodo = "GET",
    corpo = null
  ) {
    const token = obterToken();

    if (!token) {
      throw new Error("Usuário não autenticado.");
    }

    const opcoes = {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    if (corpo !== null) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.body = JSON.stringify(corpo);
    }

    const resposta = await fetch(
      `${API}${caminho}`,
      opcoes
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.erro || `Erro HTTP ${resposta.status}`
      );
    }

    return dados;
  }

  /* =====================================================
     SINCRONIZAR PREFERÊNCIA LOCAL

     O servidor é a fonte da verdade.
     O localStorage é apenas um espelho para
     compatibilidade com a página dos artigos.
  ===================================================== */

  function atualizarPreferencia(ativo) {
    historicoAtivo = ativo === true;

    toggle.checked = historicoAtivo;

    localStorage.setItem(
      CHAVE_PREFERENCIA,
      historicoAtivo ? "true" : "false"
    );
  }

  /* =====================================================
     CONSULTAR PREFERÊNCIA NO SUPABASE
     GET /historico/preferencia
  ===================================================== */

  async function carregarPreferencia() {
    toggle.disabled = true;

    // Não assumir consentimento antes da consulta.
    atualizarPreferencia(false);

    if (acoes) {
      acoes.hidden = true;
    }

    if (!obterToken()) {
      mostrarEstado(
        "Entre na sua conta para utilizar o histórico."
      );

      informar("");
      toggle.disabled = true;
      return;
    }

    mostrarEstado("Carregando suas preferências...");

    try {
      const dados = await requisicao("/preferencia");

      atualizarPreferencia(
        dados.historico_ativo === true
      );

      await carregarHistorico();

      console.log(
        "Preferência do histórico sincronizada:",
        historicoAtivo
      );

    } catch (erro) {
      console.error(
        "Erro ao consultar preferência do histórico:",
        erro
      );

      atualizarPreferencia(false);

      mostrarEstado(
        "Não foi possível consultar sua preferência de histórico."
      );

      informar(
        "Verifique sua conexão e atualize a página."
      );

    } finally {
      toggle.disabled = false;
    }
  }

  /* =====================================================
     SALVAR PREFERÊNCIA NO SUPABASE
     PUT /historico/preferencia
  ===================================================== */

  toggle.addEventListener("change", async () => {
    const novoValor = toggle.checked;
    const valorAnterior = historicoAtivo;

    toggle.disabled = true;

    informar("Salvando sua preferência...");

    try {
      const dados = await requisicao(
        "/preferencia",
        "PUT",
        {
          historico_ativo: novoValor
        }
      );

      atualizarPreferencia(
        dados.historico_ativo === true
      );

      informar(
        historicoAtivo
          ? "Histórico de leitura ativado com sucesso."
          : "Histórico de leitura desativado."
      );

      await carregarHistorico(true);

      console.log(
        "Preferência salva no Supabase:",
        historicoAtivo
      );

    } catch (erro) {
      console.error(
        "Erro ao salvar preferência:",
        erro
      );

      // Restaurar o estado anterior caso falhe.
      atualizarPreferencia(valorAnterior);

      informar(
        "Não foi possível salvar sua preferência. Tente novamente."
      );

    } finally {
      toggle.disabled = false;
    }
  });



  /* =====================================================
     MODAL PERSONALIZADO — CONFIRMAÇÕES
  ===================================================== */

  function confirmarExclusaoHistorico({
    titulo,
    descricao,
    textoBotao = "Excluir"
  }) {
    return new Promise((resolver) => {
      const overlay = document.createElement("div");
      overlay.className = "historico-modal-overlay";

      const modal = document.createElement("div");
      modal.className = "historico-modal";
      modal.setAttribute("role", "alertdialog");
      modal.setAttribute("aria-modal", "true");

      const idTitulo = "historico-modal-titulo";
      const idDescricao = "historico-modal-descricao";

      modal.setAttribute("aria-labelledby", idTitulo);
      modal.setAttribute("aria-describedby", idDescricao);

      const icone = document.createElement("div");
      icone.className = "historico-modal-icon";
      icone.setAttribute("aria-hidden", "true");

      icone.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="24" height="24"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           stroke-linecap="round"
           stroke-linejoin="round">
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5"/>
        <path d="M14 11v5"/>
      </svg>
    `;

      const tituloElemento = document.createElement("h2");
      tituloElemento.id = idTitulo;
      tituloElemento.textContent = titulo;

      const descricaoElemento = document.createElement("p");
      descricaoElemento.id = idDescricao;
      descricaoElemento.textContent = descricao;

      const acoes = document.createElement("div");
      acoes.className = "historico-modal-acoes";

      const cancelar = document.createElement("button");
      cancelar.type = "button";
      cancelar.className = "historico-modal-cancelar";
      cancelar.textContent = "Cancelar";

      const confirmar = document.createElement("button");
      confirmar.type = "button";
      confirmar.className = "historico-modal-confirmar";
      confirmar.textContent = textoBotao;

      const elementoAnterior = document.activeElement;
      const overflowAnterior = document.body.style.overflow;

      let finalizado = false;

      function finalizar(resultado) {
        if (finalizado) return;

        finalizado = true;

        document.removeEventListener("keydown", aoPressionarTecla);

        overlay.remove();
        document.body.style.overflow = overflowAnterior;

        if (
          elementoAnterior &&
          elementoAnterior.isConnected &&
          typeof elementoAnterior.focus === "function"
        ) {
          elementoAnterior.focus();
        }

        resolver(resultado);
      }

      function aoPressionarTecla(evento) {
        if (evento.key === "Escape") {
          evento.preventDefault();
          finalizar(false);
        }

        if (evento.key === "Tab") {
          const botoes = [cancelar, confirmar];
          const indice = botoes.indexOf(document.activeElement);

          if (evento.shiftKey && indice <= 0) {
            evento.preventDefault();
            confirmar.focus();
          } else if (!evento.shiftKey && indice === 1) {
            evento.preventDefault();
            cancelar.focus();
          }
        }
      }

      cancelar.addEventListener("click", () => finalizar(false));
      confirmar.addEventListener("click", () => finalizar(true));

      overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) {
          finalizar(false);
        }
      });

      acoes.append(cancelar, confirmar);

      modal.append(
        icone,
        tituloElemento,
        descricaoElemento,
        acoes
      );

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", aoPressionarTecla);

      cancelar.focus();
    });
  }


  /* =====================================================
     CRIAR BOTÃO
  ===================================================== */

  function criarBotao(texto, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = "btn-salvar";
    botao.textContent = texto;

    botao.addEventListener("click", acao);

    return botao;
  }

  /* =====================================================
     CARREGAR HISTÓRICO DE LEITURA
     GET /historico
  ===================================================== */

  async function carregarHistorico(
    preservarMensagem = false
  ) {
    const idAtual = ++carregamentoId;

    if (!preservarMensagem) {
      informar("");
    }

    if (acoes) {
      acoes.hidden = true;
    }

    if (!historicoAtivo) {
      mostrarEstado(
        "O histórico está desativado. Ative a opção acima para acompanhar suas leituras."
      );

      return;
    }

    if (!obterToken()) {
      mostrarEstado(
        "Entre na sua conta para visualizar seu histórico."
      );

      return;
    }

    mostrarEstado("Carregando histórico de leitura...");

    try {
      const resposta = await requisicao();

      // Ignora respostas antigas.
      if (
        idAtual !== carregamentoId ||
        !historicoAtivo
      ) {
        return;
      }

      const artigos = Array.isArray(resposta)
        ? resposta
        : Array.isArray(resposta.historico)
          ? resposta.historico
          : [];

      if (artigos.length === 0) {
        mostrarEstado(
          "Você ainda não possui artigos no histórico."
        );

        return;
      }

      lista.replaceChildren();

      artigos.slice(0, 10).forEach((artigo) => {
        const postId = artigo.post_id;

        const item = document.createElement("div");
        item.className = "preferencia-item";

        const info = document.createElement("div");
        info.className = "preferencia-info";

        const conteudo = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = artigo.titulo || "Artigo";

        const progresso = Math.max(
          0,
          Math.min(
            100,
            Number(artigo.progresso) || 0
          )
        );

        const descricao = document.createElement("span");

        descricao.textContent =
          `${progresso}% de leitura concluída`;

        const barra = document.createElement("progress");

        barra.max = 100;
        barra.value = progresso;

        barra.setAttribute(
          "aria-label",
          `Progresso de leitura: ${progresso}%`
        );

        conteudo.append(
          titulo,
          descricao,
          barra
        );

        info.appendChild(conteudo);

        const botoes = document.createElement("div");
        botoes.className = "form-actions";

        /* =====================================
           CONTINUAR LENDO
        ===================================== */

        const continuar = document.createElement("a");

        continuar.className = "btn-salvar";
        continuar.textContent = "Continuar lendo";

        continuar.href =
          `/post.html?id=${encodeURIComponent(postId)}`;

        /* =====================================
           REMOVER ARTIGO
        ===================================== */

        const remover = criarBotao(
          "Remover",
          async () => {
            const confirmou = await confirmarExclusaoHistorico({
              titulo: "Remover artigo do histórico?",
              descricao:
                "Este artigo e seu progresso de leitura serão removidos do seu histórico.",
              textoBotao: "Remover artigo"
            });

            if (!confirmou) {
              return;
            }

            remover.disabled = true;

            try {
              await requisicao(
                `/${encodeURIComponent(postId)}`,
                "DELETE"
              );

              await carregarHistorico();

              informar(
                "Artigo removido do histórico."
              );

            } catch (erro) {
              console.error(
                "Erro ao remover artigo:",
                erro
              );

              informar(
                "Não foi possível remover o artigo."
              );

              remover.disabled = false;
            }
          }
        );

        botoes.append(
          continuar,
          remover
        );

        item.append(
          info,
          botoes
        );

        lista.appendChild(item);
      });

      if (acoes) {
        acoes.hidden = false;
      }

    } catch (erro) {
      if (idAtual !== carregamentoId) {
        return;
      }

      console.error(
        "Erro ao carregar histórico:",
        erro
      );

      mostrarEstado(
        "Não foi possível carregar seu histórico de leitura."
      );
    }
  }

  /* =====================================================
     LIMPAR TODO O HISTÓRICO
     DELETE /historico
  ===================================================== */

  if (btnLimpar) {
    btnLimpar.addEventListener("click", async () => {
      const confirmou = await confirmarExclusaoHistorico({
        titulo: "Excluir histórico de leitura?",
        descricao:
          "Todos os artigos e progressos registrados serão excluídos permanentemente. Esta ação não poderá ser desfeita.",
        textoBotao: "Excluir histórico"
      });

      if (!confirmou) {
        return;
      }

      btnLimpar.disabled = true;

      try {
        await requisicao("", "DELETE");

        await carregarHistorico();

        informar(
          "Histórico excluído com sucesso."
        );

      } catch (erro) {
        console.error(
          "Erro ao limpar histórico:",
          erro
        );

        informar(
          "Não foi possível limpar o histórico."
        );

      } finally {
        btnLimpar.disabled = false;
      }
    });
  }

  /* =====================================================
     SINCRONIZAÇÃO ENTRE ABAS

     Se outra aba alterar a preferência local,
     consultamos novamente o servidor.
  ===================================================== */

  window.addEventListener("storage", (evento) => {
    if (
      evento.key === CHAVE_PREFERENCIA ||
      evento.key === "tokenUsuario"
    ) {
      carregarPreferencia();
    }
  });

  /* =====================================================
     INICIALIZAÇÃO
  ===================================================== */

  // Não utilizar uma preferência antiga como autorização.
  atualizarPreferencia(false);

  carregarPreferencia();

  console.log(
    "Histórico de leitura inicializado."
  );

})();
