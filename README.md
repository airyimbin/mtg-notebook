# mtg-deck-notebook
CS5610 Project 2 MTG Deck Notebook

The Gathering deck and inventory manager built with **Express**, **MongoDB**, and a lightweight **HTML/JS frontend**.  
It integrates with the **Scryfall API** to fetch real card data, lets users manage their collections, and supports full CRUD operations on cards and decks.

---

## How to Build & Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/airyimbin/mtg-deck-notebook.git
cd mtg-deck-notebook
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env file for backend
```bash
MONGODB_URI=mongourl
MONGODB_DBNAME=mtg_deck_notebook
PORT=3000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=secret
COOKIE_SECURE=false
MONGODB_SOCKET_TIMEOUT_MS=0
```

### 4. Configure the Frontend API Base
```bash
mtg-deck-notebook/
├── public/
│   ├── js/
│   │   ├── config.js
```

In config.js set api.base to "" (empty)

### 5. Run the Server
```bash
npm start
```
Then open http://localhost:3000
