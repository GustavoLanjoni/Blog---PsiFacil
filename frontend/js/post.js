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

/* SALVAR POST */

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
      const salvo = btnSalvar.classList.contains("salvo");
      const metodo = salvo ? "DELETE" : "POST";

      const resposta = await fetch(`/salvos/${id}`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!resposta.ok) return;

      atualizarBotaoSalvar(!salvo);
    } catch (error) {
      console.error("Erro ao salvar/remover post:", error);
    }
  });
}

/* TEMPO DE LEITURA */

function calcularTempoLeitura(texto) {
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  const minutos = Math.ceil(palavras / 200);

  return minutos || 1;
}

/* CARREGAR POST */

async function carregarPost() {
  if (!id) {
    postDetalhe.innerHTML = "<p>Post não encontrado.</p>";
    return;
  }

  try {
    const resposta = await fetch(`${apiPosts}/${id}`);

    if (!resposta.ok) {
      postDetalhe.innerHTML = "<p>Post não encontrado.</p>";
      return;
    }

    const post = await resposta.json();
    carregarRelacionados(post);

    const textoLimpo = (post.conteudo || "").replace(/<[^>]+>/g, " ");
    const tempoLeitura = calcularTempoLeitura(textoLimpo);

    document.title = `${post.titulo} | PsiBlog`;

    postDetalhe.innerHTML = `
      <span class="category">${post.categoria || "Blog"}</span>

      <h1>${post.titulo}</h1>

      <div class="post-meta">
        <span>
          Publicado em ${new Date(post.criado_em).toLocaleDateString("pt-BR")}
        </span>

        <span class="dot"></span>

        <span>
          ${tempoLeitura} min de leitura
        </span>
      </div>

      <img
        src="${post.imagem || "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80"}"
        alt="${post.titulo}"
        class="post-banner"
      >

      <div class="post-text">
        ${post.conteudo || ""}
      </div>

      <a href="psifacil.html" class="back-link">← Voltar para o blog</a>
    `;
  } catch (error) {
    console.error(error);
    postDetalhe.innerHTML = "<p>Erro ao carregar o artigo.</p>";
  }

  
}

/* CURTIDAS */

async function carregarCurtidas() {
  try {
    const resposta = await fetch(`${apiInteracoes}/curtidas/${id}`);
    const dados = await resposta.json();

    totalCurtidas.textContent = dados.total;
  } catch (error) {
    console.error("Erro ao carregar curtidas:", error);
  }
}

function atualizarEstadoCurtir() {
  if (localStorage.getItem(chaveCurtida)) {
    btnCurtir.classList.add("curtido");
  }
}

btnCurtir.addEventListener("click", async () => {
  if (localStorage.getItem(chaveCurtida)) {
    return;
  }

  try {
    await fetch(`${apiInteracoes}/curtidas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ post_id: id })
    });

    localStorage.setItem(chaveCurtida, "true");
    btnCurtir.classList.add("curtido");

    carregarCurtidas();
  } catch (error) {
    console.error("Erro ao curtir:", error);
  }
});

/* COMPARTILHAR */

btnCompartilhar.addEventListener("click", async () => {
  const url = window.location.href;

  if (navigator.share) {
    await navigator.share({
      title: document.title,
      url
    });
  } else {
    await navigator.clipboard.writeText(url);
    alert("Link copiado!");
  }
});

/* COMENTÁRIOS */

formComentario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeComentario").value.trim();
  const comentario = document.getElementById("textoComentario").value.trim();

  if (!nome || !comentario) {
    alert("Preencha seu nome e comentário.");
    return;
  }

  try {
    await fetch(`${apiInteracoes}/comentarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        post_id: id,
        nome,
        comentario
      })
    });

    formComentario.reset();
    carregarComentarios();
  } catch (error) {
    console.error("Erro ao comentar:", error);
  }
});

async function carregarComentarios() {
  try {
    const resposta = await fetch(`${apiInteracoes}/comentarios/${id}`);
    const comentarios = await resposta.json();

    listaComentarios.innerHTML = "";

    comentarios.forEach((item) => {
      listaComentarios.innerHTML += `
        <div class="comentario-card">
          <strong>${item.nome}</strong>
          <p>${item.comentario}</p>
          <small>${new Date(item.criado_em).toLocaleDateString("pt-BR")}</small>
        </div>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
  }
}

/* BARRA DE LEITURA */

window.addEventListener("scroll", () => {
  if (!readingBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) {
    readingBar.style.width = "0%";
    return;
  }

  const progresso = (scrollTop / docHeight) * 100;

  readingBar.style.width = `${Math.min(progresso, 100)}%`;
});


async function carregarRelacionados(postAtual) {
  if (!postsRelacionados) return;

  try {
    const resposta = await fetch(apiPosts);
    const posts = await resposta.json();

    const relacionados = posts
      .filter((post) => {
        return (
          post.id !== postAtual.id &&
          post.categoria &&
          postAtual.categoria &&
          post.categoria.toLowerCase() === postAtual.categoria.toLowerCase()
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
        <a href="post.html?id=${post.id}" class="relacionado-card">
          <img
            src="${post.imagem || "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80"}"
            alt="${post.titulo}"
          >

          <div class="relacionado-content">
            <span>${post.categoria || "Blog"}</span>
            <h3>${post.titulo}</h3>
            <p>${limitarTexto(pegarTextoLimpo(post.resumo || post.conteudo || ""), 110)}</p>
          </div>
        </a>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar relacionados:", error);
  }
}

function pegarTextoLimpo(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent.trim();
}

function limitarTexto(texto, limite) {
  if (!texto) return "Clique para ler este conteúdo completo.";

  if (texto.length <= limite) return texto;

  return texto.substring(0, limite).trim() + "...";
}

/* INICIAR */

carregarPost();
carregarCurtidas();
carregarComentarios();
atualizarEstadoCurtir();
verificarSalvo();