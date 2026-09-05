/**
 * Brébeuf & Perimeter Parking Reminder Engine
 * Accurate City of Montreal Signage Rules (April 1 - December 1)
 */

const PARKING_DATA = {
  "brebeuf": {
    name: "Rue de Brébeuf",
    shortName: "Brébeuf",
    bounds: "Blvd Saint-Joseph to Rue Saint-Grégoire",
    sides: {
      "East": {
        day: "Thursday",
        dayIndex: 4, // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        startHour: 12,
        startMin: 30,
        endHour: 13,
        endMin: 30,
        timeFormatted: "12:30 PM – 1:30 PM",
        time24h: "12h30 – 13h30",
        directionHint: "Towards Papineau / Parc Laurier side",
        signCode: "P 12h30-13h30 JEUDI 1 AVRIL AU 1 DEC",
        notes: "Applies all the way from Blvd Saint-Joseph to Rue Saint-Grégoire along Parc Laurier."
      },
      "West": {
        day: "Monday",
        dayIndex: 1,
        startHour: 13,
        startMin: 0,
        endHour: 14,
        endMin: 0,
        timeFormatted: "1:00 PM – 2:00 PM",
        time24h: "13h00 – 14h00",
        directionHint: "Towards Christophe-Colomb / Mountain",
        signCode: "P 13h-14h LUNDI 1 AVRIL AU 1 DEC",
        notes: "Applies between Blvd Saint-Joseph and Rue Gilford. Note: North of Gilford (along Parc Laurier), parking is prohibited at all times due to the REV bike path."
      }
    }
  },
  "chambord": {
    name: "Rue Chambord",
    shortName: "Chambord",
    bounds: "Blvd Saint-Joseph to Rue Saint-Grégoire",
    sides: {
      "East": {
        day: "Monday",
        dayIndex: 1,
        startHour: 13,
        startMin: 0,
        endHour: 14,
        endMin: 0,
        timeFormatted: "1:00 PM – 2:00 PM",
        time24h: "13h00 – 14h00",
        directionHint: "Towards Lanaudière / Papineau",
        signCode: "P 13h-14h LUNDI 1 AVRIL AU 1 DEC",
        notes: "Applies consistently across all blocks from Saint-Joseph to Saint-Grégoire."
      },
      "West": {
        day: "Wednesday",
        dayIndex: 3,
        startHour: 9,
        startMin: 0,
        endHour: 10,
        endMin: 0,
        timeFormatted: "9:00 AM – 10:00 AM",
        time24h: "09h00 – 10h00",
        directionHint: "Towards Brébeuf",
        signCode: "P 9h-10h MERCREDI 1 AVRIL AU 1 DEC",
        notes: "Applies consistently across all blocks from Saint-Joseph to Saint-Grégoire."
      }
    }
  },
  "lanaudiere": {
    name: "Rue de Lanaudière",
    shortName: "Lanaudière",
    bounds: "Blvd Saint-Joseph to Rue Saint-Grégoire",
    sides: {
      "East": {
        day: "Wednesday",
        dayIndex: 3,
        startHour: 8,
        startMin: 30,
        endHour: 9,
        endMin: 30,
        timeFormatted: "8:30 AM – 9:30 AM",
        time24h: "08h30 – 09h30",
        directionHint: "Towards Garnier / Papineau",
        signCode: "P 8h30-9h30 MERCREDI 1 AVRIL AU 1 DEC",
        notes: "Applies consistently across all blocks from Saint-Joseph to Saint-Grégoire."
      },
      "West": {
        day: "Monday",
        dayIndex: 1,
        startHour: 12,
        startMin: 30,
        endHour: 13,
        endMin: 30,
        timeFormatted: "12:30 PM – 1:30 PM",
        time24h: "12h30 – 13h30",
        directionHint: "Towards Chambord",
        signCode: "P 12h30-13h30 LUNDI 1 AVRIL AU 1 DEC",
        notes: "Applies consistently across all blocks from Saint-Joseph to Saint-Grégoire."
      }
    }
  },
  "roche": {
    name: "Rue de la Roche",
    shortName: "De la Roche",
    bounds: "Blvd Saint-Joseph to Rue Gilford",
    sides: {
      "East": {
        day: "Thursday",
        dayIndex: 4,
        startHour: 12,
        startMin: 0,
        endHour: 13,
        endMin: 0,
        timeFormatted: "12:00 PM – 1:00 PM",
        time24h: "12h00 – 13h00",
        directionHint: "Towards Brébeuf",
        signCode: "P 12h-13h JEUDI 1 AVRIL AU 1 DEC",
        notes: "Applies between Saint-Joseph and Gilford (one mid-block section indicates 1:30 PM – 2:30 PM). Street ends at Gilford."
      },
      "West": {
        day: "Tuesday",
        dayIndex: 2,
        startHour: 10,
        startMin: 30,
        endHour: 11,
        endMin: 30,
        timeFormatted: "10:30 AM – 11:30 AM",
        time24h: "10h30 – 11h30",
        directionHint: "Towards Christophe-Colomb",
        signCode: "P 10h30-11h30 MARDI 1 AVRIL AU 1 DEC",
        notes: "Applies between Saint-Joseph and Gilford. Street ends at Gilford."
      }
    }
  },
  "christophe": {
    name: "Avenue Christophe-Colomb",
    shortName: "Christophe-Colomb",
    bounds: "Blvd Saint-Joseph to Rue Gilford",
    sides: {
      "East": {
        day: "Tuesday",
        dayIndex: 2,
        startHour: 10,
        startMin: 0,
        endHour: 11,
        endMin: 0,
        timeFormatted: "10:00 AM – 11:00 AM",
        time24h: "10h00 – 11h00",
        directionHint: "Towards De la Roche",
        signCode: "P 10h-11h MARDI 1 AVRIL AU 1 DEC",
        notes: "Applies between Saint-Joseph and Gilford. North of Gilford is No Parking at all times."
      },
      "West": {
        day: "Thursday",
        dayIndex: 4,
        startHour: 12,
        startMin: 0,
        endHour: 13,
        endMin: 0,
        timeFormatted: "12:00 PM – 1:00 PM",
        time24h: "12h00 – 13h00",
        directionHint: "Towards Saint-Denis",
        signCode: "P 12h-13h JEUDI 1 AVRIL AU 1 DEC",
        notes: "Applies between Saint-Joseph and Gilford. North of Gilford is No Parking at all times."
      }
    }
  }
};

