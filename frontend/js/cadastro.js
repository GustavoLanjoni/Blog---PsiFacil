const formCadastro = document.getElementById("formCadastro");
const mensagemErro = document.getElementById("mensagemErro");
const toast = document.getElementById("toast");

function mostrarToast(msg, tipo = "success") {
  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();

  mensagemErro.textContent = "";

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !email || !senha) {
    mensagemErro.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const resposta = await fetch("/usuarios/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemErro.textContent = dados.erro || "Erro ao cadastrar.";
      return;
    }

    mostrarToast("Conta criada com sucesso!");
    window.location.href = "login-usuario.html";

  } catch (error) {
    console.error(error);
    mensagemErro.textContent = "Erro ao conectar com o servidor.";
  }
});