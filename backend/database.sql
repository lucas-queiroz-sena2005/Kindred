CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_vector JSONB, -- For storing the feature-based taste profile
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE directors (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE movies (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INTEGER,
    director_id INTEGER REFERENCES directors(id),
    poster_path VARCHAR(255),
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE genres (
    id INTEGER PRIMARY KEY, 
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE movie_genres (
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE tierlist_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Linking table defining which movies are in each template.
CREATE TABLE template_movies (
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, movie_id)
);

-- A record that a user has completed a specific template / created tierlist.
CREATE TABLE user_rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- Stores the specific tier for each movie in a user's ranking.
CREATE TABLE ranked_items (
    id SERIAL PRIMARY KEY,
    ranking_id INTEGER NOT NULL REFERENCES user_rankings(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Add a generated column to automatically calculate the decade for each movie.
ALTER TABLE movies
ADD COLUMN decade INTEGER GENERATED ALWAYS AS ( floor(release_year / 10) * 10 ) STORED;

-- -----------------------------------------------------------------------------

-- A virtual table that pre-joins a movie with all of its features for easy querying.
CREATE OR REPLACE VIEW vw_movie_features AS
SELECT
    m.id AS movie_id,
    m.decade,
    m.director_id,
    mg.genre_id
FROM
    movies m
LEFT JOIN
    movie_genres mg ON m.id = mg.movie_id;

-- -----------------------------------------------------------------------------

CREATE INDEX idx_movies_director_id ON movies(director_id);
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);
CREATE INDEX idx_template_movies_template_id ON template_movies(template_id);
CREATE INDEX idx_template_movies_movie_id ON template_movies(movie_id);
CREATE INDEX idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX idx_user_rankings_template_id ON user_rankings(template_id);
CREATE INDEX idx_ranked_items_ranking_id ON ranked_items(ranking_id);
CREATE INDEX idx_ranked_items_movie_id ON ranked_items(movie_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

CREATE INDEX idx_ranked_items_tier ON ranked_items(tier);
CREATE INDEX idx_movies_decade ON movies(decade);