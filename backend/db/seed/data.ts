// This file contains all the seeding data from instructions.md

export const directors = [
  { id: 525, name: "Christopher Nolan" },
  { id: 137427, name: "Denis Villeneuve" },
  { id: 118, name: "Martin Scorsese" },
  { id: 138, name: "Quentin Tarantino" },
  { id: 2636, name: "Alfred Hitchcock" },
  { id: 608, name: "Hayao Miyazaki" },
  { id: 9543, name: "Greta Gerwig" },
  { id: 5655, name: "Wes Anderson" },
  { id: 1250254, name: "Ari Aster" },
  { id: 1252129, name: "Jordan Peele" },
  { id: 1776, name: "Francis Ford Coppola" },
  { id: 15277, name: "James Gunn" },
  { id: 2062, name: "George Miller" },
  { id: 488, name: "Steven Spielberg" },
  { id: 7467, name: "David Fincher" },
  { id: 9339, name: "Lana Wachowski" }, // Wachowskis
  { id: 21684, name: "Bong Joon-ho" },
  { id: 9035, name: "Park Chan-wook" },
  { id: 190, name: "Clint Eastwood" },
  { id: 1223, name: "Joel Coen" }, // Coen Brothers
  // Directors from movies, not in the primary list from instructions
  { id: 240, name: "Stanley Kubrick" },
  { id: 10507, name: "Yorgos Lanthimos" },
  { id: 111, name: "Roman Polanski" },
  { id: 59313, name: "Chad Stahelski" },
  { id: 3778, name: "Sam Mendes" },
  { id: 3636, name: "John Ford" },
  { id: 6883, name: "Hirokazu Kore-eda" },
];