// Current State
let currentStreetKey = "brebeuf";
let currentSide = "East";

// Helper: Check if date is in active season (Apr 1 - Dec 1)
function isParkingSeason(date = new Date()) {
  const month = date.getMonth(); // 0-indexed: 0=Jan, 3=Apr, 10=Nov, 11=Dec
  const day = date.getDate();
  if (month < 3) return false; // Jan, Feb, Mar -> Inactive
  if (month > 11) return false; // > Dec
  if (month === 11 && day > 1) return false; // Dec 2 onwards -> Inactive
  return true;
}

// Compute the Next Cleaning Occurrence
function getNextCleaningDate(rule, referenceDate = new Date()) {
  const now = new Date(referenceDate);
  const targetDay = rule.dayIndex;
  
  // Start with candidate for today
  let candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), rule.startHour, rule.startMin, 0, 0);
  let cleaningEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), rule.endHour, rule.endMin, 0, 0);
  
  let daysUntil = (targetDay - now.getDay() + 7) % 7;
  
  if (daysUntil === 0) {
    // It's today. Check if the cleaning window has already passed
    if (now > cleaningEnd) {
      daysUntil = 7; // Next week
    }
  }
  
  candidate.setDate(candidate.getDate() + daysUntil);
  
  // If candidate falls outside April 1 - Dec 1, advance to next April 1st
  if (!isParkingSeason(candidate)) {
    let year = candidate.getFullYear();
    if (candidate.getMonth() >= 11) {
      year += 1;
    }
    // Next April 1st
    candidate = new Date(year, 3, 1, rule.startHour, rule.startMin, 0, 0);
    // Adjust to next matching day of week on or after April 1st
    let aprDaysUntil = (targetDay - candidate.getDay() + 7) % 7;
    candidate.setDate(candidate.getDate() + aprDaysUntil);
  }
  
  return candidate;
}

