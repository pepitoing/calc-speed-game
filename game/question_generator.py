# game/question_generator.py
import random
from collections import deque
from typing import Dict, Tuple

# Keep recent questions per topic to reduce repetition (runtime only)
RECENT = {
    "add": deque(maxlen=15),
    "sub": deque(maxlen=15),
    "mul": deque(maxlen=15),
    "div": deque(maxlen=15),
    "square": deque(maxlen=15),
    "cube": deque(maxlen=15),
    "percent": deque(maxlen=15),
    "bodmas": deque(maxlen=15),
}

def _remember(topic: str, q: str) -> bool:
    """Return True if question is new for topic; remember it."""
    if q in RECENT[topic]:
        return False
    RECENT[topic].append(q)
    return True


# ---------- Range helpers ----------
def rng(level: int, low: Tuple[int,int], mid: Tuple[int,int], high: Tuple[int,int]) -> int:
    if level <= 3:
        return random.randint(*low)
    elif level <= 7:
        return random.randint(*mid)
    else:
        return random.randint(*high)


# ---------- Topic generators ----------
def add(level):
    a = rng(level, (5,40), (30,150), (100,999))
    b = rng(level, (5,40), (30,150), (100,999))
    return f"{a} + {b}", a+b

def sub(level):
    a = rng(level, (20,80), (80,300), (300,999))
    b = rng(level, (5,40), (40,150), (150,500))
    if b>a: a,b=b,a
    return f"{a} - {b}", a-b

def mul(level):
    if level <= 5:
        a,b = random.randint(2,9), random.randint(2,9)
    elif level <= 10:
        a,b = random.randint(5,20), random.randint(5,20)
    else:
        a,b = random.randint(11,99), random.randint(11,99)
    return f"{a} × {b}", a*b

def div(level):
    b = random.randint(2,9 if level<=5 else 25)
    a = b * random.randint(2,20)
    return f"{a} ÷ {b}", a//b

def square(level):
    if level<=3: a=random.randint(5,15)
    elif level<=6: a=random.randint(10,30)
    elif level<=10: a=random.randint(20,50)
    elif level<=15: a=random.randint(35,75)
    else: a=random.randint(50,120)
    return f"{a}²", a*a

def cube(level):
    if level<=5: a=random.randint(2,6)
    elif level<=10: a=random.randint(3,9)
    elif level<=15: a=random.randint(4,12)
    else: a=random.randint(6,15)
    return f"{a}³", a**3

def percent(level):
    base = random.choice([100,200,400,500,1000])
    if level<=5: p=random.randint(5,30)
    elif level<=10: p=random.randint(10,60)
    else: p=random.randint(15,95)
    return f"{p}% of {base}", (p*base)//100

def bodmas(level):
    a = rng(level, (5,20), (20,60), (50,120))
    b = rng(level, (5,15), (10,30), (20,60))
    c = random.randint(2,10)
    return f"{a} + {b} × {c}", a + b*c


TOPICS = {
    "add": add,
    "sub": sub,
    "mul": mul,
    "div": div,
    "square": square,
    "cube": cube,
    "percent": percent,
    "bodmas": bodmas,
}

def allowed_topics(level: int):
    if level<=3: return ["add","sub"]
    if level<=6: return ["add","sub","mul"]
    if level<=10: return ["add","sub","mul","div","square","percent"]
    return list(TOPICS.keys())


def generate(level: int, qtype: str="mixed") -> Dict[str,int]:
    attempts = 0
    while attempts < 10:
        topic = random.choice(allowed_topics(level)) if qtype=="mixed" else qtype
        q, a = TOPICS[topic](level)
        if _remember(topic, q):
            return {"topic": topic, "question": q, "answer": a}
        attempts += 1
    # fallback
    return {"topic": topic, "question": q, "answer": a}
