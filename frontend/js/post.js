const apiPosts = "/posts";
const apiInteracoes = "/interacoes";

const postDetalhe = document.getElementById("postDetalhe");
const btnCurtir = document.getElementById("btnCurtir");
const totalCurtidas = document.getElementById("totalCurtidas");
const btnCompartilhar = document.getElementById("btnCompartilhar");
const formComentario = document.getElementById("formComentario");
const listaComentarios = document.getElementById("listaComentarios");
const btnSalvar = document.getElementById("btnSalvar");
const readingBar = document.getElementById("readingBar");
const postsRelacionados = document.getElementById("postsRelacionados");

const token = localStorage.getItem("tokenUsuario");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const chaveCurtida = `curtiu_post_${id}`;


/* =========================================================
   SEO
========================================================= */

function limparTexto(texto) {
  const div = document.createElement("div");
  div.innerHTML = texto || "";

  return div.textContent
    .replace(/\s+/g, " ")
    .trim();
}


function criarDescricao(post) {
  const textoResumo = limparTexto(post.resumo || "");
  const textoConteudo = limparTexto(post.conteudo || "");

  const base = textoResumo || textoConteudo;

  return base
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}


function obterUrlDoArtigo() {
  const url = new URL(window.location.href);

  return `${url.origin}${url.pathname}?id=${encodeURIComponent(id)}`;
}


function atualizarMetaTag(idElemento, atributo, valor) {
  const elemento = document.getElementById(idElemento);

  if (elemento && valor) {
    elemento.setAttribute(atributo, valor);
  }
}


function adicionarMetaProperty(property, content) {
  if (!content) return;

  let meta = document.querySelector(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}


function adicionarMetaName(name, content) {
  if (!content) return;

  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}


function atualizarSEO(post) {
  const titulo = limparTexto(post.titulo) || "Artigo | PsiFácil";

  const descricao =
    criarDescricao(post) ||
    "Leia este artigo no PsiFácil.";

  const url = obterUrlDoArtigo();

  const imagem =
    post.imagem && post.imagem.trim()
      ? post.imagem.trim()
      : null;


  /* TITLE */

  document.title = `${titulo} | PsiFácil`;


  /* META DESCRIPTION */

  atualizarMetaTag(
    "metaDescription",
    "content",
    descricao
  );


  /* CANONICAL */

  const canonicalUrl = document.getElementById("canonicalUrl");

  if (canonicalUrl) {
    canonicalUrl.setAttribute("href", url);
  }


  /* OPEN GRAPH */

  atualizarMetaTag(
    "ogTitle",
    "content",
    titulo
  );

  atualizarMetaTag(
    "ogDescription",
    "content",
    descricao
  );

  atualizarMetaTag(
    "ogUrl",
    "content",
    url
  );


  /* OG IMAGE */

  adicionarMetaProperty(
    "og:image",
    imagem
  );


  /* OG SITE NAME */

  adicionarMetaProperty(
    "og:site_name",
    "PsiFácil"
  );


  /* OG LOCALE */

  adicionarMetaProperty(
    "og:locale",
    "pt_BR"
  );


  /* TWITTER CARD */

  adicionarMetaName(
    "twitter:card",
    imagem ? "summary_large_image" : "summary"
  );

  adicionarMetaName(
    "twitter:title",
    titulo
  );

  adicionarMetaName(
    "twitter:description",
    descricao
  );

  if (imagem) {
    adicionarMetaName(
      "twitter:image",
      imagem
    );
  }


  /* =====================================================
     STRUCTURED DATA — BLOGPOSTING
  ===================================================== */

  const articleSchema =
    document.getElementById("articleSchema");

  if (articleSchema) {

    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",

      "headline": titulo,

      "description": descricao,

      "url": url,

      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },

      "datePublished": post.criado_em,

      "author": {
        "@type": "Organization",
        "name": "PsiFácil",
        "url": "https://psifacil-blog.onrender.com/"
      },

      "publisher": {
        "@type": "Organization",
        "name": "PsiFácil",
        "url": "https://psifacil-blog.onrender.com/"
      }
    };


    if (imagem) {
      schema.image = [imagem];
    }


    const dataModificacao =
      post.atualizado_em ||
      post.updated_at ||
      post.data_modificacao;

    if (dataModificacao) {
      schema.dateModified = dataModificacao;
    }


    articleSchema.textContent =
      JSON.stringify(schema);
  }
}


/* =========================================================
   SALVAR POST
========================================================= */

