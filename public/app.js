

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

    // حفظ الوصفات في قاعدة البيانات
    const saveToFavorites = async (recipe) => {
    console.log('Saving recipe:', recipe); // << تأكد من القيم

    try {
        const response = await axios.post('http://localhost:4023/recipes/favorites', {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            instructions: recipe.instructions || '',
            ingredients: recipe.ingredients || [],
            readyin: recipe.readyInMinutes || null
        });

        if (response.status === 201) {
            alert('Recipe saved to database successfully!');
        } else {
            alert(response.data.message || 'This recipe is already saved.');
        }
    } catch (error) {
        console.error('Error saving recipe:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to save recipe.');
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
    const renderFavoritesFromDB = async () => {
        resultsContainer.innerHTML = '<p>Loading your favorite recipes...</p>';
        try {
            const response = await axios.get('http://localhost:4023/recipes/show-all');
            const favorites = response.data;

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
                    <button class="update-btn" data-recipe='${JSON.stringify(recipe)}'>Update</button>
                    <button class="remove-btn" data-id="${recipe.id}">Remove</button>
                `;
                resultsContainer.appendChild(recipeCard);
            });

        } catch (error) {
            console.error('Error loading favorites:', error);
            resultsContainer.innerHTML = '<p>Failed to load favorites. Please try again.</p>';
        }
    };

    // فتح نافذة التعديل عند الضغط على Update
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-btn')) {
            const recipe = JSON.parse(e.target.dataset.recipe);

            // تعبئة بيانات الوصفة في الفورم
            document.getElementById('update-id').value = recipe.id;
            document.getElementById('update-title').value = recipe.title;
            document.getElementById('update-image').value = recipe.image;
            document.getElementById('update-instructions').value = recipe.instructions || '';
            document.getElementById('update-ingredients').value = (recipe.ingredients || []).join(', ');
            document.getElementById('update-readyin').value = recipe.readyin || '';

            document.getElementById('updateModal').style.display = 'flex';
        }
    });

    // إلغاء التعديل وإغلاق المودال
    document.getElementById('cancel-update').addEventListener('click', () => {
        document.getElementById('updateModal').style.display = 'none';
    });

    // تنفيذ عملية التعديل عند الضغط على Save
    document.getElementById('updateForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('update-id').value;
        const title = document.getElementById('update-title').value;
        const image = document.getElementById('update-image').value;
        const instructions = document.getElementById('update-instructions').value;
        const ingredients = document.getElementById('update-ingredients').value.split(',').map(i => i.trim());
        const readyin = document.getElementById('update-readyin').value;

        try {
            await axios.put(`http://localhost:4023/recipes/${id}`, {
                title,
                image,
                instructions,
                ingredients,
                readyin
            });

            alert('Recipe updated successfully!');
            document.getElementById('updateModal').style.display = 'none';
            renderFavoritesFromDB();
        } catch (error) {
            console.error('Error updating recipe:', error);
            alert('Failed to update recipe.');
        }
    });

    // حذف وصفة من قاعدة البيانات
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const recipeId = e.target.dataset.id;
            try {
                await axios.delete(`http://localhost:4023/recipes/${recipeId}`);
                alert('Recipe removed successfully!');
                renderFavoritesFromDB();
            } catch (error) {
                console.error('Error deleting recipe:', error);
                alert('Failed to remove recipe.');
            }
        }
    });

    renderFavoritesFromDB();
}


    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-btn')) {
            const recipe = JSON.parse(e.target.dataset.recipe);
            saveToFavorites(recipe);
        }
    });
});