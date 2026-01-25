# game/scoring.py

def practice_score(time_left: int, streak: int) -> int:
    base = 10
    speed = max(0, time_left)
    combo = streak * 2
    return base + speed + combo

def daily_score(time_left: int) -> int:
    return 10 + max(0, time_left)

def mock_score(time_left: int) -> int:
    # no streak bonus in mock
    return 10 + max(0, time_left)

def update_accuracy(stats: dict, topic: str, correct: bool):
    t = stats.setdefault(topic, {"correct":0,"wrong":0})
    if correct: t["correct"] += 1
    else: t["wrong"] += 1

def accuracy_percent(stats: dict, topic: str) -> int:
    t = stats.get(topic, {"correct":0,"wrong":0})
    total = t["correct"] + t["wrong"]
    return 0 if total==0 else int((t["correct"]/total)*100)
