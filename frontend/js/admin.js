const apiPosts = "/posts";

const formPost = document.getElementById("formPost");

const titulo = document.getElementById("titulo");
const categoria = document.getElementById("categoria");
const resumo = document.getElementById("resumo");
const conteudo = document.getElementById("conteudo");
const imagem = document.getElementById("imagem");

const previewTitulo = document.getElementById("previewTitulo");
const previewCategoria = document.getElementById("previewCategoria");
const previewResumo = document.getElementById("previewResumo");
const previewImagem = document.getElementById("previewImagem");

const listaPostsAdmin = document.getElementById("listaPostsAdmin");
const totalPosts = document.getElementById("totalPosts");

const toast = document.getElementById("toast");
const modalConfirmacao = document.getElementById("modalConfirmacao");
const modalTexto = document.getElementById("modalTexto");
const btnCancelarModal = document.getElementById("btnCancelarModal");
const btnConfirmarModal = document.getElementById("btnConfirmarModal");

let postEditandoId = null;
let acaoConfirmada = null;

/* TOAST */

function mostrarToast(mensagem, tipo = "success") {
  toast.textContent = mensagem;
  toast.className = `toast show ${tipo}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

/* MODAL */

function abrirModalConfirmacao(texto, callback) {
  modalTexto.textContent = texto;
  modalConfirmacao.classList.add("show");
  acaoConfirmada = callback;
}

function fecharModalConfirmacao() {
  modalConfirmacao.classList.remove("show");
  acaoConfirmada = null;
}

btnCancelarModal.addEventListener("click", fecharModalConfirmacao);

btnConfirmarModal.addEventListener("click", () => {
  if (acaoConfirmada) {
    acaoConfirmada();
  }

  fecharModalConfirmacao();
});

/* PREVIEW */

function atualizarPreview() {
  previewTitulo.textContent = titulo.value.trim() || "Título do artigo";
  previewCategoria.textContent = categoria.value.trim() || "Categoria";

  previewResumo.textContent =
    resumo.value.trim() ||
    "O resumo do artigo aparecerá aqui para visualizar como ficará no blog.";

  if (imagem.value.trim() !== "") {
    previewImagem.innerHTML = `
      <img src="${imagem.value.trim()}" alt="Pré-visualização da imagem">
    `;
  } else {
    previewImagem.innerHTML = `
      <i data-lucide="image"></i>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

titulo.addEventListener("input", atualizarPreview);
categoria.addEventListener("input", atualizarPreview);
resumo.addEventListener("input", atualizarPreview);
imagem.addEventListener("input", atualizarPreview);

/* CARREGAR POSTS */

async function carregarPostsAdmin() {
  try {
    const resposta = await fetch(apiPosts);
    const posts = await resposta.json();

    totalPosts.textContent = posts.length;

    if (posts.length === 0) {
      listaPostsAdmin.innerHTML = `
        <div class="empty-posts">
          <i data-lucide="inbox"></i>
          <p>Nenhum post criado ainda.</p>
        </div>
      `;

      if (window.lucide) {
        lucide.createIcons();
      }

      return;
    }

    listaPostsAdmin.innerHTML = "";

    posts.forEach((post) => {
      listaPostsAdmin.innerHTML += `
        <div class="post-admin-card">
          <h3>${post.titulo}</h3>
          <p>${post.resumo || "Sem resumo cadastrado."}</p>

          <div class="post-admin-actions">
            <button class="btn-editar" onclick="prepararEdicao(${post.id})">
              Editar
            </button>

            <button class="btn-excluir" onclick="confirmarExclusao(${post.id})">
              Excluir
            </button>
          </div>
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar posts:", error);
    mostrarToast("Erro ao carregar posts criados.", "error");
  }
}

/* SALVAR OU EDITAR */

formPost.addEventListener("submit", async (e) => {
  e.preventDefault();

  const post = {
    titulo: titulo.value.trim(),
    categoria: categoria.value.trim(),
    resumo: resumo.value.trim(),
    conteudo: conteudo.value.trim(),
    imagem: imagem.value.trim()
  };

  if (!post.titulo || !post.conteudo) {
    mostrarToast("Preencha pelo menos o título e o conteúdo.", "error");
    return;
  }

  try {
    const url = postEditandoId ? `${apiPosts}/${postEditandoId}` : apiPosts;
    const metodo = postEditandoId ? "PUT" : "POST";

    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post)
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      mostrarToast(erro.erro || "Erro ao salvar artigo.", "error");
      return;
    }

    mostrarToast(
      postEditandoId
        ? "Artigo atualizado com sucesso!"
        : "Artigo publicado com sucesso!",
      "success"
    );

    postEditandoId = null;
    formPost.reset();
    atualizarPreview();
    carregarPostsAdmin();

  } catch (error) {
    console.error("Erro:", error);
    mostrarToast("Erro ao conectar com o servidor.", "error");
  }
});

/* EDITAR */

async function prepararEdicao(id) {
  try {
    const resposta = await fetch(`${apiPosts}/${id}`);

    if (!resposta.ok) {
      mostrarToast("Erro ao buscar dados do post.", "error");
      return;
    }

    const post = await resposta.json();

    postEditandoId = post.id;

    titulo.value = post.titulo || "";
    categoria.value = post.categoria || "";
    resumo.value = post.resumo || "";
    conteudo.value = post.conteudo || "";
    imagem.value = post.imagem || "";

    atualizarPreview();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    mostrarToast("Post carregado para edição.", "success");

  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao carregar post para edição.", "error");
  }
}

/* EXCLUIR */

function confirmarExclusao(id) {
  abrirModalConfirmacao(
    "Deseja realmente excluir este post? Essa ação não poderá ser desfeita.",
    () => excluirPost(id)
  );
}

async function excluirPost(id) {
  try {
    const resposta = await fetch(`${apiPosts}/${id}`, {
      method: "DELETE"
    });

    if (!resposta.ok) {
      mostrarToast("Erro ao excluir post.", "error");
      return;
    }

    mostrarToast("Post excluído com sucesso!", "success");
    carregarPostsAdmin();

  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao excluir post.", "error");
  }
}

atualizarPreview();
carregarPostsAdmin();