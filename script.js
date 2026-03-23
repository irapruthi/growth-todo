// Database Init (ZenGarden Ecosystem Version)
let state = JSON.parse(localStorage.getItem('zenEcosystemData')) || {
    totalSeconds: 0,
    activeTasks: [],
    completedPlots: {} // Map Plot ID -> Emoji
};

let timerId = null;
let timeLeft = null;
let currentTaskRef = null;
let isMuted = false;

// THE EXPANDED ICON LIBRARY
const growthStages = ["🌑", "🌱", "🌿", "🪴", "🎋", "🌳"];

const rewardPool = [
    // --- FLOWERS ---
    "🌸","🌼","🌻","🌺","🌹","🌷","🪷","🏵️","🌵",
    // --- FRUITS (Including Watermelon & Persimmon) ---
    "🍉","🍅","🍎","🍐","🍊","🍋","🍌","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🌽",
    // --- RARE & EXOTIC ---
    "🌳","🌲","🌴","🌵","🍄","🍀","🍁","🍂","🍃", "🎋", "🎍",
    // --- SPECIAL REWARDS ---
    "💎", "🌟", "✨", "🎐", "🏮"
];

const audio = document.getElementById('zenAudio');

window.onload = () => {
    generateGardenGrid();
    renderUI();
    renderTasks();
};

function save() { localStorage.setItem('zenEcosystemData', JSON.stringify(state)); }

// --- THE GARDEN GRID GENERATOR ---
function generateGardenGrid() {
    const canvas = document.getElementById('gardenCanvas');
    canvas.innerHTML = ''; 
    
    // Calculate plots based on screen size (60px plots)
    const plotsX = Math.floor(window.innerWidth / 62);
    const plotsY = Math.floor(window.innerHeight / 62);
    const totalPlots = plotsX * plotsY;

    for (let i = 0; i < totalPlots; i++) {
        const plot = document.createElement('div');
        plot.className = 'garden-plot';
        plot.id = `plot-${i}`;

        if (state.completedPlots[i]) {
            plot.classList.add('grown');
            plot.innerText = state.completedPlots[i];
        }
        canvas.appendChild(plot);
    }
}

// --- TASK (SEED) MANAGEMENT ---
function plantSeed() {
    const input = document.getElementById('taskInput');
    const name = input.value.trim();
    if (!name) return;

    const plotsX = Math.floor(window.innerWidth / 62);
    const plotsY = Math.floor(window.innerHeight / 62);
    const maxPlots = plotsX * plotsY;
    
    let assignedPlotId = null;
    for (let i = 0; i < maxPlots; i++) {
        const isCompleted = state.completedPlots[i];
        const isOccupiedByActiveTask = state.activeTasks.some(t => t.plotId === i);
        
        if (!isCompleted && !isOccupiedByActiveTask) {
            assignedPlotId = i;
            break;
        }
    }

    if (assignedPlotId === null) {
        alert("Your garden is full! Complete tasks to grow more.");
        return;
    }

    state.activeTasks.push({
        id: Date.now(),
        name: name,
        plotId: assignedPlotId
    });

    document.getElementById(`plot-${assignedPlotId}`).classList.add('has-seed');

    input.value = "";
    save();
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('taskList');
    container.innerHTML = state.activeTasks.map(t => `
        <li>
            <div class="task-info" onclick="openTimer(${t.id}, '${t.name.replace(/'/g, "\\'")}')">
                <strong>${t.name}</strong> 
                <span style="opacity:0.5; font-size:0.8rem;"> (Plot ${t.plotId})</span>
            </div>
            <button class="delete-task-btn" onclick="deleteSeed(${t.id})">×</button>
        </li>
    `).join('');
}

function deleteSeed(id) {
    if (timerId && currentTaskRef && currentTaskRef.id === id) {
        alert("Cannot delete a task while it is growing!");
        return;
    }
    const task = state.activeTasks.find(t => t.id === id);
    if(task) {
        document.getElementById(`plot-${task.plotId}`).classList.remove('has-seed');
    }
    state.activeTasks = state.activeTasks.filter(t => t.id !== id);
    save();
    renderTasks();
}

// --- TIMER & GROWTH ---
function openTimer(id, name) {
    const task = state.activeTasks.find(t => t.id === id);
    if (!task) return;
    currentTaskRef = task;
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
        wave.style.animationDuration = "10s"; 
    } else {
        if (!timeLeft) timeLeft = totalSec;
        btn.innerText = "Pause";
        if (!isMuted) audio.play();
        
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
            
            const progress = (totalSec - timeLeft) / totalSec;
            const newDuration = Math.max(2, 10 - (progress * 8));
            wave.style.animationDuration = `${newDuration}s`;

            const stageIdx = Math.min(Math.floor(progress * growthStages.length), growthStages.length - 1);
            document.getElementById('tree-emoji').innerText = growthStages[stageIdx];
            
            if (timeLeft <= 0) finishGrowth(totalSec);
        }, 1000);
    }
}

function finishGrowth(secWorked) {
    clearInterval(timerId);
    timerId = null;
    state.totalSeconds += secWorked;

    // Pick a random prize from the expanded pool
    const prize = rewardPool[Math.floor(Math.random() * rewardPool.length)];

    const plotId = currentTaskRef.plotId;
    state.completedPlots[plotId] = prize;

    const plot = document.getElementById(`plot-${plotId}`);
    plot.classList.remove('has-seed');
    plot.classList.add('grown');
    plot.innerText = prize;

    state.activeTasks = state.activeTasks.filter(t => t.id !== currentTaskRef.id);

    save();
    renderUI();
    renderTasks();
    closeTimer();
    timeLeft = null;
    currentTaskRef = null;
    document.getElementById('dynamicWave').style.animationDuration = "10s"; 
}

// --- UI HELPER FUNCTIONS ---
function renderUI() {
    const h = Math.floor(state.totalSeconds / 3600);
    const m = Math.floor((state.totalSeconds % 3600) / 60);
    document.getElementById('totalTime').innerText = `${h}h ${m}m`;
    document.getElementById('treeCount').innerText = `${Object.keys(state.completedPlots).length} Plots`;
}

function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? "🔇" : "🔊";
    if (isMuted) audio.pause(); else if (timerId) audio.play();
}

function updateRangeVal(val) {
    const display = document.getElementById('rangeVal');
    display.innerText = parseFloat(val) === 0.5 ? "30 Seconds" : `${val} Minutes`;
    if (!timerId) document.getElementById('timerDisplay').innerText = formatTime(val * 60);
}

function closeTimer() {
    document.getElementById('timerOverlay').classList.add('hidden');
    clearInterval(timerId); timerId = null; timeLeft = null;
    audio.pause(); document.getElementById('startBtn').innerText = "Start Growth";
    document.getElementById('tree-emoji').innerText = "🌑";
}
