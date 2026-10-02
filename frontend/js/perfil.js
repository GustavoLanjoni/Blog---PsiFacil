const token =
  localStorage.getItem("tokenUsuario");


/* =========================================================
   ELEMENTOS DO PERFIL
========================================================= */

const nome =
  document.getElementById("nome");

const foto =
  document.getElementById("foto");

const bio =
  document.getElementById("bio");

const nomeTitulo =
  document.getElementById("nomeTitulo");

const emailUsuario =
  document.getElementById("emailUsuario");

const fotoPreview =
  document.getElementById("fotoPreview");

const formPerfil =
  document.getElementById("formPerfil");

const mensagemErro =
  document.getElementById("mensagemErro");

const toast =
  document.getElementById("toast");

const fotoMenu =
  document.getElementById("fotoMenu");

const btnVerFoto =
  document.getElementById("btnVerFoto");

const btnTrocarFoto =
  document.getElementById("btnTrocarFoto");


/* =========================================================
   ELEMENTOS DOS CONTEÚDOS SALVOS
========================================================= */

const listaSalvos =
  document.getElementById("listaSalvos");


/* =========================================================
   ELEMENTOS DAS FRASES SALVAS
========================================================= */

const listaFrasesSalvas =
  document.getElementById(
    "listaFrasesSalvas"
  );

const totalFrasesSalvas =
  document.getElementById(
    "totalFrasesSalvas"
  );


/* =========================================================
   VERIFICAR LOGIN
========================================================= */

if (!token) {

  window.location.href =
    "login-usuario.html";

}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
  msg,
  tipo = "success"
) {

  if (!toast) {
    return;
  }


  toast.textContent = msg;

  toast.className =
    `toast show ${tipo}`;


  setTimeout(() => {

    toast.className = "toast";

  }, 3000);

}


/* =========================================================
   TOKEN EXPIRADO / INVÁLIDO
========================================================= */

function encerrarSessao() {

  localStorage.removeItem(
    "tokenUsuario"
  );

  localStorage.removeItem(
    "usuarioLogado"
  );


  window.location.href =
    "login-usuario.html";

}


/* =========================================================
   MENU FOTO
========================================================= */

if (
  fotoPreview &&
  fotoMenu
) {

  fotoPreview.addEventListener(
    "click",
    () => {

      fotoMenu.classList.toggle(
        "show"
      );

    }
  );

}


if (
  btnTrocarFoto &&
  fotoMenu &&
  foto
) {

  btnTrocarFoto.addEventListener(
    "click",
    () => {

      fotoMenu.classList.remove(
        "show"
      );

      foto.click();

    }
  );

}


if (
  btnVerFoto &&
  fotoMenu &&
  fotoPreview
) {

  btnVerFoto.addEventListener(
    "click",
    () => {

      fotoMenu.classList.remove(
        "show"
      );

      window.open(
        fotoPreview.src,
        "_blank"
      );

    }
  );

}


document.addEventListener(
  "click",
  (e) => {

    if (
      fotoMenu &&
      !e.target.closest(
        ".foto-wrapper"
      )
    ) {

      fotoMenu.classList.remove(
        "show"
      );

    }

  }
);


/* =========================================================
   CARREGAR PERFIL
========================================================= */

async function carregarPerfil() {

  try {

    const resposta =
      await fetch(
        "/perfil",
        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    if (
      resposta.status === 401
    ) {

      encerrarSessao();

      return;

    }


    const usuario =
      await resposta.json();


    if (!resposta.ok) {

      encerrarSessao();

      return;

    }


    if (nome) {

      nome.value =
        usuario.nome || "";

    }


    if (bio) {

      bio.value =
        usuario.bio || "";

    }


    if (nomeTitulo) {

      nomeTitulo.textContent =
        usuario.nome;

    }


    if (emailUsuario) {

      emailUsuario.textContent =
        usuario.email;

    }


    if (fotoPreview) {

      fotoPreview.src =
        usuario.foto ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          usuario.nome
        )}`;


      fotoPreview.dataset.fotoAtual =
        usuario.foto || "";

    }


  } catch (error) {

    console.error(
      "Erro ao carregar perfil:",
      error
    );


    if (mensagemErro) {

      mensagemErro.textContent =
        "Erro ao carregar perfil.";

    }

  }

}


/* =========================================================
   PREVIEW LOCAL DA NOVA FOTO
========================================================= */

if (
  foto &&
  fotoPreview
) {

  foto.addEventListener(
    "change",
    () => {

      const file =
        foto.files[0];


      if (!file) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        (e) => {

          fotoPreview.src =
            e.target.result;

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   SALVAR PERFIL
========================================================= */

if (formPerfil) {

  formPerfil.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();


      try {

        const formData =
          new FormData();


        formData.append(
          "nome",
          nome
            ? nome.value.trim()
            : ""
        );


        formData.append(
          "bio",
          bio
            ? bio.value.trim()
            : ""
        );


        formData.append(
          "fotoAtual",
          fotoPreview
            ? fotoPreview.dataset.fotoAtual || ""
            : ""
        );


        if (
          foto &&
          foto.files[0]
        ) {

          formData.append(
            "foto",
            foto.files[0]
          );

        }


        const resposta =
          await fetch(
            "/perfil",
            {

              method: "PUT",

              headers: {

                Authorization:
                  `Bearer ${token}`

              },

              body: formData

            }
          );


        if (
          resposta.status === 401
        ) {

          encerrarSessao();

          return;

        }


        const dados =
          await resposta.json();


        if (!resposta.ok) {

          mostrarToast(
            dados.erro ||
            "Erro ao salvar perfil.",
            "error"
          );

          return;

        }


        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(dados)
        );


        if (nomeTitulo) {

          nomeTitulo.textContent =
            dados.nome;

        }


        if (fotoPreview) {

          fotoPreview.src =
            dados.foto ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              dados.nome
            )}`;


          fotoPreview.dataset.fotoAtual =
            dados.foto || "";

        }


        mostrarToast(
          "Perfil atualizado com sucesso!"
        );


      } catch (error) {

        console.error(
          "Erro ao salvar perfil:",
          error
        );


        mostrarToast(
          "Erro ao conectar com o servidor.",
          "error"
        );

      }

    }
  );

}


/* =========================================================
   CARREGAR POSTS SALVOS
========================================================= */

