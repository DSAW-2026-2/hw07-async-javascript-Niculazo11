"use strict";

// Full (non-random) list of images for the breed. Every visitor gets the
// same fixed pair of Pancho models, since we always take the first two.
const DOG_LIST_URL = "https://dog.ceo/api/breed/dachshund/images";

// Selections are stored per user: "selectedPancho_<username>"
const SELECTED_DOG_PREFIX = "selectedPancho_";

// Reuses the same localStorage key the join form on index.html already saves,
// so a user who joined there doesn't have to type their name again here.
const CURRENT_USER_KEY = "name";

// Tailwind classes used to highlight whichever image is currently picked
// (not yet confirmed with the paw).
const SELECTED_CLASSES = ["ring-4", "ring-yellow-400"];

// The image URL the user has clicked but not yet confirmed with the paw.
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

// Loads the fixed pair of dachshund images into the given container and
// wires up click-to-select. Returns true/false so the caller (main.js)
// can decide what loading/error UI to show.
async function initializeDogSelection(container) {

    if (!container) {
        return false;
    }

    const images = Array.from(container.querySelectorAll("img"));

    if (images.length < 2) {
        return false;
    }

    const dogs = await getDachshunds();

    if (dogs.length < 2) {
        return false;
    }

    images.forEach(function (img, index) {

        img.src = dogs[index];
        img.alt = "Dachshund Pancho option " + (index + 1);

        img.addEventListener("click", function () {
            pendingDogChoice = img.src;
            markSelected(images, img);
        });
    });

    // If this user already has a saved Pancho, show it pre-selected.
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

    return true;
}

function displaySelectedDog(imageElement, username) {

    const selectedDog = getSelectedDog(username);

    if (!selectedDog || !imageElement) {
        return;
    }

    imageElement.src = selectedDog;
}

// Validates + saves the pending choice. Returns { success, message } instead
// of alerting, so main.js can drive the loading/success/error UI.
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

        return { success: false, message: "Enter a username first." };
    }

    if (!pendingDogChoice) {
        return { success: false, message: "Choose a Pancho first!" };
    }

    if (nameError) {
        nameError.textContent = "";
    }

    const saved = saveSelectedDog(pendingDogChoice, username);

    if (!saved) {
        return { success: false, message: "Could not save your Pancho." };
    }

    return { success: true, message: "Pancho confirmed for " + username + "!" };
}