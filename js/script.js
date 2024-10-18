document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchpokemon');
    const searchButton = document.getElementById('searchbutton');
    const pokemonList = document.getElementById('pokemon-list');
    const paginationContainer = document.getElementById('pagination');
    const autocompleteList = document.getElementById('autocomplete-list');
    const hamburger = document.getElementById("hamburger");
    const mobileSearch = document.getElementById("mobile-search");
    const navbar = document.getElementById("navbar");
    const searchBox = document.getElementById("search-box");

    // State variables
    let allPokemon = [];
    let allPokemonTypes = [];
    let currentPage = 1;
    const pokemonPerPage = 20;
    const limit = 40; // Fetch 40 Pokémon at a time (pagination)

    // Check if cached data exists
    const cachedPokemonData = localStorage.getItem('allPokemon');
    if (cachedPokemonData) {
        allPokemon = JSON.parse(cachedPokemonData);
        allPokemonTypes = [...new Set(allPokemon.flatMap(pokemon => pokemon.types.map(type => type.type.name)))];
        loadPokemon();
    } else {
        initialize(); // Fetch data if cache doesn't exist
    }

    // Initialize app
    async function initialize() {
        await fetchAllPokemonNamesAndTypes();
        loadPokemon();
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('input', debounce(handleAutocomplete, 300)); // Debounce input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });

        // Click outside to close autocomplete
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) {
                autocompleteList.innerHTML = '';
            }
        });
    }

    // Fetch All Pokémon Data (in chunks)
    async function fetchAllPokemonNamesAndTypes(offset = 0) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
            const data = await response.json();

            const pokemonPromises = data.results.map(pokemon =>
                fetch(pokemon.url).then(res => res.json())
            );
            const pokemonDetails = await Promise.all(pokemonPromises);

            allPokemon = [...allPokemon, ...pokemonDetails]; // Append to existing Pokémon data
            allPokemonTypes = [...new Set(allPokemon.flatMap(pokemon => pokemon.types.map(type => type.type.name)))];

            // Cache the fetched data
            localStorage.setItem('allPokemon', JSON.stringify(allPokemon));

            if (data.next) { // If there's more data, fetch the next chunk
                fetchAllPokemonNamesAndTypes(offset + limit);
            } else {
                loadPokemon();
            }
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    }

    // Load Pokémon List
    function loadPokemon() {
        displayPokemon(allPokemon);
        setupPagination(allPokemon.length);
    }

    // Search Handling
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            displayPokemon(allPokemon);
            setupPagination(allPokemon.length);
            return;
        }

        const isTypeSearch = allPokemonTypes.includes(searchTerm);

        if (isTypeSearch) {
            // Search by types
            const filteredPokemon = allPokemon.filter(pokemon =>
                pokemon.types.some(type => type.type.name === searchTerm)
            );
            displayPokemon(filteredPokemon);
            setupPagination(filteredPokemon.length);
        } else {
            // Search by name
            const filteredPokemon = allPokemon.filter(pokemon =>
                pokemon.name.includes(searchTerm)
            );

            if (filteredPokemon.length === 1) {
                showPokemonDetails(filteredPokemon[0]);
            } else {
                displayPokemon(filteredPokemon);
                setupPagination(filteredPokemon.length);
            }
        }
    }

    // Autocomplete Handling
    function handleAutocomplete() {
        const inputValue = searchInput.value.toLowerCase();
        autocompleteList.innerHTML = '';

        if (!inputValue) return;

        // Filter Pokémon by name and types
        const filteredPokemon = allPokemon
            .filter(pokemon => pokemon.name.startsWith(inputValue))
            .slice(0, 5);

        const filteredTypes = allPokemonTypes
            .filter(type => type.startsWith(inputValue));

        // Display autocomplete suggestions
        filteredPokemon.forEach(pokemon => {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${pokemon.name.substr(0, inputValue.length)}</strong>${pokemon.name.substr(inputValue.length)}`;
            div.addEventListener('click', () => {
                searchInput.value = pokemon.name;
                autocompleteList.innerHTML = '';
                handleSearch();
            });
            autocompleteList.appendChild(div);
        });

        filteredTypes.forEach(type => {
            const div = document.createElement('div');
            div.innerHTML = `<strong>Type: </strong>${type}`;
            div.addEventListener('click', () => {
                searchInput.value = type;
                autocompleteList.innerHTML = '';
                handleSearch();
            });
            autocompleteList.appendChild(div);
        });
    }

    // Display Pokémon List
    function displayPokemon(pokemonArray) {
        const startIndex = (currentPage - 1) * pokemonPerPage;
        const endIndex = startIndex + pokemonPerPage;
        const paginatedPokemon = pokemonArray.slice(startIndex, endIndex);

        pokemonList.innerHTML = '';

        if (paginatedPokemon.length === 0) {
            pokemonList.innerHTML = '<p class="text-warning">No Pokémon found.</p>';
            return;
        }

        paginatedPokemon.forEach(pokemon => {
            pokemonList.appendChild(createPokemonCard(pokemon));
        });
    }

    // Create Pokémon Card
    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';

        // Fallback for missing data
        const pokemonImage = pokemon.id ?
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg` :
            'https://via.placeholder.com/150';  // Placeholder image if no ID is found

        // Create type badges with the corresponding CSS class for color
        const typeBadges = pokemon.types.map(typeInfo => {
            const typeName = typeInfo.type.name; // Get the type name (e.g., fire, water)
            return `<span class="pokemon-type ${typeName}">${typeName}</span>`; // Apply the class corresponding to the type
        }).join(' ');

        // Build the HTML for the Pokémon card
        card.innerHTML = `
            <div class="card pokemon-card" aria-label="Details of ${pokemon.name}">
                <img src="${pokemonImage}" alt="${pokemon.name} image" class="card-img-top" loading="lazy">
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">Type: ${typeBadges}</p>
                </div>
            </div>
        `;

        // Event listener to show Pokémon details on click
        card.querySelector('.pokemon-card').addEventListener('click', () => {
            showPokemonDetails(pokemon);
        });

        return card;
    }

    // Show Pokémon Details
    async function showPokemonDetails(pokemon) {
        const typeClass = pokemon.types[0].type.name;
        const typeBadges = pokemon.types.map(typeInfo => {
            const typeName = typeInfo.type.name;
            return `<span class="pokemon-type ${typeName}">${typeName}</span>`;
        }).join(' ');

        try {
            const evolutionChain = await getEvolutionChain(pokemon);

            const modalContent = `
                <div class="modal-header pokemon-modal-header ${typeClass}">
                    <h5 class="modal-title">${pokemon.name}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" alt="${pokemon.name}" class="img-fluid">
                        </div>
                        <div class="col-md-6">
                            <p class="card-text" style="padding-top:20px"><strong>Types:</strong> ${typeBadges}</p>
                            <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
                            <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
                            <p><strong>Abilities:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
                        </div>
                    </div>
                    <div class="pokemon-stats mt-4">
                        <h6>Status:</h6>
                        ${pokemon.stats.map(stat => `
                            <div class="stat-row">
                                <span>${stat.stat.name}:</span>
                                <div class="progress">
                                    <div class="progress-bar" style="width: ${stat.base_stat}%" aria-valuenow="${stat.base_stat}" aria-valuemin="0" aria-valuemax="100">
                                        ${stat.base_stat}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="evolution-chain mt-4">
                        <h6>Evolution Chain:</h6>
                        <div class="evolution-chain-container">${evolutionChain}</div>
                    </div>
                </div>
            `;

            const modalElement = document.getElementById('pokemonModal');
            modalElement.querySelector('.modal-content').innerHTML = modalContent;

            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } catch (error) {
            console.error('Error showing Pokémon details:', error);
        }
    }

    // Pagination Setup
    function setupPagination(totalItems) {
        const pageCount = Math.ceil(totalItems / pokemonPerPage);
        paginationContainer.innerHTML = '';
        if (pageCount <= 1) return;

        // Create pagination buttons
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.classList.add('page-button');
            if (i === currentPage) button.classList.add('active');
            button.addEventListener('click', () => {
                currentPage = i;
                displayPokemon(allPokemon);
                setupPagination(totalItems);
            });
            paginationContainer.appendChild(button);
        }
    }

    // Evolution Chain Helper 
    async function getEvolutionChain(pokemon) {
        try {
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();

            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResponse.json();

            let chain = [];
            let currentStage = evolutionData.chain;

            // Traverse the evolution chain
            while (currentStage) {
                const speciesUrl = currentStage.species.url;
                const pokemonId = speciesUrl.split('/').filter(Boolean).pop();

                chain.push({
                    name: currentStage.species.name,
                    id: pokemonId
                });

                currentStage = currentStage.evolves_to[0]; // Go to the next evolution stage
            }

            return chain.map((stage, index) => `
                <div class="evolution-stage">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${stage.id}.svg" alt="${stage.name}" class="evolution-image">
                    <span>${stage.name}</span> 
                    ${index < chain.length - 1 ? ' → ' : ''}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
            return 'Evolution data not available';
        }
    }

    // Debounce function to optimize search input
    function debounce(func, delay) {
        let debounceTimer;
        return function (...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }
});