async function carregarSalvos() {

  if (!listaSalvos) {
    return;
  }


  try {

    const resposta =
      await fetch(
        "/salvos",
        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    if (
      resposta.status === 401
    ) {

      encerrarSessao();

      return;

    }


    const posts =
      await resposta.json();


    if (!resposta.ok) {

      listaSalvos.innerHTML = `
        <p class="salvos-vazio">
          Erro ao carregar salvos.
        </p>
      `;

      return;

    }


    if (posts.length === 0) {

      listaSalvos.innerHTML = `
        <p class="salvos-vazio">
          Nenhum conteúdo salvo ainda.
        </p>
      `;

      return;

    }


    listaSalvos.innerHTML = "";


    posts.forEach(
      (post) => {

        listaSalvos.innerHTML += `

          <a
            href="post.html?id=${post.id}"
            class="salvo-card"
          >

            <img
              src="${post.imagem ||
          "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80"
          }"
              alt="${post.titulo}"
            >

            <div>

              <span>
                ${post.categoria || "Blog"}
              </span>

              <h3>
                ${post.titulo}
              </h3>

            </div>

          </a>

        `;

      }
    );


  } catch (error) {

    console.error(
      "Erro ao carregar salvos:",
      error
    );


    listaSalvos.innerHTML = `
      <p class="salvos-vazio">
        Erro ao conectar com o servidor.
      </p>
    `;

  }

}


/* =========================================================
   FORMATAR TIPO DA FRASE
========================================================= */

function formatarTipoFrase(tipo) {

  const tipos = {

    motivacao:
      "Motivação",

    reflexao:
      "Reflexão",

    pergunta:
      "Pergunta para refletir",

    autocuidado:
      "Autocuidado",

    autoconhecimento:
      "Autoconhecimento",

    recomeco:
      "Recomeço",

    acolhimento:
      "Acolhimento"

  };


  return tipos[tipo] ||
    "Reflexão";

}


/* =========================================================
   ATUALIZAR CONTADOR DAS FRASES
========================================================= */

function atualizarContadorFrases(
  quantidade
) {

  if (!totalFrasesSalvas) {
    return;
  }


  if (quantidade === 1) {

    totalFrasesSalvas.textContent =
      "1 salva";

    return;

  }


  totalFrasesSalvas.textContent =
    `${quantidade} salvas`;

}


/* =========================================================
   ESTADO VAZIO DAS FRASES
========================================================= */

function mostrarFrasesVazias() {

  if (!listaFrasesSalvas) {
    return;
  }


  atualizarContadorFrases(0);


  listaFrasesSalvas.innerHTML = `

    <div class="empty-state">

      <div class="empty-icon">

        <i data-lucide="heart"></i>

      </div>


      <h3>
        Nenhuma frase salva
      </h3>


      <p>
        As frases que você salvar
        no PsiFácil aparecerão aqui.
      </p>


      <a href="psifacil.html">
        Explorar conteúdos
      </a>

    </div>

  `;


  if (
    typeof lucide !== "undefined"
  ) {

    lucide.createIcons();

  }

}


/* =========================================================
   CRIAR CARD DA FRASE
========================================================= */

function criarCardFrase(frase) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "frase-salva-card";


  card.dataset.fraseId =
    frase.id;


  const tipo =
    formatarTipoFrase(
      frase.tipo
    );


  card.innerHTML = `

    <div class="frase-salva-top">

      <span class="frase-salva-tipo">
        ${tipo}
      </span>


      <button
        type="button"
        class="btn-remover-frase salvo"
        data-frase-id="${frase.id}"
        aria-label="Remover frase dos salvos"
        title="Remover dos salvos"
      >

        <i data-lucide="heart"></i>

      </button>

    </div>


    <blockquote class="frase-salva-texto">
      “${frase.texto}”
    </blockquote>


    <div class="frase-salva-bottom">

      <span>
        ${frase.autor || "PsiFácil"}
      </span>

    </div>

  `;


  const botaoRemover =
    card.querySelector(
      ".btn-remover-frase"
    );


  botaoRemover.addEventListener(
    "click",
    () => {

      removerFraseSalva(
        frase.id,
        card,
        botaoRemover
      );

    }
  );


  return card;

}


/* =========================================================
   CARREGAR FRASES SALVAS
========================================================= */

