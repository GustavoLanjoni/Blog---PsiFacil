/*
|--------------------------------------------------------------------------
| CONFIGURAÇÕES
|--------------------------------------------------------------------------
*/

const apiPosts = "/posts";
const apiInteracoes = "/interacoes";


/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

const postDetalhe =
  document.getElementById("postDetalhe");

const btnCurtir =
  document.getElementById("btnCurtir");

const totalCurtidas =
  document.getElementById("totalCurtidas");

const btnCompartilhar =
  document.getElementById("btnCompartilhar");

const formComentario =
  document.getElementById("formComentario");

const listaComentarios =
  document.getElementById("listaComentarios");

const btnSalvar =
  document.getElementById("btnSalvar");

const readingBar =
  document.getElementById("readingBar");

const postsRelacionados =
  document.getElementById("postsRelacionados");


/*
|--------------------------------------------------------------------------
| USUÁRIO
|--------------------------------------------------------------------------
*/

const token =
  localStorage.getItem("tokenUsuario");


/*
|--------------------------------------------------------------------------
| IDENTIFICAÇÃO DO POST
|--------------------------------------------------------------------------
|
| Nova URL:
|
| /artigos/como-cuidar-da-sua-saude-mental-no-dia-a-dia
|
| O servidor coloca:
|
| window.PSIFACIL_POST = {
|   id: 10,
|   slug: "...",
|   url: "..."
| }
|
| Mantemos também compatibilidade temporária com:
|
| /post.html?id=10
|--------------------------------------------------------------------------
*/

const params =
  new URLSearchParams(window.location.search);

const idAntigo =
  params.get("id");

const dadosServidor =
  window.PSIFACIL_POST || null;

const id =
  dadosServidor?.id || idAntigo;

const slug =
  dadosServidor?.slug || null;

const urlCanonica =
  dadosServidor?.url || null;

const chaveCurtida =
  id
    ? `curtiu_post_${id}`
    : null;


/*
|--------------------------------------------------------------------------
| UTILITÁRIOS
|--------------------------------------------------------------------------
*/

