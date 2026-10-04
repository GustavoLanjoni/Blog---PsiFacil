const apiPosts = "/posts";
const apiLeads = "/leads";
const apiCurtidas = "/interacoes/curtidas";

const postsGrid = document.querySelector(".posts-grid");


/* =========================================================
   TEMPO DE LEITURA
========================================================= */

function calcularTempoLeitura(conteudo) {

  if (!conteudo) {
    return 1;
  }

  const texto = conteudo
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const quantidadePalavras = texto
    ? texto.split(" ").length
    : 0;

  const palavrasPorMinuto = 200;

  return Math.max(
    1,
    Math.ceil(
      quantidadePalavras /
      palavrasPorMinuto
    )
  );
}


/* =========================================================
   FORMATAR DATA DE PUBLICAÇÃO
========================================================= */

function formatarDataPublicacaoPost(data) {

  if (!data) {
    return "";
  }

  const dataPost = new Date(data);

  if (
    Number.isNaN(
      dataPost.getTime()
    )
  ) {
    return "";
  }

  const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez"
  ];

  const dia = String(
    dataPost.getDate()
  ).padStart(2, "0");

  const mes =
    meses[
      dataPost.getMonth()
    ];

  const ano =
    dataPost.getFullYear();

  return `${dia} de ${mes} de ${ano}`;
}


/* =========================================================
   OBTER DATA DO POST
========================================================= */

function obterDataPublicacaoPost(post) {

  if (!post) {
    return "";
  }

  /*
   * Tentamos os campos mais comuns.
   *
   * Assim o frontend continua funcionando
   * caso sua API esteja usando criado_em,
   * created_at ou publicado_em.
   */

  const data =
    post.publicado_em ||
    post.criado_em ||
    post.created_at ||
    post.data_publicacao ||
    post.atualizado_em ||
    "";

  return formatarDataPublicacaoPost(
    data
  );
}


/* =========================================================
   CARREGAR QUANTIDADE DE CURTIDAS
========================================================= */

async function carregarCurtidas(postId) {

  try {

    const resposta = await fetch(
      `${apiCurtidas}/${postId}`
    );

    if (!resposta.ok) {

      throw new Error(
        "Erro ao buscar curtidas."
      );

    }

    const dados =
      await resposta.json();

    return Number(
      dados.total
    ) || 0;

  } catch (error) {

    console.error(
      `Erro ao carregar curtidas do post ${postId}:`,
      error
    );

    return 0;

  }

}


/* =========================================================
   REGISTRAR CURTIDA
========================================================= */

async function curtirPost(
  postId,
  botao
) {

  if (
    botao.dataset.curtindo ===
    "true"
  ) {
    return;
  }

  botao.dataset.curtindo =
    "true";

  try {

    const resposta = await fetch(
      apiCurtidas,
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          post_id: postId
        })

      }
    );

    if (!resposta.ok) {

      throw new Error(
        "Erro ao registrar curtida."
      );

    }

    const dados =
      await resposta.json();

    console.log(
      "Curtida registrada:",
      dados
    );

    /*
     * Como a API retorna apenas a confirmação,
     * buscamos novamente a quantidade atualizada.
     */

    const novaQuantidade =
      await carregarCurtidas(
        postId
      );

    const contador =
      botao.querySelector(
        ".like-count"
      );

    if (contador) {

      contador.textContent =
        novaQuantidade;

    }

    /*
     * Estado visual do coração
     */

    botao.classList.add(
      "liked"
    );

    const icone =
      botao.querySelector(
        "i"
      );

    if (icone) {

      icone.setAttribute(
        "data-lucide",
        "heart"
      );

    }

    /*
     * Evita múltiplos cliques
     * no mesmo carregamento.
     */

    botao.disabled = true;

    if (
      typeof lucide !==
      "undefined"
    ) {

      lucide.createIcons();

    }

  } catch (error) {

    console.error(
      "Erro ao curtir post:",
      error
    );

    alert(
      "Não foi possível registrar sua curtida. Tente novamente."
    );

  } finally {

    botao.dataset.curtindo =
      "false";

  }

}


/* =========================================================
   TOKEN DO USUÁRIO
========================================================= */

function obterTokenUsuario() {

  return localStorage.getItem(
    "tokenUsuario"
  );

}