async function carregarFrasesSalvas() {

  if (!listaFrasesSalvas) {
    return;
  }


  try {

    const resposta =
      await fetch(
        "/frases/salvas",
        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    if (
      resposta.status === 401
    ) {

      encerrarSessao();

      return;

    }


    const frases =
      await resposta.json();


    if (!resposta.ok) {

      throw new Error(
        frases.erro ||
        "Erro ao carregar frases salvas."
      );

    }


    /*
     * Garante que recebemos
     * uma lista válida.
     */

    if (!Array.isArray(frases)) {

      throw new Error(
        "Resposta inválida do servidor."
      );

    }


    atualizarContadorFrases(
      frases.length
    );


    /*
     * Nenhuma frase salva.
     */

    if (
      frases.length === 0
    ) {

      mostrarFrasesVazias();

      return;

    }


    listaFrasesSalvas.innerHTML =
      "";


    frases.forEach(
      (frase) => {

        const card =
          criarCardFrase(frase);


        listaFrasesSalvas.appendChild(
          card
        );

      }
    );


    /*
     * Renderiza os novos
     * ícones Lucide.
     */

    if (
      typeof lucide !== "undefined"
    ) {

      lucide.createIcons();

    }


  } catch (error) {

    console.error(
      "Erro ao carregar frases salvas:",
      error
    );


    listaFrasesSalvas.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">

          <i data-lucide="circle-alert"></i>

        </div>


        <h3>
          Não foi possível carregar
        </h3>


        <p>
          Ocorreu um erro ao buscar
          suas frases salvas.
        </p>


        <button
          type="button"
          class="btn-tentar-novamente"
          id="btnRecarregarFrases"
        >
          Tentar novamente
        </button>

      </div>

    `;


    const btnRecarregar =
      document.getElementById(
        "btnRecarregarFrases"
      );


    if (btnRecarregar) {

      btnRecarregar.addEventListener(
        "click",
        carregarFrasesSalvas
      );

    }


    if (
      typeof lucide !== "undefined"
    ) {

      lucide.createIcons();

    }

  }

}


/* =========================================================
   REMOVER FRASE SALVA
========================================================= */

async function removerFraseSalva(
  fraseId,
  card,
  botao
) {

  /*
   * Evita vários cliques
   * enquanto remove.
   */

  if (
    botao.dataset.removendo ===
    "true"
  ) {

    return;

  }


  botao.dataset.removendo =
    "true";


  botao.disabled = true;


  try {

    const resposta =
      await fetch(
        `/frases/${fraseId}/salvar`,
        {

          method: "DELETE",

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    if (
      resposta.status === 401
    ) {

      encerrarSessao();

      return;

    }


    const dados =
      await resposta.json();


    if (!resposta.ok) {

      throw new Error(
        dados.erro ||
        "Erro ao remover frase."
      );

    }


    /*
     * Remove visualmente o card
     * somente depois da confirmação
     * do servidor.
     */

    card.remove();


    /*
     * Conta quantos cards
     * ainda ficaram na tela.
     */

    const quantidadeRestante =
      listaFrasesSalvas.querySelectorAll(
        ".frase-salva-card"
      ).length;


    atualizarContadorFrases(
      quantidadeRestante
    );


    /*
     * Se removeu a última,
     * mostra o estado vazio.
     */

    if (
      quantidadeRestante === 0
    ) {

      mostrarFrasesVazias();

    }


    mostrarToast(
      "Frase removida dos salvos."
    );


  } catch (error) {

    console.error(
      "Erro ao remover frase:",
      error
    );


    mostrarToast(
      "Não foi possível remover a frase.",
      "error"
    );


    botao.disabled = false;


  } finally {

    botao.dataset.removendo =
      "false";

  }

}

/* =========================================================
   SEGURANÇA
   ALTERAÇÃO DE SENHA
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const formAlterarSenha =
  document.getElementById(
    "formAlterarSenha"
  );


const senhaAtual =
  document.getElementById(
    "senhaAtual"
  );


const novaSenha =
  document.getElementById(
    "novaSenha"
  );


const confirmarSenha =
  document.getElementById(
    "confirmarSenha"
  );


const requisitoTamanho =
  document.getElementById(
    "requisitoTamanho"
  );


const senhaConfirmacao =
  document.getElementById(
    "senhaConfirmacao"
  );


const mensagemSenha =
  document.getElementById(
    "mensagemSenha"
  );


const btnAlterarSenha =
  document.getElementById(
    "btnAlterarSenha"
  );


const passwordToggles =
  document.querySelectorAll(
    ".password-toggle"
  );


/* =========================================================
   MOSTRAR / ESCONDER SENHA
========================================================= */

passwordToggles.forEach(
  (botao) => {

    botao.addEventListener(
      "click",
      () => {

        const targetId =
          botao.dataset.passwordTarget;


        const input =
          document.getElementById(
            targetId
          );


        if (!input) {
          return;
        }


        const mostrando =
          input.type === "text";


        input.type =
          mostrando
            ? "password"
            : "text";


        botao.innerHTML =
          mostrando
            ? '<i data-lucide="eye"></i>'
            : '<i data-lucide="eye-off"></i>';


        botao.setAttribute(
          "aria-label",
          mostrando
            ? "Mostrar senha"
            : "Ocultar senha"
        );


        botao.setAttribute(
          "title",
          mostrando
            ? "Mostrar senha"
            : "Ocultar senha"
        );


        if (
          typeof lucide !==
          "undefined"
        ) {

          lucide.createIcons();

        }

      }
    );

  }
);


/* =========================================================
   MOSTRAR MENSAGEM NA ÁREA DE SEGURANÇA
========================================================= */

function mostrarMensagemSenha(
  mensagem,
  tipo = "erro"
) {

  if (!mensagemSenha) {
    return;
  }


  mensagemSenha.textContent =
    mensagem;


  mensagemSenha.className =
    `seguranca-mensagem ativa ${tipo}`;

}


/* =========================================================
   LIMPAR MENSAGEM
========================================================= */

function limparMensagemSenha() {

  if (!mensagemSenha) {
    return;
  }


  mensagemSenha.textContent =
    "";


  mensagemSenha.className =
    "seguranca-mensagem";

}


/* =========================================================
   VALIDAR TAMANHO DA NOVA SENHA
========================================================= */

function validarTamanhoSenha() {

  if (
    !novaSenha ||
    !requisitoTamanho
  ) {

    return false;

  }


  const valido =
    novaSenha.value.length >= 8;


  requisitoTamanho.classList.toggle(
    "valido",
    valido
  );


  /*
   * Trocamos o ícone de acordo
   * com o estado da validação.
   */

  requisitoTamanho.innerHTML =
    valido
      ? `
          <i data-lucide="circle-check"></i>
          Pelo menos 8 caracteres
        `
      : `
          <i data-lucide="circle"></i>
          Pelo menos 8 caracteres
        `;


  if (
    typeof lucide !==
    "undefined"
  ) {

    lucide.createIcons();

  }


  return valido;

}


/* =========================================================
   VALIDAR CONFIRMAÇÃO DA SENHA
========================================================= */

function validarConfirmacaoSenha() {

  if (
    !novaSenha ||
    !confirmarSenha ||
    !senhaConfirmacao
  ) {

    return false;

  }


  const nova =
    novaSenha.value;


  const confirmacao =
    confirmarSenha.value;


  const wrapperConfirmacao =
    confirmarSenha.closest(
      ".input-wrapper"
    );


  /*
   * Ainda não digitou confirmação.
   */

  if (!confirmacao) {

    senhaConfirmacao.textContent =
      "";


    senhaConfirmacao.className =
      "senha-confirmacao";


    if (wrapperConfirmacao) {

      wrapperConfirmacao.classList.remove(
        "valido",
        "erro"
      );

    }


    return false;

  }


  /*
   * Senhas iguais.
   */

  if (
    nova &&
    nova === confirmacao
  ) {

    senhaConfirmacao.textContent =
      "As senhas conferem.";


    senhaConfirmacao.className =
      "senha-confirmacao valido";


    if (wrapperConfirmacao) {

      wrapperConfirmacao.classList.remove(
        "erro"
      );


      wrapperConfirmacao.classList.add(
        "valido"
      );

    }


    return true;

  }


  /*
   * Senhas diferentes.
   */

  senhaConfirmacao.textContent =
    "As senhas não conferem.";


  senhaConfirmacao.className =
    "senha-confirmacao invalido";


  if (wrapperConfirmacao) {

    wrapperConfirmacao.classList.remove(
      "valido"
    );


    wrapperConfirmacao.classList.add(
      "erro"
    );

  }


  return false;

}


/* =========================================================
   VALIDAÇÃO EM TEMPO REAL
========================================================= */

if (novaSenha) {

  novaSenha.addEventListener(
    "input",
    () => {

      limparMensagemSenha();


      validarTamanhoSenha();


      /*
       * Se já começou a confirmar,
       * revalida automaticamente.
       */

      if (
        confirmarSenha &&
        confirmarSenha.value
      ) {

        validarConfirmacaoSenha();

      }

    }
  );

}


if (confirmarSenha) {

  confirmarSenha.addEventListener(
    "input",
    () => {

      limparMensagemSenha();

      validarConfirmacaoSenha();

    }
  );

}


if (senhaAtual) {

  senhaAtual.addEventListener(
    "input",
    limparMensagemSenha
  );

}


/* =========================================================
   ALTERAR SENHA
========================================================= */

if (formAlterarSenha) {

  formAlterarSenha.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();


      limparMensagemSenha();


      /* =====================================
         PEGAR VALORES
      ===================================== */

      const valorSenhaAtual =
        senhaAtual
          ? senhaAtual.value
          : "";


      const valorNovaSenha =
        novaSenha
          ? novaSenha.value
          : "";


      const valorConfirmarSenha =
        confirmarSenha
          ? confirmarSenha.value
          : "";


      /* =====================================
         CAMPOS OBRIGATÓRIOS
      ===================================== */

      if (
        !valorSenhaAtual ||
        !valorNovaSenha ||
        !valorConfirmarSenha
      ) {

        mostrarMensagemSenha(
          "Preencha todos os campos.",
          "erro"
        );


        return;

      }


      /* =====================================
         TAMANHO
      ===================================== */

      if (
        valorNovaSenha.length < 8
      ) {

        mostrarMensagemSenha(
          "A nova senha deve ter pelo menos 8 caracteres.",
          "erro"
        );


        if (novaSenha) {

          novaSenha.focus();

        }


        return;

      }


      /* =====================================
         SENHA NOVA DIFERENTE DA ATUAL
      ===================================== */

      if (
        valorSenhaAtual ===
        valorNovaSenha
      ) {

        mostrarMensagemSenha(
          "A nova senha deve ser diferente da senha atual.",
          "erro"
        );


        if (novaSenha) {

          novaSenha.focus();

        }


        return;

      }


      /* =====================================
         CONFIRMAÇÃO
      ===================================== */

      if (
        valorNovaSenha !==
        valorConfirmarSenha
      ) {

        mostrarMensagemSenha(
          "A confirmação da nova senha não confere.",
          "erro"
        );


        validarConfirmacaoSenha();


        if (confirmarSenha) {

          confirmarSenha.focus();

        }


        return;

      }


      /* =====================================
         BLOQUEAR BOTÃO
      ===================================== */

      if (btnAlterarSenha) {

        btnAlterarSenha.disabled =
          true;


        btnAlterarSenha.innerHTML = `
          <i data-lucide="loader-circle"></i>

          <span>
            Atualizando...
          </span>
        `;


        if (
          typeof lucide !==
          "undefined"
        ) {

          lucide.createIcons();

        }

      }


      try {

        /* ===================================
           ENVIAR PARA O BACKEND
        =================================== */

        const resposta =
          await fetch(
            "/usuarios/senha",
            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`

              },

              body:
                JSON.stringify({

                  senhaAtual:
                    valorSenhaAtual,

                  novaSenha:
                    valorNovaSenha,

                  confirmarSenha:
                    valorConfirmarSenha

                })

            }
          );


        /* ===================================
           TOKEN EXPIRADO
        =================================== */

        if (
          resposta.status === 401
        ) {

          encerrarSessao();

          return;

        }


        const dados =
          await resposta.json();


        /* ===================================
           ERRO DO BACKEND
        =================================== */

        if (!resposta.ok) {

          mostrarMensagemSenha(
            dados.erro ||
            "Não foi possível alterar a senha.",
            "erro"
          );


          return;

        }


        /* ===================================
           SUCESSO
        =================================== */

        mostrarMensagemSenha(
          dados.mensagem ||
          "Senha alterada com sucesso.",
          "sucesso"
        );


        mostrarToast(
          "Senha alterada com sucesso!"
        );


        /* ===================================
           LIMPAR FORMULÁRIO
        =================================== */

        formAlterarSenha.reset();


        /*
         * Volta todos os campos para
         * o tipo password.
         */

        if (senhaAtual) {

          senhaAtual.type =
            "password";

        }


        if (novaSenha) {

          novaSenha.type =
            "password";

        }


        if (confirmarSenha) {

          confirmarSenha.type =
            "password";

        }


        /* ===================================
           RESETAR REQUISITO
        =================================== */

        if (requisitoTamanho) {

          requisitoTamanho.classList.remove(
            "valido"
          );


          requisitoTamanho.innerHTML = `
            <i data-lucide="circle"></i>
            Pelo menos 8 caracteres
          `;

        }


        /* ===================================
           RESETAR CONFIRMAÇÃO
        =================================== */

        if (senhaConfirmacao) {

          senhaConfirmacao.textContent =
            "";


          senhaConfirmacao.className =
            "senha-confirmacao";

        }


        if (confirmarSenha) {

          const wrapper =
            confirmarSenha.closest(
              ".input-wrapper"
            );


          if (wrapper) {

            wrapper.classList.remove(
              "valido",
              "erro"
            );

          }

        }


        /* ===================================
           RESETAR ÍCONES DOS OLHOS
        =================================== */

        passwordToggles.forEach(
          (botao) => {

            botao.innerHTML =
              '<i data-lucide="eye"></i>';


            botao.setAttribute(
              "aria-label",
              "Mostrar senha"
            );


            botao.setAttribute(
              "title",
              "Mostrar senha"
            );

          }
        );


        if (
          typeof lucide !==
          "undefined"
        ) {

          lucide.createIcons();

        }


      } catch (error) {

        console.error(
          "Erro ao alterar senha:",
          error
        );


        mostrarMensagemSenha(
          "Erro ao conectar com o servidor.",
          "erro"
        );


      } finally {

        /* ===================================
           RESTAURAR BOTÃO
        =================================== */

        if (btnAlterarSenha) {

          btnAlterarSenha.disabled =
            false;


          btnAlterarSenha.innerHTML = `
            <i data-lucide="shield-check"></i>

            <span>
              Atualizar senha
            </span>
          `;


          if (
            typeof lucide !==
            "undefined"
          ) {

            lucide.createIcons();

          }

        }

      }

    }
  );

}

