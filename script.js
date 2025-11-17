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

// Handler ketika ada event "update" dari Netlify Function
channel.bind("update", function (data) {
  console.log("Pusher update:", data);

  // Ambil elemen DOM sekali saja
  const teamLeftEl = document.querySelector(".team-left");
  const teamRightEl = document.querySelector(".team-right");
  const scoreLeftEl = document.querySelector(".score-left");
  const scoreRightEl = document.querySelector(".score-right");
  const timeEl = document.querySelector("#match-time");

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
    timeEl.textContent = data.time;
  }

  // Update warna score
  if (typeof data.scoreLeftColor === "string" && data.scoreLeftColor.trim() !== "") {
    scoreLeftEl.style.color = data.scoreLeftColor;
  }

  if (typeof data.scoreRightColor === "string" && data.scoreRightColor.trim() !== "") {
    scoreRightEl.style.color = data.scoreRightColor;
  }
});
