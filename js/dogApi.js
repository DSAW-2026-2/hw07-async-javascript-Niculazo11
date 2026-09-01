"use strict";

// Full (non-random) list of images for the breed. Every visitor gets the
// same fixed pair of Pancho models, since we always take the first two.
const DOG_LIST_URL = "https://dog.ceo/api/breed/dachshund/images";

// Selections are stored per user: "selectedPancho_<username>"
const SELECTED_DOG_PREFIX = "selectedPancho_";

// Reuses the same localStorage key the join form on index.html already saves,
// so a user who joined there doesn't have to type their name again here.
const CURRENT_USER_KEY = "name";

// Fallback cache of the last successfully fetched pair of dog images, used
// when the API call fails.
const DOG_CACHE_KEY = "cachedDachshundImages";

// Tailwind classes used to highlight whichever image is currently picked
// (not yet confirmed with the paw).
const SELECTED_CLASSES = ["ring-4", "ring-yellow-400"];

// The image URL the user has clicked but not yet confirmed with the paw.
let pendingDogChoice = null;

// The single source of truth for fetching (and caching) the dog images.
// Returns { images, fromCache }:
//   - On a successful fetch: images from the API, fromCache: false, and the
//     result is saved to localStorage for next time.
//   - On a failed fetch with a cache available: the cached images,
//     fromCache: true.
//   - On a failed fetch with no cache: empty images, fromCache: false —
//     callers should treat this exactly like the old "no dogs" error case.
async function getDachshunds() {

    try {
        const response = await fetch(DOG_LIST_URL);

        if (!response.ok) {
            throw new Error("Could not retrieve dogs from the API.");
        }

        const data = await response.json();
        const allImages = data.message || [];

        // Always the same two: the first two images in the breed's fixed list.
        const dogs = allImages.slice(0, 2);

        if (dogs.length === 2) {
            localStorage.setItem(DOG_CACHE_KEY, JSON.stringify(dogs));
        }

        return { images: dogs, fromCache: false };
    } catch (error) {
        console.error("Dog API error:", error);

        const cached = localStorage.getItem(DOG_CACHE_KEY);

        if (cached) {
            try {
                return { images: JSON.parse(cached), fromCache: true };
            } catch (parseError) {
                console.error("Cached dog data was corrupted:", parseError);
            }
        }

        return { images: [], fromCache: false };
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

// Shows/hides the "saving data" label used when we're displaying cached
// (rather than freshly fetched) images. Safe no-op if the element isn't
// on the page — add <p id="dogStatus"></p> near the dog images to use it.
function setDogStatusLabel(text) {

    const statusLabel = document.getElementById("dogStatus");

    if (statusLabel) {
        statusLabel.textContent = text || "";
    }
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

    const { images: dogs, fromCache } = await getDachshunds();

    if (dogs.length < 2) {
        // No fresh data AND no cache — fall through to the existing
        // error handling already wired up around this false return.
        setDogStatusLabel("");
        return false;
    }

    // Cache exists but the live fetch failed: show the cached pair plus
    // a visible "saving data" label instead of the normal error state.
    setDogStatusLabel(fromCache ? "Saving data..." : "");

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
