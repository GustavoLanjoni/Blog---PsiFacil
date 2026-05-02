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

/* EDITORES */

const editorResumo = new Quill("#editorResumo", {
  theme: "snow",
  placeholder: "Resumo que aparecerá no card do artigo",
  modules: {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  }
});

const editorConteudo = new Quill("#editorConteudo", {
  theme: "snow",
  placeholder: "Escreva o artigo completo aqui",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "link"],
      [{ align: [] }],
      ["clean"]
    ]
  }
});

function limparHtmlVazio(html) {
  if (!html) return "";

  const texto = pegarTextoLimpo(html);

  if (!texto) return "";

  return html.trim();
}

function pegarTextoLimpo(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent.trim();
}

function sincronizarEditores() {
  resumo.value = limparHtmlVazio(editorResumo.root.innerHTML);
  conteudo.value = limparHtmlVazio(editorConteudo.root.innerHTML);
}

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
  sincronizarEditores();

  const resumoTexto = pegarTextoLimpo(resumo.value);

  previewTitulo.textContent = titulo.value.trim() || "Título do artigo";
  previewCategoria.textContent = categoria.value.trim() || "Categoria";

  previewResumo.textContent =
    resumoTexto ||
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
imagem.addEventListener("input", atualizarPreview);

editorResumo.on("text-change", atualizarPreview);
editorConteudo.on("text-change", sincronizarEditores);

formPost.addEventListener("reset", () => {
  setTimeout(() => {
    editorResumo.root.innerHTML = "";
    editorConteudo.root.innerHTML = "";
    postEditandoId = null;
    sincronizarEditores();
    atualizarPreview();
  }, 0);
});

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
      const resumoTexto = pegarTextoLimpo(post.resumo || "");

      listaPostsAdmin.innerHTML += `
        <div class="post-admin-card">
          <h3>${post.titulo}</h3>
          <p>${resumoTexto || "Sem resumo cadastrado."}</p>

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

  sincronizarEditores();

  const post = {
    titulo: titulo.value.trim(),
    categoria: categoria.value.trim(),
    resumo: resumo.value.trim(),
    conteudo: conteudo.value.trim(),
    imagem: imagem.value.trim()
  };

  const conteudoTexto = pegarTextoLimpo(post.conteudo);

  if (!post.titulo || !conteudoTexto) {
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

    editorResumo.root.innerHTML = "";
    editorConteudo.root.innerHTML = "";

    sincronizarEditores();
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
    imagem.value = post.imagem || "";

    editorResumo.root.innerHTML = post.resumo || "";
    editorConteudo.root.innerHTML = post.conteudo || "";

    sincronizarEditores();
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

/* SAIR */

function sairAdmin() {
  localStorage.removeItem("tokenAdmin");
  window.location.href = "login.html";
}

sincronizarEditores();
atualizarPreview();
carregarPostsAdmin();