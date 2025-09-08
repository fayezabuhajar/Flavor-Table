const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pg = require('pg');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static("public"));
app.use(express.json());


const clinet = new pg.Client(process.env.DATABASE_URL);
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});



// Import and use routes
const homeRoutes = require('./routes/home');
const recipeRoutes = require('./routes/recipes');

app.use('/', homeRoutes);
app.use('/recipes', recipeRoutes);




// middleware
app.use((req, res) => {
    res.status(404).send('Page not found <a href="/">Go to Home</a>');
});

// Start the server


pool.connect()
    .then((clinet) => {
        return clinet
            .query('SELECT current_database(), current_user')
            .then((res) => {
                clinet.release();

                const dbName = res.rows[0].current_database;
                const dbUser = res.rows[0].current_user;

                console.log(`Connected to database: ${dbName} as user: ${dbUser}`);
                console.log(`Server is running on http://localhost:${PORT}`);
            });
    })
    .then(() => {
        app.listen(PORT);
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
});