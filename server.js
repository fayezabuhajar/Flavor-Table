const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Import and use routes
const homeRoutes = require('./routes/home');
const recipeRoutes = require('./routes/recipes');

app.use('/', homeRoutes);
app.use('/recipes', recipeRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});