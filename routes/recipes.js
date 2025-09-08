const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Pool } = require('pg');

// CORRECTED LINE: Access the variable as it is named in your .env file
const API_KEY = process.env.API_KEY; 
const API_BASE_URL = 'https://api.spoonacular.com';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


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


router.get('/show-all', async (req, res) => { 
try {
    const result = await pool.query('SELECT * FROM recipes');
    console.log("Show the result: ",result);
    res.json(result.rows);
} catch (error) {
    res.status(500).json({ error: 'Error fetching' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching recipe:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, image, instructions, ingredients, readyin } = req.body;
    try {
        const result = await pool.query(
            `UPDATE recipes
            SET title = $1, image = $2, instructions = $3, ingredients = $4, readyin = $5
             WHERE id = $6 RETURNING *`,
            [title, image, instructions, JSON.stringify(ingredients), readyin, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating recipe:', error.message);
        res.status(500).json({ error: 'Failed to update recipe' });
    }

});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error.message);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});

router.post('/', async (req, res) => {
    const { title, image, instructions, ingredients, readyin } = req.body;

    if (!title || !instructions || !ingredients || !readyin) {
        return res.status(400).json({ error: 'Title, instructions, ingredients, and readyin are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO recipes (title, image, instructions, ingredients, readyin)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, image, instructions, JSON.stringify(ingredients), readyin]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting recipe:', error.message);
        res.status(500).json({ error: 'Failed to add recipe' });
    }
});

// Save Recipe to Database (Favorites)
router.post('/favorites', async (req, res) => {
    const { id, title, image, instructions, ingredients, readyin } = req.body;

    try {
        // تحقق إذا كانت الوصفة موجودة بالفعل في قاعدة البيانات
        const check = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Recipe already saved in database' });
        }

        // إدخال الوصفة
        const result = await pool.query(
            `INSERT INTO recipes (id, title, image, instructions, ingredients, readyin)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, title, image, instructions || '', JSON.stringify(ingredients || []), readyin || null]
        );

        res.status(201).json({ message: 'Recipe saved successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving recipe:', error.message);
        res.status(500).json({ error: 'Failed to save recipe' });
    }
});






module.exports = router;