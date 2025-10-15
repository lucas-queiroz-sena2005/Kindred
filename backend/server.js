require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();

const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful. Server time:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('🔴 Error connecting to the database:', err.stack);
    process.exit(1);
  }
};

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Tier-List Compatibility Engine API!' });
});

const startServer = async () => {
  await testDatabaseConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running and listening on http://localhost:${PORT}`);
  });
};

// Execute the server start function.
startServer();
