const apiPosts = "/posts";
const apiLeads = "/leads";

const postsGrid = document.querySelector(".posts-grid");

async function carregarPosts() {
  try {
    const resposta = await fetch(apiPosts);
    const posts = await resposta.json();

    postsGrid.innerHTML = "";

    const postsRecentes = posts.slice(0, 6);

    postsRecentes.forEach((post) => {
      postsGrid.innerHTML += `
        <article class="post-card">
          <img
            src="${post.imagem || 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80'}"
            alt="${post.titulo}"
          >

          <div class="post-content">
            <span class="category">${post.categoria || "Blog"}</span>

            <h3>${post.titulo}</h3>

            <p>
              ${post.resumo || "Clique para ler o conteúdo completo deste artigo."}
            </p>

            <a href="post.html?id=${post.id}" class="read-more">
              Ler mais
            </a>
          </div>
        </article>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar posts:", error);
  }
}

const ebookForm = document.getElementById("ebookForm");
const ebookMensagem = document.getElementById("ebookMensagem");

if (ebookForm) {
  ebookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("leadNome").value.trim();
    const email = document.getElementById("leadEmail").value.trim();

    if (!nome || !email) {
      alert("Preencha nome e e-mail.");
      return;
    }

    try {
      const resposta = await fetch(apiLeads, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email })
      });

      if (!resposta.ok) {
        alert("Erro ao cadastrar. Tente novamente.");
        return;
      }

      ebookForm.reset();
      ebookForm.style.display = "none";
      ebookMensagem.style.display = "block";

    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  });
}

carregarPosts();