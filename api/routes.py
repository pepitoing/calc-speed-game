# api/routes.py
from flask import Blueprint, jsonify, request
from datetime import date
import json
import os

# 🔥 NEW ARCHITECTURE IMPORT
from game.levels import generate_questions

api = Blueprint("api", __name__)

# ===============================
# PATH SETUP
# ===============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

LEADERBOARD_FILE = os.path.join(DATA_DIR, "leaderboard.json")
DAILY_FILE = os.path.join(DATA_DIR, "daily.json")


# ===============================
# JSON HELPERS (SAFE)
# ===============================
def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else default
    except:
        return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ===============================
# PRACTICE MODE
# ===============================
@api.route("/api/start")
def start_practice():
    level = int(request.args.get("level", 1))
    qtype = request.args.get("type", "mixed")

    payload = generate_questions(
        level=level,
        qtype=qtype,
        mode="practice"
    )
    return jsonify(payload)


# ===============================
# DAILY QUIZ (FIXED & ISOLATED)
# ===============================
@api.route("/api/daily")
def daily_quiz():
    today = str(date.today())
    data = load_json(DAILY_FILE, {})

    # If today's quiz already exists → reuse
    if data.get("date") == today:
        return jsonify(data)

    # Generate new daily quiz
    payload = generate_questions(
        level=7,          # moderate fixed difficulty
        qtype="mixed",
        mode="daily"
    )
    payload["date"] = today

    save_json(DAILY_FILE, payload)
    return jsonify(payload)


# ===============================
# MOCK EXAM (NEW)
# ===============================
@api.route("/api/mock")
def mock_exam():
    payload = generate_questions(
        level=12,         # higher difficulty
        qtype="mixed",
        mode="mock"
    )
    return jsonify(payload)


# ===============================
# SAVE SCORE (LEADERBOARD)
# ===============================
@api.route("/api/save_score", methods=["POST"])
def save_score():
    body = request.json
    username = body.get("username")
    totalScore = body.get("totalScore")
    highestLevel = body.get("level", 1)

    leaderboard = load_json(LEADERBOARD_FILE, {"users": []})
    users = leaderboard.get("users", [])

    found = False
    for u in users:
        if u["username"] == username:
            # Update ONLY if new score is higher
            if totalScore > u["totalScore"]:
                u["totalScore"] = totalScore
                u["highestLevel"] = max(u.get("highestLevel", 1), highestLevel)
            found = True
            break

    if not found:
        users.append({
            "username": username,
            "totalScore": totalScore,
            "highestLevel": highestLevel
        })

    # Sort & limit
    users = sorted(users, key=lambda x: x["totalScore"], reverse=True)[:50]
    leaderboard["users"] = users

    save_json(LEADERBOARD_FILE, leaderboard)
    return jsonify({"status": "ok"})


# ===============================
# LEADERBOARD FETCH
# ===============================
@api.route("/api/leaderboard")
def leaderboard():
    data = load_json(LEADERBOARD_FILE, {"users": []})
    return jsonify(data.get("users", []))