function escaparHtml(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function limparTexto(texto) {
  const div =
    document.createElement("div");

  div.innerHTML =
    texto || "";

  return (
    div.textContent ||
    div.innerText ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
}


function pegarTextoLimpo(html) {
  return limparTexto(html);
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


function calcularTempoLeitura(texto) {
  const palavras =
    String(texto || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

  return (
    Math.ceil(palavras / 200) || 1
  );
}


/*
|--------------------------------------------------------------------------
| URL DO ARTIGO
|--------------------------------------------------------------------------
*/

function obterUrlDoArtigo() {
  /*
  |----------------------------------------------------------------------
  | Nova arquitetura
  |----------------------------------------------------------------------
  */

  if (urlCanonica) {
    return urlCanonica;
  }


  /*
  |----------------------------------------------------------------------
  | Compatibilidade temporária com URL antiga
  |----------------------------------------------------------------------
  */

  const url =
    new URL(window.location.href);

  if (id) {
    return (
      `${url.origin}/post.html?id=` +
      encodeURIComponent(id)
    );
  }

  return window.location.href;
}


/*
|--------------------------------------------------------------------------
| SEO PARA URL ANTIGA
|--------------------------------------------------------------------------
|
| Na nova rota /artigos/:slug o SEO já vem pronto do servidor.
|
| Esta parte existe somente para manter post.html?id=... funcionando
| enquanto concluímos a migração.
|--------------------------------------------------------------------------
*/

function criarDescricao(post) {
  const textoResumo =
    limparTexto(post.resumo || "");

  const textoConteudo =
    limparTexto(post.conteudo || "");

  const base =
    textoResumo ||
    textoConteudo ||
    "Leia este artigo no PsiFácil.";

  return base
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}


function atualizarMetaTag(
  idElemento,
  atributo,
  valor
) {
  const elemento =
    document.getElementById(idElemento);

  if (
    elemento &&
    valor
  ) {
    elemento.setAttribute(
      atributo,
      valor
    );
  }
}


function adicionarMetaProperty(
  property,
  content
) {
  if (!content) return;

  let meta =
    document.querySelector(
      `meta[property="${property}"]`
    );

  if (!meta) {
    meta =
      document.createElement("meta");

    meta.setAttribute(
      "property",
      property
    );

    document.head.appendChild(meta);
  }

  meta.setAttribute(
    "content",
    content
  );
}


function adicionarMetaName(
  name,
  content
) {
  if (!content) return;

  let meta =
    document.querySelector(
      `meta[name="${name}"]`
    );

  if (!meta) {
    meta =
      document.createElement("meta");

    meta.setAttribute(
      "name",
      name
    );

    document.head.appendChild(meta);
  }

  meta.setAttribute(
    "content",
    content
  );
}


function atualizarSEOAntigo(post) {
  /*
  |----------------------------------------------------------------------
  | Na nova página SSR não alteramos o SEO.
  | Ele já foi produzido corretamente pelo Node.
  |----------------------------------------------------------------------
  */

  if (dadosServidor) {
    return;
  }

  const titulo =
    limparTexto(post.titulo) ||
    "Artigo";

  const descricao =
    criarDescricao(post);

  const url =
    obterUrlDoArtigo();

  const imagem =
    post.imagem &&
      post.imagem.trim()
      ? post.imagem.trim()
      : null;


  document.title =
    `${titulo} | PsiFácil`;


  atualizarMetaTag(
    "metaDescription",
    "content",
    descricao
  );


  const canonical =
    document.getElementById(
      "canonicalUrl"
    );

  if (canonical) {
    canonical.setAttribute(
      "href",
      url
    );
  }


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


  adicionarMetaProperty(
    "og:image",
    imagem
  );

  adicionarMetaProperty(
    "og:site_name",
    "PsiFácil"
  );

  adicionarMetaProperty(
    "og:locale",
    "pt_BR"
  );


  adicionarMetaName(
    "twitter:card",
    imagem
      ? "summary_large_image"
      : "summary"
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


  const articleSchema =
    document.getElementById(
      "articleSchema"
    );

  if (articleSchema) {
    const schema = {
      "@context":
        "https://schema.org",

      "@type":
        "BlogPosting",

      headline:
        titulo,

      description:
        descricao,

      url,

      mainEntityOfPage: {
        "@type":
          "WebPage",

        "@id":
          url
      },

      datePublished:
        post.criado_em,

      author: {
        "@type":
          "Organization",

        name:
          "PsiFácil",

        url:
          "https://psifacilblog.com.br/"
      },

      publisher: {
        "@type":
          "Organization",

        name:
          "PsiFácil",

        url:
          "https://psifacilblog.com.br/"
      }
    };


    if (imagem) {
      schema.image =
        [imagem];
    }


    const dataModificacao =
      post.atualizado_em ||
      post.updated_at ||
      post.data_modificacao;


    if (dataModificacao) {
      schema.dateModified =
        dataModificacao;
    }


    articleSchema.textContent =
      JSON.stringify(schema);
  }
}


/*
|--------------------------------------------------------------------------
| FONTES E CRÉDITOS
|--------------------------------------------------------------------------
|
| Usado apenas na URL antiga.
|
| Na nova rota SSR as fontes já são geradas pelo renderPost.js.
|--------------------------------------------------------------------------
*/

function gerarFontesCreditos(
  fontes
) {
  if (
    !fontes ||
    !String(fontes).trim()
  ) {
    return "";
  }


  const linhas =
    String(fontes)
      .split(/\r?\n/)
      .map(
        (linha) =>
          linha.trim()
      )
      .filter(Boolean);


  if (
    linhas.length === 0
  ) {
    return "";
  }


  const fontesHtml =
    linhas
      .map((linha) => {
        const urlRegex =
          /(https?:\/\/[^\s]+)/g;

        const partes =
          linha.split(urlRegex);


        const conteudo =
          partes
            .map((parte) => {
              if (
                /^https?:\/\//i.test(
                  parte
                )
              ) {
                const urlLimpa =
                  parte.replace(
                    /[),.;]+$/,
                    ""
                  );

                const final =
                  parte.substring(
                    urlLimpa.length
                  );

                return `
                  <a
                    href="${escaparHtml(urlLimpa)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ${escaparHtml(urlLimpa)}
                  </a>${escaparHtml(final)}
                `;
              }

              return escaparHtml(
                parte
              );
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

      <h2>
        Fontes e créditos
      </h2>

      <ul>
        ${fontesHtml}
      </ul>

    </section>
  `;
}


/*
|--------------------------------------------------------------------------
| CARREGAR POST ANTIGO
|--------------------------------------------------------------------------
|
| IMPORTANTE:
|
| Esta função SOMENTE é utilizada quando alguém acessa:
|
| /post.html?id=10
|
| Em /artigos/:slug o artigo já está no HTML e NÃO fazemos fetch para
| reconstruir o conteúdo.
|--------------------------------------------------------------------------
*/

async function carregarPostAntigo() {
  if (
    dadosServidor ||
    !postDetalhe
  ) {
    return null;
  }


  if (!id) {
    postDetalhe.innerHTML =
      "<p>Post não encontrado.</p>";

    return null;
  }


  try {
    const resposta =
      await fetch(
        `${apiPosts}/${id}`
      );


    if (!resposta.ok) {
      postDetalhe.innerHTML =
        "<p>Post não encontrado.</p>";

      return null;
    }


    const post =
      await resposta.json();


    /*
    |--------------------------------------------------------------------------
    | SEO ANTIGO
    |--------------------------------------------------------------------------
    */

    atualizarSEOAntigo(post);


    /*
    |--------------------------------------------------------------------------
    | TEMPO DE LEITURA
    |--------------------------------------------------------------------------
    */

    const textoLimpo =
      limparTexto(
        post.conteudo || ""
      );

    const tempoLeitura =
      calcularTempoLeitura(
        textoLimpo
      );


    /*
    |--------------------------------------------------------------------------
    | FONTES
    |--------------------------------------------------------------------------
    */

    const fontesHtml =
      gerarFontesCreditos(
        post.fontes
      );


    /*
    |--------------------------------------------------------------------------
    | CONTEÚDO
    |--------------------------------------------------------------------------
    */

    postDetalhe.innerHTML = `

      <span class="category">
        ${escaparHtml(
      post.categoria ||
      "Blog"
    )}
      </span>


      <h1>
        ${escaparHtml(
      post.titulo ||
      "Artigo"
    )}
      </h1>


      <div class="post-meta">

        <span>
          Publicado em
          ${post.criado_em
        ? new Date(
          post.criado_em
        )
          .toLocaleDateString(
            "pt-BR"
          )
        : ""
      }
        </span>

        <span class="dot"></span>

        <span>
          ${tempoLeitura}
          min de leitura
        </span>

      </div>


      ${post.imagem
        ? `
            <img
              src="${escaparHtml(post.imagem)}"
              alt="${escaparHtml(post.titulo || "")}"
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
        href="/"
        class="back-link"
      >
        ← Voltar para o blog
      </a>

    `;


    return post;

  } catch (error) {
    console.error(
      "Erro ao carregar artigo:",
      error
    );

    postDetalhe.innerHTML =
      "<p>Erro ao carregar o artigo.</p>";

    return null;
  }
}


/*
|--------------------------------------------------------------------------
| SALVAR POST
|--------------------------------------------------------------------------
*/

async function verificarSalvo() {
  if (
    !token ||
    !id ||
    !btnSalvar
  ) {
    return;
  }


  try {
    const resposta =
      await fetch(
        `/salvos/${id}/status`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    if (!resposta.ok) {
      return;
    }


    const dados =
      await resposta.json();


    atualizarBotaoSalvar(
      Boolean(dados.salvo)
    );

  } catch (error) {
    console.error(
      "Erro ao verificar artigo salvo:",
      error
    );
  }
}


function atualizarBotaoSalvar(
  salvo
) {
  if (!btnSalvar) {
    return;
  }


  if (salvo) {
    btnSalvar.classList.add(
      "salvo"
    );

    btnSalvar.innerHTML = `

      <span class="action-icon">
        <i data-lucide="bookmark-check"></i>
      </span>

      <span class="action-text">

        <span class="label">
          Salvo
        </span>

        <span class="sub">
          Nos favoritos
        </span>

      </span>
    `;

  } else {
    btnSalvar.classList.remove(
      "salvo"
    );

    btnSalvar.innerHTML = `

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
    `;
  }


  if (window.lucide) {
    window.lucide.createIcons();
  }
}


if (btnSalvar) {
  btnSalvar.addEventListener(
    "click",
    async () => {
      if (!id) {
        return;
      }


      if (!token) {
        window.location.href =
          "/login-usuario.html";

        return;
      }


      const salvo =
        btnSalvar.classList.contains(
          "salvo"
        );


      const metodo =
        salvo
          ? "DELETE"
          : "POST";


      btnSalvar.disabled =
        true;


      try {
        const resposta =
          await fetch(
            `/salvos/${id}`,
            {
              method:
                metodo,

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        if (
          resposta.status === 401 ||
          resposta.status === 403
        ) {
          localStorage.removeItem(
            "tokenUsuario"
          );

          window.location.href =
            "/login-usuario.html";

          return;
        }


        if (!resposta.ok) {
          console.error(
            "Não foi possível alterar o estado do artigo salvo."
          );

          return;
        }


        atualizarBotaoSalvar(
          !salvo
        );

      } catch (error) {
        console.error(
          "Erro ao salvar/remover artigo:",
          error
        );

      } finally {
        btnSalvar.disabled =
          false;
      }
    }
  );
}


/*
|--------------------------------------------------------------------------
| CURTIDAS
|--------------------------------------------------------------------------
*/

async function carregarCurtidas() {
  if (
    !id ||
    !totalCurtidas
  ) {
    return;
  }


  try {
    const resposta =
      await fetch(
        `${apiInteracoes}/curtidas/${id}`
      );


    if (!resposta.ok) {
      return;
    }


    const dados =
      await resposta.json();


    totalCurtidas.textContent =
      dados.total ?? 0;

  } catch (error) {
    console.error(
      "Erro ao carregar curtidas:",
      error
    );
  }
}


function atualizarEstadoCurtir() {
  if (
    !id ||
    !chaveCurtida ||
    !btnCurtir
  ) {
    return;
  }


  if (
    localStorage.getItem(
      chaveCurtida
    )
  ) {
    btnCurtir.classList.add(
      "curtido"
    );
  }
}


if (btnCurtir) {
  btnCurtir.addEventListener(
    "click",
    async () => {
      if (
        !id ||
        !chaveCurtida
      ) {
        return;
      }


      if (
        localStorage.getItem(
          chaveCurtida
        )
      ) {
        return;
      }


      btnCurtir.disabled =
        true;


      try {
        const resposta =
          await fetch(
            `${apiInteracoes}/curtidas`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  post_id:
                    id
                })
            }
          );


        if (!resposta.ok) {
          console.error(
            "Não foi possível registrar a curtida."
          );

          return;
        }


        localStorage.setItem(
          chaveCurtida,
          "true"
        );


        btnCurtir.classList.add(
          "curtido"
        );


        await carregarCurtidas();

      } catch (error) {
        console.error(
          "Erro ao curtir:",
          error
        );

      } finally {
        btnCurtir.disabled =
          false;
      }
    }
  );
}


/*
|--------------------------------------------------------------------------
| COMPARTILHAR
|--------------------------------------------------------------------------
*/

if (btnCompartilhar) {
  btnCompartilhar.addEventListener(
    "click",
    async () => {
      const url =
        obterUrlDoArtigo();


      try {
        if (navigator.share) {
          await navigator.share({
            title:
              document.title,

            url
          });

          return;
        }


        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard
            .writeText(url);

          alert(
            "Link do artigo copiado."
          );

          return;
        }


        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value =
          url;

        textarea.setAttribute(
          "readonly",
          ""
        );

        textarea.style.position =
          "fixed";

        textarea.style.opacity =
          "0";


        document.body.appendChild(
          textarea
        );

        textarea.select();

        document.execCommand(
          "copy"
        );

        textarea.remove();


        alert(
          "Link do artigo copiado."
        );

      } catch (error) {
        /*
        |------------------------------------------------------------------
        | O usuário pode cancelar o compartilhamento nativo.
        | Isso não precisa ser tratado como erro da aplicação.
        |------------------------------------------------------------------
        */

        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "Erro ao compartilhar:",
            error
          );
        }
      }
    }
  );
}


/*
|--------------------------------------------------------------------------
| COMENTÁRIOS
|--------------------------------------------------------------------------
*/

if (formComentario) {
  formComentario.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      if (!id) {
        return;
      }


      const campoNome =
        document.getElementById(
          "nomeComentario"
        );

      const campoComentario =
        document.getElementById(
          "textoComentario"
        );


      const nome =
        campoNome?.value
          .trim();

      const comentario =
        campoComentario?.value
          .trim();


      if (
        !nome ||
        !comentario
      ) {
        alert(
          "Preencha seu nome e comentário."
        );

        return;
      }


      const botaoEnviar =
        formComentario.querySelector(
          'button[type="submit"]'
        );


      if (botaoEnviar) {
        botaoEnviar.disabled =
          true;
      }


      try {
        const resposta =
          await fetch(
            `${apiInteracoes}/comentarios`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  post_id:
                    id,

                  nome,

                  comentario
                })
            }
          );


        if (!resposta.ok) {
          console.error(
            "Não foi possível enviar o comentário."
          );

          return;
        }


        formComentario.reset();


        await carregarComentarios();

      } catch (error) {
        console.error(
          "Erro ao comentar:",
          error
        );

      } finally {
        if (botaoEnviar) {
          botaoEnviar.disabled =
            false;
        }
      }
    }
  );
}


