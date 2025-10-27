INSTRUCTIONS FOR PLACING YOUR VERBS.JSON FILE
=============================================

Place your verbs.json file in this /public directory.

The file should be named exactly: verbs.json

Expected JSON structure:
[
  {
    "rank": 1,
    "verb": "ser",
    "translation": "to be (permanent)",
    "category": "er",
    "irregular": true,
    "examples": [
      "Eu sou de Portugal.",
      "Ele é médico.",
      "Nós somos amigos.",
      "Tu és inteligente.",
      "Elas são felizes."
    ]
  },
  {
    "rank": 2,
    "verb": "estar",
    "translation": "to be (temporary)",
    "category": "ar",
    "irregular": true,
    "examples": [
      "Como estás?",
      "Eu estou cansado.",
      "Eles estão em casa.",
      "Estamos bem.",
      "Ela está doente."
    ]
  }
  // ... continue for all 500 verbs
]

Each verb object must have:
- rank: number (1-500)
- verb: string (Portuguese infinitive)
- translation: string (English meaning)
- category: string ("ar", "er", or "ir")
- irregular: boolean (true or false)
- examples: array of 5 strings (Portuguese example sentences)

Once you place verbs.json here, run:
npm run dev

Then open http://localhost:3000
