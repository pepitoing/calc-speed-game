# ⚡ Calc Speed Challenge

A mobile-friendly calculation speed game built for SSC & Banking aspirants.

Boost your mental math speed with a fun, level-based game that includes mixed questions, streak bonuses, a circular timer, and a global leaderboard.

---

## 🚀 Features

- Level-based gameplay (Levels 1–10)
- Mixed math questions (Addition, Subtraction, Multiplication, Division, Squares)
- 15-second timer per question
- Circular countdown timer
- Streak & speed bonus system
- Auto next-level progression
- Level-wise points system
- Dashboard with total points
- Level map with locked levels
- Global leaderboard
- Sound effects
- Mobile numeric keypad support
- Resume progress using localStorage

---

## 🛠 Tech Stack

- **Backend:** Flask (Python)
- **Frontend:** HTML + Tailwind CSS + Vanilla JavaScript
- **Database:** JSON file (`data/leaderboard.json`)
- **Deployment:** Render

---

## 📦 Local Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/surajsri23/calc-speed-game.git
cd calc-speed-game
````

---

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / Mac**

```bash
source venv/bin/activate
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Run the App Locally

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000
```

---

## 🌐 Deployment on Render

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/surajsri23/calc-speed-game.git
git push -u origin main
```

---

### Step 2: Create Render Web Service

1. Go to [https://render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting       | Value                             |
| ------------- | --------------------------------- |
| Runtime       | Python                            |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app`                |

---

### Step 3: Deploy 🎉

Render will build and deploy your app.
After deployment, you will get a public URL.
Share it with users.

---

## 📁 Project Structure

```
calc-speed-game/
│
├── app.py
├── requirements.txt
├── README.md
│
├── api/
│   ├── __init__.py
│   └── routes.py
│
├── game/
│   ├── __init__.py
│   ├── levels.py
│   ├── question_generator.py
│   └── scoring.py
│
├── data/
│   └── leaderboard.json
│
├── templates/
│   └── index.html
│
└── static/
    ├── js/
    │   └── app.js
    └── sounds/
        ├── correct.mp3
        └── wrong.mp3
```

---

## 🔒 Notes

* Leaderboard data is stored in `data/leaderboard.json`
* This project uses localStorage for user progress
* Render free tier may reset the filesystem occasionally
* Suitable for MVP / demo use
* No authentication system implemented

---

## 📈 Future Enhancements

* Daily challenge mode
* Progressive Web App (PWA) install
* Real database (PostgreSQL / MongoDB)
* User login system
* Ads / premium mode
* Topic-wise practice mode

---

## 👨‍💻 Author

**Suraj Srivastav**
Built for SSC & Banking aspirants

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub and share it with friends preparing for competitive exams!





