// DOM Elements
const bodyEl = document.body;
const clockEl = document.getElementById("clock");
const greetingEl = document.getElementById("greeting");
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const todoInput = document.getElementById("todo-input");
const todoTagSelect = document.getElementById("todo-tag");
const addTodoBtn = document.getElementById("add-todo-btn");
const todoList = document.getElementById("todo-list");

// Top Nav Elements
const themeBtn = document.getElementById("theme-btn");
const focusModeBtn = document.getElementById("focus-mode-btn");
const colorBtns = document.querySelectorAll(".color-btn");

// Stats Modal Elements
const dailyStatsBtn = document.getElementById("daily-stats");
const statsModal = document.getElementById("stats-modal");
const closeStatsBtn = document.getElementById("close-stats-btn");
const chartContainer = document.getElementById("chart-container");

// Toast Notification Elements
const toastContainer = document.getElementById("toast-container");
const toastMessage = document.getElementById("toast-message");
const toastClose = document.getElementById("toast-close");
let toastTimeout;

// --- Clock & Greeting ---
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  clockEl.textContent = `${hours}:${minutes}`;

  // Update greeting based on time
  const hour = now.getHours();
  let greeting = "Hola";
  if (hour < 12) greeting = "Buenos días";
  else if (hour < 18) greeting = "Buenas tardes";
  else greeting = "Buenas noches"
;

  greetingEl.textContent = greeting;
}
setInterval(updateClock, 1000);
updateClock();

// --- Focus Timer (Pomodoro) ---
const timerModeEl = document.getElementById("timer-mode");
const timerLoopsEl = document.getElementById("timer-loops");
const timerInputGroup = document.querySelector(".timer-input-group");
const timerTaskInput = document.getElementById("timer-task-input");
const timerTaskBtn = document.getElementById("timer-task-btn");

// Settings Elements
const studyTimeInput = document.getElementById("study-time-input");
const restTimeInput = document.getElementById("rest-time-input");
const loopsInput = document.getElementById("loops-input");
// Audio Elements
const bgAudioSelect = document.getElementById("bg-audio-select");
const bgSound = document.getElementById("bg-sound");
const bgAudioBtn = document.getElementById("bg-audio-btn");
const bgVolumeSlider = document.getElementById("bg-volume-slider");
const audioIconOn = document.getElementById("audio-icon-on");
const audioIconOff = document.getElementById("audio-icon-off");

const progressRingBar = document.getElementById("progress-ring-bar");
const statsCountEl = document.getElementById("stats-count");

// Array of motivational quotes
const motivationalQuotes = [
  "El éxito es la suma de pequeños esfuerzos.",
  "Un viaje de mil millas comienza con un solo paso.",
  "Haz de hoy una obra maestra.",
  "La disciplina es el puente entre metas y logros.",
  "Concéntrate en el momento, es todo lo que tienes.",
  "El futuro depende de lo que hagas hoy.",
  "Tu única competencia es quién eras ayer.",
  "Una mente en calma es una mente brillante."
];
const quoteEl = document.getElementById("motivational-quote");

let timerInterval;

