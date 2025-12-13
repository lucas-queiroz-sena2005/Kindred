--
-- PostgreSQL database dump
--

\restrict d2D3MDC9ZL4bOCLgeeQqZnd88CkK69zip2hcVNJPSlA87Z8Aqb64UBw7Ydf4Jod

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
-- Name: user_connections; Type: TABLE; Schema: public; Owner: tierlist_user
--

CREATE TABLE public.user_connections (
    user_id_a integer NOT NULL,
    user_id_b integer NOT NULL,
    CONSTRAINT user_connections_check CHECK ((user_id_a < user_id_b))
);


ALTER TABLE public.user_connections OWNER TO tierlist_user;

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
374720	10752
374720	28
374720	18
577922	28
577922	53
577922	878
157336	12
157336	18
157336	878
27205	28
27205	878
27205	12
155	18
155	28
155	80
155	53
272	18
272	80
272	28
1124	18
1124	9648
1124	878
320	53
320	80
320	18
77	9648
77	53
11660	18
11660	53
43629	27
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
872585	Oppenheimer	2023	525	/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg	2025-12-10 00:56:52.670276-03
374720	Dunkirk	2017	525	/b4Oe15CGLL61Ped0RAS9JpqdmCt.jpg	2025-12-10 00:56:52.670276-03
577922	Tenet	2020	525	/aCIFMriQh8rvhxpN1IWGgvH0Tlg.jpg	2025-12-10 00:56:52.670276-03
157336	Interstellar	2014	525	/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg	2025-12-10 00:56:52.670276-03
27205	Inception	2010	525	/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg	2025-12-10 00:56:52.670276-03
155	The Dark Knight	2008	525	/qJ2tW6WMUDux911r6m7haRef0WH.jpg	2025-12-10 00:56:52.670276-03
272	Batman Begins	2005	525	/sPX89Td70IDDjVr85jdSBb4rWGr.jpg	2025-12-10 00:56:52.670276-03
1124	The Prestige	2006	525	/bdN3gXuIZYaJP7ftKK2sU0nPtEA.jpg	2025-12-10 00:56:52.670276-03
320	Insomnia	2002	525	/riVXh3EimGO0y5dgQxEWPRy5Itg.jpg	2025-12-10 00:56:52.670276-03
77	Memento	2000	525	/fKTPH2WvH8nHTXeBYBVhawtRqtR.jpg	2025-12-10 00:56:52.670276-03
11660	Following	1999	525	/3bX6VVSMf0dvzk5pMT4ALG5A92d.jpg	2025-12-10 00:56:52.670276-03
43629	Doodlebug	1997	525	/zomfKkYlS6oeiTUUfqHYHrnI2sk.jpg	2025-12-10 00:56:52.670276-03
49026	The Dark Knight Rises	2012	525	/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg	2025-12-10 00:56:52.670276-03
22302	Polytechnique	2009	137427	/k0xmtct9cSseksuFKMSXxM8hfni.jpg	2025-12-10 00:56:52.670276-03
35650	Maelström	2000	137427	/knhWhSDOEPcWed5ljKcJVnXbH7.jpg	2025-12-10 00:56:52.670276-03
46738	Incendies	2010	137427	/yH6DAQVgbyj72S66gN4WWVoTjuf.jpg	2025-12-10 00:56:52.670276-03
99343	Next Floor	2008	137427	/1HBizk472Kb0SY8NM8XTbig2xpm.jpg	2025-12-10 00:56:52.670276-03
59482	August 32nd on Earth	1999	137427	/iE0XpMkBOGgqYZ2UsS6bqtjvfLG.jpg	2025-12-10 00:56:52.670276-03
146233	Prisoners	2013	137427	/jsS3a3ep2KyBVmmiwaz3LvK49b1.jpg	2025-12-10 00:56:52.670276-03
181886	Enemy	2014	137427	/vf40tyDRKZsBmaLsYeopzfFLzLx.jpg	2025-12-10 00:56:52.670276-03
273481	Sicario	2015	137427	/lz8vNyXeidqqOdJW9ZjnDAMb5Vr.jpg	2025-12-10 00:56:52.670276-03
329865	Arrival	2016	137427	/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg	2025-12-10 00:56:52.670276-03
438631	Dune	2021	137427	/d5NXSklXo0qyIYkgV94XAgMIckC.jpg	2025-12-10 00:56:52.670276-03
335984	Blade Runner 2049	2017	137427	/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg	2025-12-10 00:56:52.670276-03
693134	Dune: Part Two	2024	137427	/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg	2025-12-10 00:56:52.670276-03
\.