/* =========================================================
   VERIFICAR SE POST ESTÁ SALVO
========================================================= */

async function verificarPostSalvo(
  postId
) {

  const token =
    obterTokenUsuario();

  if (!token) {

    return false;

  }

  try {

    const resposta =
      await fetch(
        `/salvos/${postId}/status`,
        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );

    /*
     * Token expirado.
     */

    if (
      resposta.status === 401
    ) {

      localStorage.removeItem(
        "tokenUsuario"
      );

      localStorage.removeItem(
        "usuarioLogado"
      );

      return false;

    }

    if (!resposta.ok) {

      return false;

    }

    const dados =
      await resposta.json();

    return Boolean(
      dados.salvo
    );

  } catch (error) {

    console.error(
      `Erro ao verificar post salvo ${postId}:`,
      error
    );

    return false;

  }

}


/* =========================================================
   SALVAR / REMOVER POST
========================================================= */

async function alternarPostSalvo(
  postId,
  botao
) {

  const token =
    obterTokenUsuario();

  /*
   * Para salvar um artigo,
   * o usuário precisa estar logado.
   */

  if (!token) {

    window.location.href =
      "login-usuario.html";

    return;

  }

  if (
    botao.dataset.carregando ===
    "true"
  ) {
    return;
  }

  botao.dataset.carregando =
    "true";

  const estavaSalvo =
    botao.classList.contains(
      "salvo"
    );

  try {

    const resposta =
      await fetch(
        `/salvos/${postId}`,
        {

          method:
            estavaSalvo
              ? "DELETE"
              : "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            estavaSalvo
              ? undefined
              : JSON.stringify({
                  post_id:
                    Number(postId)
                })

        }
      );

    let dados = {};

    try {

      dados =
        await resposta.json();

    } catch (error) {

      dados = {};

    }

    /*
     * Sessão expirada.
     */

    if (
      resposta.status === 401
    ) {

      localStorage.removeItem(
        "tokenUsuario"
      );

      localStorage.removeItem(
        "usuarioLogado"
      );

      window.location.href =
        "login-usuario.html";

      return;

    }

    if (!resposta.ok) {

      throw new Error(
        dados.erro ||
        dados.mensagem ||
        "Não foi possível alterar o artigo salvo."
      );

    }

    /*
     * Se a API devolver "salvo",
     * usamos a resposta do servidor.
     *
     * Caso contrário, invertemos
     * o estado anterior.
     */

    const novoEstado =
      typeof dados.salvo ===
      "boolean"
        ? dados.salvo
        : !estavaSalvo;

    botao.classList.toggle(
      "salvo",
      novoEstado
    );

    botao.setAttribute(
      "aria-label",
      novoEstado
        ? "Remover artigo dos salvos"
        : "Salvar artigo"
    );

    botao.title =
      novoEstado
        ? "Remover dos salvos"
        : "Salvar artigo";

    if (
      typeof lucide !==
      "undefined"
    ) {

      lucide.createIcons();

    }

  } catch (error) {

    console.error(
      "Erro ao salvar artigo:",
      error
    );

    /*
     * Em caso de erro,
     * consultamos novamente o estado
     * real no servidor.
     */

    const salvo =
      await verificarPostSalvo(
        postId
      );

    botao.classList.toggle(
      "salvo",
      salvo
    );

    alert(
      "Não foi possível alterar o artigo salvo. Tente novamente."
    );

  } finally {

    botao.dataset.carregando =
      "false";

  }

}


/* =========================================================
   CRIAR CARD DO POST
========================================================= */