// Load config from LocalStorage
function loadConfig() {
  const cfg = JSON.parse(localStorage.getItem("timerConfig"));
  if (cfg) {
    if (studyTimeInput) studyTimeInput.value = cfg.study || 30;
    if (restTimeInput) restTimeInput.value = cfg.rest || 10;
    if (loopsInput) loopsInput.value = cfg.loops || 4;
    
    if (bgVolumeSlider) {
      bgVolumeSlider.value = cfg.volume !== undefined ? cfg.volume : 0.5;
      if (bgSound) bgSound.volume = bgVolumeSlider.value;
    }
    
    if (bgAudioSelect && cfg.bgAudio) {
      bgAudioSelect.value = cfg.bgAudio;
      if (bgSound) bgSound.src = cfg.bgAudio;
    }
    
    // Theme and Color
    if (cfg.theme === "light") {
      bodyEl.classList.add("light-mode");
    }
    if (cfg.color) {
      document.documentElement.style.setProperty("--accent-color", cfg.color);
      // Update active btn
      colorBtns.forEach(btn => {
        if (btn.dataset.color === cfg.color) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
  } else {
    // default active color
    const defaultColorBtn = document.querySelector('.color-btn[data-color="#4ecca3"]');
    if (defaultColorBtn) defaultColorBtn.classList.add("active");
  }
}

function saveConfig() {
  localStorage.setItem("timerConfig", JSON.stringify({
    study: studyTimeInput ? studyTimeInput.value : 30,
    rest: restTimeInput ? restTimeInput.value : 10,
    loops: loopsInput ? loopsInput.value : 4,
    volume: bgVolumeSlider ? parseFloat(bgVolumeSlider.value) : 0.5,
    bgAudio: bgAudioSelect ? bgAudioSelect.value : "https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3",
    theme: bodyEl.classList.contains("light-mode") ? "light" : "dark",
    color: document.documentElement.style.getPropertyValue("--accent-color").trim() || "#4ecca3"
  }));
}

// Quote Function
function updateQuote() {
  if (quoteEl) {
    quoteEl.style.opacity = 0;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * motivationalQuotes.length);
      quoteEl.textContent = `"${motivationalQuotes[idx]}"`;
      quoteEl.style.opacity = 1;
    }, 500); // fade out duration
  }
}

// Daily Stats & Gamification
let userPoints = parseInt(localStorage.getItem("enfoquePoints")) || 0;
const userLevelBadge = document.getElementById("user-level-badge");

function updateLevelUI() {
  if (!userLevelBadge) return;
  // Level calculation (1 level every 50 points roughly)
  const level = Math.floor(userPoints / 50) + 1;
  userLevelBadge.textContent = `Lvl ${level} (${userPoints} pts)`;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function loadStats() {
  const stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  const today = getTodayKey();
  const count = stats[today] || 0;
  if(statsCountEl) statsCountEl.textContent = `Ciclos hoy: ${count}`;
  updateLevelUI();
}

function incrementStats() {
  const stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  const today = getTodayKey();
  stats[today] = (stats[today] || 0) + 1;
  localStorage.setItem("pomodoroStats", JSON.stringify(stats));
  
  // Gamification: Add 10 points for finishing a Pomodoro
  userPoints += 10;
  localStorage.setItem("enfoquePoints", userPoints);
  
  loadStats();
}

// Audio Toggle
let isBgAudioPlaying = false;
if (bgAudioBtn) {
  bgAudioBtn.addEventListener("click", () => {
    isBgAudioPlaying = !isBgAudioPlaying;
    if (isBgAudioPlaying) {
      if (bgSound) {
        bgSound.volume = bgVolumeSlider ? bgVolumeSlider.value : 0.5;
        bgSound.play().catch(e => console.log(e));
      }
      bgAudioBtn.classList.add("playing");
      audioIconOn.style.display = "block";
      audioIconOff.style.display = "none";
    } else {
      if (bgSound) bgSound.pause();
      bgAudioBtn.classList.remove("playing");
      audioIconOn.style.display = "none";
      audioIconOff.style.display = "block";
    }
  });
}

if (bgVolumeSlider) {
  bgVolumeSlider.addEventListener("input", (e) => {
    if (bgSound) bgSound.volume = e.target.value;
  });
  
  bgVolumeSlider.addEventListener("change", () => {
    saveConfig();
  });
}

if (bgAudioSelect) {
  bgAudioSelect.addEventListener("change", (e) => {
    if (bgSound) {
      bgSound.src = e.target.value;
      if (isBgAudioPlaying) {
        bgSound.play().catch(err => console.log(err));
      }
    }
    saveConfig();
  });
}

// --- Top Nav Handlers ---
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    bodyEl.classList.toggle("light-mode");
    saveConfig();
  });
}

