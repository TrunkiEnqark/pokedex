document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const pokemonList = document.getElementById('pokemon-list');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.querySelector('.inputBox input');
    const searchButton = document.querySelector('.searchButton');

    let allPokemon = [];
    let currentPage = 1;
    const pokemonPerPage = 20;
    let offset = 0;
    const limit = 300;


    async function fetchPokemon() {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching Pokemon list:', error);
            return [];
        }
    }

    async function fetchPokemonDetails(url) {
        try {
            const response = await fetch(url);
            const pokemon = await response.json();
            return pokemon;
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
        }
    }

    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card pokemon-card">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                </div>
            </div>
        `;
        card.querySelector('.card').addEventListener('click', () => showPokemonDetails(pokemon));
        return card;
    }

    async function loadPokemon() {
        const newPokemon = await fetchPokemon();
        const newPokemonDetails = await Promise.all(newPokemon.map(p => fetchPokemonDetails(p.url)));
        allPokemon = [...allPokemon, ...newPokemonDetails];
        offset += limit;
        displayPokemon();
        setupPagination();
    }

    function displayPokemon() {
        const startIndex = (currentPage - 1) * pokemonPerPage;
        const endIndex = startIndex + pokemonPerPage;
        const paginatedPokemon = allPokemon.slice(startIndex, endIndex);
    
        pokemonList.innerHTML = '';
        paginatedPokemon.forEach(pokemon => {
            pokemonList.appendChild(createPokemonCard(pokemon));
        });
    }

    function setupPagination() {
        const pageCount = Math.ceil(allPokemon.length / pokemonPerPage);
        paginationContainer.innerHTML = '';
        
        const addPageButton = (page) => {
            const button = document.createElement('button');
            button.innerText = page;
            button.classList.add('page-button');
            if (page === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = page;
                displayPokemon();
                setupPagination();
            });
            paginationContainer.appendChild(button);
        };
        
        const addEllipsis = () => {
            const span = document.createElement('span');
            span.innerText = '...';
            span.classList.add('page-ellipsis');
            paginationContainer.appendChild(span);
        };
        
        addPageButton(1);
        
        if (pageCount <= 7) {
            for (let i = 2; i <= pageCount; i++) {
                addPageButton(i);
            }
        } else {
            if (currentPage > 3) {
                addEllipsis();
            }
            
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(pageCount - 1, currentPage + 1);
            
            if (currentPage <= 3) {
                end = 5;
            }
            
            if (currentPage >= pageCount - 2) {
                start = pageCount - 4;
            }
            
            for (let i = start; i <= end; i++) {
                addPageButton(i);
            }
            
            if (currentPage < pageCount - 2) {
                addEllipsis();
            }
        }
        
        if (pageCount > 1) {
            addPageButton(pageCount);
        }
    }

    async function fetchEvolutionChain(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.evolution_chain.url;
        } catch (error) {
            console.error('Error fetching evolution chain URL:', error);
        }
    }
    
    async function fetchEvolutionDetails(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching evolution details:', error);
        }
    }
    
    async function getEvolutionChain(pokemon) {
        const speciesUrl = pokemon.species.url;
        const evolutionUrl = await fetchEvolutionChain(speciesUrl);
        const evolutionData = await fetchEvolutionDetails(evolutionUrl);
        return parseEvolutionChain(evolutionData.chain);
    }
    
    async function parseEvolutionChain(chain) {
        const evolutions = [];
        let currentStage = chain;
    
        while (currentStage) {
            const pokemonData = await fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${currentStage.species.name}`);
            evolutions.push({
                name: currentStage.species.name,
                image: pokemonData.sprites.front_default
            });
            currentStage = currentStage.evolves_to[0];
        }
    
        return evolutions;
    }
    
    async function showPokemonDetails(pokemon) {
        const typeClass = pokemon.types[0].type.name;
        try {
            const evolutionChainUrl = await fetchEvolutionChain(pokemon.species.url);
            const evolutionData = await fetchEvolutionDetails(evolutionChainUrl);
            const evolutionChain = await parseEvolutionChain(evolutionData.chain);
            
            const evolutionChainHtml = evolutionChain.length > 0
                ? evolutionChain.map(evo => `
                    <div class="evolution-item">
                        <img src="${evo.image}" alt="${evo.name}" class="evolution-image">
                        <span class="evolution-name">${evo.name}</span>
                    </div>
                `).join('<span class="evolution-arrow">&rarr;</span>')
                : 'Evolution data not available';
    
            const modalContent = `
                <div class="modal-header pokemon-modal-header ${typeClass}">
                    <h5 class="modal-title" id="pokemonModalLabel">${pokemon.name}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="pokemon-image-container">
                                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-image">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="pokemon-info">
                                <h6>Type:</h6>
                                <p>${pokemon.types.map(typeInfo => `<span class="pokemon-type ${typeInfo.type.name}">${typeInfo.type.name}</span>`).join(' ')}</p>
                                
                                <h6>Abilities:</h6>
                                <p>${pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ')}</p>
                                
                                <h6>Height:</h6>
                                <p>${pokemon.height / 10} m</p>
                                
                                <h6>Weight:</h6>
                                <p>${pokemon.weight / 10} kg</p>
                            </div>
                        </div>
                    </div>
                    <div class="pokemon-stats">
                        <h6>Stats:</h6>
                        ${pokemon.stats.map(statInfo => `
                            <div class="stat-row">
                                <span class="stat-name">${statInfo.stat.name.replace(/-/g, ' ')}:</span>
                                <div class="progress">
                                    <div class="progress-bar ${typeClass}" role="progressbar" style="width: ${statInfo.base_stat}%;" aria-valuenow="${statInfo.base_stat}" aria-valuemin="0" aria-valuemax="100">${statInfo.base_stat}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pokemon-evolution">
                        <h6>Evolution Chain:</h6>
                        <div class="evolution-chain-container">
                            ${evolutionChainHtml}
                        </div>
                    </div>
                </div>
            `;    
    
            const modalElement = document.getElementById('pokemonModal');
            modalElement.querySelector('.modal-content').innerHTML = modalContent;
    
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } catch (error) {
            console.error('Error displaying Pokemon details:', error);
            // Handle the error (e.g., show an error message to the user)
        }
    }

    function searchPokemon() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPokemon = allPokemon.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm) ||
            pokemon.types.some(type => type.type.name.toLowerCase().includes(searchTerm))
        );
        currentPage = 1;
        displayPokemon(filteredPokemon);
        setupPagination(filteredPokemon.length);
    }

    // Event listeners
    searchButton.addEventListener('click', searchPokemon);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPokemon();
        }
    });

    loadPokemon();
});