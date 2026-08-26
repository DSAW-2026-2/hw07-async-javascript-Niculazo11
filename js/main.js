import {
    validateName,
    validateEmail,
    validatePassword
} from "./validation.js";

import { initializeCosmetics } from "./cosmetics.js";


document.addEventListener("DOMContentLoaded", function () {

    console.log("Main JS loaded!");

    const savedName = localStorage.getItem("name");


    // ---------- Join form (index.html) ----------

    const form = document.getElementById("joinForm");

    if (form) {

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const nameError = document.getElementById("nameError");
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");

        const formSuccess = document.getElementById("formSuccess");
        const welcomeMessage = document.getElementById("welcomeMessage");

        if (savedName && welcomeMessage) {
            welcomeMessage.textContent = "Welcome back, " + savedName + "!";
        }

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const nameMessage = validateName(nameInput.value);
            const emailMessage = validateEmail(emailInput.value);
            const passwordMessage = validatePassword(passwordInput.value);

            nameError.textContent = nameMessage;
            emailError.textContent = emailMessage;
            passwordError.textContent = passwordMessage;

            if (
                nameMessage === "" &&
                emailMessage === "" &&
                passwordMessage === ""
            ) {

                localStorage.setItem("name", nameInput.value.trim());
                localStorage.setItem("email", emailInput.value.trim());

                formSuccess.textContent = "Welcome to Raise a Pancho!";

                form.reset();

            } else {

                formSuccess.textContent = "";
            }

        });
    }


    // ---------- Benefits search (index.html) ----------

    const searchInput = document.getElementById("searchInput");
    const benefits = document.querySelectorAll("#benefitsList li");
    const noResults = document.getElementById("noResults");

    if (searchInput && benefits.length && noResults) {

        benefits.forEach(function (benefit) {
            benefit.style.display = "none";
        });

        noResults.style.display = "none";

        searchInput.addEventListener("input", function () {

            const searchText = searchInput.value.toLowerCase().trim();

            let visibleBenefits = 0;

            benefits.forEach(function (benefit) {

                const benefitText = benefit.textContent.toLowerCase();

                if (
                    searchText !== "" &&
                    benefitText.includes(searchText)
                ) {

                    benefit.style.display = "list-item";
                    visibleBenefits++;

                } else {

                    benefit.style.display = "none";
                }
            });


            if (visibleBenefits === 0 && searchText !== "") {
                noResults.style.display = "block";
            } else {
                noResults.style.display = "none";
            }

        });


        document.addEventListener("keydown", function (event) {

            if (event.ctrlKey && event.key.toLowerCase() === "k") {

                event.preventDefault();

                const searchText = searchInput.value.toLowerCase().trim();

                if (searchText === "") {

                    searchInput.focus();
                    return;
                }


                let foundBenefit = null;

                benefits.forEach(function (benefit) {

                    const benefitText = benefit.textContent.toLowerCase();

                    if (
                        benefitText.includes(searchText) &&
                        foundBenefit === null
                    ) {

                        foundBenefit = benefit.textContent.trim();
                    }

                });


                if (foundBenefit !== null) {

                    const translationURL =
                        "https://translate.google.com/?sl=en&tl=es&text="
                        + encodeURIComponent(foundBenefit)
                        + "&op=translate";

                    window.open(translationURL, "_blank");
                }

            }

        });
    }


    // ---------- Cosmetics (index.html) ----------

    if (document.getElementById("cosmeticsLink")) {
        initializeCosmetics();
    }


    // ---------- Choose a Pancho (choosePancho.html) ----------

    const dogSelectionContainer = document.getElementById("dog-selection");
    const selectedDogImage = document.getElementById("pancho-image");
    const dogNameInput = document.getElementById("name");

    // If the user already joined on the home page, pre-fill their username
    // here so they don't have to type it again before picking a Pancho.
    if (dogSelectionContainer && dogNameInput && savedName && !dogNameInput.value) {
        dogNameInput.value = savedName;
    }

    if (dogSelectionContainer) {
        initializeDogSelection(dogSelectionContainer);
    }

    if (selectedDogImage) {
        displaySelectedDog(selectedDogImage);
    }

    const confirmPaw = document.getElementById("confirm-paw");

    if (confirmPaw) {
        confirmPaw.addEventListener("click", function () {
            confirmPancho();
        });
    }

});