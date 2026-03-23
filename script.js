let timeLeft = null; // Changed to null initially
let timerId = null;
let activeTask = null;
const stages = ["🌱", "🌿", "🌳", "🌲", "🍎"];

// ... (keep your addTask and openTimer functions as they are)

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    const minsInput = document.getElementById('minutesInput');
    const totalMins = parseInt(minsInput.value);

    if (timerId) {
        // PAUSE LOGIC
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume Growing";
    } else {
        // START/RESUME LOGIC
        if (!timeLeft) {
            timeLeft = totalMins * 60;
        }
        
        btn.innerText = "Pause";
        
        // Run once immediately to set the display
        updateTimerDisplay(totalMins);

        timerId = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                finishTask();
            } else {
                updateTimerDisplay(totalMins);
            }
        }, 1000);
    }
}

function updateTimerDisplay(totalMins) {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    // Improved Growth Logic Calculation
    const totalSeconds = totalMins * 60;
    const elapsedSeconds = totalSeconds - timeLeft;
    const progress = elapsedSeconds / totalSeconds;
    
    // Pick the stage based on percentage
    const stageIndex = Math.min(Math.floor(progress * stages.length), stages.length - 1);
    
    const tree = document.getElementById('tree-emoji');
    tree.innerText = stages[stageIndex];
    // Add a little pop effect when it grows
    tree.style.transform = `scale(${1 + (progress * 0.5)})`;
}

function finishTask() {
    clearInterval(timerId);
    timerId = null;
    activeTask.classList.add('completed');
    activeTask.innerHTML = `<span>${activeTask.querySelector('span').innerText}</span> <span>✅ Full Grown</span>`;
    
    // Reset for next task
    timeLeft = null;
    alert("Congratulations! Your tree is fully grown!");
    closeTimer();
}

// ... (keep your closeTimer function)
