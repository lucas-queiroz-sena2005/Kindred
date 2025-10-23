-- ==========================================================
-- Core user and content schema for movie tierlist platform
-- ==========================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------

CREATE TABLE directors (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE INDEX idx_directors_name ON directors(name);

-- ----------------------------------------------------------

CREATE TABLE movies (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INTEGER,
    director_id INTEGER REFERENCES directors(id),
    poster_path VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    decade INTEGER GENERATED ALWAYS AS (floor(release_year / 10) * 10) STORED
);

CREATE INDEX idx_movies_director_id ON movies(director_id);
CREATE INDEX idx_movies_decade ON movies(decade);
CREATE INDEX idx_movies_release_year ON movies(release_year);

-- ----------------------------------------------------------

CREATE TABLE genres (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX idx_genres_name ON genres(name);

-- ----------------------------------------------------------

CREATE TABLE movie_genres (
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

CREATE INDEX idx_movie_genres_movie_id_genre_id ON movie_genres(movie_id, genre_id);

-- ----------------------------------------------------------

CREATE TABLE tierlist_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tierlist_templates_title ON tierlist_templates(title);

-- ----------------------------------------------------------

CREATE TABLE template_movies (
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, movie_id)
);

CREATE INDEX idx_template_movies_template_id_movie_id ON template_movies(template_id, movie_id);

-- ----------------------------------------------------------

CREATE TABLE user_rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, template_id)
);

CREATE INDEX idx_user_rankings_user_id_updated_at 
    ON user_rankings (user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION trg_user_rankings_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_rankings_updated_at
BEFORE UPDATE ON user_rankings
FOR EACH ROW
EXECUTE FUNCTION trg_user_rankings_update_timestamp();

-- ----------------------------------------------------------

CREATE TABLE ranked_items (
    id SERIAL PRIMARY KEY,
    ranking_id INTEGER NOT NULL REFERENCES user_rankings(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL CHECK (tier BETWEEN 0 AND 5)
);

CREATE INDEX idx_ranked_items_ranking_movie ON ranked_items(ranking_id, movie_id);
CREATE INDEX idx_ranked_items_tier ON ranked_items(tier);

-- ----------------------------------------------------------

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ==========================================================
-- Views
-- ==========================================================

CREATE OR REPLACE VIEW vw_movie_features AS
SELECT
    m.id AS movie_id,
    m.title,
    m.release_year,
    m.decade,
    m.director_id,
    d.name AS director_name,
    g.id AS genre_id,
    g.name AS genre_name
FROM
    movies m
LEFT JOIN directors d ON m.director_id = d.id
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id;