async function verificarSalvo() {
  if (!token || !id || !btnSalvar) return;

  try {
    const resposta = await fetch(`/salvos/${id}/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (dados.salvo) {
      atualizarBotaoSalvar(true);
    }

  } catch (error) {
    console.error("Erro ao verificar salvo:", error);
  }
}


function atualizarBotaoSalvar(salvo) {
  if (!btnSalvar) return;

  if (salvo) {

    btnSalvar.classList.add("salvo");

    btnSalvar.innerHTML = `
      <i data-lucide="bookmark-check"></i>

      <div class="action-text">
        <span class="label">Salvo</span>
        <span class="sub">Nos favoritos</span>
      </div>
    `;

  } else {

    btnSalvar.classList.remove("salvo");

    btnSalvar.innerHTML = `
      <i data-lucide="bookmark"></i>

      <div class="action-text">
        <span class="label">Salvar</span>
        <span class="sub">Ler depois</span>
      </div>
    `;
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}


if (btnSalvar) {

  btnSalvar.addEventListener("click", async () => {

    if (!token) {
      window.location.href = "login-usuario.html";
      return;
    }

    try {

      const salvo =
        btnSalvar.classList.contains("salvo");

      const metodo =
        salvo ? "DELETE" : "POST";

      const resposta = await fetch(`/salvos/${id}`, {
        method: metodo,

        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!resposta.ok) return;

      atualizarBotaoSalvar(!salvo);

    } catch (error) {
      console.error(
        "Erro ao salvar/remover post:",
        error
      );
    }
  });
}


/* =========================================================
   TEMPO DE LEITURA
========================================================= */

function calcularTempoLeitura(texto) {

  const palavras = texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;

  const minutos = Math.ceil(palavras / 200);

  return minutos || 1;
}


/* =========================================================
   FONTES E CRÉDITOS
========================================================= */

function gerarFontesCreditos(fontes) {

  if (!fontes || !fontes.trim()) {
    return "";
  }

  const linhas = fontes
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);

  if (linhas.length === 0) {
    return "";
  }

  const fontesHtml = linhas
    .map((linha) => {

      const urlRegex =
        /(https?:\/\/[^\s]+)/g;

      const partes = linha.split(urlRegex);

      const conteudo = partes
        .map((parte) => {

          if (/^https?:\/\//i.test(parte)) {

            const urlLimpa = parte.replace(
              /[),.;]+$/,
              ""
            );

            return `
              <a
                href="${urlLimpa}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${urlLimpa}
              </a>
            `;
          }

          return parte;
        })
        .join("");

      return `
        <li>
          ${conteudo}
        </li>
      `;
    })
    .join("");

  return `
    <section class="fontes-creditos">

      <h2>Fontes e créditos</h2>

      <ul>
        ${fontesHtml}
      </ul>

    </section>
  `;
}


/* =========================================================
   CARREGAR POST
========================================================= */

async function carregarPost() {

  if (!id) {

    postDetalhe.innerHTML =
      "<p>Post não encontrado.</p>";

    return;
  }

  try {

    const resposta =
      await fetch(`${apiPosts}/${id}`);

    if (!resposta.ok) {

      postDetalhe.innerHTML =
        "<p>Post não encontrado.</p>";

      return;
    }


    const post =
      await resposta.json();


    /* SEO */

    atualizarSEO(post);


    /* POSTS RELACIONADOS */

    carregarRelacionados(post);


    /* TEMPO DE LEITURA */

    const textoLimpo =
      limparTexto(post.conteudo || "");

    const tempoLeitura =
      calcularTempoLeitura(textoLimpo);


    /* FONTES */

    const fontesHtml =
      gerarFontesCreditos(post.fontes);


    /* CONTEÚDO */

    postDetalhe.innerHTML = `

      <span class="category">
        ${post.categoria || "Blog"}
      </span>

      <h1>
        ${post.titulo}
      </h1>

      <div class="post-meta">

        <span>
          Publicado em
          ${new Date(post.criado_em)
            .toLocaleDateString("pt-BR")}
        </span>

        <span class="dot"></span>

        <span>
          ${tempoLeitura} min de leitura
        </span>

      </div>


      ${
        post.imagem
          ? `
            <img
              src="${post.imagem}"
              alt="${post.titulo}"
              class="post-banner"
            >
          `
          : `
            <img
              src="https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80"
              alt=""
              class="post-banner"
            >
          `
      }


      <div class="post-text">
        ${post.conteudo || ""}
      </div>


      ${fontesHtml}


      <a
        href="psifacil.html"
        class="back-link"
      >
        ← Voltar para o blog
      </a>

    `;

  } catch (error) {

    console.error(error);

    postDetalhe.innerHTML =
      "<p>Erro ao carregar o artigo.</p>";
  }
}


/* =========================================================
   CURTIDAS
========================================================= */

async function carregarCurtidas() {

  try {

    const resposta =
      await fetch(
        `${apiInteracoes}/curtidas/${id}`
      );

    const dados =
      await resposta.json();

    totalCurtidas.textContent =
      dados.total;

  } catch (error) {

    console.error(
      "Erro ao carregar curtidas:",
      error
    );
  }
}


function atualizarEstadoCurtir() {

  if (
    localStorage.getItem(chaveCurtida)
  ) {

    btnCurtir.classList.add("curtido");
  }
}


btnCurtir.addEventListener(
  "click",
  async () => {

    if (
      localStorage.getItem(chaveCurtida)
    ) {
      return;
    }

    try {

      await fetch(
        `${apiInteracoes}/curtidas`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            post_id: id
          })
        }
      );

      localStorage.setItem(
        chaveCurtida,
        "true"
      );

      btnCurtir.classList.add(
        "curtido"
      );

      carregarCurtidas();

    } catch (error) {

      console.error(
        "Erro ao curtir:",
        error
      );
    }
  }
);


/* =========================================================
   COMPARTILHAR
========================================================= */

btnCompartilhar.addEventListener(
  "click",
  async () => {

    const url =
      window.location.href;

    if (navigator.share) {

      await navigator.share({
        title: document.title,
        url
      });

    } else {

      await navigator.clipboard
        .writeText(url);

      alert("Link copiado!");
    }
  }
);


/* =========================================================
   COMENTÁRIOS
========================================================= */

formComentario.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const nome =
      document
        .getElementById("nomeComentario")
        .value
        .trim();

    const comentario =
      document
        .getElementById("textoComentario")
        .value
        .trim();

    if (!nome || !comentario) {

      alert(
        "Preencha seu nome e comentário."
      );

      return;
    }

    try {

      await fetch(
        `${apiInteracoes}/comentarios`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            post_id: id,
            nome,
            comentario
          })
        }
      );

      formComentario.reset();

      carregarComentarios();

    } catch (error) {

      console.error(
        "Erro ao comentar:",
        error
      );
    }
  }
);


async function carregarComentarios() {

  try {

    const resposta =
      await fetch(
        `${apiInteracoes}/comentarios/${id}`
      );

    const comentarios =
      await resposta.json();

    listaComentarios.innerHTML = "";

    comentarios.forEach((item) => {

      listaComentarios.innerHTML += `

        <div class="comentario-card">

          <strong>
            ${item.nome}
          </strong>

          <p>
            ${item.comentario}
          </p>

          <small>
            ${new Date(item.criado_em)
              .toLocaleDateString("pt-BR")}
          </small>

        </div>

      `;
    });

  } catch (error) {

    console.error(
      "Erro ao carregar comentários:",
      error
    );
  }
}


/* =========================================================
   BARRA DE LEITURA
========================================================= */

window.addEventListener(
  "scroll",
  () => {

    if (!readingBar) return;

    const scrollTop =
      window.scrollY;

    const docHeight =
      document.documentElement
        .scrollHeight -
      window.innerHeight;

    if (docHeight <= 0) {

      readingBar.style.width =
        "0%";

      return;
    }

    const progresso =
      (scrollTop / docHeight) * 100;

    readingBar.style.width =
      `${Math.min(progresso, 100)}%`;
  }
);


/* =========================================================
   POSTS RELACIONADOS
========================================================= */

async function carregarRelacionados(
  postAtual
) {

  if (!postsRelacionados) return;

  try {

    const resposta =
      await fetch(apiPosts);

    const posts =
      await resposta.json();

    const relacionados =
      posts
        .filter((post) => {

          return (
            post.id !== postAtual.id &&
            post.categoria &&
            postAtual.categoria &&
            post.categoria
              .toLowerCase() ===
            postAtual.categoria
              .toLowerCase()
          );

        })
        .slice(0, 3);


    postsRelacionados.innerHTML = "";


    if (relacionados.length === 0) {

      postsRelacionados.innerHTML = `

        <p class="sem-relacionados">
          Nenhum artigo relacionado encontrado.
        </p>

      `;

      return;
    }


    relacionados.forEach((post) => {

      postsRelacionados.innerHTML += `

        <a
          href="post.html?id=${post.id}"
          class="relacionado-card"
        >

          <img
            src="${
              post.imagem ||
              "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80"
            }"
            alt="${post.titulo}"
          >

          <div class="relacionado-content">

            <span>
              ${post.categoria || "Blog"}
            </span>

            <h3>
              ${post.titulo}
            </h3>

            <p>
              ${limitarTexto(
                pegarTextoLimpo(
                  post.resumo ||
                  post.conteudo ||
                  ""
                ),
                110
              )}
            </p>

          </div>

        </a>

      `;
    });

  } catch (error) {

    console.error(
      "Erro ao carregar relacionados:",
      error
    );
  }
}


function pegarTextoLimpo(html) {

  const div =
    document.createElement("div");

  div.innerHTML =
    html || "";

  return div.textContent.trim();
}


function limitarTexto(
  texto,
  limite
) {

  if (!texto) {
    return "Clique para ler este conteúdo completo.";
  }

  if (texto.length <= limite) {
    return texto;
  }

  return (
    texto
      .substring(0, limite)
      .trim() + "..."
  );
}


/* =========================================================
   INICIAR
========================================================= */

carregarPost();
carregarCurtidas();
carregarComentarios();
atualizarEstadoCurtir();
verificarSalvo();