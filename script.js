// script.js
// Logic untuk menerima update dari Pusher dan update DOM scoreboard

// Optional: matikan log Pusher biar console gak rame
Pusher.logToConsole = false;

// Inisialisasi Pusher (pakai key & cluster kamu)
const pusher = new Pusher("5f34f9c43667f7213afb", {
  cluster: "ap1",
});

// Subscribe ke channel
const channel = pusher.subscribe("scoreboard-channel");

let goalTimeout;
let lastVisibility = true;
let timeInterval;
let timeBaseSeconds = 0;
let timeStartMs = null;
let timeRunning = false;

// Handler ketika ada event "update" dari Netlify Function
channel.bind("update", function (data) {
  console.log("Pusher update:", data);

  // Ambil elemen DOM sekali saja
  const teamLeftEl = document.querySelector(".team-left");
  const teamRightEl = document.querySelector(".team-right");
  const scoreLeftEl = document.querySelector(".score-left");
  const scoreRightEl = document.querySelector(".score-right");
  const timeEl = document.querySelector("#match-time");
  const slideEl = document.querySelector(".slide16-9");
  const goalOverlay = document.getElementById("goal-overlay");
  const goalTeamEl = document.getElementById("goal-team-name");

  // Safety check
  if (!teamLeftEl || !teamRightEl || !scoreLeftEl || !scoreRightEl || !timeEl) {
    console.warn("Elemen scoreboard tidak lengkap di index.html");
    return;
  }

  // Update nama tim (kalau tidak kosong)
  if (typeof data.teamLeft === "string" && data.teamLeft.trim() !== "") {
    teamLeftEl.textContent = data.teamLeft;
  }

  if (typeof data.teamRight === "string" && data.teamRight.trim() !== "") {
    teamRightEl.textContent = data.teamRight;
  }

  // Update score
  if (data.scoreLeft !== undefined && data.scoreLeft !== "") {
    scoreLeftEl.textContent = data.scoreLeft;
  }

  if (data.scoreRight !== undefined && data.scoreRight !== "") {
    scoreRightEl.textContent = data.scoreRight;
  }

  // Update waktu
  if (typeof data.time === "string" && data.time.trim() !== "") {
    if (data.timeRunning) {
      timeBaseSeconds = Number(data.timeBaseSeconds || 0);
      timeStartMs = data.timeStartMs || Date.now();
      timeRunning = true;
      startOverlayTimer(timeEl);
    } else {
      stopOverlayTimer();
      timeEl.textContent = data.time;
    }
  }

  if (typeof data.scoreLeftColor === "string" && data.scoreLeftColor.trim() !== "") {
    slideEl?.style.setProperty("--score-left-color", data.scoreLeftColor);
  }

  if (typeof data.scoreRightColor === "string" && data.scoreRightColor.trim() !== "") {
    slideEl?.style.setProperty("--score-right-color", data.scoreRightColor);
  }

  if (typeof data.visible === "boolean") {
    lastVisibility = data.visible;
  }
  applyVisibility(slideEl, lastVisibility, data.replayEntrance);

  if (data.eventType === "goal") {
    playGoalAnimation({
      goalSide: data.goalSide,
      goalDuration: data.goalDuration,
      slideEl,
      goalOverlay,
      goalTeamEl,
      teamLeftEl,
      teamRightEl,
    });
  }
});

function applyVisibility(slideEl, isVisible, replay) {
  if (!slideEl) return;
  slideEl.classList.toggle("hide-scoreboard", !isVisible);

  if (isVisible && replay) {
    slideEl.classList.remove("goal-mode");
    replayEntranceAnimations();
  }
}

function playGoalAnimation({
  goalSide,
  goalDuration,
  slideEl,
  goalOverlay,
  goalTeamEl,
  teamLeftEl,
  teamRightEl,
}) {
  if (!slideEl || !goalOverlay || !goalTeamEl) return;

  const teamName =
    goalSide === "right" ? teamRightEl?.textContent : teamLeftEl?.textContent;

  goalTeamEl.textContent = (teamName || "GOAL").toUpperCase();

  slideEl.classList.add("goal-mode");

  clearTimeout(goalTimeout);
  const durationMs = (Number(goalDuration) || 4) * 1000;
  goalTimeout = setTimeout(() => {
    slideEl.classList.remove("goal-mode");
    applyVisibility(slideEl, lastVisibility);
  }, durationMs);
}

function replayEntranceAnimations() {
  const elements = document.querySelectorAll(
    ".bars-wrapper, .epl-logo, .team-name, .score, .time-panel"
  );
  elements.forEach((el) => {
    el.style.animation = "none";
    // force reflow
    void el.offsetHeight;
    el.style.animation = "";
  });
}

function startOverlayTimer(timeEl) {
  stopOverlayTimer();
  updateOverlayTime(timeEl);
  timeInterval = setInterval(() => updateOverlayTime(timeEl), 1000);
}

function stopOverlayTimer() {
  clearInterval(timeInterval);
  timeInterval = null;
}

function updateOverlayTime(timeEl) {
  if (!timeRunning || !timeEl) return;
  const elapsedSec = Math.floor((Date.now() - timeStartMs) / 1000);
  const total = timeBaseSeconds + elapsedSec;
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  timeEl.textContent = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
