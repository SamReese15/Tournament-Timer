document.addEventListener("DOMContentLoaded", () => {
  // ----------------------
  // Toolbar toggle
  // ----------------------
  const settingsBtn = document.getElementById('settingsBtn');
  const editor = document.getElementById('editor');

  settingsBtn.addEventListener('click', () => {
    editor.classList.toggle('visible');
  });

  const closeBtn = document.getElementById("closeEditor");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      editor.classList.remove("visible");
    });
  }

  // ----------------------
  // Ante checkbox toggle
  // ----------------------
  const anteCheck = document.getElementById("anteCheck");
  const anteRow = document.getElementById("anteRow");

  anteCheck.addEventListener("change", () => {
    anteRow.style.display = anteCheck.checked ? "flex" : "none";
  });

  // ----------------------
  // Background selector
  // ----------------------
  const bgOptions = document.querySelectorAll(".bg-option");

  const savedBg = localStorage.getItem("selectedBg");
  if (savedBg) {
    document.body.style.backgroundImage = `url(${savedBg})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    bgOptions.forEach(img => {
      if (img.getAttribute("src") === savedBg) img.classList.add("selected");
    });
  }

  bgOptions.forEach(img => {
    img.addEventListener("click", () => {
      bgOptions.forEach(i => i.classList.remove("selected"));
      img.classList.add("selected");
      const src = img.getAttribute("src");
      document.body.style.backgroundImage = `url(${src})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
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

  // ----------------------
  // Load levels from localStorage
  // ----------------------
  let levels = JSON.parse(localStorage.getItem("levels")) || [];
  let currentLevelIndex = 0;

  function renderLevels() {
    levelList.innerHTML = "";
    levels.forEach((lvl, i) => {
      const div = document.createElement("div");
      div.className = "level-item";
      div.textContent = lvl.isBreak
        ? `Break: ${lvl.minutes} min`
        : `Level ${i + 1}: SB: ${lvl.sb}, BB: ${lvl.bb}, Ante: ${lvl.anteChecked ? lvl.ante : 0}, ${lvl.minutes} min`;
      if (i === currentLevelIndex) div.style.fontWeight = "bold";
      levelList.appendChild(div);
    });
  }

  function updateDisplay(level) {
    if (!level) return;
    if (level.isBreak) {
      timerDisplay.textContent = `Break! ${level.minutes}:00`;
      sbDisplay.textContent = "";
      bbDisplay.textContent = "";
      anteDisplay.style.display = "none";
    } else {
      sbDisplay.textContent = `Small Blind: ${level.sb}`;
      bbDisplay.textContent = `Big Blind: ${level.bb}`;
      if (level.anteChecked) {
        anteDisplay.style.display = "block";
        anteDisplay.textContent = `Ante: ${level.ante}`;
      } else {
        anteDisplay.style.display = "none";
      }
      timerDisplay.textContent = `${level.minutes}:00`;
    }
  }

  // ----------------------
    // Break checkbox toggle
    // ----------------------
    function handleBreakToggle() {
    const disabled = breakCheck.checked;

    // Disable inputs
    sbInput.disabled = disabled;
    bbInput.disabled = disabled;
    anteInput.disabled = disabled;
    anteCheck.disabled = disabled;

    // Change styles directly
    sbInput.style.backgroundColor = disabled ? "#e0e0e0" : "";
    sbInput.style.color = disabled ? "#888" : "";

    bbInput.style.backgroundColor = disabled ? "#e0e0e0" : "";
    bbInput.style.color = disabled ? "#888" : "";

    anteInput.style.backgroundColor = disabled ? "#e0e0e0" : "";
    anteInput.style.color = disabled ? "#888" : "";

    // Optionally grey out ante checkbox label
    const anteLabel = document.querySelector('label[for="anteCheck"]');
    anteLabel.style.color = disabled ? "#888" : "";

    // Ante row visibility
    anteRow.style.display = (!disabled && anteCheck.checked) ? "flex" : "none";

    updateDisplay();
}

breakCheck.addEventListener("change", handleBreakToggle);


  // Show initial level if any
  if (levels.length > 0) updateDisplay(levels[currentLevelIndex]);
  renderLevels();

  // ----------------------
  // Add Level button
  // ----------------------
  addLevelBtn.addEventListener("click", () => {
    const level = {
      isBreak: false,
      sb: sbInput.value,
      bb: bbInput.value,
      ante: anteInput.value,
      anteChecked: anteCheck.checked,
      minutes: minutesInput.value
    };
    levels.push(level);
    localStorage.setItem("levels", JSON.stringify(levels));
    renderLevels();
    editor.classList.remove("visible");
  });

  // ----------------------
  // Add Break button
  // ----------------------
  addBreakBtn.addEventListener("click", () => {
    const level = {
      isBreak: true,
      minutes: minutesInput.value
    };
    levels.push(level);
    localStorage.setItem("levels", JSON.stringify(levels));
    renderLevels();
    editor.classList.remove("visible");
  });

  // ----------------------
  // Next Level button (cycles through levels)
  // ----------------------
  const nextLevelBtn = document.createElement("button");
  nextLevelBtn.textContent = "Next Level";
  nextLevelBtn.id = "nextLevel";
  document.querySelector(".timer-container").appendChild(nextLevelBtn);

  nextLevelBtn.addEventListener("click", () => {
    if (levels.length === 0) return;
    currentLevelIndex = (currentLevelIndex + 1) % levels.length;
    updateDisplay(levels[currentLevelIndex]);
    renderLevels();
  });
});
