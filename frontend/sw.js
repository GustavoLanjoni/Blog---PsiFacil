/* =========================================================
   PSIFÁCIL
   SERVICE WORKER - WEB PUSH
========================================================= */


/* =========================================================
   RECEBER NOTIFICAÇÃO PUSH
========================================================= */

self.addEventListener(
  "push",
  (event) => {

    /* =====================================================
       DADOS PADRÃO
    ===================================================== */

    let dados = {

      titulo:
        "PsiFácil",

      mensagem:
        "Você recebeu uma nova notificação.",

      url:
        "/psifacil.html",

      icone:
        "/img/icon-192.png",

      badge:
        "/img/icon-192.png"

    };


    /* =====================================================
       LER DADOS RECEBIDOS DO BACKEND
    ===================================================== */

    if (event.data) {

      try {

        const dadosRecebidos =
          event.data.json();


        dados = {

          ...dados,

          ...dadosRecebidos

        };


      } catch (error) {

        dados.mensagem =
          event.data.text();

      }

    }


    /* =====================================================
       CONFIGURAÇÕES DA NOTIFICAÇÃO
    ===================================================== */

    const opcoes = {

      body:
        dados.mensagem,

      icon:
        dados.icone,

      badge:
        dados.badge,

      data: {

        url:
          dados.url ||
          "/psifacil.html"

      },

      tag:
        dados.tag ||
        "psifacil-notificacao",

      renotify:
        true

    };


    /* =====================================================
       MOSTRAR NOTIFICAÇÃO
    ===================================================== */

    event.waitUntil(

      self.registration.showNotification(

        dados.titulo ||
        "PsiFácil",

        opcoes

      )

    );

  }
);


/* =========================================================
   CLIQUE NA NOTIFICAÇÃO
========================================================= */

self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();


    const urlDestino =
      event.notification.data?.url ||
      "/psifacil.html";


    event.waitUntil(

      clients
        .matchAll({

          type:
            "window",

          includeUncontrolled:
            true

        })

        .then((janelas) => {

          /* =================================================
             PROCURAR UMA ABA DO PSIFÁCIL JÁ ABERTA
          ================================================= */

          for (const janela of janelas) {

            if (
              "focus" in janela
            ) {

              /*
               * Se já existe uma janela,
               * navegamos para o conteúdo
               * da notificação.
               */

              return janela
                .navigate(urlDestino)
                .then(() => {

                  return janela.focus();

                });

            }

          }


          /* =================================================
             NÃO EXISTE ABA ABERTA
          ================================================= */

          if (
            clients.openWindow
          ) {

            return clients.openWindow(
              urlDestino
            );

          }

        })

    );

  }
);