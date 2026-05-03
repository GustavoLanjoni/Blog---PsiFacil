const formLoginUsuario = document.getElementById("formLoginUsuario");
const mensagemErro = document.getElementById("mensagemErro");
const toast = document.getElementById("toast");

function mostrarToast(msg, tipo = "success") {
  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

formLoginUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  mensagemErro.textContent = "";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    mensagemErro.textContent = "Preencha e-mail e senha.";
    return;
  }

  try {
    const resposta = await fetch("/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemErro.textContent = dados.erro || "Erro ao fazer login.";
      return;
    }

    localStorage.setItem("tokenUsuario", dados.token);
    localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

    window.location.href = "psifacil.html";

  } catch (error) {
    console.error(error);
    mensagemErro.textContent = "Erro ao conectar com o servidor.";
  }
});