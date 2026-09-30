// Perimeter schedules preserved from the project's existing signage data.
const PARKING_DATA = {
  brebeuf: {
    name: "Rue de Brébeuf", shortName: "Brébeuf",
    bounds: "Saint-Joseph → Saint-Grégoire",
    sides: {
      East: { dayIndex: 4, startHour: 12, startMin: 30, endHour: 13, endMin: 30,
        directionHint: "Towards Papineau / Parc Laurier",
        notes: "Along Parc Laurier, up to Saint-Grégoire." },
      West: { dayIndex: 1, startHour: 13, startMin: 0, endHour: 14, endMin: 0,
        directionHint: "Towards Christophe-Colomb / the mountain", bounds: "Saint-Joseph → Gilford",
        notes: "North of Gilford, parking is prohibited at all times on the west side (REV bike path).", warning: true }
    }
  },
  chambord: {
    name: "Rue Chambord", shortName: "Chambord", bounds: "Saint-Joseph → Saint-Grégoire",
    sides: {
      East: { dayIndex: 1, startHour: 13, startMin: 0, endHour: 14, endMin: 0, directionHint: "Towards Lanaudière / Papineau" },
      West: { dayIndex: 3, startHour: 9, startMin: 0, endHour: 10, endMin: 0, directionHint: "Towards Brébeuf" }
    }
  },
  lanaudiere: {
    name: "Rue de Lanaudière", shortName: "Lanaudière", bounds: "Saint-Joseph → Saint-Grégoire",
    sides: {
      East: { dayIndex: 3, startHour: 8, startMin: 30, endHour: 9, endMin: 30, directionHint: "Towards Garnier / Papineau" },
      West: { dayIndex: 1, startHour: 12, startMin: 30, endHour: 13, endMin: 30, directionHint: "Towards Chambord" }
    }
  },
  roche: {
    name: "Rue de la Roche", shortName: "De la Roche", bounds: "Saint-Joseph → Gilford",
    sides: {
      East: { dayIndex: 4, startHour: 12, startMin: 0, endHour: 13, endMin: 0, directionHint: "Towards Brébeuf",
        notes: "Heads up: one mid-block section has a different Thursday schedule, 1:30–2:30 PM. This reminder covers 12–1 PM: check your sign.", warning: true },
      West: { dayIndex: 2, startHour: 10, startMin: 30, endHour: 11, endMin: 30, directionHint: "Towards Christophe-Colomb" }
    }
  },
  christophe: {
    name: "Avenue Christophe-Colomb", shortName: "Christophe-Colomb", bounds: "Saint-Joseph → Gilford",
    sides: {
      East: { dayIndex: 2, startHour: 10, startMin: 0, endHour: 11, endMin: 0, directionHint: "Towards De la Roche",
        notes: "North of Gilford, parking is prohibited at all times.", warning: true },
      West: { dayIndex: 4, startHour: 12, startMin: 0, endHour: 13, endMin: 0, directionHint: "Towards Saint-Denis",
        notes: "North of Gilford, parking is prohibited at all times.", warning: true }
    }
  }
};

const TIME_ZONE = "America/Toronto";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SIDE_NAMES = { East: "East", West: "West" };
const montrealFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
});
let currentStreetKey = "brebeuf";
let currentSide = "East";

// A UTC Date carries Montréal's wall-clock fields, independent of the device zone.
function montrealDate(date) {
  const parts = Object.fromEntries(montrealFormatter.formatToParts(date).map(part => [part.type, part.value]));
  return new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second));
}

function montrealInstant(wallDate) {
  let instant = new Date(wallDate);
  for (let i = 0; i < 2; i++) {
    instant = new Date(instant.getTime() + wallDate.getTime() - montrealDate(instant).getTime());
  }
  return instant;
}

function isParkingSeason(date = new Date()) {
  const wall = montrealDate(date);
  return wall.getUTCMonth() >= 3 && (wall.getUTCMonth() < 11 || wall.getUTCDate() === 1);
}

function getCleaningEnd(rule, start) {
  const wall = montrealDate(start);
  wall.setUTCHours(rule.endHour, rule.endMin, 0, 0);
  return montrealInstant(wall);
}

function getNextCleaningDate(rule, referenceDate = new Date()) {
  const wall = montrealDate(referenceDate);
  wall.setUTCHours(rule.startHour, rule.startMin, 0, 0);
  wall.setUTCDate(wall.getUTCDate() + (rule.dayIndex - wall.getUTCDay() + 7) % 7);
  if (referenceDate >= getCleaningEnd(rule, montrealInstant(wall))) wall.setUTCDate(wall.getUTCDate() + 7);
  let candidate = montrealInstant(wall);
  if (!isParkingSeason(candidate)) {
    const year = wall.getUTCFullYear() + (wall.getUTCMonth() === 11 ? 1 : 0);
    wall.setUTCFullYear(year, 3, 1);
    wall.setUTCDate(1 + (rule.dayIndex - wall.getUTCDay() + 7) % 7);
    candidate = montrealInstant(wall);
  }
  return candidate;
}

function formatCountdown(targetDate, now, rule) {
  const diff = targetDate - now;
  if (diff <= 0 && now < getCleaningEnd(rule, targetDate)) return { text: "In progress", status: "urgent" };
  if (diff <= 0) return { text: "Completed", status: "normal" };
  const today = montrealDate(now);
  const target = montrealDate(targetDate);
  today.setUTCHours(0, 0, 0, 0);
  target.setUTCHours(0, 0, 0, 0);
  const days = (target - today) / 86400000;
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return { text: `In ${minutes} min`, status: "urgent" };
  if (days === 0) return { text: "Today", status: diff <= 7200000 ? "urgent" : "warning" };
  if (days === 1) return { text: "Tomorrow", status: "warning" };
  return { text: `In ${days} days`, status: "normal" };
}