async function carregarComentarios() {
  if (
    !id ||
    !listaComentarios
  ) {
    return;
  }


  try {
    const resposta =
      await fetch(
        `${apiInteracoes}/comentarios/${id}`
      );


    if (!resposta.ok) {
      return;
    }


    const comentarios =
      await resposta.json();


    listaComentarios.innerHTML =
      "";


    if (
      !Array.isArray(comentarios) ||
      comentarios.length === 0
    ) {
      return;
    }


    comentarios.forEach(
      (item) => {
        const card =
          document.createElement(
            "div"
          );

        card.className =
          "comentario-card";


        const nome =
          document.createElement(
            "strong"
          );

        nome.textContent =
          item.nome || "Visitante";


        const texto =
          document.createElement(
            "p"
          );

        texto.textContent =
          item.comentario || "";


        const data =
          document.createElement(
            "small"
          );

        data.textContent =
          item.criado_em
            ? new Date(
              item.criado_em
            )
              .toLocaleDateString(
                "pt-BR"
              )
            : "";


        card.appendChild(
          nome
        );

        card.appendChild(
          texto
        );

        card.appendChild(
          data
        );


        listaComentarios.appendChild(
          card
        );
      }
    );

  } catch (error) {
    console.error(
      "Erro ao carregar comentários:",
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| BARRA DE PROGRESSO DA LEITURA
|--------------------------------------------------------------------------
*/

function atualizarBarraLeitura() {
  if (!readingBar) {
    return;
  }


  const scrollTop =
    window.scrollY ||
    document.documentElement.scrollTop;


  const docHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;


  if (docHeight <= 0) {
    readingBar.style.width =
      "0%";

    return;
  }


  const progresso =
    (scrollTop / docHeight) *
    100;


  readingBar.style.width =
    `${Math.min(
      Math.max(
        progresso,
        0
      ),
      100
    )}%`;
}


window.addEventListener(
  "scroll",
  atualizarBarraLeitura,
  {
    passive: true
  }
);


/*
|--------------------------------------------------------------------------
| POSTS RELACIONADOS
|--------------------------------------------------------------------------
*/

async function carregarRelacionados(
  postAtual
) {
  if (!postsRelacionados) {
    return;
  }


  try {
    const resposta =
      await fetch(
        apiPosts
      );


    if (!resposta.ok) {
      return;
    }


    const posts =
      await resposta.json();


    if (!Array.isArray(posts)) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | PRIMEIRA TENTATIVA:
    | mesma categoria
    |--------------------------------------------------------------------------
    */

    let relacionados =
      posts.filter((post) => {
        const outroId =
          String(post.id);

        const atualId =
          String(id);


        return (
          outroId !== atualId &&
          post.categoria &&
          postAtual?.categoria &&
          post.categoria
            .toLowerCase() ===
          postAtual.categoria
            .toLowerCase()
        );
      });


    /*
    |--------------------------------------------------------------------------
    | Se não houver artigos suficientes da mesma categoria,
    | completamos com outros artigos publicados.
    |--------------------------------------------------------------------------
    */

    if (
      relacionados.length < 3
    ) {
      const idsJaUsados =
        new Set(
          relacionados.map(
            (post) =>
              String(post.id)
          )
        );


      const adicionais =
        posts.filter((post) => {
          return (
            String(post.id) !==
            String(id) &&
            !idsJaUsados.has(
              String(post.id)
            )
          );
        });


      relacionados = [
        ...relacionados,
        ...adicionais
      ];
    }


    relacionados =
      relacionados.slice(
        0,
        3
      );


    postsRelacionados.innerHTML =
      "";


    if (
      relacionados.length === 0
    ) {
      postsRelacionados.innerHTML = `
        <p class="sem-relacionados">
          Nenhum artigo relacionado encontrado.
        </p>
      `;

      return;
    }


    relacionados.forEach(
      (post) => {
        const titulo =
          escaparHtml(
            post.titulo ||
            "Artigo"
          );


        const categoria =
          escaparHtml(
            post.categoria ||
            "Blog"
          );


        const imagem =
          post.imagem ||
          "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80";


        const resumo =
          limitarTexto(
            pegarTextoLimpo(
              post.resumo ||
              post.conteudo ||
              ""
            ),
            110
          );


        /*
        |--------------------------------------------------------------------------
        | NOVA URL
        |--------------------------------------------------------------------------
        |
        | Se o post já possui slug:
        |
        | /artigos/slug
        |
        | Se por algum motivo não possuir slug, mantemos fallback antigo.
        |--------------------------------------------------------------------------
        */

        const href =
          post.slug
            ? `/artigos/${encodeURIComponent(post.slug)}`
            : `/post.html?id=${encodeURIComponent(post.id)}`;


        const card =
          document.createElement(
            "a"
          );

        card.href =
          href;

        card.className =
          "relacionado-card";


        const img =
          document.createElement(
            "img"
          );

        img.src =
          imagem;

        img.alt =
          post.titulo || "Artigo";

        img.loading =
          "lazy";


        const content =
          document.createElement(
            "div"
          );

        content.className =
          "relacionado-content";


        const span =
          document.createElement(
            "span"
          );

        span.textContent =
          post.categoria ||
          "Blog";


        const h3 =
          document.createElement(
            "h3"
          );

        h3.textContent =
          post.titulo ||
          "Artigo";


        const p =
          document.createElement(
            "p"
          );

        p.textContent =
          resumo;


        content.appendChild(
          span
        );

        content.appendChild(
          h3
        );

        content.appendChild(
          p
        );


        card.appendChild(
          img
        );

        card.appendChild(
          content
        );


        postsRelacionados.appendChild(
          card
        );
      }
    );

  } catch (error) {
    console.error(
      "Erro ao carregar relacionados:",
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| OBTER DADOS DO POST PARA RELACIONADOS
|--------------------------------------------------------------------------
|
| Na página SSR o HTML principal já está pronto, mas precisamos da categoria
| para encontrar relacionados.
|
| Fazemos uma chamada à API apenas para recursos complementares.
|
| IMPORTANTE:
| isso NÃO substitui nem recria o conteúdo principal.
|--------------------------------------------------------------------------
*/

async function obterDadosComplementaresPost() {
  if (!id) {
    return null;
  }


  try {
    const resposta =
      await fetch(
        `${apiPosts}/${id}`
      );


    if (!resposta.ok) {
      return null;
    }


    return await resposta.json();

  } catch (error) {
    console.error(
      "Erro ao obter dados complementares:",
      error
    );

    return null;
  }
}


/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

async function iniciarPaginaPost() {
  /*
  |--------------------------------------------------------------------------
  | Sem ID não executamos APIs de interação.
  |--------------------------------------------------------------------------
  */

  if (!id) {
    console.error(
      "PsiFácil: não foi possível identificar o artigo."
    );

    return;
  }


  /*
  |--------------------------------------------------------------------------
  | URL ANTIGA
  |--------------------------------------------------------------------------
  |
  | Se não existe window.PSIFACIL_POST, significa que estamos no
  | post.html?id=...
  |
  | Nesse caso mantemos temporariamente o comportamento antigo.
  |--------------------------------------------------------------------------
  */

  let postAtual =
    null;


  if (!dadosServidor) {
    postAtual =
      await carregarPostAntigo();

  } else {
    /*
    |--------------------------------------------------------------------------
    | NOVA URL SSR
    |--------------------------------------------------------------------------
    |
    | NÃO carregamos/recriamos o conteúdo principal.
    |--------------------------------------------------------------------------
    */

    postAtual =
      await obterDadosComplementaresPost();
  }


  /*
  |--------------------------------------------------------------------------
  | INTERAÇÕES
  |--------------------------------------------------------------------------
  */

  await Promise.allSettled([
    carregarCurtidas(),
    carregarComentarios(),
    verificarSalvo()
  ]);


  atualizarEstadoCurtir();


  /*
  |--------------------------------------------------------------------------
  | RELACIONADOS
  |--------------------------------------------------------------------------
  */

  if (postAtual) {
    await carregarRelacionados(
      postAtual
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ÍCONES
  |--------------------------------------------------------------------------
  */

  if (window.lucide) {
    window.lucide.createIcons();
  }


  /*
  |--------------------------------------------------------------------------
  | BARRA DE LEITURA
  |--------------------------------------------------------------------------
  */

  atualizarBarraLeitura();
}


/*
|--------------------------------------------------------------------------
| INICIAR
|--------------------------------------------------------------------------
*/

iniciarPaginaPost();




/* =====================================================
   PSIFÁCIL — HISTÓRICO DE LEITURA
   Progresso real, sincronização e retomada
===================================================== */

(() => {
  "use strict";

  const API = "/historico";
  const CHAVE_LOCAL = "psifacil_historico_ativo";

  const INTERVALO_SALVAMENTO = 15000;
  const ATRASO_SCROLL = 1200;

  const artigoId =
    window.PSIFACIL_POST?.id ||
    new URLSearchParams(window.location.search).get("id");

  if (
    !artigoId ||
    !/^[1-9]\d*$/.test(String(artigoId))
  ) {
    return;
  }

  let autorizado = false;
  let iniciado = false;
  let encerrado = false;

  let progressoSalvo = 0;
  let maiorProgresso = 0;

  let ultimoEnvio = 0;
  let envioEmAndamento = false;

  let temporizadorScroll = null;
  let temporizadorPeriodico = null;
  let observador = null;

  function obterToken() {
    return localStorage.getItem("tokenUsuario");
  }

  function obterConteudo() {
    return document.querySelector(
      "#postDetalhe .post-text"
    );
  }

  function permitidoLocalmente() {
    return (
      localStorage.getItem(CHAVE_LOCAL) === "true" &&
      Boolean(obterToken())
    );
  }

  function limitarPorcentagem(valor) {
    return Math.max(
      0,
      Math.min(100, Math.round(Number(valor) || 0))
    );
  }

  function calcularProgresso() {
    const conteudo = obterConteudo();

    if (!conteudo) return null;

    const retangulo = conteudo.getBoundingClientRect();

    const inicio = retangulo.top + window.scrollY;
    const altura = retangulo.height;

    if (altura <= 0) return null;

    const fim = inicio + altura;

    // A posição inferior da tela representa
    // até onde o leitor conseguiu visualizar.
    const posicaoVisivel =
      window.scrollY + window.innerHeight;

    if (posicaoVisivel <= inicio) {
      return 0;
    }

    if (posicaoVisivel >= fim) {
      return 100;
    }

    return limitarPorcentagem(
      ((posicaoVisivel - inicio) / altura) * 100
    );
  }

  async function consultarPreferencia() {
    const token = obterToken();

    if (!token) return false;

    try {
      const resposta = await fetch(
        `${API}/preferencia`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: "no-store"
        }
      );

      if (!resposta.ok) {
        return false;
      }

      const dados = await resposta.json();

      const ativo = dados.historico_ativo === true;

      localStorage.setItem(
        CHAVE_LOCAL,
        ativo ? "true" : "false"
      );

      return ativo;
    } catch (erro) {
      console.warn(
        "Não foi possível consultar a preferência de histórico:",
        erro
      );

      return false;
    }
  }

  async function consultarProgressoSalvo() {
    const token = obterToken();

    if (!token || !autorizado) {
      return 0;
    }

    try {
      const resposta = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      });

      if (!resposta.ok) {
        return 0;
      }

      const dados = await resposta.json();

      const artigos = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.historico)
          ? dados.historico
          : [];

      const artigo = artigos.find(
        (item) =>
          String(item.post_id) === String(artigoId)
      );

      return limitarPorcentagem(
        artigo?.progresso ?? 0
      );
    } catch (erro) {
      console.warn(
        "Não foi possível consultar o progresso anterior:",
        erro
      );

      return 0;
    }
  }

  async function enviarProgresso(forcar = false) {
    if (
      encerrado ||
      !autorizado ||
      !permitidoLocalmente()
    ) {
      return;
    }

    const progressoAtual = calcularProgresso();

    if (progressoAtual === null) {
      return;
    }

    maiorProgresso = Math.max(
      maiorProgresso,
      progressoAtual
    );

    const progresso = limitarPorcentagem(
      maiorProgresso
    );

    // Não cria um registro apenas porque
    // o usuário abriu o artigo.
    if (progresso <= 0) {
      return;
    }

    if (progresso <= progressoSalvo) {
      return;
    }

    if (envioEmAndamento) {
      return;
    }

    const agora = Date.now();

    if (
      !forcar &&
      agora - ultimoEnvio < INTERVALO_SALVAMENTO
    ) {
      return;
    }

    const token = obterToken();

    if (!token) return;

    envioEmAndamento = true;
    ultimoEnvio = agora;

    try {
      const resposta = await fetch(API, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          post_id: Number(artigoId),
          progresso
        }),

        keepalive: true
      });

      if (resposta.status === 403) {
        autorizado = false;
        pararMonitoramento();
        return;
      }

      if (resposta.status === 401) {
        autorizado = false;
        pararMonitoramento();
        return;
      }

      if (!resposta.ok) {
        console.warn(
          "Falha ao salvar progresso:",
          resposta.status
        );
        return;
      }

      progressoSalvo = Math.max(
        progressoSalvo,
        progresso
      );

    } catch (erro) {
      console.warn(
        "Erro ao salvar progresso de leitura:",
        erro
      );
    } finally {
      envioEmAndamento = false;
    }
  }

  function verificarProgresso() {
    if (
      encerrado ||
      !autorizado ||
      !permitidoLocalmente() ||
      document.visibilityState === "hidden"
    ) {
      return;
    }

    const progresso = calcularProgresso();

    if (progresso === null) {
      return;
    }

    maiorProgresso = Math.max(
      maiorProgresso,
      progresso
    );

    if (temporizadorScroll !== null) {
      clearTimeout(temporizadorScroll);
    }

    temporizadorScroll = setTimeout(() => {
      enviarProgresso();
    }, ATRASO_SCROLL);
  }

  function retomarLeitura(progresso) {
    const conteudo = obterConteudo();

    if (!conteudo) return;

    const porcentagem = limitarPorcentagem(
      progresso
    );

    // Artigos finalizados começam normalmente.
    if (porcentagem <= 0 || porcentagem >= 100) {
      return;
    }

    // Evita mover a página caso o visitante
    // já tenha começado a navegar manualmente.
    if (window.scrollY > 20) {
      return;
    }

    const inicio =
      conteudo.getBoundingClientRect().top +
      window.scrollY;

    const altura = conteudo.getBoundingClientRect().height;

    if (altura <= 0) return;

    const posicao =
      inicio +
      (altura * porcentagem) / 100 -
      window.innerHeight * 0.75;

    const limite =
      document.documentElement.scrollHeight -
      window.innerHeight;

    window.scrollTo({
      top: Math.max(
        0,
        Math.min(posicao, limite)
      ),
      behavior: "instant"
    });
  }

  function aoAlterarVisibilidade() {
    if (document.visibilityState === "hidden") {
      enviarProgresso(true);
      return;
    }

    verificarProgresso();
  }

  function aoAlterarPreferencia(evento) {
    if (
      evento.key !== CHAVE_LOCAL &&
      evento.key !== "tokenUsuario"
    ) {
      return;
    }

    if (!permitidoLocalmente()) {
      autorizado = false;
      pararMonitoramento();
      return;
    }

    // Reconsulta o servidor antes de iniciar
    // qualquer novo monitoramento.
    if (!iniciado) {
      iniciarHistorico();
    }
  }

  function pararMonitoramento() {
    window.removeEventListener(
      "scroll",
      verificarProgresso
    );

    window.removeEventListener(
      "resize",
      verificarProgresso
    );

    document.removeEventListener(
      "visibilitychange",
      aoAlterarVisibilidade
    );

    if (temporizadorScroll !== null) {
      clearTimeout(temporizadorScroll);
      temporizadorScroll = null;
    }

    if (temporizadorPeriodico !== null) {
      clearInterval(temporizadorPeriodico);
      temporizadorPeriodico = null;
    }

    if (observador) {
      observador.disconnect();
      observador = null;
    }

    iniciado = false;
  }

  function instalarMonitoramento() {
    if (iniciado || encerrado) {
      return;
    }

    iniciado = true;

    window.addEventListener(
      "scroll",
      verificarProgresso,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      verificarProgresso,
      { passive: true }
    );

    document.addEventListener(
      "visibilitychange",
      aoAlterarVisibilidade
    );

    temporizadorPeriodico = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        permitidoLocalmente()
      ) {
        enviarProgresso();
      }
    }, INTERVALO_SALVAMENTO);
  }

  async function prepararArtigo() {
    if (
      encerrado ||
      !autorizado ||
      !permitidoLocalmente()
    ) {
      return;
    }

    const conteudo = obterConteudo();

    if (!conteudo) return;

    progressoSalvo =
      await consultarProgressoSalvo();

    if (
      encerrado ||
      !autorizado ||
      !permitidoLocalmente()
    ) {
      return;
    }

    maiorProgresso = progressoSalvo;

    // Aguarda o navegador posicionar o conteúdo.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (
          encerrado ||
          !autorizado ||
          !permitidoLocalmente()
        ) {
          return;
        }

        retomarLeitura(progressoSalvo);
        instalarMonitoramento();

        // Não registra automaticamente uma leitura
        // antes de uma interação do visitante.
      });
    });
  }

  async function iniciarHistorico() {
    if (encerrado || iniciado) {
      return;
    }

    const tokenInicial = obterToken();

    if (!tokenInicial) {
      return;
    }

    autorizado = await consultarPreferencia();

    if (
      !autorizado ||
      encerrado ||
      obterToken() !== tokenInicial
    ) {
      return;
    }

    if (obterConteudo()) {
      await prepararArtigo();
      return;
    }

    // Compatibilidade com post.html?id=...
    // O conteúdo é carregado por JavaScript.
    observador = new MutationObserver(() => {
      if (!obterConteudo()) {
        return;
      }

      observador.disconnect();
      observador = null;

      prepararArtigo();
    });

    observador.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener(
    "storage",
    aoAlterarPreferencia
  );

  window.addEventListener("pagehide", () => {
    // Tenta registrar o último avanço antes
    // de a página ser encerrada.
    if (
      autorizado &&
      permitidoLocalmente()
    ) {
      enviarProgresso(true);
    }

    encerrado = true;
    pararMonitoramento();
  });

  iniciarHistorico();

})();


