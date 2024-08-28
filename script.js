const pokemonList = document.getElementById('pokemonList');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const modal = document.getElementById('pokemonModal');
const modalContent = document.querySelector('.modal-content');
const closeBtn = document.querySelector('.close');
const darkModeToggle = document.getElementById('darkModeToggle');

let allPokemon = [];

const typeIcons = {
    normal: "https://archives.bulbagarden.net/media/upload/9/95/Normal_icon_SwSh.png",
    fire: "https://archives.bulbagarden.net/media/upload/a/ab/Fire_icon_SwSh.png",
    water: "https://archives.bulbagarden.net/media/upload/8/80/Water_icon_SwSh.png",
    electric: "https://archives.bulbagarden.net/media/upload/7/7b/Electric_icon_SwSh.png",
    grass: "https://archives.bulbagarden.net/media/upload/a/a8/Grass_icon_SwSh.png",
    ice: "https://archives.bulbagarden.net/media/upload/1/15/Ice_icon_SwSh.png",
    fighting: "https://archives.bulbagarden.net/media/upload/3/3b/Fighting_icon_SwSh.png",
    poison: "https://archives.bulbagarden.net/media/upload/8/8d/Poison_icon_SwSh.png",
    ground: "https://archives.bulbagarden.net/media/upload/2/27/Ground_icon_SwSh.png",
    flying: "https://archives.bulbagarden.net/media/upload/b/b5/Flying_icon_SwSh.png",
    psychic: "https://archives.bulbagarden.net/media/upload/7/73/Psychic_icon_SwSh.png",
    bug: "https://archives.bulbagarden.net/media/upload/9/9c/Bug_icon_SwSh.png",
    rock: "https://archives.bulbagarden.net/media/upload/1/11/Rock_icon_SwSh.png",
    ghost: "https://archives.bulbagarden.net/media/upload/0/01/Ghost_icon_SwSh.png",
    dragon: "https://archives.bulbagarden.net/media/upload/7/70/Dragon_icon_SwSh.png",
    dark: "https://archives.bulbagarden.net/media/upload/d/d5/Dark_icon_SwSh.png",
    steel: "https://archives.bulbagarden.net/media/upload/0/09/Steel_icon_SwSh.png",
    fairy: "https://archives.bulbagarden.net/media/upload/c/c6/Fairy_icon_SwSh.png"
};

async function fetchPokemon() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
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

async function initPokeDex() {
    const pokemon = await fetchPokemon();
    allPokemon = await Promise.all(pokemon.map(p => fetchPokemonDetails(p.url)));
    displayPokemon(allPokemon);
    populateTypeFilter();
}

function displayPokemon(pokemonArray) {
    pokemonList.innerHTML = '';
    pokemonArray.forEach(pokemon => {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <div class="type-icons">
                ${pokemon.types.map(t => `<img class="type-icon" src="${typeIcons[t.type.name]}" alt="${t.type.name}" title="${t.type.name}">`).join('')}
            </div>
        `;
        card.addEventListener('click', () => showPokemonDetails(pokemon));
        pokemonList.appendChild(card);
    });
}

async function showPokemonDetails(pokemon) {
    const evolutionChain = await getEvolutionChain(pokemon);
    const evolutionHTML = evolutionChain.map(p => `
        <div class="evolution-stage">
            <img src="${p.image}" alt="${p.name}">
            <p>${p.name}</p>
        </div>
    `).join('<div class="evolution-arrow">→</div>');

    const detailsHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
        <div class="type-icons">
            ${pokemon.types.map(t => `<img class="type-icon" src="${typeIcons[t.type.name]}" alt="${t.type.name}" title="${t.type.name}">`).join('')}
        </div>
        <p><strong>Abilities:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
        <h3>Evolution Chain:</h3>
        <div class="evolution-chain">
            ${evolutionHTML}
        </div>
    `;
    document.getElementById('pokemonDetails').innerHTML = detailsHTML;
    modal.style.display = 'block';
}

function populateTypeFilter() {
    const types = [...new Set(allPokemon.flatMap(p => p.types.map(t => t.type.name)))];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeFilter.appendChild(option);
    });
}

function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value.toLowerCase();

    const filteredPokemon = allPokemon.filter(pokemon => {
        const nameMatch = pokemon.name.toLowerCase().includes(searchTerm);
        const typeMatch = selectedType === '' || pokemon.types.some(t => t.type.name.toLowerCase() === selectedType);
        return nameMatch && typeMatch;
    });

    displayPokemon(filteredPokemon);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = isDarkMode
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
}

function initDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcon();
}

searchInput.addEventListener('input', filterPokemon);
typeFilter.addEventListener('change', filterPokemon);
darkModeToggle.addEventListener('click', toggleDarkMode);

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

initDarkMode();
initPokeDex();