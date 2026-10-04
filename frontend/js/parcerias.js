/* =========================================================
   PSIFÁCIL
   Página de Parcerias
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     ELEMENTOS
  ====================================================== */

  const form = document.getElementById("parceriaForm");

  const nome = document.getElementById("nome");
  const empresa = document.getElementById("empresa");
  const email = document.getElementById("email");
  const whatsapp = document.getElementById("whatsapp");
  const tipo = document.getElementById("tipo");
  const mensagem = document.getElementById("mensagem");
  const consentimento = document.getElementById("consentimento");

  const contadorMensagem =
    document.getElementById("contadorMensagem");

  const formMessage =
    document.getElementById("formMessage");

  const btnEnviar =
    document.getElementById("btnEnviar");


  /* =====================================================
     SEGURANÇA
     Evita erro caso o JS seja carregado em outra página
  ====================================================== */

  if (
    !form ||
    !nome ||
    !empresa ||
    !email ||
    !whatsapp ||
    !tipo ||
    !mensagem ||
    !consentimento ||
    !contadorMensagem ||
    !formMessage ||
    !btnEnviar
  ) {

    console.error(
      "PsiFácil: elementos do formulário de parceria não foram encontrados."
    );

    return;

  }


  /* =====================================================
     CONTADOR DA MENSAGEM
  ====================================================== */

  mensagem.addEventListener("input", () => {

    contadorMensagem.textContent =
      mensagem.value.length;

  });


  /* =====================================================
     FORMATAÇÃO DO WHATSAPP
  ====================================================== */

  whatsapp.addEventListener("input", (event) => {

    let valor =
      event.target.value.replace(/\D/g, "");

    valor =
      valor.substring(0, 11);


    if (valor.length > 10) {

      valor = valor.replace(
        /^(\d{2})(\d{5})(\d{4})$/,
        "($1) $2-$3"
      );

    } else if (valor.length > 6) {

      valor = valor.replace(
        /^(\d{2})(\d{4})(\d{0,4})$/,
        "($1) $2-$3"
      );

    } else if (valor.length > 2) {

      valor = valor.replace(
        /^(\d{2})(\d+)/,
        "($1) $2"
      );

    } else if (valor.length > 0) {

      valor = valor.replace(
        /^(\d{0,2})/,
        "($1"
      );

    }


    event.target.value = valor;

  });


  /* =====================================================
     MENSAGEM VISUAL
  ====================================================== */

  function mostrarMensagem(texto, tipoMensagem) {

    formMessage.textContent = texto;

    formMessage.className =
      `form-message show ${tipoMensagem}`;

    formMessage.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }


  function limparMensagem() {

    formMessage.textContent = "";

    formMessage.className =
      "form-message";

  }


  /* =====================================================
     VALIDAÇÃO DE E-MAIL
  ====================================================== */

  function emailValido(valor) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  }


  /* =====================================================
     ALTERAR ESTADO DO BOTÃO
  ====================================================== */

  function definirEstadoEnvio(enviando) {

    btnEnviar.disabled = enviando;


    if (enviando) {

      btnEnviar.innerHTML = `
        <span>Enviando...</span>
      `;

      return;

    }


    btnEnviar.innerHTML = `
      <span>Enviar proposta</span>
      <i data-lucide="send"></i>
    `;


    if (window.lucide) {

      lucide.createIcons();

    }

  }


  /* =====================================================
     ENVIO DO FORMULÁRIO
  ====================================================== */

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    limparMensagem();


    /* ===================================================
       DADOS
    ==================================================== */

    const dados = {

      nome:
        nome.value.trim(),

      empresa:
        empresa.value.trim(),

      email:
        email.value.trim().toLowerCase(),

      whatsapp:
        whatsapp.value.trim(),

      tipo:
        tipo.value,

      mensagem:
        mensagem.value.trim()

    };


    /* ===================================================
       CAMPOS OBRIGATÓRIOS
    ==================================================== */

    if (
      !dados.nome ||
      !dados.empresa ||
      !dados.email ||
      !dados.tipo ||
      !dados.mensagem
    ) {

      mostrarMensagem(
        "Preencha todos os campos obrigatórios antes de enviar sua proposta.",
        "error"
      );

      return;

    }


    /* ===================================================
       NOME
    ==================================================== */

    if (dados.nome.length < 2) {

      mostrarMensagem(
        "Informe seu nome para continuar.",
        "error"
      );

      nome.focus();

      return;

    }


    if (dados.nome.length > 100) {

      mostrarMensagem(
        "O nome informado ultrapassa o limite permitido.",
        "error"
      );

      nome.focus();

      return;

    }


    /* ===================================================
       EMPRESA
    ==================================================== */

    if (dados.empresa.length > 150) {

      mostrarMensagem(
        "O nome da clínica, empresa ou projeto ultrapassa o limite permitido.",
        "error"
      );

      empresa.focus();

      return;

    }


    /* ===================================================
       E-MAIL
    ==================================================== */

    if (!emailValido(dados.email)) {

      mostrarMensagem(
        "Informe um endereço de e-mail válido para que possamos entrar em contato.",
        "error"
      );

      email.focus();

      return;

    }


    if (dados.email.length > 150) {

      mostrarMensagem(
        "O endereço de e-mail informado ultrapassa o limite permitido.",
        "error"
      );

      email.focus();

      return;

    }


    /* ===================================================
       WHATSAPP
    ==================================================== */

    if (dados.whatsapp.length > 20) {

      mostrarMensagem(
        "O número de WhatsApp informado ultrapassa o limite permitido.",
        "error"
      );

      whatsapp.focus();

      return;

    }


    /* ===================================================
       TIPO DE PARCERIA
    ==================================================== */

    const tiposPermitidos = [
      "clinica",
      "profissional",
      "editora",
      "marca",
      "conteudo",
      "outro"
    ];


    if (!tiposPermitidos.includes(dados.tipo)) {

      mostrarMensagem(
        "Selecione um tipo de parceria válido.",
        "error"
      );

      tipo.focus();

      return;

    }


    /* ===================================================
       MENSAGEM
    ==================================================== */

    if (dados.mensagem.length < 20) {

      mostrarMensagem(
        "Conte um pouco mais sobre sua proposta para que possamos entendê-la melhor.",
        "error"
      );

      mensagem.focus();

      return;

    }


    if (dados.mensagem.length > 2000) {

      mostrarMensagem(
        "Sua proposta ultrapassa o limite de 2000 caracteres.",
        "error"
      );

      mensagem.focus();

      return;

    }


    /* ===================================================
       CONSENTIMENTO
    ==================================================== */

    if (!consentimento.checked) {

      mostrarMensagem(
        "Para enviar a proposta, confirme que podemos utilizar os dados informados para analisar a solicitação e entrar em contato.",
        "error"
      );

      consentimento.focus();

      return;

    }


    /* ===================================================
       INICIA ENVIO
    ==================================================== */

    definirEstadoEnvio(true);


    try {

      /* =================================================
         ENVIA PARA O BACKEND

         POST /parcerias
      ================================================== */

      const resposta = await fetch("/parcerias", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)

      });


      /* =================================================
         TENTA LER A RESPOSTA DO SERVIDOR
      ================================================== */

      let resultado;


      try {

        resultado = await resposta.json();

      } catch {

        resultado = {};

      }


      /* =================================================
         SERVIDOR RETORNOU ERRO
      ================================================== */

      if (!resposta.ok) {

        throw new Error(
          resultado.mensagem ||
          "Não foi possível enviar sua proposta neste momento."
        );

      }


      /* =================================================
         SUCESSO
      ================================================== */

      mostrarMensagem(
        resultado.mensagem ||
        "Sua proposta foi enviada com sucesso. Obrigado pelo interesse em construir uma parceria com o PsiFácil.",
        "success"
      );


      /* =================================================
         LIMPA O FORMULÁRIO SOMENTE APÓS SUCESSO
      ================================================== */

      form.reset();

      contadorMensagem.textContent = "0";


    } catch (erro) {

      /* =================================================
         ERRO
      ================================================== */

      console.error(
        "Erro ao enviar proposta:",
        erro
      );


      mostrarMensagem(
        erro.message ||
        "Não foi possível enviar sua proposta neste momento. Tente novamente.",
        "error"
      );


    } finally {

      /* =================================================
         RESTAURA O BOTÃO
      ================================================== */

      definirEstadoEnvio(false);

    }

  });

});