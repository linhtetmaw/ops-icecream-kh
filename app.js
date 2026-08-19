/**
 * Burmese Fam Trip — Presentation Deck
 *
 * CUSTOMIZATION:
 * 1. SEAT_NAMES — assign passenger names (null = available)
 * 2. Gallery — replace placeholders with <img src="..."> in index.html
 * 3. Telegram — update href on #telegramLink
 * 4. Map — update iframe src in index.html
 */

const SEAT_NAMES = {
  bus18: {
     1: 'AUNG.K.M',
     2: 'AYE MYAT',
     3: 'BOBA',
     4: 'CHUE',
     5: 'EI',
     6: 'ERIC',
     7: 'JACOB',
     8: 'KHIN OO',
     9: 'KYAW',
    10: 'LINNN',
    11: 'LnHD',
    12: 'LYNN',
    13: 'MYAT NOE',
    14: 'NAY',
    15: 'SAGAR',
    16: 'SAI',
    17: 'SIN',
    18: 'SU',
    19: 'VINCENT',
    20: 'YAMIN',
  },
  car4: {
    1: 'AK',
    2: 'DUKE',
    3: 'PISEY',
    4: 'HEIN',
  },
};

const BUS18_LAYOUT = [
  [{ id: 1 }, { id: 2 }, 'aisle', { id: 3 }, { id: 4 }],
  [{ id: 5 }, { id: 6 }, 'aisle', { id: 7 }, { id: 8 }],
  [{ id: 9 }, { id: 10 }, 'aisle', { id: 11 }, { id: 12 }],
  [{ id: 13 }, { id: 14 }, 'aisle', { id: 15 }, { id: 16 }],
  [{ id: 17 }, { id: 18 }, 'aisle', { id: 19 }, { id: 20 }],
];

const CAR4_LAYOUT = [
  [{ id: 1 }, { id: 2 }],
  [{ id: 3 }, { id: 4 }],
];

const TRIP_DAY = 12;
const DEPART_AT = new Date('2026-09-12T10:00:00+07:00');

const STORAGE_KEY = 'burmese-fam-trip-seats';
let selectedSeats = loadSelections();
let currentSlide = 0;
let slides = [];

function loadSelections() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSelections() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSeats));
}

// ─── Seat Rendering ───────────────────────────────────────────────
function renderSeatPlan(containerId, layout, vehicleKey) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  layout.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    row.forEach((cell) => {
      if (cell === 'aisle') {
        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        rowEl.appendChild(aisle);
        return;
      }
      rowEl.appendChild(createSeat(cell.id, vehicleKey));
    });
    container.appendChild(rowEl);
  });
}

function createSeat(id, vehicleKey) {
  const btn = document.createElement('button');
  btn.className = 'seat';
  btn.type = 'button';

  const assignedName = SEAT_NAMES[vehicleKey]?.[id];
  const isTaken = assignedName != null && assignedName !== '';
  const selectionKey = `${vehicleKey}-${id}`;
  const isSelected = selectedSeats[selectionKey] === true;

  if (isTaken) {
    btn.classList.add('taken');
    btn.disabled = true;
    btn.innerHTML = `<span class="seat-num">${id}</span><span class="seat-name">${assignedName}</span>`;
    btn.title = assignedName;
  } else if (isSelected) {
    btn.classList.add('selected');
    btn.innerHTML = `<span class="seat-num">${id}</span><span class="seat-name">You</span>`;
  } else {
    btn.classList.add('available');
    btn.innerHTML = `<span class="seat-num">${id}</span>`;
  }

  if (!isTaken) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSeat(id, vehicleKey);
    });
  }
  return btn;
}

function toggleSeat(id, vehicleKey) {
  const key = `${vehicleKey}-${id}`;
  const wasSelected = selectedSeats[key] === true;

  Object.keys(selectedSeats).forEach((k) => {
    if (k.startsWith(`${vehicleKey}-`)) delete selectedSeats[k];
  });

  if (!wasSelected) selectedSeats[key] = true;

  saveSelections();
  renderSeatPlan('bus18Seats', BUS18_LAYOUT, 'bus18');
  renderSeatPlan('car4Seats', CAR4_LAYOUT, 'car4');
}

