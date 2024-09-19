document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonModal = document.getElementById('pokemonModal');
    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonType = document.getElementById('pokemon-type');
    const pokemonAbilities = document.getElementById('pokemon-abilities');
    const pokemonStats = document.getElementById('pokemon-stats');
    const pokemonEvolutions = document.getElementById('pokemon-evolutions');

    let currentPokemonId = null;
    let offset = 0;
    const limit = 20;
    let loading = false;

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        navbar.classList.toggle('dark-mode');
        document.querySelectorAll('.card').forEach(card => {
            card.classList.toggle('dark-mode');
        });
        darkModeToggle.textContent = (darkModeToggle.textContent === 'Dark Mode') ? 'Light Mode' : 'Dark Mode';
    });

    // Fetch Pokémon data
    async function fetchPokemonData() {
        if (loading) return;
        loading = true;
        showLoadingIndicator();

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
            const data = await response.json();
            const pokemonArray = data.results;

            for (const pokemon of pokemonArray) {
                await fetchPokemonDetails(pokemon.url);
            }

            offset += limit;
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        } finally {
            loading = false;
            hideLoadingIndicator();
        }
    }

    async function fetchPokemonDetails(url) {
        try {
            const response = await fetch(url);
            const pokemon = await response.json();
            createPokemonCard(pokemon);
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
        }
    }

    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card pokemon-card">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="card-img-top lazy-load">
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                </div>
            </div>
        `;
        card.querySelector('.card').addEventListener('click', () => {
            currentPokemonId = pokemon.id;
            showPokemonDetails(pokemon.id);
        });
        pokemonList.appendChild(card);
    }

    async function showPokemonDetails(id) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemon = await response.json();

            pokemonImage.innerHTML = `<img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid">`;
            pokemonType.textContent = pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');
            pokemonAbilities.textContent = pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ');
            
            pokemonStats.innerHTML = pokemon.stats.map(statInfo => `
                <div class="progress mb-2">
                    <div class="progress-bar" role="progressbar" style="width: ${statInfo.base_stat}%;" aria-valuenow="${statInfo.base_stat}" aria-valuemin="0" aria-valuemax="100">${statInfo.stat.name}: ${statInfo.base_stat}</div>
                </div>
            `).join('');
            
            const speciesResponse = await fetch(pokemon.species.url);
            const species = await speciesResponse.json();
            const evolutions = await fetchEvolutionChain(species.evolution_chain.url);
            pokemonEvolutions.textContent = evolutions.join(' → ');

            $('#pokemonModal').modal('show');
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
        }
    }

    async function fetchEvolutionChain(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const evolutions = [];
            let chain = data.chain;

            while (chain) {
                evolutions.push(chain.species.name);
                chain = chain.evolves_to[0];
            }

            return evolutions;
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
            return [];
        }
    }

    function showLoadingIndicator() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'text-center mt-4';
        loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>';
        pokemonList.appendChild(loader);
    }

    function hideLoadingIndicator() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.remove();
        }
    }

    // Implement infinite scrolling
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            fetchPokemonData();
        }
    });

    // Initial fetch of Pokémon data
    fetchPokemonData();
});