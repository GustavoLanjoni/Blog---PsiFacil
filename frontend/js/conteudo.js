const apiPosts = "/posts";
const todosPosts = document.getElementById("todosPosts");

async function carregarTodosPosts() {
  try {
    const resposta = await fetch(apiPosts);
    const posts = await resposta.json();

    todosPosts.innerHTML = "";

    if (posts.length === 0) {
      todosPosts.innerHTML = "<p>Nenhum conteúdo publicado ainda.</p>";
      return;
    }

    posts.forEach((post) => {
      todosPosts.innerHTML += `
        <article class="post-card">
          <img
            src="${post.imagem || 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80'}"
            alt="${post.titulo}"
          >

          <div class="post-content">
            <span class="category">${post.categoria || "Blog"}</span>
            <h3>${post.titulo}</h3>
            <p>${post.resumo || "Clique para ler o conteúdo completo deste artigo."}</p>
            <a href="post.html?id=${post.id}" class="read-more">Ler mais</a>
          </div>
        </article>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar conteúdos:", error);
  }
}

carregarTodosPosts();