async function criarPostCard(post) {

  const tempoLeitura =
    calcularTempoLeitura(
      post.conteudo
    );

  const [
    quantidadeCurtidas,
    postSalvo
  ] = await Promise.all([

    carregarCurtidas(
      post.id
    ),

    verificarPostSalvo(
      post.id
    )

  ]);

  const imagem =
    post.imagem ||
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80";

  const categoria =
    post.categoria ||
    "Blog";

  const titulo =
    post.titulo ||
    "Sem título";

  const resumo =
    post.resumo ||
    "Clique para ler o conteúdo completo deste artigo.";

  const dataPublicacao =
    obterDataPublicacaoPost(
      post
    );

  const article =
    document.createElement(
      "article"
    );

  article.className =
    "post-card";

  article.innerHTML = `

    <a
      href="post.html?id=${post.id}"
      class="post-image-link"
      aria-label="Ler o artigo: ${titulo}"
    >

      <img
        src="${imagem}"
        alt="${titulo}"
        loading="lazy"
      >

    </a>


    <div class="post-content">


      <!-- CATEGORIA + DATA -->

      <div class="post-card-top">

        <span class="category">
          ${categoria}
        </span>

        ${
          dataPublicacao
            ? `
              <span class="post-date">
                ${dataPublicacao}
              </span>
            `
            : ""
        }

      </div>


      <!-- TÍTULO -->

      <h3>
        ${titulo}
      </h3>


      <!-- RESUMO -->

      <p>
        ${resumo}
      </p>


      <!-- TEMPO DE LEITURA -->

      <div class="post-reading-time">

        <i data-lucide="clock-3"></i>

        <span>
          ${tempoLeitura} min de leitura
        </span>

      </div>


      <!-- RODAPÉ -->

      <div class="post-meta">


        <!-- LER ARTIGO -->

        <a
          href="post.html?id=${post.id}"
          class="post-read-more"
          aria-label="Ler artigo: ${titulo}"
        >

          <span>
            Ler artigo
          </span>

          <i data-lucide="arrow-right"></i>

        </a>


        <!-- AÇÕES -->

        <div class="post-card-actions">


          <!-- SALVAR -->

          <button
            type="button"
            class="post-save ${postSalvo ? "salvo" : ""}"
            data-post-id="${post.id}"
            aria-label="${
              postSalvo
                ? "Remover artigo dos salvos"
                : "Salvar artigo"
            }"
            title="${
              postSalvo
                ? "Remover dos salvos"
                : "Salvar artigo"
            }"
          >

            <i data-lucide="bookmark"></i>

          </button>


          <!-- CURTIR -->

          <button
            type="button"
            class="post-like"
            data-post-id="${post.id}"
            aria-label="Curtir o artigo"
            title="Curtir"
          >

            <i data-lucide="heart"></i>

            <span class="like-count">
              ${quantidadeCurtidas}
            </span>

          </button>


        </div>

      </div>

    </div>

  `;


  /* =====================================================
     EVENTO - SALVAR
  ===================================================== */

  const botaoSalvar =
    article.querySelector(
      ".post-save"
    );

  if (botaoSalvar) {

    botaoSalvar.addEventListener(
      "click",
      () => {

        alternarPostSalvo(
          post.id,
          botaoSalvar
        );

      }
    );

  }


  /* =====================================================
     EVENTO - CURTIR
  ===================================================== */

  const botaoCurtir =
    article.querySelector(
      ".post-like"
    );

  if (botaoCurtir) {

    botaoCurtir.addEventListener(
      "click",
      () => {

        curtirPost(
          post.id,
          botaoCurtir
        );

      }
    );

  }


  return article;

}


/* =========================================================
   CARREGAR POSTS
========================================================= */

async function carregarPosts() {

  if (!postsGrid) {
    return;
  }

  try {

    const resposta =
      await fetch(
        apiPosts
      );

    if (!resposta.ok) {

      throw new Error(
        "Erro ao buscar posts."
      );

    }

    const posts =
      await resposta.json();

    postsGrid.innerHTML = "";

    /*
     * Mostra os 3 artigos
     * mais recentes.
     */

    const postsRecentes =
      posts.slice(
        0,
        3
      );

    if (
      postsRecentes.length === 0
    ) {

      postsGrid.innerHTML = `

        <div class="posts-empty">

          <p>
            Nenhum artigo publicado ainda.
          </p>

        </div>

      `;

      return;

    }

    /*
     * Criamos os cards
     * individualmente.
     */

    const cards =
      await Promise.all(

        postsRecentes.map(
          (post) =>
            criarPostCard(post)
        )

      );

    cards.forEach(
      (card) => {

        postsGrid.appendChild(
          card
        );

      }
    );

    /*
     * Inicializa os
     * ícones Lucide.
     */

    if (
      typeof lucide !==
      "undefined"
    ) {

      lucide.createIcons();

    }

  } catch (error) {

    console.error(
      "Erro ao carregar posts:",
      error
    );

    postsGrid.innerHTML = `

      <div class="posts-empty">

        <p>
          Não foi possível carregar os artigos.
        </p>

      </div>

    `;

  }

}


