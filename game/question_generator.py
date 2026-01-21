import random

def generate_question(level):
    if level <= 2:
        a, b = random.randint(1,20), random.randint(1,20)
        return {"question": f"{a} + {b}", "answer": a + b}

    if level <= 5:
        a, b = random.randint(10,99), random.randint(10,99)
        return random.choice([
            {"question": f"{a} + {b}", "answer": a + b},
            {"question": f"{a} - {b}", "answer": a - b}
        ])

    if level <= 10:
        a, b = random.randint(2,20), random.randint(5,50)
        return random.choice([
            {"question": f"{a} × {b}", "answer": a * b},
            {"question": f"{a} + {b}", "answer": a + b}
        ])

    if level <= 20:
        a = random.randint(10,99)
        return {"question": f"{a}% of 200", "answer": int(a*2)}

    if level <= 30:
        a = random.randint(10,30)
        return {"question": f"{a}²", "answer": a*a}

    # Hard mixed
    a, b, c = random.randint(5,20), random.randint(5,20), random.randint(2,10)
    ans = a + b * c
    return {"question": f"{a} + {b} × {c}", "answer": ans}