function formatDateStr(date, now = new Date()) {
  return date.toLocaleDateString("en-US", {
    timeZone: TIME_ZONE, weekday: "long", month: "short", day: "numeric",
    ...(montrealDate(date).getUTCFullYear() !== montrealDate(now).getUTCFullYear() ? { year: "numeric" } : {})
  });
}

function formatSchedule(rule) {
  const time = (hour, minute) => new Date(Date.UTC(2000, 0, 1, hour, minute)).toLocaleTimeString("en-US", {
    timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true
  });
  return `${time(rule.startHour, rule.startMin)} – ${time(rule.endHour, rule.endMin)}`;
}

function generateICS(streetName, side, rule, nextCleaning) {
  const stamp = date => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const escape = text => text.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/[,;]/g, char => "\\" + char);
  const description = `Street cleaning: ${DAYS[rule.dayIndex]}, ${formatSchedule(rule)} (Montreal time).\nReminder 2 hours before. Check the signs where you park.${rule.notes ? "\n" + rule.notes : ""}`;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Brebeuf Park//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${stamp(nextCleaning)}-${encodeURIComponent(streetName)}-${side}@brebeufpark`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(nextCleaning)}`, `DTEND:${stamp(getCleaningEnd(rule, nextCleaning))}`,
    `SUMMARY:${escape(`Move your car: ${streetName} (${SIDE_NAMES[side]} side)`)}`,
    `DESCRIPTION:${escape(description)}`, `LOCATION:${escape(`${streetName}, Montréal, QC`)}`, "STATUS:CONFIRMED",
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Move your car: street cleaning starts in 2 hours.", "TRIGGER:-PT2H", "END:VALARM", "END:VEVENT", "END:VCALENDAR"
  ];
  // RFC 5545: fold at 75 UTF-8 bytes without splitting accented characters.
  const encoder = new TextEncoder();
  return lines.map(line => {
    let folded = "", bytes = 0;
    for (const char of line) {
      const length = encoder.encode(char).length;
      if (bytes + length > 75) { folded += "\r\n "; bytes = 1; }
      folded += char;
      bytes += length;
    }
    return folded;
  }).join("\r\n") + "\r\n";
}

function triggerCalendarReminder(streetName, side, rule, nextCleaning) {
  const blob = new Blob([generateICS(streetName, side, rule, nextCleaning)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `street-cleaning-${currentStreetKey}-${side.toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 60000);
}

function updateUI() {
  const street = PARKING_DATA[currentStreetKey];
  const rule = street.sides[currentSide];
  const now = new Date();
  const next = getNextCleaningDate(rule, now);
  const countdown = formatCountdown(next, now, rule);
  const inProgress = next <= now;
  const reminder = new Date(next.getTime() - 7200000);
  const text = (id, value) => { document.getElementById(id).textContent = value; };
  document.querySelectorAll(".street-btn").forEach(button => {
    const active = button.dataset.street === currentStreetKey;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".side-btn").forEach(button => {
    const active = button.dataset.side === currentSide;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  text("next-label", inProgress ? "Cleaning in progress" : "Next cleaning");
  text("next-date-text", formatDateStr(next, now));
  text("cleaning-time", formatSchedule(rule));
  text("countdown-badge", countdown.text);
  document.getElementById("countdown-badge").className = `countdown-badge status-${countdown.status}`;
  text("season-status-badge", `${isParkingSeason(now) ? "April 1 – December 1" : "Outside cleaning season"} · Montreal time`);
  document.getElementById("btn-set-reminder").disabled = inProgress;
  text("reminder-detail", inProgress ? "Move your car now" : reminder <= now ? "2-hour alert time has passed" : "Alert 2 hours before");
}

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 6000);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    const saved = JSON.parse(localStorage.getItem("brebeuf-selection"));
    if (saved && Object.hasOwn(PARKING_DATA, saved.street) && Object.hasOwn(SIDE_NAMES, saved.side)) {
      currentStreetKey = saved.street;
      currentSide = saved.side;
    }
  } catch { /* Storage can be disabled or contain an old invalid value. */ }
  function saveSelection() {
    try { localStorage.setItem("brebeuf-selection", JSON.stringify({ street: currentStreetKey, side: currentSide })); } catch { /* Keep the app usable without storage. */ }
    updateUI();
  }
  document.querySelectorAll(".street-btn").forEach(button => button.addEventListener("click", () => {
    currentStreetKey = button.dataset.street;
    saveSelection();
  }));
  document.querySelectorAll(".side-btn").forEach(button => button.addEventListener("click", () => {
    currentSide = button.dataset.side;
    saveSelection();
  }));
  document.getElementById("btn-set-reminder").addEventListener("click", () => {
    const street = PARKING_DATA[currentStreetKey];
    const rule = street.sides[currentSide];
    const now = new Date();
    const next = getNextCleaningDate(rule, now);
    updateUI();
    if (next <= now) return;
    triggerCalendarReminder(street.name, currentSide, rule, next);
    showToast("Calendar file ready. Open it and save the event to activate the reminder.");
  });
  updateUI();
  setInterval(updateUI, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updateUI(); });
  if ("serviceWorker" in navigator) {
    const alreadyControlled = !!navigator.serviceWorker.controller;
    if (alreadyControlled) navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(error => console.warn("Offline mode unavailable", error));
  }
});