/* =========================================================
   EXCLUIR CONTA - MODAL
========================================================= */

const btnAbrirExcluirConta = document.getElementById("btnAbrirExcluirConta");

const modalExcluirConta = document.getElementById("modalExcluirConta");

const btnFecharExcluirConta = document.getElementById("btnFecharExcluirConta");

const btnCancelarExcluirConta = document.getElementById("btnCancelarExcluirConta");

const btnConfirmarExcluirConta = document.getElementById("btnConfirmarExcluirConta");

const senhaExcluirConta = document.getElementById("senhaExcluirConta");

const mensagemExcluirConta = document.getElementById("mensagemExcluirConta");


/* =========================================================
   MENSAGEM DO MODAL
========================================================= */

function mostrarMensagemExcluirConta(mensagem, tipo = "erro") {

  if (!mensagemExcluirConta) {
    return;
  }

  mensagemExcluirConta.textContent = mensagem;

  mensagemExcluirConta.className = "excluir-conta-mensagem";

  mensagemExcluirConta.classList.add("ativa", tipo);

}


function limparMensagemExcluirConta() {

  if (!mensagemExcluirConta) {
    return;
  }

  mensagemExcluirConta.textContent = "";

  mensagemExcluirConta.className = "excluir-conta-mensagem";

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModalExcluirConta() {

  if (!modalExcluirConta) {
    return;
  }

  limparMensagemExcluirConta();


  if (senhaExcluirConta) {

    senhaExcluirConta.value = "";

    senhaExcluirConta.type = "password";

  }


  /*
  |----------------------------------------------------------
  | RESETAR ÍCONE DO OLHO
  |----------------------------------------------------------
  */

  const botaoOlho = modalExcluirConta.querySelector(
    '[data-password-target="senhaExcluirConta"]'
  );


  if (botaoOlho) {

    botaoOlho.innerHTML = '<i data-lucide="eye"></i>';

    botaoOlho.setAttribute(
      "aria-label",
      "Mostrar senha"
    );

    botaoOlho.setAttribute(
      "title",
      "Mostrar senha"
    );

  }


  modalExcluirConta.classList.add("ativo");

  modalExcluirConta.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-excluir-aberto"
  );


  /*
  |----------------------------------------------------------
  | RECRIAR ÍCONES LUCIDE
  |----------------------------------------------------------
  */

  if (window.lucide) {

    lucide.createIcons();

  }


  /*
  |----------------------------------------------------------
  | FOCO NO CAMPO DE SENHA
  |----------------------------------------------------------
  */

  setTimeout(() => {

    if (senhaExcluirConta) {

      senhaExcluirConta.focus();

    }

  }, 150);

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModalExcluirConta() {

  if (!modalExcluirConta) {
    return;
  }


  modalExcluirConta.classList.remove("ativo");

  modalExcluirConta.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-excluir-aberto"
  );


  limparMensagemExcluirConta();


  if (senhaExcluirConta) {

    senhaExcluirConta.value = "";

    senhaExcluirConta.type = "password";

  }


  /*
  |----------------------------------------------------------
  | RESETAR ÍCONE DO OLHO
  |----------------------------------------------------------
  */

  const botaoOlho = modalExcluirConta.querySelector(
    '[data-password-target="senhaExcluirConta"]'
  );


  if (botaoOlho) {

    botaoOlho.innerHTML = '<i data-lucide="eye"></i>';

    botaoOlho.setAttribute(
      "aria-label",
      "Mostrar senha"
    );

    botaoOlho.setAttribute(
      "title",
      "Mostrar senha"
    );

  }


  if (window.lucide) {

    lucide.createIcons();

  }

}


