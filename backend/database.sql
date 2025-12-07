--
-- PostgreSQL database dump
--

\restrict zLcTDczOKMErOq6KHA2LQNSnXDCravjOH0mued2SiWVvfx1JaJCg7yt5JmHMa0L

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: crow
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO crow;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: crow
--

COMMENT ON SCHEMA public IS '';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: trg_user_rankings_update_timestamp(); Type: FUNCTION; Schema: public; Owner: tierlist_user
--

CREATE FUNCTION public.trg_user_rankings_update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trg_user_rankings_update_timestamp() OWNER TO tierlist_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: directors; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.directors (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.directors OWNER TO tierlist_user;

--
-- Name: genres; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.genres OWNER TO tierlist_user;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO tierlist_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: tierlist_user
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO tierlist_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tierlist_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: movie_genres; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.movie_genres (
    movie_id integer NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.movie_genres OWNER TO tierlist_user;

--
-- Name: movies; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    release_year integer,
    director_id integer,
    poster_path character varying(255),
    updated_at timestamp with time zone DEFAULT now(),
    decade integer GENERATED ALWAYS AS ((floor(((release_year / 10))::double precision) * (10)::double precision)) STORED
);


ALTER TABLE public.movies OWNER TO tierlist_user;

--
-- Name: ranked_items; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.ranked_items (
    id integer NOT NULL,
    ranking_id integer NOT NULL,
    movie_id integer NOT NULL,
    tier integer NOT NULL,
    CONSTRAINT ranked_items_tier_check CHECK (((tier >= 0) AND (tier <= 5)))
);


ALTER TABLE public.ranked_items OWNER TO tierlist_user;

--
-- Name: ranked_items_id_seq; Type: SEQUENCE; Schema: public; Owner: tierlist_user
--

CREATE SEQUENCE public.ranked_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ranked_items_id_seq OWNER TO tierlist_user;

--
-- Name: ranked_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tierlist_user
--

ALTER SEQUENCE public.ranked_items_id_seq OWNED BY public.ranked_items.id;


--
-- Name: template_movies; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.template_movies (
    template_id integer NOT NULL,
    movie_id integer NOT NULL
);


ALTER TABLE public.template_movies OWNER TO tierlist_user;

--
-- Name: tierlist_templates; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.tierlist_templates (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tierlist_templates OWNER TO tierlist_user;

--
-- Name: tierlist_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: tierlist_user
--

CREATE SEQUENCE public.tierlist_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tierlist_templates_id_seq OWNER TO tierlist_user;

--
-- Name: tierlist_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tierlist_user
--

ALTER SEQUENCE public.tierlist_templates_id_seq OWNED BY public.tierlist_templates.id;


--
-- Name: user_rankings; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.user_rankings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    template_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_rankings OWNER TO tierlist_user;

--
-- Name: user_rankings_id_seq; Type: SEQUENCE; Schema: public; Owner: tierlist_user
--

CREATE SEQUENCE public.user_rankings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_rankings_id_seq OWNER TO tierlist_user;

--
-- Name: user_rankings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tierlist_user
--

ALTER SEQUENCE public.user_rankings_id_seq OWNED BY public.user_rankings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    profile_vector public.vector(256),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO tierlist_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: tierlist_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO tierlist_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tierlist_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vw_movie_features; Type: VIEW; Schema: public; Owner: tierlist_user
--

CREATE VIEW public.vw_movie_features AS
 SELECT m.id AS movie_id,
    m.title,
    m.release_year,
    m.decade,
    m.director_id,
    d.name AS director_name,
    g.id AS genre_id,
    g.name AS genre_name
   FROM (((public.movies m
     LEFT JOIN public.directors d ON ((m.director_id = d.id)))
     LEFT JOIN public.movie_genres mg ON ((m.id = mg.movie_id)))
     LEFT JOIN public.genres g ON ((mg.genre_id = g.id)));


ALTER VIEW public.vw_movie_features OWNER TO tierlist_user;

--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: ranked_items id; Type: DEFAULT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.ranked_items ALTER COLUMN id SET DEFAULT nextval('public.ranked_items_id_seq'::regclass);


--
-- Name: tierlist_templates id; Type: DEFAULT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.tierlist_templates ALTER COLUMN id SET DEFAULT nextval('public.tierlist_templates_id_seq'::regclass);


--
-- Name: user_rankings id; Type: DEFAULT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_rankings ALTER COLUMN id SET DEFAULT nextval('public.user_rankings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: directors; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.directors (id, name) FROM stdin;
525	Christopher Nolan
137427	Denis Villeneuve
118	Geoffrey Rush
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.genres (id, name) FROM stdin;
28	Action
12	Adventure
16	Animation
35	Comedy
80	Crime
99	Documentary
18	Drama
10751	Family
14	Fantasy
36	History
27	Horror
10402	Music
9648	Mystery
10749	Romance
878	Science Fiction
10770	TV Movie
53	Thriller
10752	War
37	Western
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.messages (id, sender_id, receiver_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: movie_genres; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.movie_genres (movie_id, genre_id) FROM stdin;
872585	18
872585	36
577922	28
577922	53
577922	878
272	18
272	80
272	28
157336	12
157336	18
157336	878
320	53
320	80
320	18
155	18
155	28
155	80
155	53
374720	10752
374720	28
374720	18
11660	18
11660	53
43629	27
1124	18
1124	9648
1124	878
77	9648
77	53
27205	28
27205	878
27205	12
49026	28
49026	80
49026	18
49026	53
22302	80
22302	18
22302	53
35650	18
35650	35
46738	18
46738	10752
46738	9648
99343	35
59482	10749
59482	18
146233	18
146233	53
146233	80
181886	53
181886	9648
273481	28
273481	80
273481	53
329865	18
329865	878
329865	9648
438631	878
438631	12
335984	878
335984	18
693134	878
693134	12
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.movies (id, title, release_year, director_id, poster_path, updated_at) FROM stdin;
872585	Oppenheimer	2023	525	/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg	2025-10-26 18:43:33.590679-03
577922	Tenet	2020	525	/aCIFMriQh8rvhxpN1IWGgvH0Tlg.jpg	2025-10-26 18:43:33.590679-03
272	Batman Begins	2005	525	/sPX89Td70IDDjVr85jdSBb4rWGr.jpg	2025-10-26 18:43:33.590679-03
157336	Interstellar	2014	525	/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg	2025-10-26 18:43:33.590679-03
320	Insomnia	2002	525	/riVXh3EimGO0y5dgQxEWPRy5Itg.jpg	2025-10-26 18:43:33.590679-03
155	The Dark Knight	2008	525	/qJ2tW6WMUDux911r6m7haRef0WH.jpg	2025-10-26 18:43:33.590679-03
374720	Dunkirk	2017	525	/b4Oe15CGLL61Ped0RAS9JpqdmCt.jpg	2025-10-26 18:43:33.590679-03
11660	Following	1999	525	/3bX6VVSMf0dvzk5pMT4ALG5A92d.jpg	2025-10-26 18:43:33.590679-03
43629	Doodlebug	1997	525	/zomfKkYlS6oeiTUUfqHYHrnI2sk.jpg	2025-10-26 18:43:33.590679-03
1124	The Prestige	2006	525	/2ZOzyhoW08neG27DVySMCcq2emd.jpg	2025-10-26 18:43:33.590679-03
77	Memento	2000	525	/fKTPH2WvH8nHTXeBYBVhawtRqtR.jpg	2025-10-26 18:43:33.590679-03
27205	Inception	2010	525	/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg	2025-10-26 18:43:33.590679-03
49026	The Dark Knight Rises	2012	525	/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg	2025-10-26 18:43:33.590679-03
22302	Polytechnique	2009	137427	/k0xmtct9cSseksuFKMSXxM8hfni.jpg	2025-10-26 18:43:33.590679-03
35650	Maelström	2000	137427	/knhWhSDOEPcWed5ljKcJVnXbH7.jpg	2025-10-26 18:43:33.590679-03
46738	Incendies	2010	137427	/yH6DAQVgbyj72S66gN4WWVoTjuf.jpg	2025-10-26 18:43:33.590679-03
99343	Next Floor	2008	137427	/1HBizk472Kb0SY8NM8XTbig2xpm.jpg	2025-10-26 18:43:33.590679-03
59482	August 32nd on Earth	1999	137427	/iE0XpMkBOGgqYZ2UsS6bqtjvfLG.jpg	2025-10-26 18:43:33.590679-03
146233	Prisoners	2013	137427	/jsS3a3ep2KyBVmmiwaz3LvK49b1.jpg	2025-10-26 18:43:33.590679-03
181886	Enemy	2014	137427	/vf40tyDRKZsBmaLsYeopzfFLzLx.jpg	2025-10-26 18:43:33.590679-03
273481	Sicario	2015	137427	/lz8vNyXeidqqOdJW9ZjnDAMb5Vr.jpg	2025-10-26 18:43:33.590679-03
329865	Arrival	2016	137427	/6WzElgkLjIWuWn3Nwu66s5J26tx.jpg	2025-10-26 18:43:33.590679-03
438631	Dune	2021	137427	/d5NXSklXo0qyIYkgV94XAgMIckC.jpg	2025-10-26 18:43:33.590679-03
335984	Blade Runner 2049	2017	137427	/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg	2025-10-26 18:43:33.590679-03
693134	Dune: Part Two	2024	137427	/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg	2025-10-26 18:43:33.590679-03
\.


--
-- Data for Name: ranked_items; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.ranked_items (id, ranking_id, movie_id, tier) FROM stdin;
98	18	577922	0
99	18	272	1
100	18	374720	1
101	18	155	2
102	18	27205	2
103	18	320	2
104	18	157336	3
105	18	77	3
106	18	49026	3
107	18	1124	4
108	18	43629	4
109	22	155	1
110	22	1124	1
111	22	374720	1
112	22	872585	2
113	22	157336	2
114	22	11660	3
43	2	155	0
44	2	577922	0
45	2	49026	1
46	2	157336	1
47	2	43629	2
48	2	27205	2
49	2	320	3
50	2	11660	3
51	2	872585	4
52	2	1124	4
53	2	272	5
80	15	577922	3
81	15	157336	3
82	15	320	3
83	15	374720	3
84	15	11660	3
85	15	1124	3
86	15	77	3
87	15	27205	3
88	15	49026	3
89	15	872585	4
90	15	272	4
91	15	155	4
92	15	43629	5
\.


--
-- Data for Name: template_movies; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.template_movies (template_id, movie_id) FROM stdin;
1	872585
1	577922
1	272
1	157336
1	320
1	155
1	374720
1	11660
1	43629
1	1124
1	77
1	27205
1	49026
2	22302
2	35650
2	46738
2	99343
2	59482
2	146233
2	181886
2	273481
2	329865
2	438631
2	335984
2	693134
\.


--
-- Data for Name: tierlist_templates; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.tierlist_templates (id, title, description, created_at) FROM stdin;
1	Filmography: Christopher Nolan	Rank all films directed by Christopher Nolan.	2025-10-26 18:43:33.590679-03
2	Filmography: Denis Villeneuve	Rank all films directed by Denis Villeneuve.	2025-10-26 18:43:33.590679-03
3	Filmography: Geoffrey Rush	Rank all films directed by Geoffrey Rush.	2025-10-26 18:43:33.590679-03
\.


--
-- Data for Name: user_rankings; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.user_rankings (id, user_id, template_id, created_at, updated_at) FROM stdin;
2	1	1	2025-10-26 20:57:51.398849-03	2025-11-01 00:42:55.388544-03
15	3	1	2025-11-03 21:37:19.557311-03	2025-11-03 21:38:07.766268-03
19	4	2	2025-11-04 20:31:58.913831-03	2025-11-04 20:31:58.913831-03
18	4	1	2025-11-04 17:19:47.621745-03	2025-11-06 22:02:47.369813-03
21	4	3	2025-11-06 22:02:55.306132-03	2025-11-06 22:02:55.306132-03
22	5	1	2025-12-04 10:35:21.736996-03	2025-12-04 10:35:21.736996-03
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.users (id, username, email, password_hash, profile_vector, created_at) FROM stdin;
2	ryo	ryo@gmail.com	$2b$10$Sb8b8TqXVsK1Xy4CNOYyp.LxbmPWv5Ojo.Sk8Az9cfHQH1OaQZ/NG	\N	2025-10-27 18:00:29.317188-03
1	testuser	test@test.com	$2b$10$cq8.4q/YpW1fUHk7og3eKerSiLbEj4MH/77EEIZaN8jl7eUNFF4L6	[0.875,0,0.27272728,0,0.25,-0.25,0,1,0,0.71428573,0.6,0,0.42857143,0,-0.25,0,0,0,0,0,0,0,0,0,0,0,0.2,0,0.8333333,0.4,0.5714286,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]	2025-10-26 18:43:33.590679-03
3	user	user@gmail.com	$2b$10$0dicfcY.VO2gy/SAErshmesm8DZbGD2Ggy8/L5FssImSH/4T4QCje	[-0.22222222,0,-0.25,0,-0.5,0,0,-0.11111111,0,0,0,0,-0.2857143,0,-0.25,0,0,0,0,0,0,0,0,0,0,0,-0.4,-0.25,0,-0.2,-0.3125,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]	2025-11-03 21:36:39.281358-03
4	test	test@gmail.com	$2b$10$UQs6bQm6jFJYKMAQTWNDw.WzlZ8R3TaZ1ySl2q5xD.4UpEpE/asO6	[1,0,0.5,0,-0.25,-0.2,0,0.625,0,0.42857143,0.2,0,0.5714286,0,0,0,0.5,0,0,0,0,0,0,0,0,0,-0.25,0.375,0.42857143,0.75,0.5714286,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]	2025-11-04 17:19:31.265411-03
5	test2	test2@gmail.com	$2b$10$g0wZ25VYzsRn9sdrztVtyOYWgj7cUrK2JDOUg1hhhKolLgkzZYEwy	[0.8,0,0.8888889,0,0,0.5,0,0.4,0,0.6,0.25,0,0.5,0,0.25,0,0.5,0,0,0,0,0,0,0,0,0,0,0.8,0.6,0.25,0.8888889,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]	2025-12-04 10:32:12.022198-03
\.


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: ranked_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.ranked_items_id_seq', 114, true);


--
-- Name: tierlist_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.tierlist_templates_id_seq', 3, true);


--
-- Name: user_rankings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.user_rankings_id_seq', 22, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: directors directors_name_key; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.directors
    ADD CONSTRAINT directors_name_key UNIQUE (name);


--
-- Name: directors directors_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.directors
    ADD CONSTRAINT directors_pkey PRIMARY KEY (id);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: movie_genres movie_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_pkey PRIMARY KEY (movie_id, genre_id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: ranked_items ranked_items_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.ranked_items
    ADD CONSTRAINT ranked_items_pkey PRIMARY KEY (id);


--
-- Name: template_movies template_movies_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.template_movies
    ADD CONSTRAINT template_movies_pkey PRIMARY KEY (template_id, movie_id);


--
-- Name: tierlist_templates tierlist_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.tierlist_templates
    ADD CONSTRAINT tierlist_templates_pkey PRIMARY KEY (id);


--
-- Name: tierlist_templates tierlist_templates_title_key; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.tierlist_templates
    ADD CONSTRAINT tierlist_templates_title_key UNIQUE (title);


--
-- Name: user_rankings user_rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_rankings
    ADD CONSTRAINT user_rankings_pkey PRIMARY KEY (id);


--
-- Name: user_rankings user_rankings_user_id_template_id_key; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_rankings
    ADD CONSTRAINT user_rankings_user_id_template_id_key UNIQUE (user_id, template_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_directors_name; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_directors_name ON public.directors USING btree (name);


--
-- Name: idx_genres_name; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_genres_name ON public.genres USING btree (name);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);


--
-- Name: idx_messages_sender_receiver; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_messages_sender_receiver ON public.messages USING btree (sender_id, receiver_id);


--
-- Name: idx_movie_genres_movie_id_genre_id; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_movie_genres_movie_id_genre_id ON public.movie_genres USING btree (movie_id, genre_id);


--
-- Name: idx_movies_decade; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_movies_decade ON public.movies USING btree (decade);


--
-- Name: idx_movies_director_id; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_movies_director_id ON public.movies USING btree (director_id);


--
-- Name: idx_movies_release_year; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_movies_release_year ON public.movies USING btree (release_year);


--
-- Name: idx_ranked_items_ranking_movie; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_ranked_items_ranking_movie ON public.ranked_items USING btree (ranking_id, movie_id);


--
-- Name: idx_ranked_items_tier; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_ranked_items_tier ON public.ranked_items USING btree (tier);


--
-- Name: idx_template_movies_template_id_movie_id; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_template_movies_template_id_movie_id ON public.template_movies USING btree (template_id, movie_id);


--
-- Name: idx_tierlist_templates_title; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_tierlist_templates_title ON public.tierlist_templates USING btree (title);


--
-- Name: idx_user_rankings_user_id_updated_at; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_user_rankings_user_id_updated_at ON public.user_rankings USING btree (user_id, updated_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: users_profile_vector_idx; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX users_profile_vector_idx ON public.users USING ivfflat (profile_vector public.vector_cosine_ops) WITH (lists='100');


--
-- Name: user_rankings set_user_rankings_updated_at; Type: TRIGGER; Schema: public; Owner: tierlist_user
--

CREATE TRIGGER set_user_rankings_updated_at BEFORE UPDATE ON public.user_rankings FOR EACH ROW EXECUTE FUNCTION public.trg_user_rankings_update_timestamp();


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: movie_genres movie_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE CASCADE;


--
-- Name: movie_genres movie_genres_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movies movies_director_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_director_id_fkey FOREIGN KEY (director_id) REFERENCES public.directors(id);


--
-- Name: ranked_items ranked_items_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.ranked_items
    ADD CONSTRAINT ranked_items_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: ranked_items ranked_items_ranking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.ranked_items
    ADD CONSTRAINT ranked_items_ranking_id_fkey FOREIGN KEY (ranking_id) REFERENCES public.user_rankings(id) ON DELETE CASCADE;


--
-- Name: template_movies template_movies_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.template_movies
    ADD CONSTRAINT template_movies_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: template_movies template_movies_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.template_movies
    ADD CONSTRAINT template_movies_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.tierlist_templates(id) ON DELETE CASCADE;


--
-- Name: user_rankings user_rankings_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_rankings
    ADD CONSTRAINT user_rankings_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.tierlist_templates(id) ON DELETE CASCADE;


--
-- Name: user_rankings user_rankings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_rankings
    ADD CONSTRAINT user_rankings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: crow
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO tierlist_user;


--
-- PostgreSQL database dump complete
--

\unrestrict zLcTDczOKMErOq6KHA2LQNSnXDCravjOH0mued2SiWVvfx1JaJCg7yt5JmHMa0L

