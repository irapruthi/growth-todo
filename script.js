// Database Initialization with Error Handling
let state = {
    totalMinutes: 0,
    forest: [],
    badges: [],
    tasks: []
};

// Load from LocalStorage
const savedData = localStorage.getItem('aestheticZenData');
if (savedData) {
    state = JSON.parse(savedData);
}

let timerId = null;
let timeLeft = null;
let activeId = null;

const stages = ["🌱", "🌿", "🎋", "🌳"];
const rewards = {
    short: ["🌸", "🌼", "🌻", "🌺"],
    medium: ["🌳", "🌲", "🌴", "🍀"],
    long: ["🍎", "🍋", "🍇", "🍒", "🍑"],
    rare: ["🌵", "🍄", "🌹", "💎"]
};

// Run as soon as page loads
window.onload = () => { 
    renderUI(); 
    renderTasks(); 
};

function save() { 
    localStorage.setItem('aestheticZenData', JSON.stringify(state)); 
}

function addTask() {
    const inputField = document.getElementById('taskInput');
    const taskName = inputField.value.trim();
    
    if (taskName === "") {
        alert("Please enter a task name first!");
        return;
    }

    // Add to state
    state.tasks.push({
        id: Date.now(), 
        name: taskName
    });

    // Clear input and update
    inputField.value = "";
    save();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;
    
    list.innerHTML = state.tasks.map(t => `
        <li onclick="openTimer(${t.id}, '${t.name.replace(/'/g, "\\'")}')">
            <span>${t.name}</span>
            <span style="opacity:0.4">Start →</span>
        </li>
    `).join('');
}

function openTimer(id, name) {
    activeId = id;
    document.getElementById('activeTaskName').innerText = name;
    document.getElementById('timerOverlay').classList.remove('hidden');
    
    // Reset timer display to default chosen value
    const initialMins = document.getElementById('minutesInput').value;
    document.getElementById('timerDisplay').innerText = `${initialMins}:00`;
    timeLeft = null; // Reset time left so it calculates fresh
}

function updateRangeVal(val) { 
    document.getElementById('rangeVal').innerText = val; 
    document.getElementById('timerDisplay').innerText = `${val}:00`;
}

function toggleTimer() {
    const btn = document.getElementById('startBtn');
    const totalMins = parseInt(document.getElementById('minutesInput').value);
    
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        btn.innerText = "Resume Growth";
    } else {
        if (!timeLeft) timeLeft = totalMins * 60;
        btn.innerText = "Pause";
        
        timerId = setInterval(() => {
            if (timeLeft <= 0) {
                finish(totalMins);
                return;
            }
            timeLeft--;
            updateTimerView(totalMins);
        }, 1000);
    }
}

function updateTimerView(totalMins) {
    // Update Clock
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    // Update Stage
    const progress = (totalMins * 60 - timeLeft) / (totalMins * 60);
    const stageIdx = Math.min(Math.floor(progress * stages.length), stages.length - 1);
    document.getElementById('tree-emoji').innerText = stages[stageIdx];
}

function finish(mins) {
    clearInterval(timerId);
    timerId = null;
    state.totalMinutes += mins;
    
    // Reward logic
    let pool = rewards.medium;
    if(mins < 20) pool = rewards.short;
    if(mins >= 50) pool = rewards.long;
    if(Math.random() > 0.9) pool = rewards.rare;

    const prize = pool[Math.floor(Math.random() * pool.length)];
    state.forest.push(prize);
    
    // Remove the task
    state.tasks = state.tasks.filter(t => t.id !== activeId);
    
    save();
    renderUI();
    renderTasks();
    closeTimer();
    alert(`Success! You grew a ${prize}`);
    timeLeft = null;
}

function renderUI() {
    const hrs = Math.floor(state.totalMinutes / 60);
    const mins = state.totalMinutes % 60;
    document.getElementById('totalTime').innerText = `${hrs}h ${mins}m`;
    document.getElementById('treeCount').innerText = `${state.forest.length} Plants`;
    
    const gallery = document.getElementById('gallery');
    if (gallery) {
        gallery.innerHTML = state.forest.map(f => `<span class="mini-tree">${f}</span>`).join('');
    }
}

function closeTimer() { 
    document.getElementById('timerOverlay').classList.add('hidden'); 
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}
