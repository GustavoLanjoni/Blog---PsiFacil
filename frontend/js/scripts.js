document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (!menuToggle || !mobileMenu) {
        return;
    }

    menuToggle.addEventListener("click", () => {

        const menuAberto = mobileMenu.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            menuAberto ? "true" : "false"
        );

        menuToggle.innerHTML = menuAberto
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

    });


    const links = mobileMenu.querySelectorAll("a");

    links.forEach((link) => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.innerHTML =
                '<i data-lucide="menu"></i>';

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }

        });

    });

});