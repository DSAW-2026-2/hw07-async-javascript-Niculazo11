"use strict";

// Full (non-random) list of images for the breed. Every visitor gets the
// same fixed pair of Pancho models, since we always take the first two.
const DOG_LIST_URL = "https://dog.ceo/api/breed/dachshund/images";

// Selections are stored per user: "selectedPancho_<username>"
const SELECTED_DOG_PREFIX = "selectedPancho_";

// Reuses the same localStorage key the join form on index.html already saves,
// so a user who joined there doesn't have to type their name again here.
const CURRENT_USER_KEY = "name";

async function getDachshunds() {

    try {
        const response = await fetch(DOG_LIST_URL);

        if (!response.ok) {
            throw new Error("Could not retrieve dogs from the API.");
        }

        const data = await response.json();
        const allImages = data.message || [];

        // Always the same two: the first two images in the breed's fixed list.
        return allImages.slice(0, 2);
    } catch (error) {
        console.error("Dog API error:", error);
        return [];
    }
}

function getCurrentUsername() {

    const nameInput = document.getElementById("name");
    const typedName = nameInput ? nameInput.value.trim() : "";

    return typedName || localStorage.getItem(CURRENT_USER_KEY) || "";
}

function saveSelectedDog(dogImage, username) {

    if (!username) {
        return false;
    }

    localStorage.setItem(SELECTED_DOG_PREFIX + username, dogImage);
    localStorage.setItem(CURRENT_USER_KEY, username);

    return true;
}

function getSelectedDog(username) {

    const user = username || localStorage.getItem(CURRENT_USER_KEY);

    if (!user) {
        return null;
    }

    return localStorage.getItem(SELECTED_DOG_PREFIX + user);
}

function displayDogs(dogs, container) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    dogs.forEach((dog, index) => {

        const dogCard = document.createElement("div");

        dogCard.classList.add("dog-option");

        dogCard.innerHTML = `
            <img src="${dog}" alt="Dachshund Pancho option ${index + 1}">
            <button type="button">Choose Pancho</button>
        `;

        const button = dogCard.querySelector("button");

        button.addEventListener("click", function () {

            const username = getCurrentUsername();
            const nameError = document.getElementById("nameError");

            if (!username) {

                if (nameError) {
                    nameError.textContent = "Please enter a username before choosing your Pancho.";
                }

                const nameInput = document.getElementById("name");

                if (nameInput) {
                    nameInput.focus();
                }

                return;
            }

            if (nameError) {
                nameError.textContent = "";
            }

            saveSelectedDog(dog, username);

            alert("Pancho selected! It'll be waiting for you on the home page.");
        });

        container.appendChild(dogCard);
    });
}

async function initializeDogSelection(container) {

    if (!container) {
        return;
    }

    container.textContent = "Loading Panchos...";

    const dogs = await getDachshunds();

    if (dogs.length === 0) {
        container.textContent = "Could not load Pancho options.";
        return;
    }

    displayDogs(dogs.slice(0, 2), container);
}

function displaySelectedDog(imageElement, username) {

    const selectedDog = getSelectedDog(username);

    if (!selectedDog || !imageElement) {
        return;
    }

    imageElement.src = selectedDog;
}

function confirmPancho() {

    const username = getCurrentUsername();
    const selectedDog = getSelectedDog(username);

    if (!username) {
        alert("Enter a username first.");
        return;
    }

    if (!selectedDog) {
        alert("Choose a Pancho first!");
        return;
    }

    alert("Pancho confirmed for " + username + "! Head to the home page to see it.");
}