const exitFocusBtn = document.getElementById("exit-focus-btn");

if (focusModeBtn) {
  focusModeBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      bodyEl.classList.add("focus-mode");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        bodyEl.classList.remove("focus-mode");
      }
    }
  });
}

if (exitFocusBtn) {
  exitFocusBtn.addEventListener("click", () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    bodyEl.classList.remove("focus-mode");
  });
}

// Exit focus mode if user escapes fullscreen
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    bodyEl.classList.remove("focus-mode");
  }
});

colorBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const color = e.target.dataset.color;
    document.documentElement.style.setProperty("--accent-color", color);
    colorBtns.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    saveConfig();
    updateProgressRing(); // redraw ring with new color
  });
});

// --- Data Export & Import ---
const exportBtn = document.getElementById("export-data-btn");
const importBtn = document.getElementById("import-data-btn");
const fileInput = document.getElementById("import-file-input");

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const backupData = {
      timerConfig: JSON.parse(localStorage.getItem("timerConfig") || "{}"),
      pomodoroStats: JSON.parse(localStorage.getItem("pomodoroStats") || "{}"),
      todos: JSON.parse(localStorage.getItem("todos") || "[]"),
      enfoquePoints: localStorage.getItem("enfoquePoints") || "0",
      exportDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `enfoque-backup-${getTodayKey()}.json`);
    document.body.appendChild(downloadAnchor); // required for firefox
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Datos exportados exitosamente.");
  });
}

if (importBtn && fileInput) {
  importBtn.addEventListener("click", () => {
    fileInput.click();
  });
  
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.timerConfig) localStorage.setItem("timerConfig", JSON.stringify(importedData.timerConfig));
        if (importedData.pomodoroStats) localStorage.setItem("pomodoroStats", JSON.stringify(importedData.pomodoroStats));
        if (importedData.todos) localStorage.setItem("todos", JSON.stringify(importedData.todos));
        if (importedData.enfoquePoints) localStorage.setItem("enfoquePoints", importedData.enfoquePoints);
        
        showToast("Datos importados con éxito. Recargando...");
        setTimeout(() => location.reload(), 2000);
      } catch (err) {
        showToast("Error importando datos. Archivo inválido.");
        console.error("Import error:", err);
      }
    };
    reader.readAsText(file);
  });
}

// --- Settings & Time ---
function getStudyTime() {
  const min = parseInt(studyTimeInput.value);
  const mVal = isNaN(min) || min < 1 ? 1 : min;
  return mVal * 60;
}

function getRestTime() {
  const min = parseInt(restTimeInput.value);
  const mVal = isNaN(min) || min < 1 ? 1 : min;
  return mVal * 60;
}

function getTotalLoops() {
  const val = parseInt(loopsInput.value);
  return isNaN(val) || val < 0 ? 0 : val;
}

let isStudyMode = true;
let currentLoop = 1;
let timeLeft = getStudyTime();
let totalPhaseTime = getStudyTime();
let isRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateProgressRing() {
  if (!progressRingBar) return;
  const circumference = 2 * Math.PI * 115; // r=115
  
  if (totalPhaseTime <= 0) {
    progressRingBar.style.strokeDashoffset = 0;
    return;
  }
  
  // Calculate offset (1 to 0 mapping)
  const percent = timeLeft / totalPhaseTime;
  const offset = circumference - percent * circumference;
  progressRingBar.style.strokeDashoffset = offset;
  
  // Change color based on mode
  if (isStudyMode) {
    progressRingBar.style.stroke = "var(--accent-color)";
  } else {
    progressRingBar.style.stroke = "var(--danger-color)";
  }
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  updateProgressRing();
  
  let titleText = formatTime(timeLeft);
  if (isStudyMode && timerTaskInput && timerTaskInput.value.trim() !== "") {
    titleText += ` - ${timerTaskInput.value.trim()}`;
  } else if (!isStudyMode) {
    titleText += " - Descanso";
  } else {
    titleText += " - Enfoque";
  }
  document.title = titleText;

  if (timerLoopsEl) {
    const total = getTotalLoops();
    if (total > 0) {
      timerLoopsEl.textContent = `Ciclo: ${currentLoop}/${total}`;
      timerLoopsEl.style.display = "block";
    } else {
      timerLoopsEl.style.display = "none";
    }
  }
}

