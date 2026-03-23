let timeLeft, timerId, activeTask, totalTrees = 0;
const treeTypes = ["🌳", "🌲", "🌴", "🌵", "🌿", "🍀", "🍁"];
const stages = ["🌱", "🌿", "🌳", "🌲", "🍎"];

function addTask() {
    const input = document.getElementById('taskInput');
    if (!input.value.trim()) return;
    
    const li = document.createElement('li');
    li.innerHTML = `<strong>${input.value}</strong> <span>Start →</span>`;
    li.onclick = () => openTimer(li, input.value);
    document.getElementById('taskList').appendChild(li);
    input.value = "";
}

function openTimer(element, name) {
    if (element.classList.contains('completed')) return;
    activeTask = element;
    document.getElementById('activeTaskName').innerText = name;
    document.getElementById('timerOverlay').classList.remove('hidden');
    document.body.style.background = "#1b4332"; // Dim the background
}

function closeTimer() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = null;
    document.getElementById('timerOverlay').classList.add('hidden');
    document.getElementById('startBtn').innerText = "Start Growing";
    document.body.style.background = "#d8f3dc"; // Restore background
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    const mins = parseInt(document.getElementById('minutesInput').value);

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume";
    } else {
        if (!timeLeft) timeLeft = mins * 60;
        btn.innerText = "Focusing...";
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay(mins);
            if (timeLeft <= 0) finishTask();
        }, 1000);
    }
}

function updateDisplay(totalMins) {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    const progress = (totalMins * 60 - timeLeft) / (totalMins * 60);
    const stageIndex = Math.min(Math.floor(progress * stages.length), stages.length - 1);
    document.getElementById('tree-emoji').innerText = stages[stageIndex];
    document.getElementById('tree-emoji').style.transform = `scale(${1 + progress})`;
}

function finishTask() {
    clearInterval(timerId);
    totalTrees++;
    document.getElementById('treeCount').innerText = totalTrees;

    // Mark task complete
    activeTask.classList.add('completed');
    activeTask.style.opacity = "0.5";
    activeTask.innerHTML = `<span>${activeTask.querySelector('strong').innerText}</span> <span>✅ Grown</span>`;

    // Add to Gallery
    const gallery = document.getElementById('gallery');
    const miniTree = document.createElement('span');
    miniTree.className = "mini-tree";
    miniTree.innerText = treeTypes[Math.floor(Math.random() * treeTypes.length)];
    gallery.appendChild(miniTree);

    alert("Task complete! A new tree has joined your forest.");
    closeTimer();
}
