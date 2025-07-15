let startTime, timerInterval;
let currentNumber = 1;
let gameData = [];
let isGameActive = false;

const timerDisplay = document.getElementById("timer");
const currentNumberDisplay = document.getElementById("current-number");
const progressDisplay = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const gameBoard = document.getElementById("game-board");
const resultDisplay = document.getElementById("result");
const startBtn = document.getElementById("start-btn");

let rankings = [];

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function updateProgress() {
    const progress = Math.round(((currentNumber - 1) / 50) * 100);
    progressDisplay.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
}

function startGame() {
    startBtn.style.display = "none";
    gameBoard.style.display = "grid";
    resultDisplay.textContent = "";
    resultDisplay.classList.remove("show");
    currentNumber = 1;
    isGameActive = true;
    gameData = [];

    updateProgress();
    currentNumberDisplay.textContent = currentNumber;

    const firstLayer = shuffle([...Array(25).keys()].map((n) => n + 1));
    const secondLayer = shuffle([...Array(25).keys()].map((n) => n + 26));

    gameBoard.innerHTML = "";

    for (let i = 0; i < 25; i++) {
        const block = document.createElement("div");
        block.className = "block";
        block.dataset.index = i;

        const front = document.createElement("div");
        front.className = "layer front";
        front.textContent = firstLayer[i];

        const back = document.createElement("div");
        back.className = "layer back";
        back.textContent = secondLayer[i];

        block.appendChild(front);
        block.appendChild(back);

        gameData.push({
            element: block,
            front: front,
            back: back,
            frontNum: firstLayer[i],
            backNum: secondLayer[i],
            isFlipped: false,
        });

        block.onclick = () => handleClick(i);
        gameBoard.appendChild(block);
    }

    highlightNextNumber();

    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    timerDisplay.textContent = `${elapsed}초`;
}

function highlightNextNumber() {
    gameData.forEach((data) => {
        data.element.classList.remove("pulse");
        if (data.frontNum === currentNumber && !data.isFlipped) {
            data.element.classList.add("pulse");
        } else if (data.backNum === currentNumber && data.isFlipped) {
            data.element.classList.add("pulse");
        }
    });
}

function handleClick(index) {
    if (!isGameActive) return;

    const data = gameData[index];
    const { element, front, back, frontNum, backNum, isFlipped } = data;

    if (element.classList.contains("completed")) return;

    let isCorrect = false;

    if (!isFlipped && frontNum === currentNumber) {
        // 앞면 클릭 정답
        element.classList.add("flip");
        data.isFlipped = true;
        isCorrect = true;
    } else if (isFlipped && backNum === currentNumber) {
        // 뒷면 클릭 정답
        element.classList.add("completed");
        isCorrect = true;
    } else {
        // 틀린 답
        element.classList.add("shake");
        setTimeout(() => element.classList.remove("shake"), 500);
        return;
    }

    if (isCorrect) {
        currentNumber++;
        currentNumberDisplay.textContent = currentNumber > 50 ? "완료!" : currentNumber;
        updateProgress();
        highlightNextNumber();

        if (currentNumber > 50) {
            endGame();
        }
    }
}

function endGame() {
    isGameActive = false;
    clearInterval(timerInterval);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    rankings.push({
        time: parseFloat(totalTime),
        date: new Date().toLocaleString(),
    });
    rankings.sort((a, b) => a.time - b.time);
    if (rankings.length > 10) rankings = rankings.slice(0, 10);

    resultDisplay.innerHTML = `
                🎉 <strong>완료!</strong><br>
                ⏱️ 총 소요 시간: <span style="color: #FFD700;">${totalTime}초</span><br>
                🏆 랭킹: ${rankings.findIndex((r) => r.time === parseFloat(totalTime)) + 1}위
            `;
    resultDisplay.classList.add("show");

    gameData.forEach((data) => {
        data.element.classList.remove("pulse");
    });

    startBtn.style.display = "inline-block";
    startBtn.textContent = "🔄 다시 시작";
}

function restartGame() {
    clearInterval(timerInterval);
    startBtn.style.display = "inline-block";
    startBtn.textContent = "🚀 게임 시작";
    gameBoard.style.display = "none";
    resultDisplay.classList.remove("show");
    currentNumber = 1;
    isGameActive = false;
    timerDisplay.textContent = "0초";
    currentNumberDisplay.textContent = "1";
    progressDisplay.textContent = "0%";
    progressFill.style.width = "0%";
}

function showRanking() {
    const modal = document.getElementById("ranking-modal");
    const rankingList = document.getElementById("ranking-list");

    if (rankings.length === 0) {
        rankingList.innerHTML = "<p>아직 기록이 없습니다.</p>";
    } else {
        rankingList.innerHTML = rankings
            .map(
                (rank, index) => `
                    <div class="ranking-item">
                        <span>${index + 1}위</span>
                        <span>${rank.time}초</span>
                        <span>${rank.date.split(" ")[0]}</span>
                    </div>
                `
            )
            .join("");
    }

    modal.style.display = "flex";
}

function closeRanking() {
    document.getElementById("ranking-modal").style.display = "none";
}

startBtn.onclick = startGame;

document.getElementById("ranking-modal").onclick = (e) => {
    if (e.target.id === "ranking-modal") {
        closeRanking();
    }
};

// 키보드 단축키
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isGameActive) {
        e.preventDefault();
        startGame();
    } else if (e.code === "KeyR" && !isGameActive) {
        e.preventDefault();
        restartGame();
    }
});
