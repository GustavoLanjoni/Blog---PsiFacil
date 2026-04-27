const apiPosts = "/posts";
const postDetalhe = document.getElementById("postDetalhe");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

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
        src="${post.imagem || 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80'}"
        alt="${post.titulo}"
        class="post-banner"
      >

      <div class="post-text">
        ${post.conteudo
          .split("\n")
          .map(paragrafo => `<p>${paragrafo}</p>`)
          .join("")}
      </div>

      <a href="psifacil.html" class="back-link">← Voltar para o blog</a>
    `;

  } catch (error) {
    console.error(error);
    postDetalhe.innerHTML = "<p>Erro ao carregar o artigo.</p>";
  }
}

carregarPost();