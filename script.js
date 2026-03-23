// State & LocalStorage
let state = JSON.parse(localStorage.getItem('zenForestData')) || {
    totalMinutes: 0,
    forest: [],
    badges: [],
    tasks: []
};

let timerId = null;
let timeLeft = null;
let activeId = null;
let isMuted = false;

const audio = document.getElementById('zenAudio');
const stages = ["🌱", "🌿", "🎋", "🌳"];
const rewards = {
    short: ["🌸", "🌼", "🌻", "🌺"], 
    medium: ["🌳", "🌲", "🌴", "🍀"], 
    long: ["🍎", "🍋", "🍇", "🍒", "🍑"], 
    rare: ["🌵", "🍄", "🌹", "💎"] 
};

window.onload = () => { renderUI(); renderTasks(); };

function save() { localStorage.setItem('zenForestData', JSON.stringify(state)); }

function addTask() {
    const inputField = document.getElementById('taskInput');
    const name = inputField.value.trim();
    if (!name) return;

    state.tasks.push({ id: Date.now(), name: name });
    inputField.value = "";
    save();
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('taskList');
    container.innerHTML = state.tasks.map(t => `
        <div class="task-item">
            <div class="task-text" onclick="openTimer(${t.id}, '${t.name.replace(/'/g, "\\'")}')">
                ${t.name}
            </div>
            <button class="delete-btn" onclick="deleteTask(${t.id})">Delete</button>
        </div>
    `).join('');
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
    renderTasks();
}

function openTimer(id, name) {
    activeId = id;
    document.getElementById('activeTaskName').innerText = name;
    document.getElementById('timerOverlay').classList.remove('hidden');
    const mins = document.getElementById('minutesInput').value;
    document.getElementById('timerDisplay').innerText = `${mins}:00`;
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    const minsInput = document.getElementById('minutesInput');
    const totalMins = parseInt(minsInput.value);

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume Growth";
        audio.pause();
    } else {
        if (!timeLeft) timeLeft = totalMins * 60;
        btn.innerText = "Pause";
        if (!isMuted) audio.play();

        timerId = setInterval(() => {
            timeLeft--;
            updateTimerView(totalMins);
            if (timeLeft <= 0) finish(totalMins);
        }, 1000);
    }
}

function updateTimerView(totalMins) {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    const progress = (totalMins * 60 - timeLeft) / (totalMins * 60);
    const stageIdx = Math.min(Math.floor(progress * stages.length), stages.length - 1);
    document.getElementById('tree-emoji').innerText = stages[stageIdx];
}

function finish(mins) {
    clearInterval(timerId);
    timerId = null;
    state.totalMinutes += mins;

    let pool = mins < 20 ? rewards.short : (mins >= 50 ? rewards.long : rewards.medium);
    if (Math.random() > 0.9) pool = rewards.rare;

    const prize = pool[Math.floor(Math.random() * pool.length)];
    state.forest.push(prize);
    state.tasks = state.tasks.filter(t => t.id !== activeId);

    // Badge Logic
    const hrs = Math.floor(state.totalMinutes / 60);
    if (hrs > 0 && !state.badges.includes(`🎖️ ${hrs} Hour Club`)) {
        state.badges.push(`🎖️ ${hrs} Hour Club`);
    }

    save();
    renderUI();
    renderTasks();
    closeTimer();
    timeLeft = null;
    alert(`Amazing! You've grown a ${prize}`);
}

function renderUI() {
    const hrs = Math.floor(state.totalMinutes / 60);
    const mins = state.totalMinutes % 60;
    document.getElementById('totalTime').innerText = `${hrs}h ${mins}m`;
    document.getElementById('treeCount').innerText = `${state.forest.length} Plants`;
    document.getElementById('gallery').innerHTML = state.forest.map(f => `<span class="mini-tree">${f}</span>`).join('');
    document.getElementById('badgeContainer').innerHTML = state.badges.map(b => `<span class="badge">${b}</span>`).join('');
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";
    if (isMuted) audio.pause();
    else if (timerId) audio.play();
}

function updateRangeVal(val) {
    document.getElementById('rangeVal').innerText = val;
    if (!timerId) document.getElementById('timerDisplay').innerText = `${val}:00`;
}

function closeTimer() {
    document.getElementById('timerOverlay').classList.add('hidden');
    clearInterval(timerId);
    timerId = null;
    timeLeft = null;
    audio.pause();
    document.getElementById('startBtn').innerText = "Start Growth";
}