/* =========================================================
   FORMULÁRIO DO EBOOK
========================================================= */

const ebookForm =
  document.getElementById(
    "ebookForm"
  );

const ebookMensagem =
  document.getElementById(
    "ebookMensagem"
  );


if (ebookForm) {

  ebookForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const nomeInput =
        document.getElementById(
          "leadNome"
        );

      const emailInput =
        document.getElementById(
          "leadEmail"
        );

      const nome =
        nomeInput
          ? nomeInput.value.trim()
          : "";

      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      if (!nome || !email) {

        alert(
          "Preencha nome e e-mail."
        );

        return;

      }

      try {

        const resposta =
          await fetch(
            apiLeads,
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  nome,

                  email

                })

            }
          );

        if (!resposta.ok) {

          alert(
            "Erro ao cadastrar. Tente novamente."
          );

          return;

        }

        ebookForm.reset();

        ebookForm.style.display =
          "none";

        if (ebookMensagem) {

          ebookMensagem.style.display =
            "block";

        }

      } catch (error) {

        console.error(
          "Erro ao cadastrar lead:",
          error
        );

        alert(
          "Erro ao conectar com o servidor."
        );

      }

    }
  );

}

/* =========================================================
   VERIFICAR SE A FRASE ESTÁ SALVA
========================================================= */