/* =========================================================
   BOTÃO ABRIR
========================================================= */

if (btnAbrirExcluirConta) {

  btnAbrirExcluirConta.addEventListener(
    "click",
    abrirModalExcluirConta
  );

}


/* =========================================================
   BOTÃO FECHAR
========================================================= */

if (btnFecharExcluirConta) {

  btnFecharExcluirConta.addEventListener(
    "click",
    fecharModalExcluirConta
  );

}


/* =========================================================
   BOTÃO CANCELAR
========================================================= */

if (btnCancelarExcluirConta) {

  btnCancelarExcluirConta.addEventListener(
    "click",
    fecharModalExcluirConta
  );

}


/* =========================================================
   CLIQUE FORA DO MODAL
========================================================= */

if (modalExcluirConta) {

  modalExcluirConta.addEventListener(
    "click",
    (event) => {

      /*
      |--------------------------------------------------
      | Só fecha se clicar exatamente no overlay.
      |
      | Clicar dentro da caixa não fecha.
      |--------------------------------------------------
      */

      if (event.target === modalExcluirConta) {

        fecharModalExcluirConta();

      }

    }
  );

}


/* =========================================================
   TECLA ESC
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      modalExcluirConta &&
      modalExcluirConta.classList.contains("ativo")
    ) {

      fecharModalExcluirConta();

    }

  }
);


/* =========================================================
   MOSTRAR / OCULTAR SENHA DO MODAL
========================================================= */

const toggleSenhaExcluirConta = document.querySelector(
  '[data-password-target="senhaExcluirConta"]'
);


if (
  toggleSenhaExcluirConta &&
  senhaExcluirConta
) {

  toggleSenhaExcluirConta.addEventListener(
    "click",
    () => {

      const senhaVisivel =
        senhaExcluirConta.type === "text";


      /*
      |--------------------------------------------------
      | ALTERAR TIPO DO INPUT
      |--------------------------------------------------
      */

      senhaExcluirConta.type =
        senhaVisivel
          ? "password"
          : "text";


      /*
      |--------------------------------------------------
      | ALTERAR ÍCONE
      |--------------------------------------------------
      */

      toggleSenhaExcluirConta.innerHTML =
        senhaVisivel
          ? '<i data-lucide="eye"></i>'
          : '<i data-lucide="eye-off"></i>';


      /*
      |--------------------------------------------------
      | ACESSIBILIDADE
      |--------------------------------------------------
      */

      const texto =
        senhaVisivel
          ? "Mostrar senha"
          : "Ocultar senha";


      toggleSenhaExcluirConta.setAttribute(
        "aria-label",
        texto
      );


      toggleSenhaExcluirConta.setAttribute(
        "title",
        texto
      );


      /*
      |--------------------------------------------------
      | RECRIAR ÍCONE
      |--------------------------------------------------
      */

      if (window.lucide) {

        lucide.createIcons();

      }


      /*
      |--------------------------------------------------
      | DEVOLVER FOCO AO INPUT
      |--------------------------------------------------
      */

      senhaExcluirConta.focus();

    }
  );

}


/* =========================================================
   LIMPAR ERRO AO DIGITAR
========================================================= */

if (senhaExcluirConta) {

  senhaExcluirConta.addEventListener(
    "input",
    () => {

      limparMensagemExcluirConta();

    }
  );

}


/* =========================================================
   ENTER NO CAMPO DE SENHA
========================================================= */

if (senhaExcluirConta) {

  senhaExcluirConta.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

        event.preventDefault();

        btnConfirmarExcluirConta?.click();

      }

    }
  );

}

/* =================================================
   excluir conta
================================================= */


