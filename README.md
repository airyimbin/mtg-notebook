### Authors
[Tim Yim](https://github.com/airyimbin/) and [Rudra](https://github.com/Rudra072)

### Class Link
Created for [CS5610](https://johnguerra.co/classes/webDevelopment_online_fall_2025/) taught by [John Alexis Guerra Gómez](https://johnguerra.co)

## Site Link
[https://mtg-notebook.vercel.app/](https://mtg-notebook.vercel.app/)

## CS5610 Project 2 MTG Notebook

The MTG Notebook is built with **Node**, **Express**, **MongoDB**, and a lightweight **HTML/JS frontend**.
MTG Notebook is a web app with the goal of helping MtG players find cards and manage their MtG inventory all in one place. It has full details on each card, a robust search, and easy ways to find cards that are legal in the Commander game format.
Users are also able to signup with the website in order to track cards they own into a central inventory list.
The live production link is [here](https://mtg-deck-notebook.vercel.app/).
It dumps Scryfall MtG card data and inserts it into our database, lets users manage their collections, supports full CRUD operations on cards and inventory, and allows signup and signin to manage personal profiles.

## CRUD Operations
CRUD operations:

Tim:

Create all the cards into db with data dumped from master card list json. Create new users with full signup and sign in. Read all the cards onto the main page and implement search for specific cards with multiple filter criteria. Delete users if they wish to delete their profile.

Rudra:

Create inventory list for each user. Read all the cards users own. Click on any card in inventory to reach an individual card page with full details of the card. Update by adding cards to inventory. Delete any cards from inventory that they no longer have.

## MongoDB Collections
<img width="2043" height="256" alt="Screenshot 2025-10-10 120624" src="https://github.com/user-attachments/assets/33142fcd-7b2a-4cf8-a4b4-4244529ef232" />

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

---

## Design Document
[Document](https://docs.google.com/document/d/1xwS8EaBsdJiyRUbLaA9yJb9xZ5Puq1CjsSjt_Ekbazg/edit?usp=sharing)
## Video Introduction
Youtube
## Slides
[Slides](https://docs.google.com/presentation/d/1qJT4OouqPAMWhR_vDQ-RRRB99tmYaScfArgBmmAr6x4/edit?usp=sharing)
## Screenshots
<img width="2559" height="1461" alt="Screenshot 2025-10-10 121745" src="https://github.com/user-attachments/assets/56cc72cc-9390-4dd4-9130-10c82bd27884" />
<img width="2559" height="1467" alt="Screenshot 2025-10-10 121803" src="https://github.com/user-attachments/assets/139b4472-0501-4bcb-8f08-28e8013fd77e" />
<img width="2559" height="1459" alt="Screenshot 2025-10-10 121828" src="https://github.com/user-attachments/assets/49f27602-cf06-49ce-85dd-5b2e611a9b3a" />
<img width="2559" height="1462" alt="Screenshot 2025-10-10 121843" src="https://github.com/user-attachments/assets/21d21d37-8def-497f-afa2-46e0d7f0425e" />