async function verificarFraseSalva(
  fraseId
) {

  const btnSalvar =
    document.getElementById(
      "btnSalvarFrase"
    );


  if (!btnSalvar) {
    return;
  }


  const token =
    localStorage.getItem(
      "tokenUsuario"
    );


  /*
   * Usuário não está logado.
   * Mantemos o coração vazio.
   */

  if (!token) {

    btnSalvar.classList.remove(
      "salvo"
    );


    btnSalvar.setAttribute(
      "aria-label",
      "Salvar frase"
    );


    btnSalvar.title =
      "Salvar frase";


    return;

  }


  try {

    const resposta =
      await fetch(
        `/frases/${fraseId}/status`,
        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    /*
     * Token inválido ou expirado.
     *
     * Não redirecionamos automaticamente
     * apenas por entrar na Home.
     */

    if (
      resposta.status === 401
    ) {

      localStorage.removeItem(
        "tokenUsuario"
      );


      localStorage.removeItem(
        "usuarioLogado"
      );


      btnSalvar.classList.remove(
        "salvo"
      );


      btnSalvar.setAttribute(
        "aria-label",
        "Salvar frase"
      );


      btnSalvar.title =
        "Salvar frase";


      return;

    }


    if (!resposta.ok) {

      throw new Error(
        "Erro ao verificar frase salva."
      );

    }


    const dados =
      await resposta.json();


    /*
     * O banco decide o estado
     * verdadeiro do coração.
     */

    btnSalvar.classList.toggle(
      "salvo",
      dados.salvo
    );


    btnSalvar.setAttribute(
      "aria-label",
      dados.salvo
        ? "Remover frase dos salvos"
        : "Salvar frase"
    );


    btnSalvar.title =
      dados.salvo
        ? "Remover dos salvos"
        : "Salvar frase";


  } catch (error) {

    console.error(
      "Erro ao verificar frase salva:",
      error
    );

  }

}


/* =========================================================
   FRASE DO DIA
========================================================= */

async function carregarFraseDoDia() {

  const fraseTexto =
    document.getElementById(
      "fraseDoDia"
    );


  const fraseTipo =
    document.getElementById(
      "fraseTipo"
    );


  const fraseAutor =
    document.getElementById(
      "fraseAutor"
    );


  const btnSalvar =
    document.getElementById(
      "btnSalvarFrase"
    );


  if (!fraseTexto) {
    return;
  }


  try {

    const resposta =
      await fetch(
        "/frases/dia"
      );


    if (!resposta.ok) {

      throw new Error(
        "Não foi possível carregar a frase do dia."
      );

    }


    const frase =
      await resposta.json();


    /* =========================
       TEXTO
    ========================= */

    fraseTexto.textContent =
      `“${frase.texto}”`;


    /* =========================
       AUTOR
    ========================= */

    if (fraseAutor) {

      fraseAutor.textContent =
        frase.autor ||
        "PsiFácil";

    }


    /* =========================
       TIPO
    ========================= */

    if (fraseTipo) {

      const nomesTipos = {

        motivacao:
          "Motivação",

        reflexao:
          "Reflexão",

        pergunta:
          "Pergunta para refletir",

        autocuidado:
          "Autocuidado",

        autoconhecimento:
          "Autoconhecimento",

        recomeco:
          "Recomeço",

        acolhimento:
          "Acolhimento"

      };


      fraseTipo.textContent =
        nomesTipos[frase.tipo] ||
        "Reflexão";

    }


    /* =========================
       ID DA FRASE
    ========================= */

    if (btnSalvar) {

      btnSalvar.dataset.fraseId =
        frase.id;


      /*
       * Depois que sabemos qual é
       * a frase do dia, consultamos
       * se o usuário já a salvou.
       */

      await verificarFraseSalva(
        frase.id
      );

    }


  } catch (error) {

    console.error(
      "Erro ao carregar frase do dia:",
      error
    );


    /*
     * Não apagamos a frase padrão
     * do HTML.
     *
     * Se a API estiver indisponível,
     * o card continua mostrando
     * a reflexão padrão.
     */

  }

}


/* =========================================================
   SALVAR / REMOVER FRASE
========================================================= */

async function alternarFraseSalva() {

  const btnSalvar =
    document.getElementById(
      "btnSalvarFrase"
    );


  if (!btnSalvar) {
    return;
  }


  const fraseId =
    btnSalvar.dataset.fraseId;


  /*
   * Ainda não carregou a frase.
   */

  if (!fraseId) {
    return;
  }


  const token =
    localStorage.getItem(
      "tokenUsuario"
    );


  /* =========================
     USUÁRIO NÃO LOGADO
  ========================= */

  if (!token) {

    window.location.href =
      "login-usuario.html";


    return;

  }


  /*
   * Evita clique duplo enquanto
   * estamos esperando o servidor.
   */

  if (btnSalvar.disabled) {
    return;
  }


  btnSalvar.disabled = true;


  /*
   * Estado atual ANTES da
   * requisição.
   */

  const estavaSalva =
    btnSalvar.classList.contains(
      "salvo"
    );


  try {

    const resposta =
      await fetch(
        `/frases/${fraseId}/salvar`,
        {

          method:
            estavaSalva
              ? "DELETE"
              : "POST",

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    let dados = {};


    try {

      dados =
        await resposta.json();

    } catch (error) {

      dados = {};

    }


    /* =========================
       TOKEN INVÁLIDO
    ========================= */

    if (
      resposta.status === 401
    ) {

      localStorage.removeItem(
        "tokenUsuario"
      );


      localStorage.removeItem(
        "usuarioLogado"
      );


      window.location.href =
        "login-usuario.html";


      return;

    }


    /* =========================
       ERRO DO SERVIDOR
    ========================= */

    if (!resposta.ok) {

      throw new Error(
        dados.erro ||
        "Erro ao salvar frase."
      );

    }


    /*
     * IMPORTANTE:
     *
     * O coração só muda depois
     * que o servidor confirmou
     * que salvou/removeu.
     */

    btnSalvar.classList.toggle(
      "salvo",
      dados.salvo
    );


    btnSalvar.setAttribute(
      "aria-label",
      dados.salvo
        ? "Remover frase dos salvos"
        : "Salvar frase"
    );


    btnSalvar.title =
      dados.salvo
        ? "Remover dos salvos"
        : "Salvar frase";


  } catch (error) {

    console.error(
      "Erro ao alterar frase salva:",
      error
    );


    /*
     * Se houver erro, consultamos
     * novamente o banco para garantir
     * que o visual represente o estado
     * verdadeiro.
     */

    await verificarFraseSalva(
      fraseId
    );


  } finally {

    btnSalvar.disabled =
      false;

  }

}


/* =========================================================
   EVENTOS DA FRASE DO DIA
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
     * Primeiro carrega a frase.
     */

    carregarFraseDoDia();


    /*
     * Depois conecta o clique
     * do coração.
     */

    const btnSalvar =
      document.getElementById(
        "btnSalvarFrase"
      );


    if (btnSalvar) {

      btnSalvar.addEventListener(
        "click",
        alternarFraseSalva
      );

    }

  }
);


/* =========================================================
   INICIAR
========================================================= */

carregarPosts();