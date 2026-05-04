const token = localStorage.getItem("tokenUsuario");

const nome = document.getElementById("nome");
const foto = document.getElementById("foto");
const bio = document.getElementById("bio");

const nomeTitulo = document.getElementById("nomeTitulo");
const emailUsuario = document.getElementById("emailUsuario");
const fotoPreview = document.getElementById("fotoPreview");
const formPerfil = document.getElementById("formPerfil");
const mensagemErro = document.getElementById("mensagemErro");
const toast = document.getElementById("toast");

const fotoMenu = document.getElementById("fotoMenu");
const btnVerFoto = document.getElementById("btnVerFoto");
const btnTrocarFoto = document.getElementById("btnTrocarFoto");

if (!token) {
  window.location.href = "login-usuario.html";
}

/* TOAST */
function mostrarToast(msg, tipo = "success") {
  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

/* MENU FOTO */
fotoPreview.addEventListener("click", () => {
  fotoMenu.classList.toggle("show");
});

btnTrocarFoto.addEventListener("click", () => {
  fotoMenu.classList.remove("show");
  foto.click();
});

btnVerFoto.addEventListener("click", () => {
  fotoMenu.classList.remove("show");
  window.open(fotoPreview.src, "_blank");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".foto-wrapper")) {
    fotoMenu.classList.remove("show");
  }
});

/* CARREGAR PERFIL */
async function carregarPerfil() {
  try {
    const resposta = await fetch("/perfil", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const usuario = await resposta.json();

    if (!resposta.ok) {
      window.location.href = "login-usuario.html";
      return;
    }

    nome.value = usuario.nome || "";
    bio.value = usuario.bio || "";

    nomeTitulo.textContent = usuario.nome;
    emailUsuario.textContent = usuario.email;

    fotoPreview.src =
      usuario.foto ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nome)}`;

    fotoPreview.dataset.fotoAtual = usuario.foto || "";

  } catch (error) {
    mensagemErro.textContent = "Erro ao carregar perfil.";
  }
}

/* PREVIEW LOCAL DA NOVA FOTO */
foto.addEventListener("change", () => {
  const file = foto.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    fotoPreview.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

/* SALVAR PERFIL */
formPerfil.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    formData.append("nome", nome.value.trim());
    formData.append("bio", bio.value.trim());
    formData.append("fotoAtual", fotoPreview.dataset.fotoAtual || "");

    if (foto.files[0]) {
      formData.append("foto", foto.files[0]);
    }

    const resposta = await fetch("/perfil", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarToast(dados.erro || "Erro ao salvar perfil.", "error");
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(dados));

    nomeTitulo.textContent = dados.nome;

    fotoPreview.src =
      dados.foto ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(dados.nome)}`;

    fotoPreview.dataset.fotoAtual = dados.foto || "";

    mostrarToast("Perfil atualizado com sucesso!");

  } catch (error) {
    mostrarToast("Erro ao conectar com o servidor.", "error");
  }
});

/* SAIR */
function sairUsuario() {
  localStorage.removeItem("tokenUsuario");
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login-usuario.html";
}

/* INICIAR */
carregarPerfil();