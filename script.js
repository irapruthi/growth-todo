let count = 0;
const stages = ["🌑", "🌱", "🌿", "🌳", "🌲", "🍎"];

function addTask() {
    const val = document.getElementById('taskInput').value;
    if (!val) return;
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" onchange="grow(this)"> ${val}`;
    document.getElementById('taskList').appendChild(li);
    document.getElementById('taskInput').value = "";
}

function grow(cb) {
    count += cb.checked ? 1 : -1;
    const stageIndex = Math.min(Math.max(count, 0), stages.length - 1);
    document.getElementById('tree-emoji').innerText = stages[stageIndex];
    document.getElementById('tree-emoji').style.transform = `scale(${1 + stageIndex * 0.1})`;
}
