This directive provides the structured data and logic required to seed the **Kindred** database with high-variance signals for a **256-dimension profile_vector**. Use the provided constants and data mappings to execute the seeding without external API calls.

---

### I. Global Configuration Logic

Maintain the following feature mappings to ensure vector indices align with the recommendation engine logic.

**Feature Map Index Mandate:**

* **0–18 (Genres):** Action (0), Comedy (1), Drama (2), Fantasy (3), Horror (4), Mystery (5), Romance (6), Thriller (7), Western (8), Sci-Fi (9), Adventure (10), Animation (11), Crime (12), Family (13), History (14), Music (15), War (16), Documentary (17), TV Movie (18).
* **19–29 (Decades):** 1920s (19) through 2020s (29).
* **30–255 (Directors):** Nolan (30), Villeneuve (31), Scorsese (32), Tarantino (33), Hitchcock (34), Miyazaki (35), Gerwig (36), Wes Anderson (37), Ari Aster (38), Jordan Peele (39), Coppola (40), James Gunn (41), Spielberg (42), Fincher (43), Bong Joon-ho (44), Clint Eastwood (45), Coen Brothers (46).

---

### II. Tierlist Template Data

Seed these 12 templates. Each movie object contains the `tmdb_id`, title, and necessary metadata for the vectorizer.

| Template ID | Theme | Movie List (TMDB ID | Title | Decade Index) |
| :--- | :--- | :--- |
| **T1** | Modern Sci-Fi | (157336|Interstellar|28), (438631|Dune|29), (335984|BR 2049|28), (62|2001|23) |
| **T2** | Crime & Grit | (103|Taxi Driver|24), (680|Pulp Fiction|26), (769|Goodfellas|26), (106646|Wolf Wall St|28) |
| **T3** | Suspense | (426|Vertigo|22), (567|Rear Window|22), (527|Psycho|23), (213|NxNW|22) |
| **T4** | Animation | (129|Spirited Away|27), (128|Mononoke|26), (508883|Boy & Heron|29), (30031|Totoro|25) |
| **T5** | Indie Perspectives | (391713|Lady Bird|28), (447332|Barbie|29), (120467|Grand Budapest|28), (792307|Poor Things|29) |
| **T6** | High Horror | (420617|Hereditary|28), (419430|Get Out|28), (530385|Midsommar|28), (603|The Shining|25) |
| **T7** | 70s Revolution | (238|Godfather|24), (28|Apocalypse Now|24), (935|Chinatown|24), (103|Taxi Driver|24) |
| **T8** | Pop Spectacle | (76341|Fury Road|28), (245891|John Wick|28), (118340|GotG|28), (155|Dark Knight|27) |
| **T9** | War Epics | (424|Schindler's List|26), (857|Saving Private Ryan|26), (530915|1917|28), (872585|Oppenheimer|29) |
| **T10** | 90s Cult | (550|Fight Club|26), (807|Se7en|26), (603|The Matrix|26), (500|Reservoir Dogs|26) |
| **T11** | Intl. Auteurs | (496243|Parasite|28), (670|Oldboy|27), (705996|Decision to Leave|29), (398818|Shoplifters|28) |
| **T12** | Western/Americana | (311|Unforgiven|26), (11324|No Country|27), (44264|True Grit|28), (3114|The Searchers|22) |

---

### III. User Profile & Ranking Data

Seed the following 12 users. Each user must have filled exactly the 2 templates listed.
*Note: Tier 0=S, 1=A, 2=B, 3=C, 4=D, 5=F.*

**User Rankings (Pseudo-JSON):**

1. **Elena Vance:** T1: {157336:0, 438631:1, 335984:1, 62:5} | T5: {391713:0, 447332:1, 120467:1, 792307:2}
2. **Marcus Thorne:** T2: {103:0, 680:0, 769:0, 106646:1} | T10: {550:0, 807:1, 603:1, 500:0}
3. **Hana Sato:** T4: {129:0, 128:0, 508883:0, 30031:1} | T11: {496243:0, 670:0, 705996:1, 398818:1}
4. **Julian Sterling:** T3: {426:0, 567:0, 527:0, 213:1} | T7: {238:0, 28:0, 935:1, 103:1}
5. **Chloe Miller:** T5: {120467:0, 447332:0, 391713:1, 792307:1} | T4: {129:0, 30031:0, 508883:2}
6. **Silas Vane:** T6: {420617:0, 419430:0, 530385:1, 603:1} | T10: {807:0, 550:2, 603:2}
7. **Riley Becker:** T8: {76341:0, 245891:0, 118340:1, 155:1} | T1: {438631:0, 157336:1, 335984:2}
8. **Dr. Aris Thorne:** T9: {424:0, 857:0, 530915:1, 872585:1} | T7: {238:0, 28:0, 935:1}
9. **Sarah Connor:** T10: {603:0, 550:0, 500:1} | T8: {76341:0, 155:1, 245891:1}
10. **Leo Morales:** T12: {311:0, 11324:0, 44264:1, 3114:2} | T2: {872585:0, 103:1, 680:3}
11. **Beatrice Quinn:** T11: {705996:0, 670:0, 496243:1} | T3: {426:0, 527:1, 567:1}
12. **Felix Kim:** T1: {335984:0, 157336:1, 438631:0, 62:1} | T6: {603:0, 420617:2}

---

### IV. Action Checklist for Agent

1. **Template Creation:** Loop through Section II. Create a `user_ranking_template` entry first, then link the movie IDs.
2. **User Creation:** Create 12 users with `password_hash` using "password123".
3. **Ranking Insertion:** For each User/Template pair in Section III, insert rows into `ranked_items`.
4. **Vector Calculation:** After rankings are inserted, trigger the `update_profile_vector` function (or equivalent logic) for each user.
5. → **Implication:** The relative `poster_path` should be left as a string fragment (e.g., `/hZ...jpg`) to ensure the offline seed is compatible with future online syncs.
6. — **Emphasis:** Do not use `0.0` for all vector weights. Ensure the negative weights for D and F tiers are applied to "push" the vector away from those genres/directors.