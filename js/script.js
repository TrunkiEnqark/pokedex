document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchpokemon');
    const searchButton = document.getElementById('searchbutton');
    const pokemonList = document.getElementById('pokemon-list');
    const paginationContainer = document.getElementById('pagination');
    const autocompleteList = document.getElementById('autocomplete-list');

    // State variables
    let allPokemon = [];
    let allPokemonTypes = [];
    let currentPage = 1;
    const pokemonPerPage = 20;
    let offset = 0;
    const limit = 80;

    // Khởi tạo ứng dụng
    initialize();

    async function initialize() {
        await fetchAllPokemonNamesAndTypes();
        loadPokemon();
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('input', handleAutocomplete);
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

    // Fetch All Pokemon Data
    async function fetchAllPokemonNamesAndTypes() {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            const data = await response.json();

            const pokemonPromises = data.results.map(pokemon => 
                fetch(pokemon.url).then(res => res.json())
            );
            const pokemonDetails = await Promise.all(pokemonPromises);

            allPokemonTypes = [...new Set(pokemonDetails.flatMap(pokemon => 
                pokemon.types.map(type => type.type.name)
            ))];
            
            allPokemon = pokemonDetails;
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    }

    // Load Pokemon List
    async function loadPokemon() {
        try {
            displayPokemon(allPokemon);
            setupPagination(allPokemon.length);
        } catch (error) {
            console.error('Error loading Pokémon:', error);
            pokemonList.innerHTML = '<p class="text-danger">Failed to load Pokémon data.</p>';
        }
    }

    // Search Handling
    async function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            displayPokemon(allPokemon);
            setupPagination(allPokemon.length);
            return;
        }

        const isTypeSearch = allPokemonTypes.includes(searchTerm);
        
        if (isTypeSearch) {
            // search by types
            const filteredPokemon = allPokemon.filter(pokemon =>
                pokemon.types.some(type => type.type.name === searchTerm)
            );
            displayPokemon(filteredPokemon);
            setupPagination(filteredPokemon.length);
        } else {
            // search by name
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

        // filter name and types comfortable
        const filteredPokemon = allPokemon
            .filter(pokemon => pokemon.name.startsWith(inputValue))
            .slice(0, 5);
        
        const filteredTypes = allPokemonTypes
            .filter(type => type.startsWith(inputValue));

        // get hint
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

    // Display Pokemon List
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

    // Create Pokemon Card
    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card pokemon-card">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" 
                     alt="${pokemon.name}" 
                     class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                </div>
            </div>
        `;
        
        card.querySelector('.pokemon-card').addEventListener('click', () => {
            showPokemonDetails(pokemon);
        });
        
        return card;
    }

    // Show Pokemon Details
    async function showPokemonDetails(pokemon) {
        const typeClass = pokemon.types[0].type.name;
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
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" 
                                 alt="${pokemon.name}" 
                                 class="img-fluid">
                        </div>
                        <div class="col-md-6">
                            <p><strong>Types:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
                            <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
                            <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
                            <p><strong>Abilities:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
                        </div>
                    </div>
                    <div class="pokemon-stats mt-4">
                        <h6>Stats:</h6>
                        ${pokemon.stats.map(stat => `
                            <div class="stat-row">
                                <span>${stat.stat.name}:</span>
                                <div class="progress">
                                    <div class="progress-bar" 
                                         style="width: ${stat.base_stat}%" 
                                         aria-valuenow="${stat.base_stat}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                        ${stat.base_stat}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="evolution-chain mt-4">
                        <h6>Evolution Chain:</h6>
                        <div class="evolution-chain-container">
                            ${evolutionChain}
                        </div>
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
    
        // create button
        function createPageButton(pageNum, text = pageNum) {
            const button = document.createElement('button');
            button.innerText = text;
            button.classList.add('page-button');
            if (pageNum === currentPage) button.classList.add('active');
            if (text !== '...') {
                button.addEventListener('click', () => {
                    currentPage = pageNum;
                    displayPokemon(allPokemon);
                    setupPagination(totalItems);
                });
            }
            return button;
        }
    
        //add first button
        paginationContainer.appendChild(createPageButton(1));
    
        let start = Math.max(2, currentPage - 2);
        let end = Math.min(pageCount - 1, currentPage + 2);
    
        //  add sign ... after the first button
        if (start > 2) {
            paginationContainer.appendChild(createPageButton(null, '...'));
        }
    
        // add middle button 
        for (let i = start; i <= end ; i++) {
            paginationContainer.appendChild(createPageButton(i));
        }
    
        // add sign ... before the last button
        if (end < pageCount - 1) {
            paginationContainer.appendChild(createPageButton(null, '...'));
        }
    
        // add the last button
        if (pageCount > 1) {
            paginationContainer.appendChild(createPageButton(pageCount));
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
            
            while (currentStage) {
                chain.push(currentStage.species.name);
                currentStage = currentStage.evolves_to[0];
            }
            
            return chain.map(name => `
                <div class="evolution-stage">
                    <span>${name}</span>
                    ${chain.indexOf(name) < chain.length - 1 ? ' → ' : ''}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
            return 'Evolution data not available';
        }
    }
})
