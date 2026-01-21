from flask import Blueprint, jsonify, request
import random
import json
import os
from datetime import date

api = Blueprint("api", __name__)

LEADERBOARD_FILE = "leaderboard.json"
DAILY_FILE = "daily_quiz.json"


# ================= LEADERBOARD HELPERS =================

def load_leaderboard():
    if not os.path.exists(LEADERBOARD_FILE):
        return []
    try:
        with open(LEADERBOARD_FILE, "r") as f:
            return json.load(f)
    except:
        return []


def save_leaderboard(data):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ================= QUESTION GENERATOR =================

def generate_question(level):
    if level <= 3:
        a = random.randint(5, 99)
        b = random.randint(5, 99)
        op = random.choice(["+", "-"])
    elif level <= 7:
        a = random.randint(10, 99)
        b = random.randint(10, 99)
        op = random.choice(["+", "-", "*"])
    else:
        a = random.randint(10, 99)
        b = random.randint(2, 20)
        op = random.choice(["+", "-", "*"])

    question = f"{a} {op} {b}"
    answer = eval(question)

    return {"question": question}, answer


# ================= NORMAL LEVEL MODE =================

@api.route("/api/start")
def start_level():
    level = int(request.args.get("level", 1))

    questions = []
    answers = []

    for _ in range(20):
        q, a = generate_question(level)
        questions.append(q)
        answers.append(a)

    return jsonify({
        "questions": questions,
        "answers": answers
    })


# ================= DAILY QUIZ MODE =================

@api.route("/api/daily")
def daily_quiz():
    today = str(date.today())

    # If today's quiz already generated → reuse
    if os.path.exists(DAILY_FILE):
        try:
            with open(DAILY_FILE, "r") as f:
                data = json.load(f)
                if data.get("date") == today:
                    return jsonify({
                        "questions": data["questions"],
                        "answers": data["answers"]
                    })
        except:
            pass

    # Generate new daily quiz (10 questions, mixed medium level)
    questions = []
    answers = []

    for _ in range(10):
        q, a = generate_question(5)  # medium difficulty
        questions.append(q)
        answers.append(a)

    data = {
        "date": today,
        "questions": questions,
        "answers": answers
    }

    with open(DAILY_FILE, "w") as f:
        json.dump(data, f, indent=2)

    return jsonify({
        "questions": questions,
        "answers": answers
    })


# ================= SAVE SCORE =================

@api.route("/api/save_score", methods=["POST"])
def save_score():
    data = request.json
    username = data.get("username")
    totalScore = data.get("totalScore")
    level = data.get("level")

    leaderboard = load_leaderboard()

    found = False
    for user in leaderboard:
        if user["username"] == username:
            if totalScore > user["totalScore"]:
                user["totalScore"] = totalScore
                user["level"] = level
            found = True
            break

    if not found:
        leaderboard.append({
            "username": username,
            "totalScore": totalScore,
            "level": level
        })

    leaderboard = sorted(leaderboard, key=lambda x: x["totalScore"], reverse=True)[:50]

    save_leaderboard(leaderboard)

    return jsonify({"status": "ok"})


# ================= LEADERBOARD =================

@api.route("/api/leaderboard")
def leaderboard():
    return jsonify(load_leaderboard())
