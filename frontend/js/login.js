const apiLogin = "/auth/login";

const form = document.getElementById("loginForm");
const mensagemErro = document.getElementById("mensagemErro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  mensagemErro.textContent = "";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const resposta = await fetch(apiLogin, {
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

    localStorage.setItem("tokenAdmin", dados.token);

    window.location.href = "admin.html";

  } catch (error) {
    console.error(error);
    mensagemErro.textContent = "Erro ao conectar com o servidor.";
  }
});