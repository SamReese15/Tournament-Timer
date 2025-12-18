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

    // Apply saved background on page load
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
    // Settings inputs
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

  const saveBtn = document.getElementById("saveSettings");

  // ----------------------
  // Load saved settings
  // ----------------------
  const savedSettings = JSON.parse(localStorage.getItem("tournamentSettings"));
  if (savedSettings) {
    sbInput.value = savedSettings.smallBlind;
    bbInput.value = savedSettings.bigBlind;
    minutesInput.value = savedSettings.levelMinutes;
    anteInput.value = savedSettings.anteValue || 0;
    anteCheck.checked = savedSettings.anteChecked || false;
    breakCheck.checked = savedSettings.breakChecked || false;
  }

  // ----------------------
  // Update main display
  // ----------------------
  function updateDisplay() {
  sbDisplay.textContent = `Small Blind: ${sbInput.value}`;
  bbDisplay.textContent = `Big Blind: ${bbInput.value}`;

  // Show Ante separately under blinds if checked
  if (anteCheck.checked) {
    anteDisplay.style.display = "block";
    anteDisplay.textContent = `Ante: ${anteInput.value}`;
  } else {
    anteDisplay.style.display = "none";
  }

  // Timer / Break display
  timerDisplay.textContent = breakCheck.checked
    ? `Break! ${minutesInput.value}:00`
    : `${minutesInput.value}:00`;
}

  // Initial display
  updateDisplay();

  // ----------------------
  // Save button
  // ----------------------
  saveBtn.addEventListener("click", () => {
    const settings = {
      smallBlind: sbInput.value,
      bigBlind: bbInput.value,
      levelMinutes: minutesInput.value,
      anteValue: anteInput.value,
      anteChecked: anteCheck.checked,
      breakChecked: breakCheck.checked
    };

    localStorage.setItem("tournamentSettings", JSON.stringify(settings));

    updateDisplay(); // Immediately update screen
    editor.classList.remove("visible"); // Close settings panel
  });

});
