// MODO OSCURO
// Alterna la clase "dark-mode" en <body> (usada por la config de Tailwind:
// darkMode: ['selector', '.dark-mode']) y guarda la preferencia del usuario
// en localStorage para que persista al recargar la página.

(function () {
    "use strict";

    var STORAGE_KEY = "theme";
    var DARK_CLASS = "dark-mode";

    var toggleButton = document.getElementById("dark-mode");

    if (!toggleButton) {
        return;
    }

    toggleButton.addEventListener("click", function (event) {
        event.preventDefault();

        var isDark = document.body.classList.toggle(DARK_CLASS);

        localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    });
})();
