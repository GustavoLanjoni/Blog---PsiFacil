document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const sidebar = document.getElementById("perfilSidebar");
    const overlay = document.getElementById("sidebarOverlay");

    const btnAbrir = document.getElementById("abrirMenuPerfil");
    const btnFechar = document.getElementById("fecharMenuPerfil");

    const navItems = document.querySelectorAll("[data-section]");

    const sections = document.querySelectorAll(".perfil-section");

    const configToggle = document.getElementById("configToggle");
    const configSubmenu = document.getElementById("configSubmenu");
    const navSubmenu = configToggle?.closest(".nav-submenu");

    const fotoEditBtn = document.getElementById("fotoEditBtn");
    const fotoPreview = document.getElementById("fotoPreview");


    /* =====================================================
       ABRIR MENU
    ====================================================== */

    function abrirMenu() {

        if (!sidebar || !overlay) return;

        sidebar.classList.add("active");
        overlay.classList.add("active");

        document.body.classList.add("menu-perfil-aberto");

        btnAbrir?.setAttribute("aria-expanded", "true");

    }


    /* =====================================================
       FECHAR MENU
    ====================================================== */

    function fecharMenu() {

        if (!sidebar || !overlay) return;

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

        document.body.classList.remove("menu-perfil-aberto");

        btnAbrir?.setAttribute("aria-expanded", "false");

    }


    btnAbrir?.addEventListener("click", abrirMenu);

    btnFechar?.addEventListener("click", fecharMenu);

    overlay?.addEventListener("click", fecharMenu);


    /* =====================================================
       ESC
    ====================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            fecharMenu();
        }

    });


    /* =====================================================
       SUBMENU CONFIGURAÇÕES
    ====================================================== */

    configToggle?.addEventListener("click", () => {

        navSubmenu?.classList.toggle("open");

        const aberto = navSubmenu?.classList.contains("open");

        configToggle.setAttribute(
            "aria-expanded",
            aberto ? "true" : "false"
        );

    });


    /* =====================================================
       TROCAR SEÇÃO
    ====================================================== */

    function abrirSecao(nomeSecao, botaoClicado) {

        const sectionDestino = document.getElementById(
            `section-${nomeSecao}`
        );

        if (!sectionDestino) return;


        /* ESCONDE TODAS */

        sections.forEach((section) => {
            section.classList.remove("active");
        });


        /* MOSTRA A ESCOLHIDA */

        sectionDestino.classList.add("active");


        /* REMOVE ACTIVE DOS MENUS */

        document
            .querySelectorAll(".perfil-nav-item[data-section]")
            .forEach((item) => {
                item.classList.remove("active");
            });

        document
            .querySelectorAll(".submenu-item")
            .forEach((item) => {
                item.classList.remove("active");
            });


        /* MARCA ITEM CLICADO */

        botaoClicado?.classList.add("active");


        /* SE FOR CONFIGURAÇÃO */

        if (botaoClicado?.classList.contains("submenu-item")) {

            configToggle?.classList.add("active");

            navSubmenu?.classList.add("open");

            configToggle?.setAttribute(
                "aria-expanded",
                "true"
            );

        } else {

            configToggle?.classList.remove("active");

        }


        /* FECHA DRAWER NO TABLET/CELULAR */

        if (window.innerWidth <= 1024) {
            fecharMenu();
        }


        /* VOLTA PARA O TOPO */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    navItems.forEach((item) => {

        item.addEventListener("click", () => {

            const section = item.dataset.section;

            abrirSecao(section, item);

        });

    });


    /* =====================================================
       FOTO
    ====================================================== */

    function abrirMenuFoto(event) {

        event?.stopPropagation();

        const fotoMenu = document.getElementById("fotoMenu");

        fotoMenu?.classList.toggle("show");

    }


    fotoEditBtn?.addEventListener(
        "click",
        abrirMenuFoto
    );

    fotoPreview?.addEventListener(
        "click",
        abrirMenuFoto
    );


    document.addEventListener("click", (event) => {

        const fotoMenu = document.getElementById("fotoMenu");
        const fotoWrapper = document.querySelector(".foto-wrapper");

        if (
            fotoMenu &&
            fotoWrapper &&
            !fotoWrapper.contains(event.target)
        ) {
            fotoMenu.classList.remove("show");
        }

    });


    /* =====================================================
       SINCRONIZA FOTO/NOME NO CARD MOBILE

       O perfil.js preenche os dados principais.
       Este observer apenas replica esses dados no mobile.
    ====================================================== */

    const fotoMobile = document.getElementById("fotoPreviewMobile");
    const nomeMobile = document.getElementById("nomeTituloMobile");
    const emailMobile = document.getElementById("emailUsuarioMobile");

    const nomeTitulo = document.getElementById("nomeTitulo");
    const emailUsuario = document.getElementById("emailUsuario");


    function sincronizarUsuarioMobile() {

        if (fotoPreview && fotoMobile) {
            fotoMobile.src = fotoPreview.src;
        }

        if (nomeTitulo && nomeMobile) {
            nomeMobile.textContent =
                nomeTitulo.textContent || "Meu perfil";
        }

        if (emailUsuario && emailMobile) {
            emailMobile.textContent =
                emailUsuario.textContent || "Sua conta PsiFácil";
        }

    }


    sincronizarUsuarioMobile();


    const observer = new MutationObserver(() => {
        sincronizarUsuarioMobile();
    });


    if (nomeTitulo) {

        observer.observe(nomeTitulo, {
            childList: true,
            subtree: true,
            characterData: true
        });

    }


    if (emailUsuario) {

        observer.observe(emailUsuario, {
            childList: true,
            subtree: true,
            characterData: true
        });

    }


    if (fotoPreview) {

        observer.observe(fotoPreview, {
            attributes: true,
            attributeFilter: ["src"]
        });

    }


    /* =====================================================
       RESIZE
    ====================================================== */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 1024) {

            sidebar?.classList.remove("active");
            overlay?.classList.remove("active");

            document.body.classList.remove(
                "menu-perfil-aberto"
            );

            btnAbrir?.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* =====================================================
       LUCIDE
    ====================================================== */

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

});