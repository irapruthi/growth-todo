let timeLeft;
let timerId = null;
let activeTask = null;
const stages = ["🌱", "🌿", "🌳", "🌲", "🍎"];

function addTask() {
    const input = document.getElementById('taskInput');
    if (!input.value) return;
    
    const li = document.createElement('li');
    li.innerHTML = `<span>${input.value}</span> <span>⏳</span>`;
    li.onclick = () => openTimer(li, input.value);
    document.getElementById('taskList').appendChild(li);
    input.value = "";
}

function openTimer(element, name) {
    if (element.classList.contains('completed')) return;
    activeTask = element;
    document.getElementById('activeTaskName').innerText = name;
    document.getElementById('timerOverlay').classList.remove('hidden');
}

function closeTimer() {
    clearInterval(timerId);
    timerId = null;
    document.getElementById('timerOverlay').classList.add('hidden');
    document.getElementById('startBtn').innerText = "Start Growing";
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume";
    } else {
        const mins = document.getElementById('minutesInput').value;
        if (!timeLeft) timeLeft = mins * 60;
        btn.innerText = "Pause";
        
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(mins);
            if (timeLeft <= 0) finishTask();
        }, 1000);
    }
}

function updateTimerDisplay(totalMins) {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    // Growth Logic
    const percent = (totalMins * 60 - timeLeft) / (totalMins * 60);
    const stage = Math.min(Math.floor(percent * stages.length), stages.length - 1);
    document.getElementById('tree-emoji').innerText = stages[stage];
}

function finishTask() {
    clearInterval(timerId);
    activeTask.classList.add('completed');
    activeTask.innerHTML = `<span>${activeTask.firstChild.innerText}</span> <span>🌳 (Grown)</span>`;
    alert("Task Grown!");
    timeLeft = null;
    closeTimer();
}