// Format relative countdown
function formatCountdown(targetDate, now = new Date()) {
  const diffMs = targetDate - now;
  if (diffMs < 0) {
    const endDiff = diffMs + (60 * 60 * 1000);
    if (endDiff > 0) {
      return { text: "IN PROGRESS NOW! Move car immediately", status: "urgent" };
    }
    return { text: "Just completed", status: "normal" };
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  const remMin = diffMin % 60;
  
  if (diffDays === 0) {
    if (diffHours === 0) {
      return { text: `In ${remMin} minute${remMin === 1 ? '' : 's'}`, status: "urgent" };
    }
    if (diffHours <= 2) {
      return { text: `Today in ${diffHours}h ${remMin}m (Reminder time soon!)`, status: "urgent" };
    }
    return { text: `Today at ${formatTimeStr(targetDate)} (in ${diffHours}h ${remMin}m)`, status: "warning" };
  }
  
  if (diffDays === 1) {
    return { text: `Tomorrow at ${formatTimeStr(targetDate)} (in ${diffHours}h)`, status: "warning" };
  }
  
  return { text: `In ${diffDays} days, ${remHours} hours`, status: "normal" };
}

function formatTimeStr(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateStr(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Generate RFC 5545 iCalendar (.ics) string for the single next upcoming cleaning
function generateICS(streetName, side, rule, nextCleaning) {
  const startDate = new Date(nextCleaning);
  const endDate = new Date(nextCleaning);
  endDate.setHours(rule.endHour, rule.endMin, 0, 0);
  
  // Format date to UTC for ICS: YYYYMMDDTHHMMSSZ
  const formatICSDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const dtStart = formatICSDate(startDate);
  const dtEnd = formatICSDate(endDate);
  const dtStamp = formatICSDate(new Date());
  const uid = `cleaning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@brebeufpark`;
  
  const summary = `🚗 Move Car: Street Cleaning on ${streetName} (${side} side)`;
  const description = `Montreal Street Cleaning on ${streetName} (${side} side).\\nSchedule: ${rule.timeFormatted} (${rule.signCode}).\\nReminder set for 2 hours prior to avoid a ticket!`;
  const location = `${streetName}, Montreal, QC`;
  
  // TRIGGER:-PT2H sets the native alarm 2 hours prior!
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Brebeuf Parking App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:🚗 Move your car! Street cleaning starts in 2 hours!',
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

// Download or trigger .ics in iOS Safari
function triggerCalendarReminder(streetName, side, rule, nextCleaning) {
  const icsData = generateICS(streetName, side, rule, nextCleaning);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const filename = `street_cleaning_${side.toLowerCase()}_side.ics`;
  
  // For iOS Safari: creating a blob URL and navigating or creating an <a> tag triggers Apple Calendar import modal
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1500);
}

// UI Update Function
function updateUI() {
  const street = PARKING_DATA[currentStreetKey];
  const rule = street.sides[currentSide];
  const now = new Date();
  const nextCleaning = getNextCleaningDate(rule, now);
  const countdown = formatCountdown(nextCleaning, now);
  
  // Reminder time is 2 hours before cleaning start
  const reminderTime = new Date(nextCleaning.getTime() - (2 * 60 * 60 * 1000));
  
  // Update Street Info
  document.getElementById('selected-street-title').textContent = street.name;
  
  // Update Side Selection Pills
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.side === currentSide);
  });
  
  // Update Street Buttons
  document.querySelectorAll('.street-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.street === currentStreetKey);
  });
  
  // Schedule Card Info
  document.getElementById('cleaning-day').textContent = rule.day;
  document.getElementById('cleaning-time').textContent = rule.timeFormatted;
  document.getElementById('cleaning-time-24h').textContent = rule.time24h;
  document.getElementById('direction-hint').textContent = rule.directionHint;
  
  // Next cleaning details
  document.getElementById('next-date-text').textContent = `${formatDateStr(nextCleaning)} at ${formatTimeStr(nextCleaning)}`;
  
  // Countdown
  const countdownEl = document.getElementById('countdown-badge');
  countdownEl.textContent = countdown.text;
  countdownEl.className = `countdown-badge status-${countdown.status}`;
  
  // Active Season Badge
  const seasonBadge = document.getElementById('season-status-badge');
  if (isParkingSeason(now)) {
    seasonBadge.className = 'status-pill active';
    seasonBadge.innerHTML = '<span class="status-dot"></span> Active Parking Season (Apr 1 – Dec 1)';
  } else {
    seasonBadge.className = 'status-pill winter';
    seasonBadge.innerHTML = '<span class="status-dot winter"></span> Winter Period (Signs Inactive until Apr 1)';
  }
}

// Toast Feedback
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Initialization and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Setup Street Buttons
  document.querySelectorAll('.street-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentStreetKey = btn.dataset.street;
      if (navigator.vibrate) navigator.vibrate(15);
      updateUI();
    });
  });
  
  // Setup Side Buttons (East / West)
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentSide = btn.dataset.side;
      if (navigator.vibrate) navigator.vibrate(15);
      updateUI();
    });
  });
  
  // Setup Set Reminder Button
  document.getElementById('btn-set-reminder').addEventListener('click', () => {
    const street = PARKING_DATA[currentStreetKey];
    const rule = street.sides[currentSide];
    const nextCleaning = getNextCleaningDate(rule, new Date());
    
    triggerCalendarReminder(street.name, currentSide, rule, nextCleaning);
    showToast(`📅 Calendar event ready! Tap 'Add' to save the 2-hour reminder.`);
  });
  
  // Initial Render
  updateUI();
  
  // Refresh countdown every 30 seconds
  setInterval(updateUI, 30000);
  
  // Register Service Worker for offline capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