function notifyUser(message) {
  // Always show our custom toast UI Notification
  showToast(message);

  // Still try browser notification if permitted
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Panel de Enfoque", { body: message });
    } catch(e) {
      console.log("Browser notification failed", e);
    }
  }
}

function showToast(message) {
  if (!toastContainer || !toastMessage) return;
  
  toastMessage.textContent = message;
  toastContainer.classList.remove("hidden");
  
  // Minimal timeout to allow display block to apply before adding class
  setTimeout(() => {
    toastContainer.classList.add("show");
  }, 10);

  // Auto hide after 5 seconds
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(hideToast, 5000);
}

function hideToast() {
  if (!toastContainer) return;
  toastContainer.classList.remove("show");
  // Wait for transition to finish
  setTimeout(() => {
    toastContainer.classList.add("hidden");
  }, 300);
}

if (toastClose) {
  toastClose.addEventListener("click", hideToast);
}

function startTimer() {

  if (isRunning) {
    // If we're already running, this button acts as "Terminar"
    resetTimer();
    return;
  }
  
  if (pauseBtn.textContent === "Reanudar") {
     resetTimer();
     return;
  }
  
  isRunning = true;
  // Change start button text to "Terminar" instead of disabling it
  startBtn.textContent = "Terminar";
  startBtn.classList.remove("primary");
  startBtn.classList.add("danger");
  
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pausar";
  if (studyTimeInput) studyTimeInput.disabled = true;
  if (restTimeInput) restTimeInput.disabled = true;
  if (loopsInput) loopsInput.disabled = true;
  if (timerTaskInput) {
    timerTaskInput.disabled = true;
    timerTaskBtn.disabled = true;
  }

  timerInterval = setInterval(timerTick, 1000);
}

const timerTick = () => {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      
      const totalLoops = getTotalLoops();
      
      if (isStudyMode) {
        let taskName = timerTaskInput && timerTaskInput.value.trim() !== "" ? ` de ${timerTaskInput.value.trim()}` : "";
        notifyUser(`¡Tiempo${taskName} terminado! Tómate un descanso.`);
        isStudyMode = false;
        totalPhaseTime = getRestTime();
        timeLeft = totalPhaseTime;
        incrementStats(); // Completed a study session
        currentLoop++; // Increment loop after study session
        updateQuote(); // Update quote on Pomodoro finish

        if (totalLoops > 0 && currentLoop > totalLoops) {
          // Finished all loops
          notifyUser("¡Felicidades! Has completado todos los ciclos.");
          resetTimer();
          return;
        }

        if (timerModeEl) {
          timerModeEl.textContent = "Descanso";
          timerModeEl.classList.add("rest");
        }
        if (timerInputGroup) timerInputGroup.style.display = "none";
        updateTimerDisplay();
        
        // Auto-start rest
        timerInterval = setInterval(timerTick, 1000);
      } else {
        notifyUser("¡Descanso terminado! Volvamos a enfocarnos.");
        isStudyMode = true;
        totalPhaseTime = getStudyTime();
        timeLeft = totalPhaseTime;
        if (timerModeEl) {
          const customTask = timerTaskInput && timerTaskInput.value.trim() !== "" ? timerTaskInput.value.trim() : "Estudio";
          timerModeEl.textContent = customTask;
          timerModeEl.classList.remove("rest");
        }
        if (timerInputGroup) timerInputGroup.style.display = "flex";
        updateTimerDisplay();
        
        // Auto-start next study session
        timerInterval = setInterval(timerTick, 1000);
      }
    }
};