if (btnConfirmarExcluirConta) {

  btnConfirmarExcluirConta.addEventListener(
    "click",
    async () => {

      const senha =
        senhaExcluirConta?.value || "";


      /* =================================================
         VALIDAR SENHA
      ================================================= */

      if (!senha.trim()) {

        mostrarMensagemExcluirConta(
          "Digite sua senha atual para continuar.",
          "erro"
        );

        senhaExcluirConta?.focus();

        return;

      }


      /* =================================================
         PEGAR TOKEN
      ================================================= */

      const tokenAtual =
        localStorage.getItem("tokenUsuario");


      if (!tokenAtual) {

        mostrarMensagemExcluirConta(
          "Sua sessão expirou. Faça login novamente.",
          "erro"
        );

        setTimeout(() => {

          window.location.href =
            "login-usuario.html";

        }, 1500);

        return;

      }


      /* =================================================
         ESTADO DE CARREGAMENTO
      ================================================= */

      const conteudoOriginalBotao =
        btnConfirmarExcluirConta.innerHTML;


      btnConfirmarExcluirConta.disabled = true;


      btnConfirmarExcluirConta.innerHTML = `
                <i data-lucide="loader-circle"></i>
                <span>Excluindo...</span>
            `;


      if (window.lucide) {

        lucide.createIcons();

      }


      limparMensagemExcluirConta();


      /* =================================================
         REQUISIÇÃO
      ================================================= */

      try {

        const resposta = await fetch(
          "/usuarios/conta",
          {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",

              Authorization:
                `Bearer ${tokenAtual}`
            },

            body: JSON.stringify({
              senha: senha
            })
          }
        );


        /* =================================================
           RESPOSTA DO SERVIDOR
        ================================================= */

        let dados = {};


        try {

          dados = await resposta.json();

        } catch (error) {

          dados = {};

        }


        /* =================================================
           TOKEN INVÁLIDO / EXPIRADO
        ================================================= */

        if (resposta.status === 401) {

          localStorage.removeItem(
            "tokenUsuario"
          );

          localStorage.removeItem(
            "usuarioLogado"
          );


          mostrarMensagemExcluirConta(
            dados.erro ||
            "Sua sessão expirou. Faça login novamente.",
            "erro"
          );


          setTimeout(() => {

            window.location.href =
              "login-usuario.html";

          }, 1600);


          return;

        }


        /* =================================================
           ERRO DA API
        ================================================= */

        if (!resposta.ok) {

          mostrarMensagemExcluirConta(
            dados.erro ||
            "Não foi possível excluir sua conta.",
            "erro"
          );


          senhaExcluirConta.value = "";

          senhaExcluirConta.focus();


          return;

        }


        /* =================================================
           CONTA EXCLUÍDA
        ================================================= */

        mostrarMensagemExcluirConta(
          dados.mensagem ||
          "Conta excluída com sucesso.",
          "sucesso"
        );


        /*
        |--------------------------------------------------
        | Remover dados locais da sessão
        |--------------------------------------------------
        */

        localStorage.removeItem(
          "tokenUsuario"
        );

        localStorage.removeItem(
          "usuarioLogado"
        );


        /*
        |--------------------------------------------------
        | Impedir novas ações enquanto redireciona
        |--------------------------------------------------
        */

        if (senhaExcluirConta) {

          senhaExcluirConta.disabled = true;

        }


        btnConfirmarExcluirConta.innerHTML = `
                    <i data-lucide="check"></i>
                    <span>Conta excluída</span>
                `;


        if (window.lucide) {

          lucide.createIcons();

        }


        /*
        |--------------------------------------------------
        | Voltar para página inicial
        |--------------------------------------------------
        */

        setTimeout(() => {

          window.location.href =
            "psifacil.html";

        }, 1800);


      } catch (error) {

        console.error(
          "Erro ao excluir conta:",
          error
        );


        mostrarMensagemExcluirConta(
          "Não foi possível conectar ao servidor. Tente novamente.",
          "erro"
        );


      } finally {

        /*
        |--------------------------------------------------
        | Só restaura o botão se a conta ainda existir.
        |
        | Se houve sucesso, o token já foi removido.
        |--------------------------------------------------
        */

        const contaAindaAtiva =
          localStorage.getItem(
            "tokenUsuario"
          );


        if (contaAindaAtiva) {

          btnConfirmarExcluirConta.disabled =
            false;


          btnConfirmarExcluirConta.innerHTML =
            conteudoOriginalBotao;


          if (window.lucide) {

            lucide.createIcons();

          }

        }

      }

    }
  );

}

/* =========================================================
   PREFERÊNCIAS DE NOTIFICAÇÕES
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const preferenciaNovosArtigos =
  document.getElementById(
    "preferenciaNovosArtigos"
  );


const preferenciaNovidades =
  document.getElementById(
    "preferenciaNovidades"
  );


let carregandoPreferencias = false;

let salvandoPreferencias = false;


/* =========================================================
   WEB PUSH
========================================================= */


/* =========================================================
   CONVERTER CHAVE VAPID
========================================================= */

function urlBase64ParaUint8Array(base64String) {

  const padding =
    "=".repeat(
      (4 - base64String.length % 4) % 4
    );


  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");


  const rawData =
    window.atob(base64);


  return Uint8Array.from(
    [...rawData].map(
      (caractere) =>
        caractere.charCodeAt(0)
    )
  );

}


/* =========================================================
   VERIFICAR SUPORTE A WEB PUSH
========================================================= */

function navegadorSuportaPush() {

  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );

}


/* =========================================================
   REGISTRAR SERVICE WORKER
========================================================= */

async function registrarServiceWorker() {

  if (!navegadorSuportaPush()) {

    throw new Error(
      "Este navegador não oferece suporte a notificações Push."
    );

  }


  const registro =
    await navigator.serviceWorker.register(
      "/sw.js"
    );


  await navigator.serviceWorker.ready;


  return registro;

}


/* =========================================================
   BUSCAR CHAVE PÚBLICA VAPID
========================================================= */

async function buscarChavePublicaVapid() {

  const resposta =
    await fetch(
      "/push/public-key"
    );


  const dados =
    await resposta.json();


  if (!resposta.ok) {

    throw new Error(
      dados.erro ||
      "Não foi possível carregar a chave de notificações."
    );

  }


  if (!dados.publicKey) {

    throw new Error(
      "Chave pública VAPID não encontrada."
    );

  }


  return dados.publicKey;

}


/* =========================================================
   ENVIAR INSCRIÇÃO PARA O BACKEND
========================================================= */

async function salvarInscricaoPush(
  subscription
) {

  const resposta =
    await fetch(
      "/push/subscribe",
      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`

        },

        body:
          JSON.stringify({

            subscription:
              subscription.toJSON()

          })

      }
    );


  if (resposta.status === 401) {

    encerrarSessao();

    throw new Error(
      "Sessão expirada."
    );

  }


  const dados =
    await resposta.json();


  if (!resposta.ok) {

    throw new Error(
      dados.erro ||
      "Não foi possível registrar este dispositivo."
    );

  }


  return dados;

}


/* =========================================================
   ATIVAR WEB PUSH
========================================================= */

async function ativarWebPush() {

  /* =====================================================
     SUPORTE DO NAVEGADOR
  ===================================================== */

  if (!navegadorSuportaPush()) {

    throw new Error(
      "Seu navegador não oferece suporte a notificações Push."
    );

  }


  /* =====================================================
     PERMISSÃO JÁ BLOQUEADA
  ===================================================== */

  if (
    Notification.permission ===
    "denied"
  ) {

    throw new Error(
      "As notificações estão bloqueadas neste navegador. Libere a permissão nas configurações do site."
    );

  }


  /* =====================================================
     PEDIR PERMISSÃO
  ===================================================== */

  let permissao =
    Notification.permission;


  if (
    permissao ===
    "default"
  ) {

    permissao =
      await Notification.requestPermission();

  }


  if (
    permissao !==
    "granted"
  ) {

    throw new Error(
      "Permissão para notificações não concedida."
    );

  }


  /* =====================================================
     REGISTRAR SERVICE WORKER
  ===================================================== */

  const registro =
    await registrarServiceWorker();


  /* =====================================================
     VERIFICAR SE JÁ EXISTE INSCRIÇÃO
  ===================================================== */

  let subscription =
    await registro.pushManager
      .getSubscription();


  /* =====================================================
     CRIAR INSCRIÇÃO
  ===================================================== */

  if (!subscription) {

    const chavePublica =
      await buscarChavePublicaVapid();


    subscription =
      await registro.pushManager
        .subscribe({

          userVisibleOnly:
            true,

          applicationServerKey:
            urlBase64ParaUint8Array(
              chavePublica
            )

        });

  }


  /* =====================================================
     SALVAR NO BACKEND
  ===================================================== */

  await salvarInscricaoPush(
    subscription
  );


  return subscription;

}


/* =========================================================
   REMOVER INSCRIÇÃO PUSH
========================================================= */

async function desativarWebPush() {

  if (
    !("serviceWorker" in navigator)
  ) {

    return;

  }


  const registro =
    await navigator.serviceWorker
      .getRegistration();


  if (!registro) {

    return;

  }


  const subscription =
    await registro.pushManager
      .getSubscription();


  if (!subscription) {

    return;

  }


  const endpoint =
    subscription.endpoint;


  /* =====================================================
     REMOVER DO BACKEND
  ===================================================== */

  const resposta =
    await fetch(
      "/push/subscribe",
      {

        method:
          "DELETE",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`

        },

        body:
          JSON.stringify({

            endpoint:
              endpoint

          })

      }
    );


  if (resposta.status === 401) {

    encerrarSessao();

    return;

  }


  const dados =
    await resposta.json();


  if (!resposta.ok) {

    throw new Error(
      dados.erro ||
      "Não foi possível remover este dispositivo."
    );

  }


  /* =====================================================
     REMOVER DO NAVEGADOR
  ===================================================== */

  await subscription.unsubscribe();

}



