const express = require('express');
const axios = require('axios');
const router = express.Router();

// CORRECTED LINE: Access the variable as it is named in your .env file
const API_KEY = process.env.API_KEY; 
const API_BASE_URL = 'https://api.spoonacular.com';

// Random Recipe Endpoint
router.get('/random', async (req, res) => {
    console.log('Random recipe endpoint hit'); 
    try {
        const url = `${API_BASE_URL}/recipes/random?number=1&apiKey=${API_KEY}`;
        console.log('Fetching from URL:', url); 
        const response = await axios.get(url);
        console.log('Received response from Spoonacular'); 
        const recipe = response.data.recipes[0];

        const simplifiedRecipe = {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            instructions: recipe.instructions,
            ingredients: recipe.extendedIngredients.map(ingredient => ingredient.name)
        };
        res.json(simplifiedRecipe);
    } catch (error) {
        console.error('Error in /recipes/random:', error.message); 
        res.status(500).json({ error: 'Failed to fetch random recipe' });
    }
});

// Search Recipes Endpoint
router.get('/search', async (req, res) => {
    console.log('Search recipe endpoint hit'); 
    const ingredients = req.query.ingredients;
    if (!ingredients) {
        return res.status(400).json({ error: 'Ingredients query parameter is required' });
    }

    try {
        const url = `${API_BASE_URL}/recipes/findByIngredients?ingredients=${ingredients}&apiKey=${API_KEY}`;
        console.log('Fetching from URL:', url); 
        const response = await axios.get(url);
        console.log('Received response from Spoonacular'); 

        const simplifiedRecipes = response.data.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            usedIngredients: recipe.usedIngredients.map(ing => ing.name),
            missedIngredients: recipe.missedIngredients.map(ing => ing.name)
        }));

        res.json(simplifiedRecipes);
    } catch (error) {
        console.error('Error in /recipes/search:', error.message); 
        res.status(500).json({ error: 'Failed to search for recipes' });
    }
});

module.exports = router;