function pauseTimer() {
  if (isRunning) {
    // We are running, so pause it
    clearInterval(timerInterval);
    isRunning = false;
    pauseBtn.textContent = "Reanudar";
  } else {
    // We are paused, so resume it
    isRunning = true;
    pauseBtn.textContent = "Pausar";
    
    timerInterval = setInterval(timerTick, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isStudyMode = true;
  currentLoop = 1;
  totalPhaseTime = getStudyTime();
  timeLeft = totalPhaseTime;
  if (timerModeEl) {
    const customTask = timerTaskInput && timerTaskInput.value.trim() !== "" ? timerTaskInput.value.trim() : "Estudio";
    timerModeEl.textContent = customTask;
    timerModeEl.classList.remove("rest");
  }
  if (studyTimeInput) studyTimeInput.disabled = false;
  if (restTimeInput) restTimeInput.disabled = false;
  if (loopsInput) loopsInput.disabled = false;
  if (timerInputGroup) timerInputGroup.style.display = "flex";
  if (timerTaskInput) {
    timerTaskInput.disabled = false;
    timerTaskBtn.disabled = false;
  }
  
  updateTimerDisplay();
  
  // Revert Terminar button back to Iniciar
  startBtn.textContent = "Iniciar";
  startBtn.classList.add("primary");
  startBtn.classList.remove("danger");
  startBtn.disabled = false;
  
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pausar";
  document.title = "Panel de Enfoque";
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

if (timerTaskBtn && timerTaskInput && timerModeEl) {
  timerTaskBtn.addEventListener("click", () => {
    if (isStudyMode) {
      const val = timerTaskInput.value.trim();
      timerModeEl.textContent = val ? val : "Estudio";
      updateTimerDisplay();
    }
  });
  
  timerTaskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      timerTaskBtn.click();
    }
  });
}

if (studyTimeInput) {
  studyTimeInput.addEventListener("change", () => {
    saveConfig();
    if (!isRunning && isStudyMode) {
      totalPhaseTime = getStudyTime();
      timeLeft = totalPhaseTime;
      updateTimerDisplay();
    }
  });
}

if (restTimeInput) {
  restTimeInput.addEventListener("change", () => {
    saveConfig();
    if (!isRunning && !isStudyMode) {
      totalPhaseTime = getRestTime();
      timeLeft = totalPhaseTime;
      updateTimerDisplay();
    }
  });
}



if (loopsInput) {
  loopsInput.addEventListener("change", () => {
    saveConfig();
    updateTimerDisplay();
  });
}

// --- Stats Modal Chart ---
function renderChart() {
  if (!chartContainer) return;
  const stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};
  chartContainer.innerHTML = "";
  
  // Get last 7 days
  const today = new Date();
  const days = [];
  let maxVal = 1; // to normalize height
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    const count = stats[key] || 0;
    if (count > maxVal) maxVal = count;
    
    // format day string (e.g. "Lun 5")
    const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    days.push({ label: dayStr, count: count });
  }
  
  days.forEach(day => {
    const heightPercent = (day.count / maxVal) * 100;
    
    const group = document.createElement("div");
    group.className = "chart-bar-group";
    
    group.innerHTML = `
      <span class="chart-value">${day.count}</span>
      <div class="chart-bar" style="height: ${heightPercent}%;"></div>
      <span class="chart-label">${day.label.split(' ')[0]}</span>
    `;
    chartContainer.appendChild(group);
  });
}

if (dailyStatsBtn) {
  dailyStatsBtn.addEventListener("click", () => {
    renderChart();
    if (statsModal) statsModal.classList.remove("hidden");
  });
}

if (closeStatsBtn) {
  closeStatsBtn.addEventListener("click", () => {
    if (statsModal) statsModal.classList.add("hidden");
  });
}

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === statsModal) {
    statsModal.classList.add("hidden");
  }
});