/* =========================================================
   CARREGAR PREFERÊNCIAS
========================================================= */

async function carregarPreferencias() {

  if (
    !preferenciaNovosArtigos ||
    !preferenciaNovidades
  ) {

    return;

  }


  carregandoPreferencias = true;


  try {

    const resposta =
      await fetch(
        "/preferencias",
        {

          method: "GET",

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }
      );


    /* =====================================================
       SESSÃO EXPIRADA
    ===================================================== */

    if (resposta.status === 401) {

      encerrarSessao();

      return;

    }


    const dados =
      await resposta.json();


    /* =====================================================
       ERRO
    ===================================================== */

    if (!resposta.ok) {

      throw new Error(
        dados.erro ||
        "Não foi possível carregar as preferências."
      );

    }


    /* =====================================================
       APLICAR VALORES NOS SWITCHES
    ===================================================== */

    preferenciaNovosArtigos.checked =
      dados.novos_artigos === true;


    preferenciaNovidades.checked =
      dados.novidades === true;


  } catch (error) {

    console.error(
      "Erro ao carregar preferências:",
      error
    );


    mostrarToast(
      "Não foi possível carregar suas preferências.",
      "error"
    );


  } finally {

    carregandoPreferencias = false;

  }

}


/* =========================================================
   SALVAR PREFERÊNCIAS
========================================================= */

async function salvarPreferencias() {

  if (
    !preferenciaNovosArtigos ||
    !preferenciaNovidades
  ) {

    return;

  }


  if (
    carregandoPreferencias ||
    salvandoPreferencias
  ) {

    return;

  }


  salvandoPreferencias = true;


  /*
   * Guardamos os valores atuais.
   * Se o servidor der erro, podemos recarregar
   * os valores verdadeiros do banco.
   */

  const novosArtigos =
    preferenciaNovosArtigos.checked;


  const novidades =
    preferenciaNovidades.checked;


  /*
   * Enquanto salva, bloqueia os switches
   * para evitar vários cliques seguidos.
   */

  preferenciaNovosArtigos.disabled =
    true;


  preferenciaNovidades.disabled =
    true;


  try {

    const resposta =
      await fetch(
        "/preferencias",
        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },


          body:
            JSON.stringify({

              novosArtigos:
                novosArtigos,

              novidades:
                novidades

            })

        }
      );


    /* =====================================================
       SESSÃO EXPIRADA
    ===================================================== */

    if (resposta.status === 401) {

      encerrarSessao();

      return;

    }


    const dados =
      await resposta.json();


    /* =====================================================
       ERRO
    ===================================================== */

    if (!resposta.ok) {

      throw new Error(
        dados.erro ||
        "Não foi possível salvar as preferências."
      );

    }


    /* =====================================================
       GARANTIR VALORES RETORNADOS PELO SERVIDOR
    ===================================================== */

    if (dados.preferencias) {

      preferenciaNovosArtigos.checked =
        dados.preferencias.novos_artigos ===
        true;


      preferenciaNovidades.checked =
        dados.preferencias.novidades ===
        true;

    }


    /* =====================================================
       SUCESSO
    ===================================================== */

    mostrarToast(
      "Preferências atualizadas!"
    );


  } catch (error) {

    console.error(
      "Erro ao salvar preferências:",
      error
    );


    mostrarToast(
      "Não foi possível salvar suas preferências.",
      "error"
    );


    /*
     * Se falhou, busca novamente os valores
     * que realmente estão no banco.
     */

    await carregarPreferencias();


  } finally {

    salvandoPreferencias = false;


    preferenciaNovosArtigos.disabled =
      false;


    preferenciaNovidades.disabled =
      false;

  }

}


/* =========================================================
   ALTERAR PREFERÊNCIAS DE NOTIFICAÇÃO
========================================================= */

async function alterarPreferenciasNotificacao() {

  const algumTipoAtivado =
    preferenciaNovosArtigos.checked ||
    preferenciaNovidades.checked;


  /* =====================================================
     PELO MENOS UMA NOTIFICAÇÃO ESTÁ ATIVA
  ===================================================== */

  if (algumTipoAtivado) {

    try {

      /*
       * Garante que este dispositivo esteja
       * inscrito para receber Push.
       *
       * Se já estiver inscrito, a função apenas
       * reutiliza a inscrição existente.
       */

      await ativarWebPush();


      /*
       * Salvar estados dos dois switches.
       */

      await salvarPreferencias();


    } catch (error) {

      console.error(
        "Erro ao ativar notificações:",
        error
      );


      mostrarToast(
        error.message ||
        "Não foi possível ativar as notificações.",
        "error"
      );


      /*
       * Recarrega os valores verdadeiros
       * que estão armazenados no banco.
       */

      await carregarPreferencias();

    }


    return;

  }


  /* =====================================================
     OS DOIS SWITCHES ESTÃO DESLIGADOS
  ===================================================== */

  try {

    /*
     * Primeiro salvamos no banco que nenhuma
     * categoria de notificação está ativa.
     */

    await salvarPreferencias();


    /*
     * Agora podemos remover a inscrição Push
     * deste dispositivo.
     */

    await desativarWebPush();


  } catch (error) {

    console.error(
      "Erro ao desativar notificações:",
      error
    );


    mostrarToast(
      error.message ||
      "Não foi possível desativar as notificações.",
      "error"
    );


    await carregarPreferencias();

  }

}


/* =========================================================
   SWITCH - NOVOS ARTIGOS
========================================================= */

if (preferenciaNovosArtigos) {

  preferenciaNovosArtigos.addEventListener(
    "change",
    alterarPreferenciasNotificacao
  );

}




/* =========================================================
   NOTIFICAÇÕES RECEBIDAS
========================================================= */

const listaNotificacoes =
    document.getElementById(
        "listaNotificacoes"
    );

const contadorNotificacoes =
    document.getElementById(
        "contadorNotificacoes"
    );