export const movies = [
  // T1
  { id: 157336, title: "Interstellar", release_year: 2014, director_id: 525, poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: 438631, title: "Dune", release_year: 2021, director_id: 137427, poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" },
  { id: 335984, title: "Blade Runner 2049", release_year: 2017, director_id: 137427, poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" },
  { id: 62, title: "2001: A Space Odyssey", release_year: 1968, director_id: 240, poster_path: "/ve72wD_1dY323HuxidHjS13B224.jpg" },
  // T2
  { id: 103, title: "Taxi Driver", release_year: 1976, director_id: 118, poster_path: "/ekdG3y372i0a2dC9Xg55i22siS.jpg" },
  { id: 680, title: "Pulp Fiction", release_year: 1994, director_id: 138, poster_path: "/d5iIlFn5s0ImszYzBPb8KpgUvIW.jpg" },
  { id: 769, title: "Goodfellas", release_year: 1990, director_id: 118, poster_path: "/aKuFiU82s5ISJpGZp7YkAh3ckKX.jpg" },
  { id: 106646, title: "The Wolf of Wall Street", release_year: 2013, director_id: 118, poster_path: "/34m2wq5aaw4S15ckJmNs2eBdel1.jpg" },
  // T3
  { id: 426, title: "Vertigo", release_year: 1958, director_id: 2636, poster_path: "/d4q1pghaeiYCa9iilGCs0m6eedj.jpg" },
  { id: 567, title: "Rear Window", release_year: 1954, director_id: 2636, poster_path: "/t2mMei9uT8d4O3a2uhT5w2p8jvw.jpg" },
  { id: 527, title: "Psycho", release_year: 1960, director_id: 2636, poster_path: "/8f3e5p4jpZyj6b3hnEIXx423h62.jpg" },
  { id: 213, title: "North by Northwest", release_year: 1959, director_id: 2636, poster_path: "/2s9J2n2G3y5TfB5o2dei8n5t5i.jpg" },
  // T4
  { id: 129, title: "Spirited Away", release_year: 2001, director_id: 608, poster_path: "/39wmItIW2asRtoUfN4KTMhJoAG.jpg" },
  { id: 128, title: "Princess Mononoke", release_year: 1997, director_id: 608, poster_path: "/gn2DBay24PSbYcQj2jD2K2yIm1I.jpg" },
  { id: 508883, title: "The Boy and the Heron", release_year: 2023, director_id: 608, poster_path: "/f4o4c4gDlaC0O5A4o16B23lv9Hp.jpg" },
  { id: 30031, title: "My Neighbor Totoro", release_year: 1988, director_id: 608, poster_path: "/rtGDOeA92tPjBf1mTLGjD5dY3oG.jpg" },
  // T5
  { id: 391713, title: "Lady Bird", release_year: 2017, director_id: 9543, poster_path: "/bgR2mlg2S12Iu6p08r6D43fTj0M.jpg" },
  { id: 447332, title: "Barbie", release_year: 2023, director_id: 9543, poster_path: "/iuFNMS8U5cb6xfzi51DbkovYqrv.jpg" },
  { id: 120467, title: "The Grand Budapest Hotel", release_year: 2014, director_id: 5655, poster_path: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg" },
  { id: 792307, title: "Poor Things", release_year: 2023, director_id: 10507, poster_path: "/kCGlIMrgdce1bqmIWPGfHn7qP4J.jpg" },
  // T6
  { id: 420617, title: "Hereditary", release_year: 2018, director_id: 1250254, poster_path: "/yV95b5csE3nAZse6QU5fbk3Ldax.jpg" },
  { id: 419430, title: "Get Out", release_year: 2017, director_id: 1252129, poster_path: "/k2o2n2sa9a0gJpA29l4qqw2n5iI.jpg" },
  { id: 530385, title: "Midsommar", release_year: 2019, director_id: 1250254, poster_path: "/7tN6b8O53I3bcj2yV21I6P2Ea2.jpg" },
  { id: 603, title: "The Matrix", release_year: 1999, director_id: 9339, poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" }, // instruction.md has The Shining here, but ID points to The Matrix. I'll use The Matrix from the ID.
  // T7
  { id: 238, title: "The Godfather", release_year: 1972, director_id: 1776, poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
  { id: 28, title: "Apocalypse Now", release_year: 1979, director_id: 1776, poster_path: "/gQBmI22OUmC5s0n3i2w5b2l7aag.jpg" },
  { id: 935, title: "Chinatown", release_year: 1974, director_id: 111, poster_path: "/j7p4p1W9d2w1PDRtLQn14gc47M.jpg" },
  // T8
  { id: 76341, title: "Mad Max: Fury Road", release_year: 2015, director_id: 2062, poster_path: "/8tGms4kHwV2nBwPaY337fag6t4a.jpg" },
  { id: 245891, title: "John Wick", release_year: 2014, director_id: 59313, poster_path: "/nCzzQKG844ZAor52aGnS43g6GkF.jpg" },
  { id: 118340, title: "Guardians of the Galaxy", release_year: 2014, director_id: 15277, poster_path: "/r7pQGSlnL227hafxNlqtYyv8u2i.jpg" },
  { id: 155, title: "The Dark Knight", release_year: 2008, director_id: 525, poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  // T9
  { id: 424, title: "Schindler's List", release_year: 1993, director_id: 488, poster_path: "/sF1U4EUQS8YHUYjNl3pMGsWaAyr.jpg" },
  { id: 857, title: "Saving Private Ryan", release_year: 1998, director_id: 488, poster_path: "/1wY4psJ5NVEhCuOYROwLH2XExM2.jpg" },
  { id: 530915, title: "1917", release_year: 2019, director_id: 3778, poster_path: "/iZf0KyrE25z1sage4SYFLCCrMi9.jpg" },
  { id: 872585, title: "Oppenheimer", release_year: 2023, director_id: 525, poster_path: "/ptpr0kGAckfQikBPe2A12sEwG6X.jpg" },
  // T10
  { id: 550, title: "Fight Club", release_year: 1999, director_id: 7467, poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
  { id: 807, title: "Se7en", release_year: 1995, director_id: 7467, poster_path: "/6yogJs1j2nK9ncrj3wvjCuSfSj.jpg" },
  { id: 500, title: "Reservoir Dogs", release_year: 1992, director_id: 138, poster_path: "/2LqaL2t1hYn5liA0TzS22Gk2e6p.jpg" },
  // T11
  { id: 496243, title: "Parasite", release_year: 2019, director_id: 21684, poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
  { id: 670, title: "Oldboy", release_year: 2003, director_id: 9035, poster_path: "/3fVoE2i7pD292uhb3p5yvzt85s.jpg" },
  { id: 705996, title: "Decision to Leave", release_year: 2022, director_id: 9035, poster_path: "/v28T3P5a0y3l3iC5n8v7bce1f3.jpg" },
  { id: 398818, title: "Shoplifters", release_year: 2018, director_id: 6883, poster_path: "/r16nQ2kHh2aBko5eQotnoDWf5u.jpg" },
  // T12
  { id: 311, title: "Unforgiven", release_year: 1992, director_id: 190, poster_path: "/5gdV3n2o9h2Gj5iC2I2D3i72l4v.jpg" },
  { id: 11324, title: "No Country for Old Men", release_year: 2007, director_id: 1223, poster_path: "/6dO1m3DSH305fIYIuN2a52LzFeH.jpg" },
  { id: 44264, title: "True Grit", release_year: 2010, director_id: 1223, poster_path: "/i8yHGA6hPfmA4a1w4w9f1vY3bNx.jpg" },
  { id: 3114, title: "The Searchers", release_year: 1956, director_id: 3636, poster_path: "/2VprCoN4nQ2y1bMOdYQz4na4Wq.jpg" },
];

export const templates = [
  { id: 1, title: "Modern Sci-Fi Architects", movieIds: [157336, 438631, 335984, 62] },
  { id: 2, title: "The Crime & Grit Era", movieIds: [103, 680, 769, 106646] },
  { id: 3, title: "Foundations of Suspense", movieIds: [426, 567, 527, 213] },
  { id: 4, title: "Animation & Whimsy", movieIds: [129, 128, 508883, 30031] },
  { id: 5, title: "Modern Indie Perspectives", movieIds: [391713, 447332, 120467, 792307] },
  { id: 6, title: "High-Concept Horror", movieIds: [420617, 419430, 530385, 603] },
  { id: 7, title: "The 70s Auteur Revolution", movieIds: [238, 28, 935, 103] },
  { id: 8, title: "Action & Pop-Culture", movieIds: [76341, 245891, 118340, 155] },
  { id: 9, title: "Historical & War Epics", movieIds: [424, 857, 530915, 872585] },
  { id: 10, title: "90s Cult Phenomenon", movieIds: [550, 807, 603, 500] },
  { id: 11, title: "International Auteurs", movieIds: [496243, 670, 705996, 398818] },
  { id: 12, title: "Western & Americana", movieIds: [311, 11324, 44264, 3114] },
];

export const users = [
  { id: 1, username: "Elena Vance", email: "elena@test.com" },
  { id: 2, username: "Marcus Thorne", email: "marcus@test.com" },
  { id: 3, username: "Hana Sato", email: "hana@test.com" },
  { id: 4, username: "Julian Sterling", email: "julian@test.com" },
  { id: 5, username: "Chloe Miller", email: "chloe@test.com" },
  { id: 6, username: "Silas Vane", email: "silas@test.com" },
  { id: 7, username: "Riley Becker", email: "riley@test.com" },
  { id: 8, username: "Dr. Aris Thorne", email: "aris@test.com" },
  { id: 9, username: "Sarah Connor", email: "sarah@test.com" },
  { id: 10, username: "Leo Morales", email: "leo@test.com" },
  { id: 11, username: "Beatrice Quinn", email: "beatrice@test.com" },
  { id: 12, username: "Felix Kim", email: "felix@test.com" },
];

export const rankings = [
  // Elena Vance
  { userId: 1, templateId: 1, rankedItems: [{ movieId: 157336, tier: 0 }, { movieId: 438631, tier: 1 }, { movieId: 335984, tier: 1 }, { movieId: 62, tier: 5 }] },
  { userId: 1, templateId: 5, rankedItems: [{ movieId: 391713, tier: 0 }, { movieId: 447332, tier: 1 }, { movieId: 120467, tier: 1 }, { movieId: 792307, tier: 2 }] },
  // Marcus Thorne
  { userId: 2, templateId: 2, rankedItems: [{ movieId: 103, tier: 0 }, { movieId: 680, tier: 0 }, { movieId: 769, tier: 0 }, { movieId: 106646, tier: 1 }] },
  { userId: 2, templateId: 10, rankedItems: [{ movieId: 550, tier: 0 }, { movieId: 807, tier: 1 }, { movieId: 603, tier: 1 }, { movieId: 500, tier: 0 }] },
  // Hana Sato
  { userId: 3, templateId: 4, rankedItems: [{ movieId: 129, tier: 0 }, { movieId: 128, tier: 0 }, { movieId: 508883, tier: 0 }, { movieId: 30031, tier: 1 }] },
  { userId: 3, templateId: 11, rankedItems: [{ movieId: 496243, tier: 0 }, { movieId: 670, tier: 0 }, { movieId: 705996, tier: 1 }, { movieId: 398818, tier: 1 }] },
  // Julian Sterling
  { userId: 4, templateId: 3, rankedItems: [{ movieId: 426, tier: 0 }, { movieId: 567, tier: 0 }, { movieId: 527, tier: 0 }, { movieId: 213, tier: 1 }] },
  { userId: 4, templateId: 7, rankedItems: [{ movieId: 238, tier: 0 }, { movieId: 28, tier: 0 }, { movieId: 935, tier: 1 }, { movieId: 103, tier: 1 }] },
  // Chloe Miller
  { userId: 5, templateId: 5, rankedItems: [{ movieId: 120467, tier: 0 }, { movieId: 447332, tier: 0 }, { movieId: 391713, tier: 1 }, { movieId: 792307, tier: 1 }] },
  { userId: 5, templateId: 4, rankedItems: [{ movieId: 129, tier: 0 }, { movieId: 30031, tier: 0 }, { movieId: 508883, tier: 2 }] },
  // Silas Vane
  { userId: 6, templateId: 6, rankedItems: [{ movieId: 420617, tier: 0 }, { movieId: 419430, tier: 0 }, { movieId: 530385, tier: 1 }, { movieId: 603, tier: 1 }] },
  { userId: 6, templateId: 10, rankedItems: [{ movieId: 807, tier: 0 }, { movieId: 550, tier: 2 }, { movieId: 603, tier: 2 }] },
  // Riley Becker
  { userId: 7, templateId: 8, rankedItems: [{ movieId: 76341, tier: 0 }, { movieId: 245891, tier: 0 }, { movieId: 118340, tier: 1 }, { movieId: 155, tier: 1 }] },
  { userId: 7, templateId: 1, rankedItems: [{ movieId: 438631, tier: 0 }, { movieId: 157336, tier: 1 }, { movieId: 335984, tier: 2 }] },
  // Dr. Aris Thorne
  { userId: 8, templateId: 9, rankedItems: [{ movieId: 424, tier: 0 }, { movieId: 857, tier: 0 }, { movieId: 530915, tier: 1 }, { movieId: 872585, tier: 1 }] },
  { userId: 8, templateId: 7, rankedItems: [{ movieId: 238, tier: 0 }, { movieId: 28, tier: 0 }, { movieId: 935, tier: 1 }] },
  // Sarah Connor
  { userId: 9, templateId: 10, rankedItems: [{ movieId: 603, tier: 0 }, { movieId: 550, tier: 0 }, { movieId: 500, tier: 1 }] },
  { userId: 9, templateId: 8, rankedItems: [{ movieId: 76341, tier: 0 }, { movieId: 155, tier: 1 }, { movieId: 245891, tier: 1 }] },
  // Leo Morales
  { userId: 10, templateId: 12, rankedItems: [{ movieId: 311, tier: 0 }, { movieId: 11324, tier: 0 }, { movieId: 44264, tier: 1 }, { movieId: 3114, tier: 2 }] },
  { userId: 10, templateId: 2, rankedItems: [{ movieId: 106646, tier: 0 }, { movieId: 103, tier: 1 }, { movieId: 680, tier: 3 }] },
  // Beatrice Quinn
  { userId: 11, templateId: 11, rankedItems: [{ movieId: 705996, tier: 0 }, { movieId: 670, tier: 0 }, { movieId: 496243, tier: 1 }] },
  { userId: 11, templateId: 3, rankedItems: [{ movieId: 426, tier: 0 }, { movieId: 527, tier: 1 }, { movieId: 567, tier: 1 }] },
  // Felix Kim
  { userId: 12, templateId: 1, rankedItems: [{ movieId: 335984, tier: 0 }, { movieId: 157336, tier: 1 }, { movieId: 438631, tier: 0 }, { movieId: 62, tier: 1 }] },
  { userId: 12, templateId: 6, rankedItems: [{ movieId: 603, tier: 0 }, { movieId: 420617, tier: 2 }] },
];
