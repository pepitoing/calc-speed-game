from game.question_generator import generate, allowed_topics

# ======================================
# TIMER LOGIC (MONOTONIC INCREASE)
# ======================================
def time_for_level(level: int) -> int:
    if level <= 3:
        return 40
    if level <= 6:
        return 45
    if level <= 10:
        return 50
    if level <= 15:
        return 55
    return 60


# ======================================
# QUESTION COUNT RULES
# ======================================
def questions_for_mode(mode: str) -> int:
    if mode == "daily":
        return 10
    if mode == "mock":
        return 50
    return 20  # practice default


# ======================================
# PRACTICE / DAILY / MOCK GENERATOR
# ======================================
def generate_questions(level: int, qtype: str="mixed", mode: str="practice"):
    count = questions_for_mode(mode)

    questions = []
    answers = []
    topics = []

    for _ in range(count):
        q = generate(level, qtype)
        questions.append({"question": q["question"]})
        answers.append(q["answer"])
        topics.append(q["topic"])

    return {
        "questions": questions,
        "answers": answers,
        "topics": topics,
        "time": time_for_level(level)
    }
