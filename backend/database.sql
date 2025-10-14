-- backend/database.sql

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    taste_vector JSONB
);

-- Movies Table (Local Cache)
CREATE TABLE movies (
    id INTEGER PRIMARY KEY, -- The TMDb movie ID
    title VARCHAR(255) NOT NULL,
    release_year INTEGER,
    decade INTEGER GENERATED AlWAYS AS ( floor(release_year / 10) * 10 ) STORED;
    director_id INTEGER REFERENCES directors(id), -- Foreign key to the director
    poster_path VARCHAR(255),
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tierlist Templates Table (The Themes)
CREATE TABLE tierlist_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,

);

-- Template Movies Table (Links Movies to Templates)
CREATE TABLE template_movies (
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, movie_id)
);

-- User Rankings Table (A User's Submission for a Template)
CREATE TABLE user_rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- Ranked Items Table (The Specific Tier for Each Ranked Movie)
CREATE TABLE ranked_items (
    id SERIAL PRIMARY KEY,
    ranking_id INTEGER NOT NULL REFERENCES user_rankings(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL CHECK (tier >= -3 AND tier <= 3), -- Tiers S(+3) to F(-3)
    UNIQUE(ranking_id, movie_id)
);

-- Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genres Table: Stores a unique list of all genres.
CREATE TABLE genres (
    id INTEGER PRIMARY KEY, -- The TMDb genre ID
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Directors Table: Stores a unique list of all directors.
CREATE TABLE directors (
    id INTEGER PRIMARY KEY, -- The TMDb person ID for the director
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Movie Genres (Linking Table): A movie can have multiple genres.
CREATE TABLE movie_genres (
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- Add indexes for foreign keys to improve query performance
CREATE INDEX idx_movies_director_id ON movies(director_id);
CREATE INDEX idx_template_movies_template_id ON template_movies(template_id);
CREATE INDEX idx_template_movies_movie_id ON template_movies(movie_id);
CREATE INDEX idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX idx_user_rankings_template_id ON user_rankings(template_id);
CREATE INDEX idx_ranked_items_ranking_id ON ranked_items(ranking_id);
CREATE INDEX idx_ranked_items_movie_id ON ranked_items(movie_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);

-- Add an index on the tier for faster filtering/aggregation by tier
CREATE INDEX idx_ranked_items_tier ON ranked_items(tier);