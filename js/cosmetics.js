let cosmetics = [];
let sortField = "none";
let sortDirection = "asc";

export function initializeCosmetics() {

    console.log("Cosmetics module loaded!");

    const cosmeticsLink = document.getElementById("cosmeticsLink");
    const cosmeticsSection = document.getElementById("cosmeticsSection");

    console.log("Link:", cosmeticsLink);
    console.log("Section:", cosmeticsSection);

    cosmeticsLink.addEventListener("click", function (event) {

        event.preventDefault();

        console.log("Cosmetics clicked!");

        cosmeticsSection.hidden = !cosmeticsSection.hidden;
    });

    const searchInput = document.getElementById("cosmeticsSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const costMinInput = document.getElementById("costMin");
    const costMaxInput = document.getElementById("costMax");
    const sortFieldSelect = document.getElementById("sortField");
    const sortDirectionBtn = document.getElementById("sortDirectionBtn");

    // Any change to search/category/cost re-applies all filters together
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
    }

    if (costMinInput) {
        costMinInput.addEventListener("input", applyFilters);
    }

    if (costMaxInput) {
        costMaxInput.addEventListener("input", applyFilters);
    }

    if (sortFieldSelect) {
        sortFieldSelect.addEventListener("change", function () {
            sortField = sortFieldSelect.value;
            updateSortButtonLabel();
            applyFilters();
        });
    }

    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener("click", function () {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
            updateSortButtonLabel();
            applyFilters();
        });
    }

    fetch("js/dataset.json")
        .then(response => {
            console.log("JSON response:", response);

            if (!response.ok) {
                throw new Error("Could not load JSON");
            }

            return response.json();
        })
        .then(data => {

            console.log("JSON data:", data);

            cosmetics = data;

            populateCategoryFilter(cosmetics);
            renderCosmetics(cosmetics);
        })
        .catch(error => {
            console.error("ERROR:", error);
        });
}


function populateCategoryFilter(list) {

    const categoryFilter = document.getElementById("categoryFilter");

    if (!categoryFilter) {
        return;
    }

    // Grab every distinct "categoria" value that actually exists in the dataset
    const categories = [...new Set(list.map(item => item.categoria))].sort();

    categories.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        categoryFilter.appendChild(option);
    });
}


function applyFilters() {

    const searchInput = document.getElementById("cosmeticsSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const costMinInput = document.getElementById("costMin");
    const costMaxInput = document.getElementById("costMax");

    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "";
    const minCost = costMinInput && costMinInput.value !== "" ? Number(costMinInput.value) : null;
    const maxCost = costMaxInput && costMaxInput.value !== "" ? Number(costMaxInput.value) : null;

    const filtered = cosmetics.filter(cosmetic => {

        const matchesSearch =
            searchText === "" ||
            cosmetic.nombre.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "" ||
            cosmetic.categoria === selectedCategory;

        const matchesMin =
            minCost === null || cosmetic.costo >= minCost;

        const matchesMax =
            maxCost === null || cosmetic.costo <= maxCost;

        return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });

    renderCosmetics(filtered);
}


function displayCosmetics(list) {

    console.log("Displaying cosmetics:", list);

    const table = document.getElementById("cosmeticsTable");
    const noResults = document.getElementById("cosmeticsNoResults");

    if (!table) {
        console.error("cosmeticsTable was not found!");
        return;
    }

    table.innerHTML = "";

    list.forEach(cosmetic => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${cosmetic.nombre}</td>
            <td>${cosmetic.categoria}</td>
            <td>${cosmetic.costo}</td>
        `;

        table.appendChild(row);
    });

    if (noResults) {
        noResults.hidden = list.length !== 0;
    }
}

function sortCosmetics(list) {
    if (sortField === "none") {
        return list;
    }

    const sorted = [...list].sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];

        const comparison =
            typeof valueA === "string"
                ? valueA.localeCompare(valueB)
                : valueA - valueB;
        return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
}

function getSummary(list) {
    const totals = list.reduce((accumulator, cosmetic) => {
        accumulator.count += 1;
        accumulator.totalCost += cosmetic.cost;
        return accumulator;
    }, {count: 0, totalCost: 0});

    const avgCost = totals.count === 0
        ? 0
        : (totals.totalCost / totals.count).toFixed(2);

    return {count: totals.count, avgCost};
}

function updateSummary(list) {
    const summaryE1 = document.getElementById("cosmeticsSummary");

    if (!summaryE1) {
        return;
    }

    const {count, avgCost} = getSummary(list);

    summaryE1.textContent = count === 0
        ? ""
        : `Showing ${count} item(s) — average cost: $${avgCost}`;
}

function updateSortButtonLabel() {
    const sortDirectionBtn = document.getElementById("sortDirectionBtn");

    if (!sortDirectionBtn) {
        return;
    }

    const labels = {
        name: {asc: "A → Z", desc: "Z → A"},
        cost: {asc: "↑ Low to High", desc: "↓ High to Low"},
        none: {asc: "↑ Ascending", desc: "↓ Descending"}
    };

    sortDirectionBtn.textContent = labels[sortField][sortDirection];
}

function renderCosmetics(list) {
    const sorted = sortCosmetics(list);
    displayCosmetics(sorted);
    updateSummary(sorted);
}