--
-- Data for Name: ranked_items; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.ranked_items (id, ranking_id, movie_id, tier) FROM stdin;
1	1	872585	2
2	1	374720	2
3	1	577922	1
4	1	157336	4
5	1	27205	5
6	1	155	4
7	1	272	5
8	1	1124	4
9	1	320	3
10	1	77	0
11	1	11660	0
12	1	43629	3
13	1	49026	4
\.


--
-- Data for Name: template_movies; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.template_movies (template_id, movie_id) FROM stdin;
1	872585
1	374720
1	577922
1	157336
1	27205
1	155
1	272
1	1124
1	320
1	77
1	11660
1	43629
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
1	Filmography: Christopher Nolan	Rank all films directed by Christopher Nolan.	2025-12-10 00:56:52.670276-03
2	Filmography: Denis Villeneuve	Rank all films directed by Denis Villeneuve.	2025-12-10 00:56:52.670276-03
3	Filmography: Geoffrey Rush	Rank all films directed by Geoffrey Rush.	2025-12-10 00:56:52.670276-03
\.


--
-- Data for Name: user_connections; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.user_connections (user_id_a, user_id_b) FROM stdin;
1	2
1	3
\.


--
-- Data for Name: user_rankings; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.user_rankings (id, user_id, template_id, created_at, updated_at) FROM stdin;
1	1	1	2025-12-10 00:56:52.670276-03	2025-12-10 00:56:52.670276-03
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tierlist_user
--

