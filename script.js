// Database Init
let state = JSON.parse(localStorage.getItem('aestheticZenData')) || {
    totalMinutes: 0,
    forest: [],
    badges: [],
    tasks: []
};

let timerId = null;
let timeLeft = null;
let activeId = null;

// The Evolutionary Lineup
const stages = ["🌱", "🌿", "🎋", "🌳"];
const rewards = {
    short: ["🌸", "🌼", "🌻", "🌺"], // Under 20 mins
    medium: ["🌳", "🌲", "🌴", "🍀"], // 20-50 mins
    long: ["🍎", "🍋", "🍇", "🍒", "🍑"], // Over 50 mins
    rare: ["🌵", "🍄", "🌹", "💎"] // Random chance
};

window.onload = () => { renderUI(); renderTasks(); };

function updateRangeVal(val) { document.getElementById('rangeVal').innerText = val; }

function addTask() {
    const val = document.getElementById('taskInput').value;
    if(!val) return;
    state.tasks.push({id: Date.now(), name: val});
    document.getElementById('taskInput').value = "";
    save();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = state.tasks.map(t => `
        <li onclick="openTimer(${t.id}, '${t.name}')">
            <span>${t.name}</span>
            <span style="opacity:0.4">→</span>
        </li>
    `).join('');
}

function openTimer(id, name) {
    activeId = id;
    document.getElementById('activeTaskName').innerText = name;
    document.getElementById('timerOverlay').classList.remove('hidden');
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    const totalMins = parseInt(document.getElementById('minutesInput').value);
    
    if(timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume";
    } else {
        if(!timeLeft) timeLeft = totalMins * 60;
        btn.innerText = "Focusing...";
        timerId = setInterval(() => {
            timeLeft--;
            const progress = (totalMins * 60 - timeLeft) / (totalMins * 60);
            document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
            
            // Evolution
            const stageIdx = Math.min(Math.floor(progress * stages.length), stages.length - 1);
            document.getElementById('tree-emoji').innerText = stages[stageIdx];
            
            if(timeLeft <= 0) finish(totalMins);
        }, 1000);
    }
}

function finish(mins) {
    clearInterval(timerId);
    state.totalMinutes += mins;
    
    // Determine Reward Type
    let pool = rewards.medium;
    if(mins < 20) pool = rewards.short;
    if(mins >= 50) pool = rewards.long;
    if(Math.random() > 0.9) pool = rewards.rare;

    const prize = pool[Math.floor(Math.random() * pool.length)];
    state.forest.push(prize);
    state.tasks = state.tasks.filter(t => t.id !== activeId);
    
    // Stats Update
    if(state.totalMinutes >= 60 && !state.badges.includes("🏆 Hour Club")) state.badges.push("🏆 Hour Club");
    
    timeLeft = null;
    timerId = null;
    save();
    renderUI();
    renderTasks();
    closeTimer();
    alert(`Beautiful! You've grown a ${prize}`);
}

function renderUI() {
    const hrs = Math.floor(state.totalMinutes/60);
    const mins = state.totalMinutes % 60;
    document.getElementById('totalTime').innerText = `${hrs}h ${mins}m`;
    document.getElementById('treeCount').innerText = `${state.forest.length} Plants`;
    document.getElementById('gallery').innerHTML = state.forest.map(f => `<span class="mini-tree">${f}</span>`).join('');
    document.getElementById('badgeContainer').innerHTML = state.badges.map(b => `<span class="badge">${b}</span>`).join('');
}

function formatTime(sec) {
    let m = Math.floor(sec/60);
    let s = sec%60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function save() { localStorage.setItem('aestheticZenData', JSON.stringify(state)); }
function closeTimer() { document.getElementById('timerOverlay').classList.add('hidden'); }
