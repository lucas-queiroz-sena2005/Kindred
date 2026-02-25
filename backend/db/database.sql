-- ==========================================================
-- Core user and content schema for movie tierlist platform
-- Updated with TMDB integration support
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ----------------------------------------------------------
-- Configuration & Metadata
-- ----------------------------------------------------------

CREATE TABLE tmdb_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    base_url VARCHAR(255) NOT NULL,
    secure_base_url VARCHAR(255) NOT NULL,
    poster_sizes TEXT[] NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- User Management
-- ----------------------------------------------------------

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_vector vector(256) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX ON users USING ivfflat (profile_vector vector_cosine_ops) WITH (lists = 100);

-- ----------------------------------------------------------
-- Social & Connections
-- ----------------------------------------------------------

CREATE TABLE connection_request (
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE user_connections (
    user_id_a INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_b INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CHECK (user_id_a < user_id_b),
    PRIMARY KEY (user_id_a, user_id_b)
);

CREATE TABLE user_blocks (
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- ----------------------------------------------------------
-- Notifications & Messaging
-- ----------------------------------------------------------

CREATE TYPE notification_type AS ENUM ('kin_request', 'kin_accepted', 'new_message');

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- Movie Data (TMDB Synchronized)
-- ----------------------------------------------------------

CREATE TABLE directors (
    id INTEGER PRIMARY KEY, -- Maps to TMDB Person ID
    name VARCHAR(255) NOT NULL
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY, -- Internal reference ID
    tmdb_id INTEGER UNIQUE NOT NULL, -- External source ID
    title VARCHAR(255) NOT NULL,
    release_year INTEGER,
    director_id INTEGER REFERENCES directors(id) ON DELETE SET NULL,
    poster_path VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    decade INTEGER GENERATED ALWAYS AS (floor(release_year / 10) * 10) STORED
);

CREATE TABLE genres (
    id INTEGER PRIMARY KEY, -- Maps to TMDB Genre ID
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE movie_genres (
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- ----------------------------------------------------------
-- Tierlists & Rankings
-- ----------------------------------------------------------

CREATE TABLE tierlist_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE template_movies (
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, movie_id)
);

CREATE TABLE user_rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES tierlist_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, template_id)
);

CREATE TABLE ranked_items (
    id SERIAL PRIMARY KEY,
    ranking_id INTEGER NOT NULL REFERENCES user_rankings(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL CHECK (tier BETWEEN 0 AND 5)
);

-- ----------------------------------------------------------
-- Indices, Views & Triggers
-- ----------------------------------------------------------

-- Social Indices
CREATE INDEX idx_connection_request_receiver ON connection_request(receiver_id);
CREATE INDEX idx_user_connections_b ON user_connections(user_id_b);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);

-- Content Indices
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_movies_director_id ON movies(director_id);
CREATE INDEX idx_movies_decade ON movies(decade);
CREATE INDEX idx_ranked_items_ranking_movie ON ranked_items(ranking_id, movie_id);

-- Views
CREATE OR REPLACE VIEW vw_movie_features AS
SELECT
    m.id AS movie_id,
    m.tmdb_id,
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

-- Logic Triggers
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