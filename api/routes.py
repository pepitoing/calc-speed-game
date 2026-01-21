import json, os, datetime, random
from flask import Blueprint, request, jsonify
from game.question_generator import generate_question

api = Blueprint("api", __name__)

DATA_FILE = "data/leaderboard.json"
DAILY_FILE = "data/daily.json"

def load(file):
    if not os.path.exists(file):
        return []
    try:
        with open(file, "r") as f:
            return json.load(f)
    except:
        return []

def save(file, data):
    os.makedirs(os.path.dirname(file), exist_ok=True)
    with open(file, "w") as f:
        json.dump(data, f, indent=2)

@api.route("/start")
def start():
    level = int(request.args.get("level", 1))
    qs = [generate_question(level) for _ in range(20)]
    return jsonify({
        "questions": [{"question": q["question"]} for q in qs],
        "answers": [q["answer"] for q in qs]
    })

@api.route("/save_score", methods=["POST"])
def save_score():
    data = request.json
    board = load(DATA_FILE)

    board = [u for u in board if u["username"] != data["username"]]
    board.append(data)

    board = sorted(board, key=lambda x: x["totalScore"], reverse=True)[:50]
    save(DATA_FILE, board)

    return jsonify({"ok": True})

@api.route("/leaderboard")
def leaderboard():
    return jsonify(load(DATA_FILE))

# DAILY QUIZ

@api.route("/daily")
def daily():
    today = str(datetime.date.today())
    data = load(DAILY_FILE)

    if not data or data[0]["date"] != today:
        qs = [generate_question(random.randint(5,15)) for _ in range(10)]
        data = [{
            "date": today,
            "questions": qs,
            "scores": []
        }]
        save(DAILY_FILE, data)

    qs = data[0]["questions"]
    return jsonify({
        "questions": [{"question": q["question"]} for q in qs],
        "answers": [q["answer"] for q in qs]
    })

@api.route("/save_daily", methods=["POST"])
def save_daily():
    payload = request.json
    data = load(DAILY_FILE)

    data[0]["scores"].append(payload)
    save(DAILY_FILE, data)

    return jsonify({"ok": True})
