/* =========================
   USER & STORAGE
========================= */
let username = localStorage.getItem("username");
let totalPoints = parseInt(localStorage.getItem("totalPoints") || "0");

let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "{}");
let accuracyStats = JSON.parse(localStorage.getItem("accuracyStats") || "{}");

/* =========================
   GAME STATE (ISOLATED)
========================= */
let questions = [], answers = [], topics = [];
let idx = 0, score = 0;
let timeLeft = 0, timer = null;

let currentLevel = 1;          // 🔥 topic-wise level
let selectedTopic = "mixed";
let daily = false, mock = false;

/* =========================
   SOUNDS
========================= */
const sounds = {
  correct: new Audio("/static/sounds/correct.mp3"),
  wrong: new Audio("/static/sounds/wrong.mp3"),
  level: new Audio("/static/sounds/level_pass.mp3")
};

function playSound(name){
  const s = sounds[name];
  if(!s) return;
  s.pause(); s.currentTime = 0; s.play();
}

/* =========================
   UI HELPERS
========================= */
function hideAll(){
  [
    "username-screen","dashboard","topic-selector",
    "level-map","game-screen","game-over-screen",
    "leaderboard-screen"
  ].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.classList.add("hidden");
  });
}
function clearTimer(){
  if(timer){ clearInterval(timer); timer=null; }
}

/* =========================
   INIT
========================= */
window.onload = ()=>{
  if(!username){
    document.getElementById("username-screen").classList.remove("hidden");
  } else {
    showDashboard();
  }
};

/* =========================
   DASHBOARD + ANALYTICS
========================= */
function showDashboard(){
  clearTimer();
  hideAll();
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("welcome-text").innerText = `Welcome, ${username}`;
  document.getElementById("total-points").innerText = totalPoints;
  renderAnalytics(); // 🔥 ALWAYS refresh
}

function renderAnalytics(){
  let best=null, worst=null;
  for(let t in accuracyStats){
    const a = accuracyStats[t];
    const acc = a.c / (a.c + a.w || 1);
    if(!best || acc > best.v) best = {t,v:acc};
    if(!worst || acc < worst.v) worst = {t,v:acc};
  }
  document.getElementById("strong-topic").innerText = best ? best.t : "—";
  document.getElementById("weak-topic").innerText   = worst ? worst.t : "—";
}

/* =========================
   USERNAME
========================= */
function saveUsername(){
  const v = document.getElementById("username-input").value.trim();
  if(!v) return;
  username = v;
  localStorage.setItem("username", username);
  showDashboard();
}
function goDashboard(){
  showDashboard();
}