COPY public.users (id, username, email, password_hash, profile_vector, created_at) FROM stdin;
1	testuser	test@gmail.com	$2b$10$.vy.SdRhlUIv5wrb1zYi2.XqpgnHxpNvkI2qeXrSCzj27rWQerEw2	[0.24161254,0.019680679,0.5797643,0.32012936,0.34136528,0.40308505,0.2663464,0.2477286,0.38822925,0.2714982,0.77706134,0.6745111,0.81119305,0.7606552,0.6095621,0.44805673,0.19154273,0.9640922,0.74146765,0.9702466,0.3021903,0.7216188,0.37859708,0.86278415,0.31172967,0.92970616,0.9750928,0.66848165,0.50672936,0.30570024,0.39471993,0.9772706,0.44103205,0.679337,0.5883245,0.806229,0.35934663,0.4335289,0.696737,0.5334329,0.2440803,0.124296986,0.26477998,0.7911028,0.05244452,0.11906861,0.00964857,0.19171871,0.3046258,0.36217275,0.94307566,0.9272228,0.3491719,0.5334097,0.48259303,0.3720543,0.3089475,0.5205515,0.7224427,0.80968976,0.41428268,0.9229153,0.91987497,0.6683852,0.22037035,0.5275442,0.51615894,0.9088298,0.15828624,0.1410005,0.17925729,0.23537531,0.3215939,0.6609067,0.22977015,0.88583535,0.6578905,0.26625204,0.8206192,0.05362005,0.73298913,0.78880304,0.22604254,0.17216574,0.4549157,0.6235821,0.49692386,0.19751023,0.15651004,0.9991479,0.17469203,0.3002109,0.35648802,0.9488311,0.8679462,0.3285585,0.24699745,0.97275156,0.9795159,0.64125925,0.45806232,0.78162706,0.2400158,0.9628751,0.87565696,0.69919103,0.8697123,0.9068257,0.4903727,0.5906756,0.16579685,0.62127495,0.40530226,0.3826489,0.19364372,0.23189525,0.033290148,0.28475136,0.3613615,0.58102065,0.79077446,0.043542903,0.8512857,0.5383727,0.34276533,0.19004522,0.64645946,0.27442536,0.8811136,0.25434375,0.4410455,0.9285921,0.89595515,0.69811445,0.77956444,0.80696946,0.08522059,0.4783996,0.89701766,0.1476061,0.91363955,0.76136994,0.0326301,0.18600844,0.9533582,0.87988746,0.9996202,0.9210936,0.30732813,0.9022264,0.62082815,0.8406238,0.6496508,0.27325085,0.5876513,0.7672105,0.07182506,0.17319548,0.6966651,0.2786102,0.25624463,0.45786363,0.6230331,0.64463145,0.5791655,0.5166547,0.8899355,0.48123634,0.93876153,0.4148066,0.32304677,0.42991248,0.8348863,0.36789548,0.28363904,0.80740523,0.5827751,0.8787212,0.43793273,0.31200537,0.16646685,0.33863178,0.16705112,0.19408324,0.12396324,0.48147014,0.20725243,0.8795331,0.7198959,0.76203066,0.66862965,0.08134085,0.71050906,0.6642119,0.45866174,0.22825633,0.5120691,0.77025527,0.45162645,0.23897713,0.97266537,0.6796523,0.41089156,0.69223326,0.6141799,0.3357138,0.76088536,0.16631147,0.45591563,0.27043402,0.9516765,0.16891046,0.44930395,0.5244169,0.07386981,0.82982117,0.81033015,0.8154193,0.6144096,0.39287856,0.9602425,0.5226102,0.9085267,0.59639716,0.026205119,0.8109415,0.33773845,0.09099383,0.14532344,0.92985463,0.9684845,0.0706451,0.37441966,0.77076703,0.3851614,0.26731038,0.122181684,0.6054919,0.83259696,0.687166,0.24220362,0.08514446,0.1318953,0.87668824,0.49398455,0.81049496,0.43547627,0.780271,0.84899837,0.12642482,0.97898316,0.17850816,0.3086415,0.78603953,0.86051863,0.72817487]	2025-12-10 00:56:52.670276-03
2	user2	user2@test.com	$2b$10$NKTEfAB0dD5i.vWvb0VJK.FvYFh1Lo4/0gucxXe32DtjtmXkkqtYi	[0.6007387,0.8659337,0.32041657,0.6657131,0.74403113,0.07303488,0.40553793,0.097011976,0.11865418,0.13699295,0.06257775,0.20583332,0.4157026,0.3020928,0.52950245,0.92191637,0.4778583,0.81499594,0.7974885,0.9038887,0.33813244,0.5758008,0.14292799,0.608222,0.82043976,0.4652318,0.403228,0.07156575,0.83699495,0.977141,0.21629335,0.8870356,0.5547077,0.46597564,0.32207832,0.60473245,0.7873498,0.624318,0.033417746,0.4421823,0.7529178,0.77041703,0.34744385,0.05458314,0.9367357,0.70248514,0.5954356,0.80542433,0.21948342,0.5071617,0.7970806,0.7482077,0.40950787,0.7594001,0.7925702,0.3996566,0.0036552756,0.87318116,0.36666232,0.6673558,0.42569786,0.38936302,0.8404938,0.46996412,0.49071273,0.8053279,0.08606227,0.7377078,0.7707239,0.2031273,0.109823935,0.57824916,0.8525818,0.00525812,0.3021559,0.6221732,0.87546575,0.014416752,0.7187843,0.12163301,0.26623106,0.5570501,0.5885208,0.14513996,0.5415909,0.4465141,0.34675154,0.9278656,0.029292429,0.9931725,0.051864263,0.665999,0.7138593,0.23967136,0.40202105,0.5426575,0.8307513,0.56787145,0.5974994,0.918584,0.07420485,0.3128098,0.038897548,0.28195226,0.9843002,0.0019510629,0.51083964,0.5354276,0.4796248,0.05298233,0.47170246,0.6914133,0.41273043,0.020604117,0.89663464,0.6691527,0.10600344,0.70039296,0.3289497,0.026169404,0.10983948,0.81236124,0.9429983,0.04541352,0.7928767,0.42532393,0.03681823,0.9826061,0.5519968,0.8436073,0.03610841,0.8463664,0.56172734,0.5744792,0.30370775,0.22694407,0.77857596,0.48808938,0.26026285,0.18801022,0.65520346,0.0029073465,0.3356408,0.50606966,0.55376965,0.25091103,0.65569454,0.7673868,0.6183028,0.013052863,0.07435233,0.03365768,0.86281383,0.4886559,0.34485948,0.078475855,0.8320158,0.72296506,0.6685597,0.6698509,0.35895434,0.98410785,0.64870965,0.27805567,0.9575051,0.9552688,0.37814587,0.3111895,0.64552397,0.04620491,0.060572937,0.34627464,0.71709764,0.7698628,0.8472964,0.8186408,0.4329521,0.44723293,0.37874132,0.6028649,0.57249004,0.15600993,0.20401198,0.69977385,0.091704436,0.29845917,0.7885483,0.8688738,0.7896476,0.106996305,0.65280443,0.46596703,0.43431643,0.35048664,0.8943726,0.29236186,0.35434365,0.9348264,0.89214617,0.09244348,0.44161266,0.06310301,0.8141615,0.72394925,0.83838457,0.46923828,0.38201782,0.4024846,0.7635735,0.09682903,0.58409745,0.55190647,0.95558953,0.7510446,0.5403817,0.76296324,0.6121166,0.039760273,0.91117066,0.18337402,0.6338591,0.196349,0.668378,0.02265258,0.3708353,0.33163655,0.83037364,0.14192612,0.85487175,0.36752555,0.034143753,0.9273531,0.647832,0.5404618,0.6812207,0.45159832,0.36978418,0.56920856,0.99545336,0.9197878,0.5619541,0.06668156,0.9773088,0.38451833,0.13793024,0.93469304,0.7234079,0.058443826,0.7387291,0.74621165,0.54628986,0.74222094,0.9925811,0.1690406,0.8302537,0.27440712]	2025-12-10 00:56:52.670276-03
3	user3	user3@test.com	$2b$10$14LAzPl5AmtISlPjRrQn2.zK.7xLZlzGlle9WXx1kqH9aB5oAry/O	[0.1941357,0.5063241,0.58427656,0.14650658,0.923945,0.012689327,0.66888493,0.58619523,0.10439791,0.10294063,0.53541654,0.13395247,0.91213816,0.19940853,0.7182419,0.47667873,0.40197942,0.20878471,0.20180516,0.9775524,0.6378779,0.27345848,0.44349998,0.73672765,0.0012691977,0.49830934,0.8470728,0.5153465,0.4253116,0.15280458,0.19203955,0.032371894,0.34202796,0.11342886,0.11002735,0.5393004,0.8115327,0.62829006,0.8354836,0.91595703,0.9065535,0.8909919,0.37242392,0.060347285,0.31866586,0.5513799,0.45022222,0.29672834,0.5723731,0.6065883,0.8255398,0.9828244,0.2923891,0.20914954,0.2710134,0.93826383,0.73261285,0.22336107,0.31432292,0.9359321,0.11834951,0.75757885,0.42520127,0.17453498,0.6836366,0.46904972,0.021246651,0.20632365,0.22842252,0.24968615,0.9213115,0.9506018,0.23573281,0.8439516,0.83288264,0.9811822,0.4510825,0.971096,0.9952305,0.3581213,0.62048876,0.8767779,0.7402991,0.0013599832,0.57673216,0.16969714,0.07833036,0.9718689,0.99399316,0.28601375,0.5118146,0.23382294,0.61214805,0.87236696,0.7793414,0.07970298,0.18076754,0.2796138,0.31154695,0.9529315,0.8138265,0.6168433,0.074702546,0.48382246,0.25100687,0.06429198,0.9372731,0.11031936,0.43274456,0.08139424,0.110076115,0.96643853,0.85695815,0.24283578,0.23140405,0.8832469,0.32236022,0.31392837,0.81049097,0.730523,0.954858,0.17086832,0.31323224,0.40014267,0.034047633,0.34642354,0.75042754,0.7665356,0.5876917,0.26122078,0.34040552,0.13056162,0.004553016,0.9906639,0.7780827,0.80882347,0.04238355,0.71842045,0.38651904,0.29428214,0.7532195,0.9209227,0.079220444,0.38128358,0.6756165,0.6133935,0.72143394,0.8923887,0.6672927,0.53796244,0.21072842,0.5403471,0.4363179,0.3954199,0.6802575,0.36278242,0.15026759,0.218164,0.7216559,0.9172668,0.38719,0.42351186,0.93090177,0.098266795,0.6905268,0.44469425,0.36455566,0.545492,0.98082185,0.69938064,0.09516875,0.80647963,0.39863166,0.15396446,0.5652988,0.6570908,0.74249905,0.8822584,0.097400814,0.7475087,0.0245554,0.25213814,0.07634155,0.8834519,0.36067364,0.49325284,0.14549601,0.062446397,0.042022124,0.4962495,0.33296898,0.5945304,0.5064933,0.6809255,0.5726816,0.09534074,0.55914104,0.55409193,0.9022497,0.20054106,0.87366724,0.20380925,0.51703006,0.35773444,0.2758798,0.7369241,0.4932509,0.3411079,0.47420517,0.523272,0.4167412,0.9124433,0.5434662,0.38340425,0.5170923,0.16495034,0.8745765,0.7527479,0.39200133,0.720011,0.8583423,0.35805944,0.9856433,0.1634826,0.6567231,0.11218484,0.4037294,0.6213604,0.5705853,0.92957366,0.7379273,0.45546725,0.84132504,0.06955107,0.8836411,0.089929685,0.31190166,0.14293665,0.787739,0.9860742,0.43329373,0.86261743,0.7903033,0.2865384,0.073512144,0.42188528,0.1456819,0.2081756,0.53881866,0.32417,0.5187617,0.44295594,0.8709959,0.7098664,0.33125857,0.45454794]	2025-12-10 00:56:52.670276-03
4	user4	user4@test.com	$2b$10$BlPsl8yGDB6QtVzFF3zIN.31dVn5Og6CfnDSjCpd8kzcUvnkdVtfe	[0.860233,0.02640628,0.53561825,0.7938439,0.98580354,0.8221973,0.440321,0.7096307,0.39599022,0.5740616,0.10757398,0.6263083,0.829295,0.93676895,0.42495182,0.53327894,0.7904066,0.17458312,0.79592526,0.93802404,0.006598261,0.38270742,0.17529312,0.12003545,0.35354906,0.845928,0.43294013,0.1994124,0.85482734,0.8345797,0.6516283,0.37039867,0.19167909,0.8001929,0.45821995,0.69522536,0.8363887,0.1359401,0.91229165,0.6121623,0.91145104,0.6607244,0.2047469,0.9014885,0.9450257,0.82762945,0.5063403,0.63804674,0.31896228,0.39829117,0.3290028,0.41170707,0.52681905,0.32186934,0.26362282,0.76522994,0.7297902,0.10330205,0.7622922,0.30594724,0.20281836,0.88969463,0.9832244,0.20937504,0.8679837,0.76616466,0.14911416,0.88085866,0.5259693,0.99157566,0.669623,0.6833689,0.0681851,0.3083501,0.77821404,0.6779642,0.9075834,0.46584406,0.70890415,0.16493641,0.11459154,0.18470933,0.92790246,0.34876913,0.9706438,0.4194313,0.8835301,0.6260866,0.6130407,0.91144896,0.7342044,0.4577029,0.7354006,0.29838866,0.0320245,0.72757566,0.6452216,0.34518948,0.50661653,0.46510252,0.45571405,0.10405959,0.5237355,0.48883045,0.7201074,0.037359335,0.8552708,0.4744471,0.8781499,0.6829381,0.1438828,0.238749,0.03928376,0.8940257,0.4516191,0.69912696,0.3321089,0.063304536,0.33383036,0.67045724,0.062004916,0.80905646,0.3850133,0.49777934,0.19517137,0.9440678,0.5614311,0.20333758,0.8507287,0.045384552,0.84478354,0.68145937,0.75007874,0.72452044,0.36477974,0.38830882,0.33798772,0.96317565,0.8205977,0.9411137,0.46957627,0.5839294,0.6761815,0.36500102,0.92992413,0.42703268,0.29656348,0.103703886,0.3023939,0.509279,0.20476627,0.62506473,0.4240265,0.003981448,0.14223269,0.7797103,0.17818376,0.90867746,0.27389735,0.28196824,0.06798078,0.7132689,0.9600257,0.7867047,0.56002384,0.34033644,0.9739573,0.9159828,0.8565434,0.76864564,0.66237515,0.4790783,0.1497953,0.9351401,0.30449027,0.15674609,0.3099213,0.37454405,0.9396212,0.17828554,0.42790458,0.02979127,0.81617624,0.35755938,0.90581137,0.9137849,0.6238496,0.39168334,0.997231,0.3722256,0.00045509642,0.83198744,0.68849456,0.10470021,0.048078854,0.6777671,0.07083889,0.45481858,0.85558766,0.19377907,0.6680997,0.8846049,0.10326866,0.37808698,0.8294048,0.54111266,0.42892972,0.7830118,0.800577,0.6747878,0.85735446,0.24871948,0.95672333,0.83747745,0.032490153,0.95985925,0.5476616,0.25322643,0.7222937,0.369544,0.8335947,0.10510833,0.72168297,0.70275533,0.80892324,0.75959057,0.8627902,0.88484025,0.6763248,0.94399124,0.74436176,0.29023612,0.34809706,0.25339416,0.47302896,0.03098157,0.43435836,0.47224462,0.6913517,0.19150805,0.71613073,0.4953599,0.45234284,0.40290052,0.9279319,0.97218126,0.6992639,0.6697471,0.85916245,0.34334627,0.5434238,0.87734103,0.13848975,0.07237027,0.4024109,0.9095581]	2025-12-10 00:56:52.670276-03
\.


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: ranked_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.ranked_items_id_seq', 13, true);


--
-- Name: tierlist_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.tierlist_templates_id_seq', 3, true);


--
-- Name: user_rankings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.user_rankings_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tierlist_user
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


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
-- Name: user_connections user_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_pkey PRIMARY KEY (user_id_a, user_id_b);


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
-- Name: idx_user_connections_bi_directional; Type: INDEX; Schema: public; Owner: tierlist_user
--

CREATE INDEX idx_user_connections_bi_directional ON public.user_connections USING btree (user_id_a, user_id_b);


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
-- Name: user_connections user_connections_user_id_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_user_id_a_fkey FOREIGN KEY (user_id_a) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_connections user_connections_user_id_b_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tierlist_user
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_user_id_b_fkey FOREIGN KEY (user_id_b) REFERENCES public.users(id) ON DELETE CASCADE;


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

\unrestrict d2D3MDC9ZL4bOCLgeeQqZnd88CkK69zip2hcVNJPSlA87Z8Aqb64UBw7Ydf4Jod

