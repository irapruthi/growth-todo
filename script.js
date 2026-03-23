// State & LocalStorage
let state = JSON.parse(localStorage.getItem('zenForestData')) || {
    totalSeconds: 0, // Changed to seconds for higher precision
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

window.onload = () => { 
    // Set slider step and min for 30s increments
    const slider = document.getElementById('minutesInput');
    slider.min = "0.5"; 
    slider.step = "0.5";
    renderUI(); 
    renderTasks(); 
};

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
    if (timerId && activeId === id) return alert("Cannot delete active task!");
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
    renderTasks();
}

function openTimer(id, name) {
    activeId = id;
    document.getElementById('activeTaskName').innerText = name;
    document.getElementById('timerOverlay').classList.remove('hidden');
    const mins = parseFloat(document.getElementById('minutesInput').value);
    document.getElementById('timerDisplay').innerText = formatTime(mins * 60);
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    const minsInput = document.getElementById('minutesInput');
    const totalSeconds = parseFloat(minsInput.value) * 60;

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume Growth";
        audio.pause();
    } else {
        if (!timeLeft) timeLeft = totalSeconds;
        btn.innerText = "Pause";
        if (!isMuted) audio.play();

        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
            
            const progress = (totalSeconds - timeLeft) / totalSeconds;
            const stageIdx = Math.min(Math.floor(progress * stages.length), stages.length - 1);
            document.getElementById('tree-emoji').innerText = stages[stageIdx];

            if (timeLeft <= 0) finish(totalSeconds);
        }, 1000);
    }
}

function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function finish(secondsWorked) {
    clearInterval(timerId);
    timerId = null;
    state.totalSeconds += secondsWorked;

    const mins = secondsWorked / 60;
    let pool = mins < 10 ? rewards.short : (mins >= 45 ? rewards.long : rewards.medium);
    if (Math.random() > 0.9) pool = rewards.rare;

    const prize = pool[Math.floor(Math.random() * pool.length)];
    state.forest.push(prize);
    state.tasks = state.tasks.filter(t => t.id !== activeId);

    save();
    renderUI();
    renderTasks();
    closeTimer();
    timeLeft = null;
    alert(`Success! Your garden gained a ${prize}`);
}

function renderUI() {
    const totalHrs = Math.floor(state.totalSeconds / 3600);
    const totalMins = Math.floor((state.totalSeconds % 3600) / 60);
    document.getElementById('totalTime').innerText = `${totalHrs}h ${totalMins}m`;
    document.getElementById('treeCount').innerText = `${state.forest.length} Plants`;
    document.getElementById('gallery').innerHTML = state.forest.map(f => `<span class="mini-tree">${f}</span>`).join('');
    
    // Achievement Logic
    if (totalHrs > 0 && !state.badges.includes(`🎖️ ${totalHrs}h Master`)) {
        state.badges.push(`🎖️ ${totalHrs}h Master`);
        save();
    }
    document.getElementById('badgeContainer').innerHTML = state.badges.map(b => `<span class="badge">${b}</span>`).join('');
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";
    if (isMuted) audio.pause();
    else if (timerId) audio.play();
}

function updateRangeVal(val) {
    const displayVal = val < 1 ? "30 Seconds" : `${val} Minutes`;
    document.getElementById('rangeVal').innerText = displayVal;
    if (!timerId) document.getElementById('timerDisplay').innerText = formatTime(val * 60);
}

function closeTimer() {
    document.getElementById('timerOverlay').classList.add('hidden');
    clearInterval(timerId);
    timerId = null;
    timeLeft = null;
    audio.pause();
    document.getElementById('startBtn').innerText = "Start Growth";
}