const btnMarcarTodasLidas =
    document.getElementById(
        "btnMarcarTodasLidas"
    );


/* =========================================================
   FORMATAR DATA DA NOTIFICAÇÃO
========================================================= */

function formatarDataNotificacao(data) {

    const dataNotificacao =
        new Date(data);

    const agora =
        new Date();

    const diferenca =
        agora - dataNotificacao;

    const minutos =
        Math.floor(
            diferenca / 60000
        );

    const horas =
        Math.floor(
            diferenca / 3600000
        );

    const dias =
        Math.floor(
            diferenca / 86400000
        );


    if (minutos < 1) {
        return "Agora";
    }


    if (minutos < 60) {

        return `Há ${minutos} min`;

    }


    if (horas < 24) {

        return horas === 1
            ? "Há 1 hora"
            : `Há ${horas} horas`;

    }


    if (dias === 1) {
        return "Ontem";
    }


    if (dias < 7) {

        return `Há ${dias} dias`;

    }


    return dataNotificacao
        .toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


/* =========================================================
   ATUALIZAR CONTADOR
========================================================= */

function atualizarContadorNotificacoes(
    notificacoes
) {

    if (!contadorNotificacoes) {
        return;
    }


    const naoLidas =
        notificacoes.filter(
            notificacao =>
                !notificacao.lida
        ).length;


    if (naoLidas === 0) {

        contadorNotificacoes.textContent =
            "Nenhuma notificação nova";


        if (btnMarcarTodasLidas) {

            btnMarcarTodasLidas.hidden =
                true;

        }


        return;

    }


    contadorNotificacoes.textContent =
        naoLidas === 1
            ? "1 nova"
            : `${naoLidas} novas`;


    if (btnMarcarTodasLidas) {

        btnMarcarTodasLidas.hidden =
            false;

    }

}


/* =========================================================
   MARCAR UMA COMO LIDA
========================================================= */

async function marcarNotificacaoComoLida(
    id
) {

    try {

        const resposta =
            await fetch(
                `/notificacoes/${id}/lida`,
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao atualizar notificação."
            );

        }


        return true;


    } catch (error) {

        console.error(
            "ERRO AO MARCAR NOTIFICAÇÃO:",
            error
        );


        return false;

    }

}


/* =========================================================
   ABRIR NOTIFICAÇÃO
========================================================= */

async function abrirNotificacao(
    notificacao
) {

    if (!notificacao.lida) {

        await marcarNotificacaoComoLida(
            notificacao.id
        );

    }


    if (notificacao.url) {

        window.location.href =
            notificacao.url;

        return;

    }


    await carregarNotificacoes();

}


/* =========================================================
   RENDERIZAR NOTIFICAÇÕES
========================================================= */

function renderizarNotificacoes(
    notificacoes
) {

    if (!listaNotificacoes) {
        return;
    }


    listaNotificacoes.innerHTML =
        "";


    atualizarContadorNotificacoes(
        notificacoes
    );


    if (
        notificacoes.length === 0
    ) {

        listaNotificacoes.innerHTML =
            `
            <div class="notificacoes-vazio">

                <i data-lucide="bell-off"></i>

                <div>
                    Você ainda não recebeu notificações.
                </div>

            </div>
            `;


        if (window.lucide) {
            lucide.createIcons();
        }


        return;

    }


    notificacoes.forEach(
        notificacao => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                `notificacao-item ${
                    notificacao.lida
                        ? "lida"
                        : "nao-lida"
                }`;


            item.innerHTML =
                `
                <div class="notificacao-item-icone">
                    <i data-lucide="book-open"></i>
                </div>

                <div class="notificacao-item-conteudo">

                    <p class="notificacao-item-titulo">
                        ${escaparHtmlNotificacao(
                            notificacao.titulo
                        )}
                    </p>

                    <p class="notificacao-item-mensagem">
                        ${escaparHtmlNotificacao(
                            notificacao.mensagem
                        )}
                    </p>

                    <span class="notificacao-item-data">
                        ${formatarDataNotificacao(
                            notificacao.criado_em
                        )}
                    </span>

                </div>

                ${
                    notificacao.url
                        ? `
                            <div class="notificacao-item-seta">
                                <i data-lucide="chevron-right"></i>
                            </div>
                          `
                        : ""
                }
                `;


            item.addEventListener(
                "click",
                () => {

                    abrirNotificacao(
                        notificacao
                    );

                }
            );


            listaNotificacoes.appendChild(
                item
            );

        }
    );


    if (window.lucide) {
        lucide.createIcons();
    }

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHtmlNotificacao(
    valor
) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.textContent =
        valor || "";


    return elemento.innerHTML;

}


/* =========================================================
   CARREGAR NOTIFICAÇÕES
========================================================= */

async function carregarNotificacoes() {

    if (!listaNotificacoes) {
        return;
    }


    try {

        const resposta =
            await fetch(
                "/notificacoes",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar notificações."
            );

        }


        renderizarNotificacoes(
            dados
        );


    } catch (error) {

        console.error(
            "ERRO AO CARREGAR NOTIFICAÇÕES:",
            error
        );


        contadorNotificacoes.textContent =
            "Não foi possível carregar";


        listaNotificacoes.innerHTML =
            `
            <div class="notificacoes-erro">

                <i data-lucide="circle-alert"></i>

                <div>
                    Não foi possível carregar suas notificações.
                </div>

            </div>
            `;


        if (window.lucide) {
            lucide.createIcons();
        }

    }

}


/* =========================================================
   MARCAR TODAS COMO LIDAS
========================================================= */

if (btnMarcarTodasLidas) {

    btnMarcarTodasLidas.addEventListener(
        "click",
        async () => {

            try {

                btnMarcarTodasLidas.disabled =
                    true;


                const resposta =
                    await fetch(
                        "/notificacoes/marcar-todas/lidas",
                        {
                            method: "PATCH",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        dados.erro ||
                        "Erro ao atualizar notificações."
                    );

                }


                await carregarNotificacoes();


                mostrarToast(
                    "Todas as notificações foram marcadas como lidas.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "ERRO AO MARCAR TODAS COMO LIDAS:",
                    error
                );


                mostrarToast(
                    error.message ||
                    "Não foi possível atualizar as notificações.",
                    "error"
                );


            } finally {

                btnMarcarTodasLidas.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   INICIAR
========================================================= */

carregarNotificacoes();







/* =========================================================
   ALTERAÇÃO — NOVIDADES
========================================================= */

if (preferenciaNovidades) {

  preferenciaNovidades.addEventListener(
    "change",
    () => {

      salvarPreferencias();

    }
  );

}

/* =========================================================
   SAIR
========================================================= */

function sairUsuario() {

  localStorage.removeItem(
    "tokenUsuario"
  );

  localStorage.removeItem(
    "usuarioLogado"
  );


  window.location.href =
    "login-usuario.html";

}


/* =========================================================
   INICIAR
========================================================= */

carregarPerfil();

carregarSalvos();

carregarFrasesSalvas();

carregarPreferencias();