// Dark Mode Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "🌙" : "☀️";
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "🌙";
}

// Welcome Screen Logic
function startApp() {
  localStorage.setItem("hasStarted", true);
  document.getElementById("welcomeScreen").style.display = "none";
  document.querySelector(".app-header").classList.remove("hidden");
  document.querySelector(".dashboard").classList.remove("hidden");
}
if (localStorage.getItem("hasStarted")) {
  document.getElementById("welcomeScreen").style.display = "none";
  document.querySelector(".app-header").classList.remove("hidden");
  document.querySelector(".dashboard").classList.remove("hidden");
} else {
  document.getElementById("welcomeScreen").style.display = "flex";
  document.querySelector(".app-header").classList.add("hidden");
  document.querySelector(".dashboard").classList.add("hidden");
}

// Navigation Logic
function navigate(page) {
  document.querySelectorAll("main, section").forEach(s => s.classList.add("hidden"));
  document.getElementById(page + "Page").classList.remove("hidden");
  if (page === "today") {
    loadToday();
  } else if (page === "logs") {
    setupLogs();
  }
}
function goHome() {
  document.querySelectorAll("main, section").forEach(s => s.classList.add("hidden"));
  document.querySelector("main").classList.remove("hidden");
}

// Add Medicine Logic
const addForm = document.getElementById("addMedicineForm");
addForm.onsubmit = function(e) {
  e.preventDefault();
  const med = {
    name: document.getElementById("name").value,
    dosage: document.getElementById("dosage").value,
    times: document.getElementById("timesPerDay").value,
    meal: document.getElementById("mealTime").value,
    timeOfDay: document.getElementById("timeOfDay").value,
    duration: parseInt(document.getElementById("duration").value),
    startDate: document.getElementById("startDate").value,
    taken: []
  };
  const meds = JSON.parse(localStorage.getItem("medicines")) || [];
  meds.push(med);
  localStorage.setItem("medicines", JSON.stringify(meds));
  addForm.reset();
  navigate('today');
};

// Load Today's Medicines (with Delete and Slide-up Details)
function loadToday() {
  document.getElementById("morningGroup").innerHTML = "";
  document.getElementById("nightGroup").innerHTML = "";
  const meds = JSON.parse(localStorage.getItem("medicines")) || [];
  const today = new Date().toISOString().split("T")[0];
  meds.forEach((med, index) => {
    const startDate = new Date(med.startDate);
    const todayDate = new Date(today);
    const dayDiff = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (dayDiff > 0 && dayDiff <= med.duration) {
      const progress = Math.floor((dayDiff / med.duration) * 100);
      const card = document.createElement("div");
      card.className = "card-entry";

      // Medicine Card Content
      card.innerHTML = `
        <div onclick="showMedicineDetails(${index})">
          <strong>${med.name}</strong><br>
          Dosage: ${med.dosage}<br>
          Day ${dayDiff} of ${med.duration}
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
        </div>
        <div>
          <label>
            <input type="checkbox" ${med.taken.find(entry => entry.date === today)?.status ? "checked" : ""} 
              onchange="markTaken(${index}, '${today}', this.checked)">
            Taken
          </label>
          <button onclick="deleteMedicine(${index})" class="delete-btn">Delete</button>
        </div>
      `;

      if (med.timeOfDay.includes("Morning")) {
        document.getElementById("morningGroup").appendChild(card);
      }
      if (med.timeOfDay.includes("Night")) {
        document.getElementById("nightGroup").appendChild(card);
      }
    }
  });
}

// Mark as Taken
function markTaken(index, date, status) {
  const meds = JSON.parse(localStorage.getItem("medicines"));
  meds[index].taken = meds[index].taken || [];
  const existing = meds[index].taken.find(entry => entry.date === date);
  if (existing) {
    existing.status = status;
  } else {
    meds[index].taken.push({ date: date, status: status });
  }
  localStorage.setItem("medicines", JSON.stringify(meds));
  loadToday();
}

// Delete Medicine
function deleteMedicine(index) {
  if (confirm("Are you sure you want to delete this medicine?")) {
    const meds = JSON.parse(localStorage.getItem("medicines")) || [];
    meds.splice(index, 1);
    localStorage.setItem("medicines", JSON.stringify(meds));
    loadToday();
  }
}

// Logs Page Setup
function setupLogs() {
  const datePicker = document.getElementById("logDatePicker");
  datePicker.value = "";
  document.getElementById("logsResult").innerHTML = "";
  datePicker.onchange = function() {
    const selectedDate = this.value;
    const meds = JSON.parse(localStorage.getItem("medicines")) || [];
    const logResult = document.getElementById("logsResult");
    logResult.innerHTML = "";
    meds.forEach(med => {
      const takenEntry = (med.taken || []).find(entry => entry.date === selectedDate);
      const statusText = takenEntry ? (takenEntry.status ? "Taken" : "Missed") : "Not Recorded";
      const statusClass = takenEntry ? (takenEntry.status ? "taken-label" : "not-taken-label") : "not-taken-label";
      logResult.innerHTML += `<div class="log-entry">${med.name} - <span class="${statusClass}">${statusText}</span></div>`;
    });
  };
}

// Slide-up Modal Logic
function showMedicineDetails(index) {
  const meds = JSON.parse(localStorage.getItem("medicines")) || [];
  const med = meds[index];
  document.getElementById("modalMedName").textContent = med.name;
  document.getElementById("modalDosage").textContent = med.dosage;
  document.getElementById("modalTimes").textContent = med.times;
  document.getElementById("modalMeal").textContent = med.meal;
  document.getElementById("modalTime").textContent = med.timeOfDay;
  document.getElementById("modalDuration").textContent = med.duration;
  document.getElementById("modalStartDate").textContent = med.startDate;

  const modal = document.getElementById("medicineModal");
  modal.classList.add("show");
  modal.classList.remove("hidden");
}

// Close Modal Function
function closeModal() {
  const modal = document.getElementById("medicineModal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}
