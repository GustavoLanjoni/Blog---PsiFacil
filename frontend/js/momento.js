
document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     GOOGLE ANALYTICS — MEU MOMENTO PSIFÁCIL
  ========================================= */

  function registrarEventoMomento(nomeEvento, parametros = {}) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", nomeEvento, {
      recurso: "meu_momento_psifacil",
      ...parametros
    });
  }

  /* =========================================
     ELEMENTOS DA PÁGINA
  ========================================= */

  const secao = document.getElementById("meu-momento");

  if (!secao) return;

  const botoesHumor = secao.querySelectorAll("[data-humor]");
  const botoesNecessidade = secao.querySelectorAll("[data-necessidade]");

  const enviar = document.getElementById("momentoEnviar");
  const resultado = document.getElementById("momentoResultado");
  const perguntas = document.getElementById("momentoPerguntas");
  const mensagem = document.getElementById("momentoMensagem");
  const artigos = document.getElementById("momentoArtigos");
  const reiniciar = document.getElementById("momentoReiniciar");

  if (
    !enviar ||
    !resultado ||
    !perguntas ||
    !mensagem ||
    !artigos ||
    !reiniciar
  ) {
    console.warn(
      "Meu Momento PsiFácil: elementos necessários não encontrados."
    );
    return;
  }

  let humor = null;
  let necessidade = null;

  /* =========================================
     MENSAGENS DE ACOLHIMENTO
  ========================================= */

  const mensagens = {
    bem:
      "Que bom! Aproveite esse momento para conhecer mais sobre você.",

    ansioso:
      "Compreender o que sentimos pode ser um primeiro passo importante.",

    triste:
      "Você merece acolhimento e gentileza, inclusive de si mesmo.",

    cansado:
      "Respeitar seus limites também é uma forma de autocuidado.",

    confuso:
      "Você não precisa encontrar todas as respostas imediatamente."
  };

  /* =========================================
     NORMALIZAR TEXTOS
  ========================================= */

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }


  /* =========================================
     LIMPAR HTML DOS RESUMOS DOS ARTIGOS
  ========================================= */

  function limparResumo(conteudo) {
    if (!conteudo) return "";

    // Converte HTML em texto sem executar scripts.
    const documento = new DOMParser().parseFromString(
      String(conteudo),
      "text/html"
    );

    // Remove elementos que não devem aparecer.
    documento.querySelectorAll(
      "script, style, iframe, noscript, svg"
    ).forEach(elemento => elemento.remove());

    let texto = documento.body.textContent || "";

    // Remove espaços e quebras de linha excessivas.
    texto = texto.replace(/\s+/g, " ").trim();

    // Evita descrições muito longas.
    const limite = 180;

    if (texto.length > limite) {
      texto = texto.slice(0, limite).trimEnd();

      // Evita cortar no meio de uma palavra.
      const ultimoEspaco = texto.lastIndexOf(" ");

      if (ultimoEspaco > 100) {
        texto = texto.slice(0, ultimoEspaco);
      }

      texto += "...";
    }

    return texto;
  }


  /* =========================================
     SELEÇÃO DOS BOTÕES
  ========================================= */

  function selecionar(botoes, selecionado) {
    botoes.forEach(botao => {
      const ativo = botao === selecionado;

      botao.classList.toggle("ativo", ativo);
      botao.setAttribute("aria-pressed", String(ativo));
    });
  }

  function atualizarBotao() {
    enviar.disabled = !(humor && necessidade);
  }

  botoesHumor.forEach(botao => {
    botao.setAttribute("aria-pressed", "false");

    botao.addEventListener("click", () => {
      humor = botao.dataset.humor;

      selecionar(botoesHumor, botao);
      atualizarBotao();
    });
  });

  botoesNecessidade.forEach(botao => {
    botao.setAttribute("aria-pressed", "false");

    botao.addEventListener("click", () => {
      necessidade = botao.dataset.necessidade;

      selecionar(botoesNecessidade, botao);
      atualizarBotao();
    });
  });

  /* =========================================
     URL DOS ARTIGOS
  ========================================= */

  function obterUrl(post) {
    if (post.slug && String(post.slug).trim()) {
      return (
        "/artigos/" +
        encodeURIComponent(String(post.slug).trim())
      );
    }

    if (post.id == null) return null;

    return (
      "/post.html?id=" +
      encodeURIComponent(String(post.id))
    );
  }

  /* =========================================
     RECOMENDAÇÕES INTELIGENTES
  ========================================= */

  function pontuar(post) {
    const titulo = normalizar(post.titulo);
    const categoria = normalizar(post.categoria);
    const resumo = normalizar(post.resumo);

    const grupos = {
      bem: [
        ["autoconhecimento", "conhecer a si", "conhecer melhor"],
        ["autoestima", "autovalorizacao", "amor proprio"],
        ["bem estar", "bem-estar", "qualidade de vida", "autocuidado"],
        ["gratidao", "felicidade", "equilibrio emocional"]
      ],

      ansioso: [
        ["ansiedade", "ansioso", "ansiosa", "ansiosos"],
        ["preocupacao", "preocupacoes", "preocupado"],
        ["panico", "crise de ansiedade"],
        ["medo", "inseguranca", "nervosismo"],
        ["pensamentos acelerados", "mente acelerada"]
      ],

      triste: [
        ["tristeza", "triste", "desanimo"],
        ["luto", "perda", "saudade"],
        ["solidao", "sozinho", "sozinha"],
        ["autocompaixao", "acolhimento", "gentileza consigo"],
        ["sofrimento emocional", "dor emocional"]
      ],

      cansado: [
        ["burnout", "esgotamento", "exaustao"],
        ["cansaco", "cansado", "cansada", "fadiga"],
        ["estresse", "sobrecarga", "sobrecarregado"],
        ["descanso", "pausa", "recuperacao"],
        ["limites", "dizer nao", "autocuidado"]
      ],

      confuso: [
        ["autoconhecimento", "identificar emocoes"],
        ["ruminacao", "ruminar", "remoer"],
        ["pensamentos", "pensamento repetitivo"],
        ["indecisao", "duvida", "incerteza"],
        ["sentimentos", "conflito interno", "confusao"]
      ]
    };

    const objetivos = {
      entender: [
        "entenda",
        "entender",
        "compreenda",
        "compreender",
        "o que e",
        "por que",
        "causas",
        "sinais",
        "sintomas",
        "significa",
        "explicacao"
      ],

      acolher: [
        "acolhimento",
        "autocompaixao",
        "gentileza",
        "aceitacao",
        "validar",
        "respeitar seus limites",
        "nao se culpe",
        "acolher"
      ],

      praticar: [
        "como lidar",
        "como fazer",
        "dicas",
        "estrategias",
        "exercicios",
        "tecnicas",
        "passo a passo",
        "habitos",
        "praticas",
        "no dia a dia"
      ]
    };

    let pontosTema = 0;
    let pontosObjetivo = 0;

    // Avalia a relação do artigo com a emoção escolhida.
    for (const grupo of grupos[humor] || []) {
      const noTitulo = grupo.some(termo =>
        titulo.includes(termo)
      );

      const naCategoria = grupo.some(termo =>
        categoria.includes(termo)
      );

      const noResumo = grupo.some(termo =>
        resumo.includes(termo)
      );

      if (noTitulo) {
        pontosTema += 8;
      } else if (naCategoria) {
        pontosTema += 6;
      } else if (noResumo) {
        pontosTema += 3;
      }
    }

    // Evita recomendar artigos sem relação com o tema.
    if (pontosTema === 0) {
      return 0;
    }

    // Ajusta a ordem conforme a necessidade escolhida.
    for (const termo of objetivos[necessidade] || []) {
      if (titulo.includes(termo)) {
        pontosObjetivo += 3;
      } else if (resumo.includes(termo)) {
        pontosObjetivo += 1;
      }
    }

    return pontosTema + Math.min(pontosObjetivo, 9);
  }

  /* =========================================
     CRIAR CARD DE RECOMENDAÇÃO
  ========================================= */

  function criarLink(
    titulo,
    url,
    descricao = "",
    categoria = "",
    ehRecomendacao = true
  ) {
    const link = document.createElement("a");

    link.href = url;
    link.className = "momento-artigo";

    // Categoria
    if (categoria) {
      const categoriaElemento = document.createElement("span");

      categoriaElemento.className =
        "momento-artigo-categoria";

      categoriaElemento.textContent = categoria;

      link.appendChild(categoriaElemento);
    }

    // Título
    const nome = document.createElement("strong");

    nome.className = "momento-artigo-titulo";
    nome.textContent = titulo;

    link.appendChild(nome);

    // Descrição
    if (descricao) {
      const detalhe = document.createElement("span");

      detalhe.className = "momento-artigo-descricao";
      detalhe.textContent = descricao;

      link.appendChild(detalhe);
    }

    // Chamada para leitura
    const chamada = document.createElement("span");

    chamada.className = "momento-artigo-acao";
    chamada.textContent = ehRecomendacao
      ? "Ler artigo →"
      : "Explorar conteúdos →";

    link.appendChild(chamada);

    // Google Analytics
    if (ehRecomendacao) {
      link.addEventListener("click", () => {
        registrarEventoMomento("momento_clique_artigo", {
          link_destino: link.pathname
        });
      });
    }

    return link;
  }

  /* =========================================
     CARD ALTERNATIVO
  ========================================= */

  function mostrarLinkAlternativo() {
    artigos.replaceChildren();

    artigos.appendChild(
      criarLink(
        "Explorar todos os artigos",
        "conteudo.html",
        "",
        "",
        false
      )
    );
  }

  /* =========================================
     BUSCAR E EXIBIR RECOMENDAÇÕES
  ========================================= */

  enviar.addEventListener("click", async () => {
    if (!humor || !necessidade || enviar.disabled) {
      return;
    }

    enviar.disabled = true;

    const textoOriginal = enviar.textContent;
    enviar.textContent = "Buscando leituras...";

    let quantidadeRecomendada = 0;
    let resultadoCarregado = false;

    try {
      const resposta = await fetch("/posts", {
        headers: {
          Accept: "application/json"
        }
      });

      if (!resposta.ok) {
        throw new Error(
          `Erro ao buscar artigos: HTTP ${resposta.status}`
        );
      }

      const posts = await resposta.json();

      if (!Array.isArray(posts)) {
        throw new Error(
          "A API não retornou uma lista de artigos."
        );
      }

      const recomendados = posts
        .filter(post => {
          return (
            post &&
            post.titulo &&
            obterUrl(post)
          );
        })
        .map(post => ({
          ...post,
          pontos: pontuar(post)
        }))
        .filter(post => post.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 3);

      artigos.replaceChildren();

      mensagem.textContent =
        mensagens[humor] ||
        "Selecionamos algumas leituras para este momento.";

      if (recomendados.length === 0) {
        mensagem.textContent =
          "Ainda não encontramos leituras específicas para essa combinação. Explore nossos conteúdos.";

        mostrarLinkAlternativo();
      } else {

        // CORREÇÃO: percorre os artigos e cria cada card.
        recomendados.forEach(post => {
          artigos.appendChild(
            criarLink(
              post.titulo,
              obterUrl(post),
              limparResumo(post.resumo) ||
              "Uma leitura selecionada para este momento.",
              post.categoria || "Saúde emocional",
              true
            )
          );
        });

        quantidadeRecomendada = recomendados.length;
      }

      resultadoCarregado = true;

    } catch (erro) {
      console.error(
        "Meu Momento PsiFácil:",
        erro
      );

      mensagem.textContent =
        "Não conseguimos buscar sugestões agora. Você ainda pode explorar nossos conteúdos.";

      mostrarLinkAlternativo();

    } finally {
      enviar.textContent = textoOriginal;

      perguntas.hidden = true;
      resultado.hidden = false;

      // Mede resultados sem registrar respostas emocionais.
      if (resultadoCarregado) {
        registrarEventoMomento("momento_resultado", {
          quantidade_artigos: quantidadeRecomendada
        });
      }

      resultado.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",

        block: "center"
      });
    }
  });

  /* =========================================
     RESPONDER NOVAMENTE
  ========================================= */

  reiniciar.addEventListener("click", () => {
    registrarEventoMomento("momento_reiniciar");

    humor = null;
    necessidade = null;

    botoesHumor.forEach(botao => {
      botao.classList.remove("ativo");
      botao.setAttribute("aria-pressed", "false");
    });

    botoesNecessidade.forEach(botao => {
      botao.classList.remove("ativo");
      botao.setAttribute("aria-pressed", "false");
    });

    artigos.replaceChildren();

    resultado.hidden = true;
    perguntas.hidden = false;

    atualizarBotao();
  });

  /* =========================================
     ESTADO INICIAL
  ========================================= */

  atualizarBotao();

});