// ─── Deck Navigation ──────────────────────────────────────────────
function initDeck() {
  const deck = document.getElementById('deck');
  slides = [...document.querySelectorAll('.slide')];
  const dotsContainer = document.getElementById('deckDots');
  const countEl = document.getElementById('deckCount');
  const prevBtn = document.getElementById('deckPrev');
  const nextBtn = document.getElementById('deckNext');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'deck-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function updateUI(index) {
    currentSlide = index;
    countEl.textContent = `${index + 1} / ${slides.length}`;
    dotsContainer.querySelectorAll('.deck-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    prevBtn.classList.toggle('hidden', index === 0);
    nextBtn.classList.toggle('hidden', index === slides.length - 1);
  }

  function goToSlide(index) {
    const target = Math.max(0, Math.min(index, slides.length - 1));
    slides[target].scrollIntoView({ behavior: 'smooth' });
    updateUI(target);
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const index = slides.indexOf(entry.target);
          if (index !== -1) updateUI(index);
        }
      });
    },
    { root: deck, threshold: 0.5 }
  );

  slides.forEach((slide) => observer.observe(slide));

  document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.hidden) return;

    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    }
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    }
    if (e.key === 'Home') { e.preventDefault(); goToSlide(0); }
    if (e.key === 'End') { e.preventDefault(); goToSlide(slides.length - 1); }
  });

  updateUI(0);
}

// ─── Gallery Lightbox ─────────────────────────────────────────────
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  const caption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const img = item.querySelector('img');
    const placeholder = item.querySelector('.gallery-placeholder');

    content.innerHTML = '';
    if (img) content.appendChild(img.cloneNode());
    else if (placeholder) content.appendChild(placeholder.cloneNode(true));

    caption.textContent = '';
    lightbox.hidden = false;
    document.getElementById('deck').style.overflow = 'hidden';
  }

  function hide() {
    lightbox.hidden = true;
    document.getElementById('deck').style.overflow = '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      show(i);
    });
  });

  closeBtn?.addEventListener('click', hide);
  prevBtn?.addEventListener('click', () => show(currentIndex - 1));
  nextBtn?.addEventListener('click', () => show(currentIndex + 1));
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) hide(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
}

function renderCalendar() {
  const grid = document.getElementById('tripCalendar');
  if (!grid) return;

  const year = 2026;
  const month = 8;
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i += 1) {
    const blank = document.createElement('span');
    blank.className = 'cal-day is-empty';
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement('span');
    cell.className = 'cal-day' + (day === TRIP_DAY ? ' is-trip' : '');
    cell.textContent = String(day);
    if (day === TRIP_DAY) cell.setAttribute('aria-label', 'Trip day, 12 September');
    grid.appendChild(cell);
  }
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function renderCountdown() {
  const root = document.getElementById('departCountdown');
  if (!root) return;

  const diff = DEPART_AT.getTime() - Date.now();
  if (diff <= 0) {
    root.innerHTML = '<p class="countdown-done">We\'re on the road 🚐</p>';
    return false;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  root.innerHTML = `
    <div class="count-unit"><span class="count-num">${days}</span><span class="count-label">Days</span></div>
    <div class="count-unit"><span class="count-num">${pad(hours)}</span><span class="count-label">Hours</span></div>
    <div class="count-unit"><span class="count-num">${pad(minutes)}</span><span class="count-label">Mins</span></div>
    <div class="count-unit"><span class="count-num">${pad(seconds)}</span><span class="count-label">Secs</span></div>
  `;
  return true;
}

function initCountdown() {
  if (!renderCountdown()) return;
  const timer = setInterval(() => {
    if (!renderCountdown()) clearInterval(timer);
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSeatPlan('bus18Seats', BUS18_LAYOUT, 'bus18');
  renderSeatPlan('car4Seats', CAR4_LAYOUT, 'car4');
  renderCalendar();
  initCountdown();
  initDeck();
  initGallery();
});
