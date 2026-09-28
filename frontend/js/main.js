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
    Math.ceil(quantidadePalavras / palavrasPorMinuto)
  );
}


/* =========================================================
   CARREGAR QUANTIDADE DE CURTIDAS
========================================================= */

async function carregarCurtidas(postId) {
  try {
    const resposta = await fetch(`${apiCurtidas}/${postId}`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar curtidas.");
    }

    const dados = await resposta.json();

    return Number(dados.total) || 0;

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

async function curtirPost(postId, botao) {
  if (botao.dataset.curtindo === "true") {
    return;
  }

  botao.dataset.curtindo = "true";

  try {
    const resposta = await fetch(apiCurtidas, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        post_id: postId
      })
    });

    if (!resposta.ok) {
      throw new Error("Erro ao registrar curtida.");
    }

    const dados = await resposta.json();

    console.log("Curtida registrada:", dados);

    /*
     * Como a API retorna apenas a confirmação,
     * buscamos novamente a quantidade atualizada.
     */
    const novaQuantidade = await carregarCurtidas(postId);

    const contador = botao.querySelector(".like-count");

    if (contador) {
      contador.textContent = novaQuantidade;
    }

    /*
     * Estado visual do coração
     */
    botao.classList.add("liked");

    const icone = botao.querySelector("i");

    if (icone) {
      icone.setAttribute("data-lucide", "heart");
    }

    /*
     * Evita múltiplos cliques no mesmo carregamento.
     */
    botao.disabled = true;

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

  } catch (error) {
    console.error("Erro ao curtir post:", error);

    alert("Não foi possível registrar sua curtida. Tente novamente.");

  } finally {
    botao.dataset.curtindo = "false";
  }
}


/* =========================================================
   CRIAR CARD DO POST
========================================================= */

async function criarPostCard(post) {
  const tempoLeitura = calcularTempoLeitura(post.conteudo);

  const quantidadeCurtidas = await carregarCurtidas(post.id);

  const imagem =
    post.imagem ||
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80";

  const categoria = post.categoria || "Blog";

  const titulo = post.titulo || "Sem título";

  const resumo =
    post.resumo ||
    "Clique para ler o conteúdo completo deste artigo.";

  const article = document.createElement("article");

  article.className = "post-card";

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

      <span class="category">
        ${categoria}
      </span>

      <h3>
        ${titulo}
      </h3>

      <p>
        ${resumo}
      </p>

      <div class="post-meta">

        <div class="reading-time">
          <i data-lucide="clock-3"></i>
          <span>${tempoLeitura} min de leitura</span>
        </div>

        <button
          type="button"
          class="post-like"
          data-post-id="${post.id}"
          aria-label="Curtir o artigo"
          title="Curtir"
        >
          <i data-lucide="heart"></i>
          <span class="like-count">${quantidadeCurtidas}</span>
        </button>

      </div>

    </div>
  `;

  const botaoCurtir = article.querySelector(".post-like");

  botaoCurtir.addEventListener("click", () => {
    curtirPost(post.id, botaoCurtir);
  });

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
    const resposta = await fetch(apiPosts);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar posts.");
    }

    const posts = await resposta.json();

    postsGrid.innerHTML = "";

    /*
     * Mostra os 3 artigos mais recentes
     * porque o novo layout foi pensado para
     * três cards lado a lado.
     */
    const postsRecentes = posts.slice(0, 3);

    if (postsRecentes.length === 0) {
      postsGrid.innerHTML = `
        <div class="posts-empty">
          <p>Nenhum artigo publicado ainda.</p>
        </div>
      `;

      return;
    }

    /*
     * Criamos os cards individualmente.
     */
    const cards = await Promise.all(
      postsRecentes.map((post) => criarPostCard(post))
    );

    cards.forEach((card) => {
      postsGrid.appendChild(card);
    });

    /*
     * Inicializa os ícones Lucide
     */
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

  } catch (error) {
    console.error("Erro ao carregar posts:", error);

    postsGrid.innerHTML = `
      <div class="posts-empty">
        <p>Não foi possível carregar os artigos.</p>
      </div>
    `;
  }
}


/* =========================================================
   FORMULÁRIO DO EBOOK
========================================================= */

const ebookForm = document.getElementById("ebookForm");
const ebookMensagem = document.getElementById("ebookMensagem");

if (ebookForm) {

  ebookForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nomeInput = document.getElementById("leadNome");
    const emailInput = document.getElementById("leadEmail");

    const nome = nomeInput
      ? nomeInput.value.trim()
      : "";

    const email = emailInput
      ? emailInput.value.trim()
      : "";

    if (!nome || !email) {
      alert("Preencha nome e e-mail.");
      return;
    }

    try {

      const resposta = await fetch(apiLeads, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          nome,
          email
        })
      });

      if (!resposta.ok) {
        alert("Erro ao cadastrar. Tente novamente.");
        return;
      }

      ebookForm.reset();

      ebookForm.style.display = "none";

      if (ebookMensagem) {
        ebookMensagem.style.display = "block";
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
  });
}


/* =========================================================
   INICIAR
========================================================= */

carregarPosts();