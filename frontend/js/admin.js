const apiPosts = "/posts";

const formPost = document.getElementById("formPost");

const titulo = document.getElementById("titulo");
const categoria = document.getElementById("categoria");
const resumo = document.getElementById("resumo");
const conteudo = document.getElementById("conteudo");
const imagem = document.getElementById("imagem");

const statusPost = document.getElementById("status");
const agendadoPara = document.getElementById("agendadoPara");
const grupoAgendamento = document.getElementById("grupoAgendamento");

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

/* TINYMCE */

tinymce.init({
  selector: "#resumo",
  height: 190,
  menubar: false,
  branding: false,
  plugins: "lists link wordcount",
  toolbar: "bold italic underline | bullist numlist | link | removeformat",
  placeholder: "Resumo que aparecerá no card do artigo",
  setup: (editor) => {
    editor.on("keyup change input setcontent", atualizarPreview);
  },
  content_style: `
    body {
      font-family: Inter, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #2f2a28;
    }

    p {
      margin: 0 0 10px;
    }
  `
});

tinymce.init({
  selector: "#conteudo",
  height: 540,
  menubar: false,
  branding: false,
  plugins: "lists link table code wordcount",
  toolbar:
    "undo redo | blocks | bold italic underline strikethrough | " +
    "bullist numlist | blockquote link | alignleft aligncenter alignright | " +
    "table | code | removeformat",
  placeholder: "Escreva o artigo completo aqui",
  content_style: `
    body {
      font-family: Inter, Arial, sans-serif;
      font-size: 17px;
      line-height: 1.8;
      color: #2f2a28;
      padding: 18px;
    }

    h1, h2, h3 {
      color: #2f2a28;
      line-height: 1.25;
      margin: 24px 0 12px;
    }

    p {
      margin: 0 0 16px;
    }

    ul, ol {
      margin: 12px 0 18px 24px;
    }

    blockquote {
      border-left: 4px solid #7a5c58;
      padding: 12px 16px;
      background: #f8f4ef;
      border-radius: 10px;
    }
  `
});

/* HELPERS */

function pegarConteudoEditor(id) {
  const editor = tinymce.get(id);
  return editor ? editor.getContent().trim() : document.getElementById(id).value.trim();
}

function setarConteudoEditor(id, valor) {
  const editor = tinymce.get(id);
  if (editor) {
    editor.setContent(valor || "");
  } else {
    document.getElementById(id).value = valor || "";
  }
}

function limparHtmlVazio(html) {
  if (!html) return "";

  return html
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "")
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
    .trim();
}

function pegarTextoLimpo(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent.trim();
}

function controlarAgendamento() {
  if (statusPost.value === "agendado") {
    grupoAgendamento.style.display = "block";
  } else {
    grupoAgendamento.style.display = "none";
    agendadoPara.value = "";
  }
}

function formatarDataAdmin(data) {
  if (!data) return "";

  return new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short"
  });
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
  const resumoHtml = pegarConteudoEditor("resumo");
  const resumoTexto = pegarTextoLimpo(resumoHtml);

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

/* EVENTOS */

titulo.addEventListener("input", atualizarPreview);
categoria.addEventListener("input", atualizarPreview);
imagem.addEventListener("input", atualizarPreview);
statusPost.addEventListener("change", controlarAgendamento);

formPost.addEventListener("reset", () => {
  setTimeout(() => {
    setarConteudoEditor("resumo", "");
    setarConteudoEditor("conteudo", "");

    statusPost.value = "publicado";
    agendadoPara.value = "";
    postEditandoId = null;

    controlarAgendamento();
    atualizarPreview();
  }, 0);
});

/* CARREGAR POSTS */

async function carregarPostsAdmin() {
  try {
    const resposta = await fetch("/posts/admin/todos");
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

      const agora = new Date();
      const dataAgendada = post.agendado_para ? new Date(post.agendado_para) : null;

      let statusTexto = "Publicado";
      let statusClasse = "status-publicado";

      if (post.status === "agendado" && dataAgendada > agora) {
        statusTexto = `Agendado para ${formatarDataAdmin(post.agendado_para)}`;
        statusClasse = "status-agendado";
      }

      listaPostsAdmin.innerHTML += `
        <div class="post-admin-card">
          <div class="post-admin-top">
            <span class="post-status ${statusClasse}">
              ${statusTexto}
            </span>
          </div>

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

  const resumoHtml = limparHtmlVazio(pegarConteudoEditor("resumo"));
  const conteudoHtml = limparHtmlVazio(pegarConteudoEditor("conteudo"));

  const post = {
    titulo: titulo.value.trim(),
    categoria: categoria.value.trim(),
    resumo: resumoHtml,
    conteudo: conteudoHtml,
    imagem: imagem.value.trim(),
    status: statusPost.value,
    agendado_para: agendadoPara.value
      ? `${agendadoPara.value}:00-03:00`
      : null
  };

  const conteudoTexto = pegarTextoLimpo(post.conteudo);

  if (!post.titulo || !conteudoTexto) {
    mostrarToast("Preencha pelo menos o título e o conteúdo.", "error");
    return;
  }

  if (post.status === "agendado" && !post.agendado_para) {
    mostrarToast("Escolha a data e hora do agendamento.", "error");
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
        : post.status === "agendado"
          ? "Artigo agendado com sucesso!"
          : "Artigo publicado com sucesso!",
      "success"
    );

    postEditandoId = null;
    formPost.reset();

    setarConteudoEditor("resumo", "");
    setarConteudoEditor("conteudo", "");

    statusPost.value = "publicado";
    agendadoPara.value = "";

    controlarAgendamento();
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

    statusPost.value = post.status || "publicado";

    if (post.agendado_para) {
      agendadoPara.value = post.agendado_para.slice(0, 16);
    } else {
      agendadoPara.value = "";
    }

    setarConteudoEditor("resumo", post.resumo || "");
    setarConteudoEditor("conteudo", post.conteudo || "");

    controlarAgendamento();
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
    console.error("Erro ao excluir:", error);
    mostrarToast("Erro ao excluir post.", "error");
  }
}

/* SAIR */

function sairAdmin() {
  localStorage.removeItem("tokenAdmin");
  window.location.href = "login.html";
}

/* INICIAR */

controlarAgendamento();
atualizarPreview();
carregarPostsAdmin();

if (window.lucide) {
  lucide.createIcons();
}