"use strict";


const DOG_LIST_URL = "https://dog.ceo/api/breed/dachshund/images";


const SELECTED_DOG_PREFIX = "selectedPancho_";


const CURRENT_USER_KEY = "name";


const SELECTED_CLASSES = ["ring-4", "ring-yellow-400"];

let pendingDogChoice = null;

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

function markSelected(images, chosenImage) {

    images.forEach(function (img) {

        if (img === chosenImage) {
            img.classList.add(...SELECTED_CLASSES);
        } else {
            img.classList.remove(...SELECTED_CLASSES);
        }
    });
}

async function initializeDogSelection(container) {

    if (!container) {
        return;
    }

    const images = Array.from(container.querySelectorAll("img"));

    if (images.length < 2) {
        return;
    }

    const dogs = await getDachshunds();

    if (dogs.length < 2) {
        container.textContent = "Could not load Pancho options.";
        return;
    }

    images.forEach(function (img, index) {

        img.src = dogs[index];
        img.alt = "Dachshund Pancho option " + (index + 1);

        img.addEventListener("click", function () {
            pendingDogChoice = img.src;
            markSelected(images, img);
        });
    });

    
    const username = getCurrentUsername();
    const savedDog = getSelectedDog(username);

    if (savedDog) {
        images.forEach(function (img) {
            if (img.src === savedDog) {
                pendingDogChoice = img.src;
                markSelected(images, img);
            }
        });
    }
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
    const nameError = document.getElementById("nameError");

    if (!username) {

        if (nameError) {
            nameError.textContent = "Please enter a username before confirming your Pancho.";
        }

        const nameInput = document.getElementById("name");

        if (nameInput) {
            nameInput.focus();
        }

        return;
    }

    if (!pendingDogChoice) {
        alert("Choose a Pancho first!");
        return;
    }

    if (nameError) {
        nameError.textContent = "";
    }

    saveSelectedDog(pendingDogChoice, username);

    alert("Pancho confirmed for " + username + "! It'll be waiting for you on the home page.");
}