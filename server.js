const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const routeGuard = require('./middleware/verifyToken');

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





// Start the server

 
// Protected route
app.get("/secret", routeGuard, (req, res) => {
  res.send(`Hello ${req.user.username}, this is a protected route`);
});

    // User registration
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into database
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/login', async (req, res) => {

  try {
    const { username, password } = req.body;

    // find user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});



// middleware
app.use((req, res) => {
    res.status(404).send('Page not found <a href="/">Go to Home</a>');
});

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