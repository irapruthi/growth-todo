let state = JSON.parse(localStorage.getItem('zenForestData')) || {
    totalSeconds: 0,
    forest: [],
    badges: [],
    tasks: []
};

let timerId = null;
let timeLeft = null;
let activeId = null;
let isMuted = false;

const audio = document.getElementById('zenAudio');
const stages = ["🌑", "🌱", "🌿", "🪴", "🌿", "🎋", "🌳"];
const rewards = {
    flowers: ["🌸", "🌼", "🌻", "🌺", "🌹", "🌷", "🪷", "🏵️"],
    trees: ["🌳", "🌲", "🌴", "🌵", "🎋", "🌿", "🍀", "🍄"],
    fruits: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍"],
    mythic: ["🌟", "✨", "💎", "🎋", "🎍", "🪴"]
};

const badgeTitles = [
    { hrs: 1, title: "🌱 Sprout Scout" },
    { hrs: 5, title: "🌿 Leaf Leader" },
    { hrs: 10, title: "🌳 Grove Guardian" },
    { hrs: 25, title: "🌲 Forest Overlord" },
    { hrs: 50, title: "👑 Nature Deity" }
];

window.onload = () => { renderUI(); renderTasks(); };

function save() { localStorage.setItem('zenForestData', JSON.stringify(state)); }

function addTask() {
    const input = document.getElementById('taskInput');
    const name = input.value.trim();
    if (!name) return;
    state.tasks.push({ id: Date.now(), name: name });
    input.value = "";
    save();
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('taskList');
    container.innerHTML = state.tasks.map(t => `
        <div class="task-item">
            <div class="task-text" onclick="openTimer(${t.id}, '${t.name.replace(/'/g, "\\'")}')">${t.name}</div>
            <button class="delete-btn" onclick="deleteTask(${t.id})">×</button>
        </div>
    `).join('');
}

function deleteTask(id) {
    if (timerId && activeId === id) return alert("Task is growing!");
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
    const totalSec = parseFloat(document.getElementById('minutesInput').value) * 60;
    const wave = document.getElementById('dynamicWave');

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume Growth";
        audio.pause();
        wave.style.animationDuration = "12s";
    } else {
        if (!timeLeft) timeLeft = totalSec;
        btn.innerText = "Pause";
        if (!isMuted) audio.play();
        
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
            const progress = (totalSec - timeLeft) / totalSec;
            
            // Accelerate Wave Animation
            const newDuration = Math.max(2, 12 - (progress * 10));
            wave.style.animationDuration = `${newDuration}s`;

            const stageIdx = Math.min(Math.floor(progress * stages.length), stages.length - 1);
            document.getElementById('tree-emoji').innerText = stages[stageIdx];
            
            if (timeLeft <= 0) finish(totalSec);
        }, 1000);
    }
}

function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function finish(sec) {
    clearInterval(timerId);
    timerId = null;
    state.totalSeconds += sec;
    document.getElementById('dynamicWave').style.animationDuration = "12s";

    let pool = (sec/60) < 5 ? rewards.flowers : ((sec/60) >= 30 ? rewards.fruits : rewards.trees);
    if (Math.random() > 0.95) pool = rewards.mythic;
    const prize = pool[Math.floor(Math.random() * pool.length)];
    state.forest.push(prize);
    state.tasks = state.tasks.filter(t => t.id !== activeId);
    save(); renderUI(); renderTasks(); closeTimer();
    alert(`Success! You've grown a ${prize}`);
}

function renderUI() {
    const h = Math.floor(state.totalSeconds / 3600);
    const m = Math.floor((state.totalSeconds % 3600) / 60);
    document.getElementById('totalTime').innerText = `${h}h ${m}m`;
    document.getElementById('treeCount').innerText = `${state.forest.length} Plants`;
    document.getElementById('gallery').innerHTML = state.forest.map(f => `<span class="mini-tree">${f}</span>`).join('');
    badgeTitles.forEach(b => {
        const tag = `🎖️ ${b.title}`;
        if (h >= b.hrs && !state.badges.includes(tag)) state.badges.push(tag);
    });
    document.getElementById('badgeContainer').innerHTML = state.badges.map(b => `<span class="badge">${b}</span>`).join('');
    save();
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";
    if (isMuted) audio.pause(); else if (timerId) audio.play();
}

function updateRangeVal(val) {
    const display = document.getElementById('rangeVal');
    
    // Clear the text first, then set it correctly
    if (parseFloat(val) === 0.5) {
        display.innerText = "30 Seconds";
    } else {
        display.innerText = `${val} Minutes`;
    }
    
    if (!timerId) {
        document.getElementById('timerDisplay').innerText = formatTime(val * 60);
    }
}
function closeTimer() {
    document.getElementById('timerOverlay').classList.add('hidden');
    clearInterval(timerId); timerId = null; timeLeft = null;
    audio.pause(); document.getElementById('startBtn').innerText = "Start Growth";
    document.getElementById('tree-emoji').innerText = "🌑";
    document.getElementById('dynamicWave').style.animationDuration = "12s";
}
