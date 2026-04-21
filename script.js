let questions = [];
let current = 0;
let correct = 0;
let wrong = 0;
let answered = false;

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data)) {
      console.error("JSON ist kein Array!");
      return;
    }

    questions = data;
    loadQuestion();
    updateStats();
  })
  .catch(err => console.error("Fehler beim Laden:", err));

function loadQuestion() {
  if (!questions.length || !questions[current]) return;

  answered = false;

  const q = questions[current];

  const questionBox = document.getElementById("questionBox");
  const answerBox = document.getElementById("answerBox");
  const input = document.getElementById("textInput");
  const feedback = document.getElementById("feedback");

  if (!questionBox || !answerBox || !input || !feedback) {
    console.error("HTML Elemente fehlen!");
    return;
  }

  questionBox.innerText = q.question;
  answerBox.innerHTML = "";
  feedback.innerHTML = "";
  input.value = "";

  // MULTIPLE CHOICE
  if (q.options) {
    Object.entries(q.options).forEach(([key, value]) => {
      const div = document.createElement("div");
      div.classList.add("option");
      div.innerText = value;

      div.dataset.key = key;

      div.onclick = () => checkMC(key, q);

      answerBox.appendChild(div);
    });

    input.style.display = "none";
  } else {
    input.style.display = "block";
  }
}

function checkMC(answerKey, q) {

  answered = true;

  const options = document.querySelectorAll(".option");
  const correctKey = q.correctAnswer;

  // Klick sperren
  options.forEach(o => o.onclick = null);

  // Bewertung
  if (answerKey === correctKey) {
    correct++;
    showFeedback(true, q.explanation);
  } else {
    wrong++;
    showFeedback(false, q.explanation);
  }

  // VISUAL FEEDBACK
  options.forEach(o => {
    const key = o.dataset.key;

    if (key === correctKey) {
      o.classList.add("correct");
    }

    if (key === answerKey && answerKey !== correctKey) {
      o.classList.add("wrong");
    }
  });

  updateStats();
}

function showFeedback(ok, explanation) {
  document.getElementById("feedback").innerHTML =
    (ok ? "✔ Richtig! " : "❌ Falsch! ") + explanation;
}

document.getElementById("continueBtn").onclick = () => {

  if (!answered) {
    document.getElementById("feedback").innerHTML =
      "⚠ Bitte zuerst eine Antwort auswählen.";
    return;
  }

  current++;

  if (current >= questions.length) {
    showResult();
    return;
  }

  loadQuestion();
  updateStats();
};

function updateStats() {
  document.getElementById("progressText").innerText =
    `Frage ${current + 1} / ${questions.length}`;

  document.getElementById("scoreText").innerText =
    `✔ ${correct} | ❌ ${wrong}`;

  document.getElementById("progressFill").style.width =
    ((current + 1) / questions.length) * 100 + "%";
}

function showResult() {

  const percent = (correct / questions.length) * 100;

  let grade;

  if (percent >= 92) grade = 1;
  else if (percent >= 81) grade = 2;
  else if (percent >= 67) grade = 3;
  else if (percent >= 50) grade = 4;
  else if (percent >= 30) grade = 5;
  else grade = 6;

  document.getElementById("quizBox").innerHTML = `
    <h2>Quiz beendet</h2>
    <p>Richtige Antworten: ${correct}</p>
    <p>Falsche Antworten: ${wrong}</p>
    <p>Ergebnis: ${percent.toFixed(1)}%</p>
    <h3>Note: ${grade}</h3>
  `;
}