/* =========================
   TOPIC + LEVEL
========================= */
function showTopicSelector(){
  hideAll();
  document.querySelectorAll(".topic-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("topic-selector").classList.remove("hidden");
}

function selectTopic(t){
  selectedTopic = t;
  document.querySelectorAll(".topic-btn").forEach(b=>b.classList.remove("active"));
  event.target.classList.add("active");
}

function showLevelMap(){
  hideAll();
  const box = document.getElementById("levels-container");
  box.innerHTML = "";

  const max = unlockedLevels[selectedTopic] || 1;
  for(let i=1;i<=max+1;i++){   // 🔥 unlimited growth
    const b = document.createElement("button");
    if(i<=max){
      b.innerText = i;
      b.className = "bg-emerald-500 p-3 rounded-lg text-black";
      b.onclick = ()=>startPractice(i);
    } else {
      b.innerText = "🔒";
      b.disabled = true;
      b.className = "bg-slate-700 p-3 rounded-lg";
    }
    box.appendChild(b);
  }
  document.getElementById("level-map").classList.remove("hidden");
}

/* =========================
   GAME STARTERS
========================= */
function startPractice(lvl){
  currentLevel = lvl;         // 🔥 isolate per topic
  daily=false; mock=false;
  fetch(`/api/start?level=${lvl}&type=${selectedTopic}`)
    .then(r=>r.json()).then(startGame);
}
function startDailyQuiz(){
  daily=true; mock=false;
  fetch("/api/daily").then(r=>r.json()).then(startGame);
}
function startMockExam(){
  mock=true; daily=false;
  fetch("/api/mock").then(r=>r.json()).then(startGame);
}

/* =========================
   TIMER (QUESTION BASED ONLY)
========================= */
function getTimeForQuestion(q){
  if(mock || daily) return 30;
  if(q.includes("×")||q.includes("*")) return q.length>5 ? 35 : 25;
  if(q.includes("÷")||q.includes("/")) return 35;
  if(q.includes("%")) return 35;
  if(q.includes("^")) return 30;
  if(q.length <= 5) return 15;
  return 20;
}

/* =========================
   GAME CORE
========================= */
function startGame(data){
  questions = data.questions.map(q=>q.question);
  answers = data.answers;
  topics = data.topics;

  idx = 0; score = 0;

  hideAll();
  document.getElementById("game-screen").classList.remove("hidden");
  document.getElementById("topic-label").innerText =
    `Topic: ${selectedTopic.toUpperCase()}`;
  document.getElementById("mode-label").innerText =
    mock ? "Mock Exam" : daily ? "Daily Quiz" : `Level ${currentLevel}`;

  showQuestion();
}

function showQuestion(){
  clearTimer();
  document.getElementById("question").innerText = questions[idx];
  document.getElementById("score").innerText = `Score: ${score}`;

  const ans = document.getElementById("answer");
  ans.value=""; ans.focus();

  timeLeft = getTimeForQuestion(questions[idx]);
  document.getElementById("timer-text").innerText = timeLeft;

  timer = setInterval(()=>{
    timeLeft--;
    document.getElementById("timer-text").innerText = timeLeft;
    if(timeLeft<=0){
      clearTimer();
      playSound("wrong");
      showCorrectThenEnd();
    }
  },1000);
}

/* =========================
   ANSWER CHECK
========================= */
function checkAnswer(){
  const v = document.getElementById("answer").value;
  if(parseInt(v) === answers[idx]){
    playSound("correct");
    score += 10 + timeLeft;

    const t = topics[idx];
    accuracyStats[t] = accuracyStats[t] || {c:0,w:0};
    accuracyStats[t].c++;
    localStorage.setItem("accuracyStats", JSON.stringify(accuracyStats));

    idx++;
    if(idx >= questions.length){
      onLevelComplete();
    } else {
      showQuestion();
    }
  }
}

/* =========================
   TIMEOUT FEEDBACK
========================= */
function showCorrectThenEnd(){
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 flex items-center justify-center bg-black/70 text-xl z-50";
  overlay.innerHTML =
    `❌ Time Up<br><span class="text-emerald-400">Correct Answer: ${answers[idx]}</span>`;
  document.body.appendChild(overlay);

  setTimeout(()=>{
    document.body.removeChild(overlay);
    endGame("Time Up");
  },1500);
}

/* =========================
   LEVEL COMPLETE
========================= */
function onLevelComplete(){
  clearTimer();
  playSound("level");

  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 flex items-center justify-center bg-black/70 text-3xl z-50";
  overlay.innerText = "🎉 Level Cleared!";
  document.body.appendChild(overlay);

  setTimeout(()=>{
    document.body.removeChild(overlay);

    const u = unlockedLevels[selectedTopic] || 1;
    if(currentLevel === u){
      unlockedLevels[selectedTopic] = u + 1;
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }
    currentLevel++;
    startPractice(currentLevel);
  },1200);
}

/* =========================
   END / LEADERBOARD
========================= */
function endGame(msg){
  hideAll();
  document.getElementById("game-over-screen").classList.remove("hidden");
  document.getElementById("final-score").innerText = msg;
}

function showLeaderboard(){
  hideAll();
  fetch("/api/leaderboard")
    .then(r=>r.json())
    .then(data=>{
      const ul = document.getElementById("leaderboard-list");
      ul.innerHTML="";
      data.forEach((u,i)=>{
        const li = document.createElement("li");
        li.innerText = `${i+1}. ${u.username} — ${u.totalScore}`;
        ul.appendChild(li);
      });
      document.getElementById("leaderboard-screen").classList.remove("hidden");
    });
}

function quitGame(){
  clearTimer();
  showDashboard();
}
