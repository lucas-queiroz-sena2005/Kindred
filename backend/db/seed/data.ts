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

  { id: 59313, name: "Chad Stahelski" },
  { id: 3778, name: "Sam Mendes" },

  { id: 6883, name: "Hirokazu Kore-eda" },
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
