# MTG Notebook
## CS5610 Project 2 MTG Notebook

The MTG Notebook is built with **Node**, **Express**, **MongoDB**, and a lightweight **HTML/JS frontend**.
MTG Notebook is a web app with the goal of helping MtG players find cards and manage their MtG inventory all in one place. It has full details on each card, a robust search, and easy ways to find cards that are legal in the Commander game format.
Users are also able to signup with the website in order to track cards they own into a central inventory list.
The live production link is [here](https://mtg-notebook.vercel.app/).
It dumps Scryfall MtG card data and inserts it into our database, lets users manage their collections, supports full CRUD operations on cards and inventory, and allows signup and signin to manage personal profiles.

### Authors
[Tim Yim](https://github.com/airyimbin/) and [Rudra Vaghani](https://github.com/Rudra072)

### Note for Grader
Had to remove commits because of secrets being leaked, so commits will not show full story.
Instead each file will have the name of the person who worked on it at the top.

Explained to professor here [https://webdev-online-neu.slack.com/archives/C09D5UFRT2R/p1760127545626929?thread_ts=1760126253.337449&cid=C09D5UFRT2R](https://webdev-online-neu.slack.com/archives/C09D5UFRT2R/p1760127545626929?thread_ts=1760126253.337449&cid=C09D5UFRT2R)

### Class Link
Created for [CS5610](https://johnguerra.co/classes/webDevelopment_online_fall_2025/) taught by [John Alexis Guerra Gómez](https://johnguerra.co)

## Site Link
[https://mtg-notebook.vercel.app/](https://mtg-notebook.vercel.app/)



## CRUD Operations
CRUD operations:

Tim:

Create all the cards into db with data dumped from master card list json. Create new users with full signup and sign in. Read all the cards onto the main page and implement search for specific cards with multiple filter criteria. Delete users if they wish to delete their profile.

Rudra:

Create inventory list for each user. Read all the cards users own. Click on any card in inventory to reach an individual card page with full details of the card. Update by adding cards to inventory. Delete any cards from inventory that they no longer have.

## MongoDB Collections

<img width="2043" height="256" alt="Screenshot 2025-10-10 120624" src="https://github.com/user-attachments/assets/8081eaa7-447b-4c53-9968-cea06ef9af8d" />

---

## How to Build & Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/airyimbin/mtg-notebook.git
cd mtg-notebook
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
[Youtube](https://youtu.be/NN5Li61Nc04)
## Slides
[Slides](https://docs.google.com/presentation/d/1qJT4OouqPAMWhR_vDQ-RRRB99tmYaScfArgBmmAr6x4/edit?usp=sharing)
## Screenshots

<img width="2559" height="1461" alt="Screenshot 2025-10-10 121745" src="https://github.com/user-attachments/assets/ca20434f-cb81-4472-8c76-3b8d10efb574" />
<img width="2559" height="1467" alt="Screenshot 2025-10-10 121803" src="https://github.com/user-attachments/assets/9f6cc5f6-0413-4d6f-836a-2b4701f71336" />
<img width="2553" height="1456" alt="Screenshot 2025-10-10 183417" src="https://github.com/user-attachments/assets/cd31a78c-3649-4a6f-b8f0-77e324ea9308" />
<img width="2559" height="1462" alt="Screenshot 2025-10-10 121843" src="https://github.com/user-attachments/assets/5d4cce42-648e-4081-a89f-5f2a5926d2ec" />


