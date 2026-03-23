let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
const stages = ["🌑", "🌱", "🌿", "🌳", "🌲", "🍎"];

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').innerText = 
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    const elapsedMinutes = 25 - (timeLeft / 60);
    const stageIndex = Math.min(Math.floor(elapsedMinutes / 5), stages.length - 1);
    
    const tree = document.getElementById('tree-emoji');
    tree.innerText = stages[stageIndex];
    tree.style.transform = `scale(${1 + (stageIndex * 0.15)})`;
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume";
    } else {
        btn.innerText = "Pause";
        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerId);
                alert("Time is up! Your tree is fully grown!");
            }
        }, 1000);
    }
}
