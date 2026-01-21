// ================= USER DATA =================
let username = localStorage.getItem("username");
let unlockedLevel = parseInt(localStorage.getItem("unlockedLevel") || "1");
let totalPoints = parseInt(localStorage.getItem("totalPoints") || "0");

// ================= GAME STATE =================
let level = unlockedLevel;
let questions = [];
let answers = [];
let currentIndex = 0;
let score = 0;
let streak = 0;

let timeLeft = 0;
let timerInterval = null;
let dailyMode = false;

// ================= SOUNDS =================
const correctSound = new Audio("/static/sounds/correct.mp3");
const wrongSound   = new Audio("/static/sounds/wrong.mp3");
const levelSound   = new Audio("/static/sounds/level_pass.mp3");

correctSound.volume = 0.6;
wrongSound.volume = 0.7;
levelSound.volume = 0.8;

window.onload = () => {
  if (username) showDashboard();
};

// ================= UTILITIES =================

function hideAll() {
  ["username-screen","dashboard","level-map","game-screen",
   "game-over-screen","leaderboard-screen"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

function getPointsPerQuestion(level) {
  if (level <= 2) return 10;
  if (level <= 5) return 15;
  if (level <= 10) return 20;
  return 25;
}

function getTimeForLevel(level) {
  if (level <= 2) return 12;
  if (level <= 5) return 14;
  if (level <= 10) return 16;
  if (level <= 20) return 18;
  if (level <= 30) return 20;
  return 22;
}

// ================= DASHBOARD =================

function saveUsername() {
  const input = document.getElementById("username-input").value.trim();
  if (!input) return;

  username = input;
  localStorage.setItem("username", username);

  if (!localStorage.getItem("unlockedLevel")) {
    localStorage.setItem("unlockedLevel", "1");
    localStorage.setItem("totalPoints", "0");
  }

  unlockedLevel = parseInt(localStorage.getItem("unlockedLevel"));
  totalPoints = parseInt(localStorage.getItem("totalPoints"));

  showDashboard();
}

function showDashboard() {
  hideAll();
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("welcome-text").innerText = `Welcome, ${username}`;
  document.getElementById("total-points").innerText = totalPoints;
}

// ================= LEVEL MAP =================

function showLevelMap() {
  hideAll();
  const container = document.getElementById("levels-container");
  container.innerHTML = "";

  const maxVisible = unlockedLevel + 5;

  for (let i = 1; i <= maxVisible; i++) {
    const btn = document.createElement("button");

    if (i <= unlockedLevel) {
      btn.innerText = i;
      btn.className = "bg-green-500 p-3 rounded text-black hover:scale-105 transition";
      btn.onclick = () => startGame(i);
    } else {
      btn.innerText = "🔒";
      btn.className = "bg-slate-600 p-3 rounded opacity-60";
      btn.disabled = true;
    }

    container.appendChild(btn);
  }

  document.getElementById("level-map").classList.remove("hidden");
}

// ================= GAME START =================

function startGame(lvl = unlockedLevel) {
  dailyMode = false;
  level = lvl;

  fetch(`/api/start?level=${level}`)
    .then(res => res.json())
    .then(data => {
      questions = data.questions.map(q => q.question);
      answers = data.answers;

      currentIndex = 0;
      score = 0;
      streak = 0;

      hideAll();
      document.getElementById("game-screen").classList.remove("hidden");

      showQuestion();
    });
}

// ================= QUESTION FLOW =================

function showQuestion() {
  document.getElementById("level").innerText = `Level ${level}`;
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("streak").innerText =
    streak > 1 ? `🔥 Streak x${streak}` : "";

  const percent = ((currentIndex + 1) / questions.length) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";

  document.getElementById("question").innerText = questions[currentIndex];
  document.getElementById("answer").value = "";

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);

  const maxTime = getTimeForLevel(level);
  timeLeft = maxTime;

  updateCircle(maxTime);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateCircle(maxTime);

    if (timeLeft <= 0) {
      gameOver("⏱ Time up!");
    }
  }, 1000);
}

function updateCircle(maxTime) {
  const circle = document.getElementById("timer-circle");
  const circumference = 176;
  const offset = circumference - (timeLeft / maxTime) * circumference;
  circle.style.strokeDashoffset = offset;
}

// ================= ANSWER CHECK =================

function checkAnswer() {
  const input = document.getElementById("answer").value;
  if (!input) return;

  const userAnswer = parseInt(input);
  const correctAnswer = answers[currentIndex];

  if (userAnswer === correctAnswer) {

    // 🔊 ALWAYS PLAY CORRECT SOUND (NO LAG)
    correctSound.currentTime = 0;
    correctSound.play();

    streak++;

    const base = getPointsPerQuestion(level);
    score += base + timeLeft + streak * 2;

    currentIndex++;

    if (currentIndex >= questions.length) {
      levelComplete();
    } else {
      showQuestion();
    }
  }
}

// ================= LEVEL COMPLETE =================

function levelComplete() {
  clearInterval(timerInterval);

  // 🎉 LEVEL PASS SOUND
  levelSound.currentTime = 0;
  levelSound.play();

  // 🎊 SHOW CONGRATS ANIMATION (NON-BLOCKING)
  showCongrats();

  totalPoints += score;
  localStorage.setItem("totalPoints", totalPoints);

  if (level === unlockedLevel) {
    unlockedLevel++;
    localStorage.setItem("unlockedLevel", unlockedLevel);
  }

  fetch("/api/save_score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username,
      totalScore: totalPoints,
      level: unlockedLevel
    })
  });

  setTimeout(() => {
    level++;
    startGame(level);
  }, 1400);
}

// ================= CONGRATS ANIMATION =================

function showCongrats() {
  const box = document.createElement("div");
  box.innerHTML = `
    <div style="
      position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,0.3); z-index:50;">
      <div style="
        background:white; color:black; padding:30px 50px; border-radius:20px;
        font-size:28px; font-weight:bold; animation: pop 0.6s ease;">
        🎉 Level Passed!
      </div>
    </div>
  `;

  document.body.appendChild(box);

  setTimeout(() => {
    box.remove();
  }, 900);
}

// ================= GAME OVER =================

function gameOver(reason) {
  clearInterval(timerInterval);
  wrongSound.currentTime = 0;
  wrongSound.play();

  hideAll();
  document.getElementById("game-over-screen").classList.remove("hidden");

  document.getElementById("final-score").innerText =
    `${reason}\nCorrect Answer: ${answers[currentIndex]}\nScore: ${score}`;
}

// ================= QUIT GAME =================

function quitGame() {
  clearInterval(timerInterval);
  showDashboard();
}

// ================= LEADERBOARD =================

function showLeaderboard() {
  hideAll();

  fetch("/api/leaderboard")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("leaderboard-list");
      list.innerHTML = "";

      data.forEach((u, index) => {
        const li = document.createElement("li");
        li.innerText = `${index + 1}. ${u.username} — ${u.totalScore} pts`;
        list.appendChild(li);
      });

      document.getElementById("leaderboard-screen").classList.remove("hidden");
    });
}

// ================= NAVIGATION =================

function goDashboard() {
  hideAll();
  showDashboard();
}
