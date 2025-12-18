document.addEventListener("DOMContentLoaded", () => {
    // ----------------------
    // Toolbar toggle
    // ----------------------
    const settingsBtn = document.getElementById('settingsBtn');
    const editor = document.getElementById('editor');
    const closeBtn = document.getElementById("closeEditor");

    settingsBtn.addEventListener('click', () => editor.classList.toggle('visible'));
    if (closeBtn) closeBtn.addEventListener("click", () => editor.classList.remove("visible"));

    // ----------------------
    // Ante toggle
    // ----------------------
    const anteCheck = document.getElementById("anteCheck");
    const anteRow = document.getElementById("anteRow");
    anteCheck.addEventListener("change", () => anteRow.style.display = anteCheck.checked ? "flex" : "none");

    // ----------------------
    // Background selector
    // ----------------------
    const bgOptions = document.querySelectorAll(".bg-option");
    const savedBg = localStorage.getItem("selectedBg");
    if (savedBg) document.body.style.backgroundImage = `url(${savedBg})`;
    bgOptions.forEach(img => {
        if (img.getAttribute("src") === savedBg) img.classList.add("selected");
        img.addEventListener("click", () => {
            bgOptions.forEach(i => i.classList.remove("selected"));
            img.classList.add("selected");
            const src = img.getAttribute("src");
            document.body.style.backgroundImage = `url(${src})`;
            localStorage.setItem("selectedBg", src);
        });
    });

    // ----------------------
    // Inputs and displays
    // ----------------------
    const sbInput = document.getElementById("sbInput");
    const bbInput = document.getElementById("bbInput");
    const minutesInput = document.getElementById("minutesInput");
    const anteInput = document.getElementById("anteInput");
    const breakCheck = document.getElementById("breakCheck");

    const sbDisplay = document.getElementById("sb");
    const bbDisplay = document.getElementById("bb");
    const anteDisplay = document.getElementById("ante");
    const timerDisplay = document.getElementById("timer");
    const levelList = document.getElementById("levelList");

    const addLevelBtn = document.getElementById("addLevel");
    const addBreakBtn = document.getElementById("addBreak");
    const startBtn = document.getElementById("startBtn");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const pauseBtn = document.getElementById("pauseBtn");

    const resetModal = document.getElementById("resetModal");
    const restartTournamentBtn = document.getElementById("restartTournamentBtn");
    const resetLevelBtn = document.getElementById("resetLevelBtn");
    const cancelResetBtn = document.getElementById("cancelResetBtn");

    let tournamentSettings = JSON.parse(localStorage.getItem("tournamentSettings")) || { levels: [] };
    let currentLevelIndex = 0;
    let timerInterval = null;
    let remainingTime = 0;
    let isPaused = false;

    // ----------------------
    // Enable/disable inputs when break is checked
    // ----------------------
    function toggleInputs() {
        const inputs = [sbInput, bbInput, anteInput];
        inputs.forEach(input => input.disabled = breakCheck.checked);
        inputs.forEach(input => input.style.backgroundColor = breakCheck.checked ? "#ccc" : "#fff");
    }
    breakCheck.addEventListener("change", toggleInputs);
    toggleInputs();

    // ----------------------
    // Display current level
    // ----------------------
    function showLevel(index) {
        if (!tournamentSettings.levels[index]) return;
        const level = tournamentSettings.levels[index];

        if (level.type === "level") {
            // Small Blind
            const sbNum = sbDisplay.querySelector(".blind-number");
            const sbLbl = sbDisplay.querySelector(".blind-label");
            sbNum.textContent = level.sb;
            sbLbl.textContent = "Small Blind";

            // Big Blind
            const bbNum = bbDisplay.querySelector(".blind-number");
            const bbLbl = bbDisplay.querySelector(".blind-label");
            bbNum.textContent = level.bb;
            bbLbl.textContent = "Big Blind";

            // Ante
            if (level.ante) {
                anteDisplay.style.display = "block";
                anteDisplay.textContent = `Ante: ${level.ante}`;
            } else {
                anteDisplay.style.display = "none";
                anteDisplay.textContent = "";
            }

            if (remainingTime === 0) remainingTime = parseInt(level.minutes) * 60;
        } else if (level.type === "break") {
            sbDisplay.querySelector(".blind-number").textContent = "";
            sbDisplay.querySelector(".blind-label").textContent = "";
            bbDisplay.querySelector(".blind-number").textContent = "";
            bbDisplay.querySelector(".blind-label").textContent = "";
            anteDisplay.style.display = "none";
            anteDisplay.textContent = "";
            if (remainingTime === 0) remainingTime = parseInt(level.minutes) * 60;
        }

        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const level = tournamentSettings.levels[currentLevelIndex];
        if (!level) return;
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent = level.type === "break"
            ? `Break! ${mins}:${secs < 10 ? "0" : ""}${secs}`
            : `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // ----------------------
    // Level list rendering
    // ----------------------
    function updateLevelList() {
        levelList.innerHTML = "";
        tournamentSettings.levels.forEach((lvl, i) => {
            const div = document.createElement("div");
            div.className = "level-item";
            div.innerHTML = `${lvl.type === "break" ? "Break" : `SB: ${lvl.sb} BB: ${lvl.bb} ${lvl.ante ? "| Ante: "+lvl.ante : ""}`} - ${lvl.minutes} min
                <button class="deleteBtn">❌</button>
                <button class="upBtn">⬆</button>
                <button class="downBtn">⬇</button>
            `;
            levelList.appendChild(div);

            // Delete
            div.querySelector(".deleteBtn").addEventListener("click", () => {
                tournamentSettings.levels.splice(i, 1);
                localStorage.setItem("tournamentSettings", JSON.stringify(tournamentSettings));
                updateLevelList();
            });

            // Move up
            div.querySelector(".upBtn").addEventListener("click", () => {
                if (i === 0) return;
                [tournamentSettings.levels[i-1], tournamentSettings.levels[i]] = [tournamentSettings.levels[i], tournamentSettings.levels[i-1]];
                localStorage.setItem("tournamentSettings", JSON.stringify(tournamentSettings));
                updateLevelList();
            });

            // Move down
            div.querySelector(".downBtn").addEventListener("click", () => {
                if (i === tournamentSettings.levels.length - 1) return;
                [tournamentSettings.levels[i], tournamentSettings.levels[i+1]] = [tournamentSettings.levels[i+1], tournamentSettings.levels[i]];
                localStorage.setItem("tournamentSettings", JSON.stringify(tournamentSettings));
                updateLevelList();
            });
        });
    }

    // ----------------------
    // Add Level / Break
    // ----------------------
    addLevelBtn.addEventListener("click", () => {
        const level = {
            type: "level",
            sb: sbInput.value,
            bb: bbInput.value,
            ante: anteCheck.checked ? anteInput.value : 0,
            minutes: minutesInput.value
        };
        tournamentSettings.levels.push(level);
        localStorage.setItem("tournamentSettings", JSON.stringify(tournamentSettings));
        updateLevelList();
    });

    addBreakBtn.addEventListener("click", () => {
        const level = {
            type: "break",
            minutes: minutesInput.value
        };
        tournamentSettings.levels.push(level);
        localStorage.setItem("tournamentSettings", JSON.stringify(tournamentSettings));
        updateLevelList();
    });

    // ----------------------
    // Timer start / pause / resume
    // ----------------------
    function startTimer() {
        if (!tournamentSettings.levels[currentLevelIndex]) return;
        if (timerInterval) return; // already running
        isPaused = false;
        pauseBtn.textContent = "Pause";

        timerInterval = setInterval(() => {
            if (!isPaused) {
                remainingTime--;
                updateTimerDisplay();

                if (remainingTime < 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    if (currentLevelIndex < tournamentSettings.levels.length - 1) {
                        currentLevelIndex++;
                        remainingTime = 0;
                        showLevel(currentLevelIndex);
                        startTimer();
                    }
                }
            }
        }, 1000);
    }

    startBtn.addEventListener("click", () => {
        if (timerInterval && isPaused) { // Resume
            isPaused = false;
            pauseBtn.textContent = "Pause";
        } else if (!timerInterval) { // Start new
            showLevel(currentLevelIndex);
            startTimer();
        }
    });

    pauseBtn.addEventListener("click", () => {
        if (!timerInterval) return;
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? "Resume" : "Pause";
    });

    nextBtn.addEventListener("click", () => {
        if (currentLevelIndex < tournamentSettings.levels.length - 1) {
            currentLevelIndex++;
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
            remainingTime = 0;
            showLevel(currentLevelIndex);
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentLevelIndex > 0) {
            currentLevelIndex--;
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
            remainingTime = 0;
            showLevel(currentLevelIndex);
        }
    });

    // ----------------------
    // Reset modal
    // ----------------------
    const resetBtn = document.getElementById("resetBtn");

    resetBtn.addEventListener("click", () => resetModal.style.display = "block");
    cancelResetBtn.addEventListener("click", () => resetModal.style.display = "none");

    resetLevelBtn.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        const level = tournamentSettings.levels[currentLevelIndex];
        remainingTime = parseInt(level.minutes) * 60;
        showLevel(currentLevelIndex);
        resetModal.style.display = "none";
    });

    restartTournamentBtn.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        currentLevelIndex = 0;
        const level = tournamentSettings.levels[currentLevelIndex];
        remainingTime = parseInt(level.minutes) * 60;
        showLevel(currentLevelIndex);
        resetModal.style.display = "none";
    });

    // ----------------------
    // Initialize
    // ----------------------
    updateLevelList();
    if (tournamentSettings.levels.length > 0) showLevel(currentLevelIndex);
});
