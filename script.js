let questions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let answersStatus = []; // Array to store correctness of each answer

const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerInput = document.getElementById("answer");
const nextButton = document.getElementById("next-btn");
const resultContainer = document.getElementById("result-container");
const scoreElement = document.getElementById("score");
const wrongAnswersElement = document.getElementById("wrong-answers");
const timeElement = document.getElementById("time");

fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    for (let type in questions) {
      const randomIndex = Math.floor(Math.random() * questions[type].length);
      selectedQuestions.push({ type, ...questions[type][randomIndex] });
    }
    startQuiz();
  });

function startQuiz() {
  showQuestion();
  startTimer(300); // 300 seconds = 5 minutes
}

function showQuestion() {
  const questionNumber = currentQuestionIndex + 1; // Display "Question 1", "Question 2", etc.
  const question = selectedQuestions[currentQuestionIndex];

  // Format the question with MathJax for math expressions only
  questionElement.innerHTML = `
    <strong>Question ${questionNumber}:</strong><br>
    ${formatQuestion(question.question)}
  `;

  answerInput.value = "";
  answerInput.focus();

  // Trigger MathJax rendering for the math parts
  MathJax.typeset();
}

// Helper function to selectively apply MathJax formatting
function formatQuestion(questionText) {
  // Use delimiters \\( ... \\) only around math expressions
  return questionText.replace(/\$(.*?)\$/g, "\\($1\\)");
}




function checkAnswer() {
  const userAnswer = answerInput.value.trim();
  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion.answer;
  answersStatus.push(isCorrect); // Store the result (true for correct, false for wrong)
  if (isCorrect) {
    score++; // Increment score only if the answer is correct
  }
}

function showResults() {
  clearInterval(timer);
  questionContainer.style.display = "none";
  resultContainer.style.display = "block";
  timeElement.style.display = "none"; // Hides timer on results page

  scoreElement.textContent = `Your Score: ${score}/${selectedQuestions.length}`;
  wrongAnswersElement.innerHTML = "";

  selectedQuestions.forEach((q, index) => {
    const li = document.createElement("li");
    const isCorrect = answersStatus[index]; // Use the stored result
    li.innerHTML = `<strong>Question ${index + 1}: ${q.type}</strong> - ${isCorrect ? "Correct" : "Wrong"}`;
    if (!isCorrect) {
      li.innerHTML += ` - Correct answer: ${q.answer}`;
    }
    wrongAnswersElement.appendChild(li);
  });

}

function startTimer(seconds) {
  clearInterval(timer);
  timer = setInterval(() => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timeElement.textContent = `Time Left: ${minutes}:${secs < 10 ? "0" + secs : secs}`;
    seconds--;
    if (seconds < 0) {
      clearInterval(timer);
      handleNext();
    }
  }, 1000);
}

function handleNext() {
  checkAnswer();
  currentQuestionIndex++;
  if (currentQuestionIndex < selectedQuestions.length) {
    showQuestion();
    startTimer(300); // Reset timer for the next question
  } else {
    showResults();
  }
}

nextButton.addEventListener("click", handleNext);

// Allow Enter Key to Submit Answer
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    nextButton.click();
  }
});
