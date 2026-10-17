
const formLoginUsuario = document.getElementById("formLoginUsuario");
const mensagemErro = document.getElementById("mensagemErro");
const toast = document.getElementById("toast");

function mostrarToast(msg, tipo = "success") {
  if (!toast) return;

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
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    mensagemErro.textContent = "Preencha e-mail e senha.";
    return;
  }

  const botaoEntrar = formLoginUsuario.querySelector(
    'button[type="submit"]'
  );

  if (botaoEntrar) {
    botaoEntrar.disabled = true;
  }

  try {
    const resposta = await fetch("/auth/login-unico", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemErro.textContent =
        dados.erro || "Erro ao fazer login.";
      return;
    }

    if (!dados.token) {
      mensagemErro.textContent =
        "O servidor não retornou uma sessão válida.";
      return;
    }

    /*
      LOGIN ADMINISTRATIVO
    */

    if (dados.tipo === "admin") {
      localStorage.removeItem("tokenUsuario");
      localStorage.removeItem("usuarioLogado");

      localStorage.setItem("tokenAdmin", dados.token);

      window.location.href = "admin.html";
      return;
    }

    /*
      LOGIN DO LEITOR
    */

    if (dados.tipo === "usuario" && dados.usuario) {
      localStorage.removeItem("tokenAdmin");

      localStorage.setItem("tokenUsuario", dados.token);

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(dados.usuario)
      );

      window.location.href = "psifacil.html";
      return;
    }

    mensagemErro.textContent =
      "Tipo de conta não reconhecido.";

  } catch (error) {
    console.error("Erro no login:", error);

    mensagemErro.textContent =
      "Erro ao conectar com o servidor.";

  } finally {
    if (botaoEntrar) {
      botaoEntrar.disabled = false;
    }
  }
});
