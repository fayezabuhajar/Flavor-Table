document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const ingredientsInput = document.getElementById('ingredients-input');
    const resultsContainer = document.getElementById('results-container');
    const randomButton = document.getElementById('random-button');

    const renderRecipes = (recipes) => {
        resultsContainer.innerHTML = '';
        if (recipes.length === 0) {
            resultsContainer.innerHTML = '<p>No recipes found. Try different ingredients.</p>';
            return;
        }
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <h3>${recipe.title}</h3>
                <img src="${recipe.image}" alt="${recipe.title}">
                <button class="save-btn" data-recipe='${JSON.stringify(recipe)}'>Save to Favorites</button>
            `;
            resultsContainer.appendChild(recipeCard);
        });
    };

    const saveToFavorites = (recipe) => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isAlreadySaved = favorites.some(fav => fav.id === recipe.id);
        if (!isAlreadySaved) {
            favorites.push(recipe);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Recipe saved to favorites!');
        } else {
            alert('This recipe is already in your favorites.');
        }
    };

    // Event Listeners
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ingredients = ingredientsInput.value;
            if (ingredients) {
                try {
                    const response = await fetch(`/recipes/search?ingredients=${ingredients}`);
                    const recipes = await response.json();
                    renderRecipes(recipes);
                } catch (error) {
                    resultsContainer.innerHTML = '<p>Failed to load recipes. Please try again.</p>';
                }
            }
        });
    }

    if (randomButton) {
        randomButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`/recipes/random`);
                const recipe = await response.json();
                renderRecipes([recipe]);
            } catch (error) {
                resultsContainer.innerHTML = '<p>Failed to load a random recipe. Please try again.</p>';
            }
        });
    }

    if (window.location.pathname.includes('favorites.html')) {
        const renderFavorites = () => {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            resultsContainer.innerHTML = '';
            if (favorites.length === 0) {
                resultsContainer.innerHTML = '<p>You have no favorite recipes saved yet.</p>';
                return;
            }
            favorites.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';
                recipeCard.innerHTML = `
                    <h3>${recipe.title}</h3>
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <button class="remove-btn" data-id="${recipe.id}">Remove</button>
                `;
                resultsContainer.appendChild(recipeCard);
            });
        };

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const recipeId = parseInt(e.target.dataset.id);
                let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                favorites = favorites.filter(fav => fav.id !== recipeId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                renderFavorites();
            }
        });
        renderFavorites();
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-btn')) {
            const recipe = JSON.parse(e.target.dataset.recipe);
            saveToFavorites(recipe);
        }
    });
});