/* =========================================
   LOCALIZAR O CONTEÚDO DO ARTIGO
========================================= */

function obterConteudoArtigo() {
  return document.querySelector(
    "#postDetalhe .post-text, .post-detail .post-text, .post-text"
  );
}

/* =========================================
   CALCULAR PROGRESSO REAL
========================================= */

function calcularProgressoArtigo() {
  const conteudo = obterConteudoArtigo();

  if (!conteudo) {
    return null;
  }

  const inicio =
    conteudo.getBoundingClientRect().top +
    window.scrollY;

  const fim =
    inicio + conteudo.offsetHeight;

  if (fim <= inicio) {
    return null;
  }

  // Usa a parte inferior da área visível para
  // estimar até onde o leitor chegou.
  const posicaoLeitura =
    window.scrollY + window.innerHeight;

  const porcentagem =
    ((posicaoLeitura - inicio) /
      (fim - inicio)) * 100;

  return Math.round(
    Math.min(
      100,
      Math.max(0, porcentagem)
    )
  );
}

/* =========================================
   ENVIAR PROGRESSO PARA A API
========================================= */

async function registrarProgresso(progresso) {
  if (envioEmAndamento) {
    envioPendente = progresso;
    return;
  }

  envioEmAndamento = true;

  try {
    const resposta = await fetch(
      API_HISTORICO,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${tokenHistorico}`
        },

        body: JSON.stringify({
          post_id: String(artigoId),
          progresso
        }),

        keepalive: true
      }
    );

    if (!resposta.ok) {
      if (resposta.status === 401) {
        // Não remove o token nem redireciona:
        // outras funcionalidades controlam a sessão.
        pararMonitoramento();
      }

      return;
    }

    ultimoProgressoEnviado = progresso;
    ultimoEnvio = Date.now();

  } catch (erro) {
    console.warn(
      "Não foi possível atualizar o histórico:",
      erro
    );
  } finally {
    envioEmAndamento = false;

    if (envioPendente !== null) {
      const pendente = envioPendente;
      envioPendente = null;

      if (
        pendente !== ultimoProgressoEnviado &&
        Date.now() - ultimoEnvio >= INTERVALO_ENVIO
      ) {
        registrarProgresso(pendente);
      }
    }
  }
}

/* =========================================
   MONITORAR LEITURA
========================================= */

function verificarProgresso() {
  if (document.visibilityState === "hidden") {
    return;
  }

  const progresso = calcularProgressoArtigo();

  if (progresso === null) {
    return;
  }

  const agora = Date.now();

  if (
    progresso === ultimoProgressoEnviado ||
    agora - ultimoEnvio < INTERVALO_ENVIO
  ) {
    return;
  }

  registrarProgresso(progresso);
}

/* =========================================
   ENCERRAR MONITORAMENTO
========================================= */

let intervalo = null;

function pararMonitoramento() {
  window.removeEventListener(
    "scroll",
    verificarProgresso
  );

  document.removeEventListener(
    "visibilitychange",
    verificarProgresso
  );

  if (intervalo !== null) {
    clearInterval(intervalo);
    intervalo = null;
  }
}

/* =========================================
   INICIAR
========================================= */

function iniciarHistorico() {
  if (!obterConteudoArtigo()) {
    return false;
  }

  verificarProgresso();

  window.addEventListener(
    "scroll",
    verificarProgresso,
    { passive: true }
  );

  document.addEventListener(
    "visibilitychange",
    verificarProgresso
  );

  intervalo = setInterval(
    verificarProgresso,
    INTERVALO_ENVIO
  );

  return true;
}

// A página SSR já pode ter o conteúdo pronto.
// Na URL antiga, o artigo pode carregar depois.
if (!iniciarHistorico()) {
  const observador = new MutationObserver(() => {
    if (iniciarHistorico()) {
      observador.disconnect();
    }
  });

  observador.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  window.addEventListener(
    "pagehide",
    () => observador.disconnect(),
    { once: true }
  );
}