// Initialize timer display
updateTimerDisplay();
pauseBtn.disabled = true;

// --- Todo List ---
let todos = JSON.parse(localStorage.getItem("todos")) || [];

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

let dragStartIndex;

function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.setAttribute("data-index", index);
    li.setAttribute("draggable", "true");

    // Generate Tag HTML if exists
    let tagHtml = "";
    if (todo.tag && todo.tagColor && todo.tag !== "none") {
      tagHtml = `<span class="todo-tag-badge" style="background: ${todo.tagColor}; color: #fff;">${todo.tag}</span>`;
    }

    li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${
              todo.completed ? "checked" : ""
            }>
            <span class="todo-text" title="Doble clic para editar">${todo.text} ${tagHtml}</span>
            <div class="todo-actions">
              <button class="delete-btn" aria-label="Eliminar" title="Eliminar tarea">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            <div class="todo-hint">Doble clic para editar</div>
        `;

    // Toggle complete
    const checkbox = li.querySelector(".todo-checkbox");
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      
      if (todo.completed) {
        userPoints += 5; // +5 points for completing a task
        localStorage.setItem("enfoquePoints", userPoints);
        updateLevelUI();
        showToast("+5 Puntos por completar tarea!");
      }
      
      saveTodos();
      renderTodos();
    });

    // Delete
    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent trigger task click
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });


    // Define text element for editing
    const textSpan = li.querySelector(".todo-text");

    // Logic to edit text
    const startEdit = (e) => {
      if(e) e.stopPropagation();
      const input = document.createElement("input");
      input.type = "text";
      input.value = todo.text;
      input.className = "todo-edit-input";
      
      const hintEl = li.querySelector(".todo-hint");
      if(hintEl) hintEl.style.display = "none";
      
      // Temporarily clear the tag HTML to just edit text
      textSpan.innerHTML = "";
      textSpan.appendChild(input);
      input.focus();
      
      const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
          todo.text = newText;
          saveTodos();
        }
        renderTodos();
      };
      
      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
          input.removeEventListener("blur", saveEdit); // prevent double fire
          saveEdit();
        }
      });
    };

    // Double click to edit
    textSpan.addEventListener("dblclick", startEdit);

    // --- Drag and Drop Logic --- //
    li.addEventListener("dragstart", () => {
      dragStartIndex = index;
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });
    
    li.addEventListener("dragover", (e) => {
      e.preventDefault(); // necessary to allow dropping
      const draggingItem = document.querySelector(".dragging");
      const currentItems = [...todoList.querySelectorAll(".todo-item:not(.dragging)")];
      let nextItem = currentItems.find(item => {
        return e.clientY <= item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
      });
      if (nextItem) {
        todoList.insertBefore(draggingItem, nextItem);
      } else {
        todoList.appendChild(draggingItem);
      }
    });

    li.addEventListener("drop", (e) => {
      const dragEndIndex = Array.from(todoList.children).indexOf(li);
      if (dragStartIndex !== undefined && dragStartIndex !== dragEndIndex) {
        // Reorder array
        const item = todos.splice(dragStartIndex, 1)[0];
        todos.splice(dragEndIndex, 0, item);
        saveTodos();
        renderTodos();
      }
    });
    
    todoList.addEventListener("dragover", (e) => e.preventDefault()); // Allow drop on container
    
    todoList.appendChild(li);
  });
}

function addTodo() {
  const text = todoInput.value.trim();
  const tagOption = todoTagSelect ? todoTagSelect.options[todoTagSelect.selectedIndex] : null;
  const tag = tagOption ? tagOption.value : "none";
  const tagColor = tagOption ? tagOption.dataset.color : null;
  
  if (text) {
    todos.push({ text, completed: false, tag, tagColor });
    saveTodos();
    renderTodos();
    todoInput.value = "";
    if (todoTagSelect) todoTagSelect.value = "none";
  }
}

addTodoBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

renderTodos();
