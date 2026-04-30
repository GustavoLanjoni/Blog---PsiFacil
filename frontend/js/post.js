const apiPosts = "/posts";
const apiInteracoes = "/interacoes";

const postDetalhe = document.getElementById("postDetalhe");
const btnCurtir = document.getElementById("btnCurtir");
const totalCurtidas = document.getElementById("totalCurtidas");
const btnCompartilhar = document.getElementById("btnCompartilhar");
const formComentario = document.getElementById("formComentario");
const listaComentarios = document.getElementById("listaComentarios");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const chaveCurtida = `curtiu_post_${id}`;

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

    document.title = `${post.titulo} | PsiBlog`;

    postDetalhe.innerHTML = `
      <span class="category">${post.categoria || "Blog"}</span>

      <h1>${post.titulo}</h1>

      <div class="post-meta">
        Publicado em ${new Date(post.criado_em).toLocaleDateString("pt-BR")}
      </div>

      <img
        src="${post.imagem || "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80"}"
        alt="${post.titulo}"
        class="post-banner"
      >

      <div class="post-text">
        ${post.conteudo
          .split("\n")
          .map((paragrafo) => `<p>${paragrafo}</p>`)
          .join("")}
      </div>

      <a href="psifacil.html" class="back-link">← Voltar para o blog</a>
    `;
  } catch (error) {
    console.error(error);
    postDetalhe.innerHTML = "<p>Erro ao carregar o artigo.</p>";
  }
}

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

carregarPost();
carregarCurtidas();
carregarComentarios();
atualizarEstadoCurtir();