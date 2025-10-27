# Portuguese Verbs - Top 500 by Frequency

A Next.js 14+ application for learning the top 500 European Portuguese verbs by frequency.

## Features

- 🎯 Top 500 verbs ranked by frequency
- 🎨 Color-coded by verb category (-ar, -er, -ir)
- ⭐ Irregular verb markers
- 🔊 European Portuguese text-to-speech (pt-PT)
- 🔍 Real-time search (Portuguese & English)
- 🎛️ Filter by category or irregular status
- 🌙 Dark mode support
- 📱 Mobile responsive
- 💡 Expandable example sentences

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Add Your Verbs Data

Place your `verbs.json` file in the `/public` directory:

```
public/
└── verbs.json    ← Your 500 verbs here
```

### Expected JSON Structure

```json
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
  }
  // ... 499 more verbs
]
```

### 3. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Web Speech API** - Text-to-speech for European Portuguese

## Project Structure

```
portuguese-verbs/
├── app/
│   ├── page.js          # Main application page
│   ├── layout.js        # Root layout
│   └── globals.css      # Global styles
├── public/
│   ├── verbs.json       # Your verb data (you provide this)
│   └── README.txt       # Instructions
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## License

MIT
