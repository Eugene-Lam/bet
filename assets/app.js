/*
  HKJC Modern Web Prototype
  - Plain JS shared app code for header/footer, auth, and pages
*/

// ---------------------- Storage Utils ----------------------
const STORAGE_KEYS = Object.freeze({
  user: 'hkjc_user',
  bets: 'hkjc_bet_history',
  transactions: 'hkjc_transactions',
});

function readJsonFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function writeJsonToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------- User / Auth ----------------------
function getCurrentUser() {
  return readJsonFromLocalStorage(STORAGE_KEYS.user, null);
}

function setCurrentUser(user) {
  writeJsonToLocalStorage(STORAGE_KEYS.user, user);
  renderHeader();
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
  renderHeader();
  navigateTo('/Users/eugene/fake-gambling/index.html');
}

function ensureLoggedIn(actionDescription) {
  const user = getCurrentUser();
  if (!user) {
    showToast(`Please login to ${actionDescription || 'continue'}.`);
    setTimeout(() => navigateTo('/Users/eugene/fake-gambling/login.html'), 800);
    return false;
  }
  return true;
}

function getUserBalance() {
  const user = getCurrentUser();
  return user ? Number(user.balance || 0) : 0;
}

function setUserBalance(amount) {
  const user = getCurrentUser();
  if (!user) return;
  user.balance = Math.max(0, Number(amount || 0));
  setCurrentUser(user);
  updateHeaderBalance();
}

function adjustUserBalance(delta) {
  const current = getUserBalance();
  setUserBalance(current + Number(delta));
}

// ---------------------- Bets / Transactions ----------------------
function getBetHistory() {
  return readJsonFromLocalStorage(STORAGE_KEYS.bets, []);
}

function addBetToHistory(bet) {
  const list = getBetHistory();
  list.unshift({ ...bet, id: `bet_${Date.now()}` });
  writeJsonToLocalStorage(STORAGE_KEYS.bets, list);
}

function getTransactions() {
  return readJsonFromLocalStorage(STORAGE_KEYS.transactions, []);
}

function addTransaction(type, amount) {
  const list = getTransactions();
  list.unshift({ id: `txn_${Date.now()}` , type, amount: Number(amount), date: new Date().toISOString() });
  writeJsonToLocalStorage(STORAGE_KEYS.transactions, list);
}

// ---------------------- Navigation Helpers ----------------------
function navigateTo(path) {
  window.location.href = path;
}

// ---------------------- Formatting ----------------------
const currencyFormatter = new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD' });
function formatCurrency(value) { return currencyFormatter.format(Number(value || 0)); }

// ---------------------- Header / Footer ----------------------
function renderHeader() {
  const container = document.getElementById('header');
  if (!container) return;
  const user = getCurrentUser();
  const isLoggedIn = !!user;

  container.innerHTML = `
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <div class="text-emerald-600 font-bold text-xl">HKJC</div>
          </div>
          <nav class="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="/Users/eugene/fake-gambling/index.html" class="hover:text-emerald-600">Home</a>
            <a href="/Users/eugene/fake-gambling/racing.html" class="hover:text-emerald-600">Horse Racing</a>
            <a href="/Users/eugene/fake-gambling/football.html" class="hover:text-emerald-600">Football</a>
            <a href="/Users/eugene/fake-gambling/mark-six.html" class="hover:text-emerald-600">Mark Six</a>
          </nav>
          <div class="flex items-center space-x-3">
            ${isLoggedIn ? `
              <div id="header-balance" class="hidden sm:block text-sm text-gray-700">${formatCurrency(user.balance || 0)}</div>
              <div class="relative">
                <button id="accountMenuBtn" class="inline-flex items-center px-3 py-2 rounded-md border text-sm bg-white hover:bg-gray-50">
                  <span class="mr-2">${user.username || 'Account'}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="accountDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1">
                  <a href="/Users/eugene/fake-gambling/account.html" class="block px-4 py-2 text-sm hover:bg-gray-50">Dashboard</a>
                  <a href="/Users/eugene/fake-gambling/history.html" class="block px-4 py-2 text-sm hover:bg-gray-50">Betting History</a>
                  <a href="/Users/eugene/fake-gambling/transactions.html" class="block px-4 py-2 text-sm hover:bg-gray-50">Transactions</a>
                  <button id="logoutBtn" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Logout</button>
                </div>
              </div>
            ` : `
              <a href="/Users/eugene/fake-gambling/login.html" class="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50">Login</a>
              <a href="/Users/eugene/fake-gambling/register.html" class="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Register</a>
            `}
          </div>
        </div>
      </div>
      <div class="md:hidden border-t">
        <nav class="flex items-center justify-around py-2 text-sm">
          <a href="/Users/eugene/fake-gambling/racing.html" class="hover:text-emerald-600">Racing</a>
          <a href="/Users/eugene/fake-gambling/football.html" class="hover:text-emerald-600">Football</a>
          <a href="/Users/eugene/fake-gambling/mark-six.html" class="hover:text-emerald-600">Mark Six</a>
        </nav>
      </div>
    </header>
  `;

  if (isLoggedIn) {
    const btn = document.getElementById('accountMenuBtn');
    const dd = document.getElementById('accountDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    if (btn && dd) {
      btn.addEventListener('click', () => {
        dd.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dd.contains(e.target)) {
          dd.classList.add('hidden');
        }
      });
    }
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
  }
}

function updateHeaderBalance() {
  const el = document.getElementById('header-balance');
  if (el) {
    el.textContent = formatCurrency(getUserBalance());
  }
}

function renderFooter() {
  const container = document.getElementById('footer');
  if (!container) return;
  container.innerHTML = `
    <footer class="border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex gap-6 text-sm">
            <a href="#" class="hover:text-emerald-600">About Us</a>
            <a href="#" class="hover:text-emerald-600">Responsible Gambling</a>
            <a href="#" class="hover:text-emerald-600">Contact</a>
            <a href="#" class="hover:text-emerald-600">Terms & Conditions</a>
          </div>
          <div class="text-xs text-gray-500">This is a prototype. No real money is involved.</div>
          <div class="flex items-center gap-4">
            <a href="#" aria-label="Twitter" class="text-gray-500 hover:text-emerald-600">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 0 0 1.87-2.35 8.49 8.49 0 0 1-2.7 1.03 4.24 4.24 0 0 0-7.23 3.87 12.03 12.03 0 0 1-8.74-4.43 4.24 4.24 0 0 0 1.31 5.66c-.64-.02-1.24-.2-1.77-.49v.05a4.24 4.24 0 0 0 3.4 4.16c-.3.08-.62.12-.95.12-.23 0-.46-.02-.68-.06a4.25 4.25 0 0 0 3.96 2.95A8.5 8.5 0 0 1 2 19.54a12 12 0 0 0 6.5 1.9c7.8 0 12.07-6.46 12.07-12.07 0-.18 0-.36-.01-.54A8.63 8.63 0 0 0 24 5.56a8.43 8.43 0 0 1-2.54.7z"/></svg>
            </a>
            <a href="#" aria-label="Facebook" class="text-gray-500 hover:text-emerald-600">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12H16l-.5 3h-2v7A10 10 0 0 0 22 12"/></svg>
            </a>
            <a href="#" aria-label="Instagram" class="text-gray-500 hover:text-emerald-600">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-5 3.7A5.3 5.3 0 1 1 6.7 13 5.3 5.3 0 0 1 12 7.7m0 2A3.3 3.3 0 1 0 15.3 13 3.3 3.3 0 0 0 12 9.7M17.8 6.2a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// ---------------------- Toasts ----------------------
function ensureToastContainer() {
  let el = document.getElementById('toast-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-root';
    el.className = 'fixed top-4 right-4 z-[100] space-y-2';
    document.body.appendChild(el);
  }
  return el;
}

function showToast(message, type = 'success') {
  const root = ensureToastContainer();
  const bg = type === 'error' ? 'bg-red-600' : 'bg-emerald-600';
  const el = document.createElement('div');
  el.className = `${bg} text-white px-4 py-2 rounded shadow`; 
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => { el.remove(); }, 2200);
}

// ---------------------- Page: Home ----------------------
function initHomePage() {
  const m6Btn = document.getElementById('cta-mark-six');
  if (m6Btn) m6Btn.addEventListener('click', () => navigateTo('/Users/eugene/fake-gambling/mark-six.html'));
  const raceBtn = document.getElementById('cta-racing');
  if (raceBtn) raceBtn.addEventListener('click', () => navigateTo('/Users/eugene/fake-gambling/racing.html'));
  const footBtn = document.getElementById('cta-football');
  if (footBtn) footBtn.addEventListener('click', () => navigateTo('/Users/eugene/fake-gambling/football.html'));
}

// ---------------------- Page: Mark Six ----------------------
function initMarkSixPage() {
  const grid = document.getElementById('m6-grid');
  const selectedWrap = document.getElementById('m6-selected');
  const amountInput = document.getElementById('m6-amount');
  const placeBtn = document.getElementById('m6-place');
  const quickBtn = document.getElementById('m6-quick');
  const MAX = 6;
  const selected = new Set();

  function renderSelected() {
    selectedWrap.innerHTML = Array.from(selected)
      .sort((a,b)=>a-b)
      .map(n => `<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm">${n}</span>`) 
      .join('');
  }

  function toggleNumber(n) {
    if (selected.has(n)) {
      selected.delete(n);
    } else {
      if (selected.size >= MAX) {
        showToast(`You can select up to ${MAX} numbers.`, 'error');
        return;
      }
      selected.add(n);
    }
    renderSelected();
    highlightGrid();
  }

  function highlightGrid() {
    grid.querySelectorAll('button').forEach(btn => {
      const val = Number(btn.dataset.num);
      if (selected.has(val)) {
        btn.classList.add('bg-emerald-600','text-white');
        btn.classList.remove('bg-white');
      } else {
        btn.classList.remove('bg-emerald-600','text-white');
        btn.classList.add('bg-white');
      }
    });
  }

  // Build grid 1..49
  for (let i = 1; i <= 49; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.num = String(i);
    btn.className = 'w-10 h-10 rounded-full border bg-white hover:bg-gray-50 text-sm';
    btn.textContent = i;
    btn.addEventListener('click', () => toggleNumber(i));
    grid.appendChild(btn);
  }

  function quickPick() {
    selected.clear();
    while (selected.size < MAX) {
      selected.add(1 + Math.floor(Math.random()*49));
    }
    renderSelected();
    highlightGrid();
  }

  if (quickBtn) quickBtn.addEventListener('click', quickPick);

  function placeBet() {
    if (!ensureLoggedIn('place a Mark Six bet')) return;
    if (selected.size !== MAX) {
      showToast(`Please select exactly ${MAX} numbers.`, 'error');
      return;
    }
    const amount = Number(amountInput.value || 0);
    if (!(amount > 0)) {
      showToast('Please enter a valid bet amount.', 'error');
      return;
    }
    const balance = getUserBalance();
    if (amount > balance) {
      showToast('Insufficient balance.', 'error');
      return;
    }
    adjustUserBalance(-amount);
    addTransaction('Bet - Mark Six', -amount);
    const status = ['Pending','Won','Lost'][Math.floor(Math.random()*3)];
    // Demo payout rule for Mark Six when randomly marked as Won
    const payout = status === 'Won' ? +(amount * 30).toFixed(2) : 0; // arbitrary 30x for prototype
    if (payout > 0) {
      adjustUserBalance(payout);
      addTransaction('Winnings - Mark Six', payout);
    }
    addBetToHistory({
      type: 'Mark Six',
      selections: Array.from(selected).sort((a,b)=>a-b),
      stake: amount,
      payout,
      settled: payout > 0,
      date: new Date().toISOString(),
      status,
    });
    showToast('Your Mark Six bet has been placed!');
    selected.clear();
    renderSelected();
    highlightGrid();
    amountInput.value = '';
  }

  if (placeBtn) placeBtn.addEventListener('click', placeBet);

  // Recent results (fake)
  const results = document.getElementById('m6-results');
  if (results) {
    const items = Array.from({ length: 5 }).map((_, idx) => {
      const date = new Date(Date.now() - idx*86400000).toISOString().slice(0,10);
      const nums = new Set();
      while (nums.size < 6) nums.add(1 + Math.floor(Math.random()*49));
      const arr = Array.from(nums).sort((a,b)=>a-b);
      return { date, arr };
    });
    results.innerHTML = items.map(it => (
      `<div class="flex items-center justify-between py-2 border-b last:border-0">
        <div class="text-sm text-gray-600">${it.date}</div>
        <div class="flex gap-1">${it.arr.map(n=>`<span class='w-7 h-7 rounded-full bg-gray-100 inline-flex items-center justify-center text-xs'>${n}</span>`).join('')}</div>
      </div>`
    )).join('');
  }
}

// ---------------------- Page: Racing ----------------------
const RACING_DATA = {
  meeting: { name: 'Sha Tin', date: '2025-08-20' },
  races: Array.from({ length: 3 }).map((_, rIdx) => ({
    raceNumber: rIdx+1,
    horses: Array.from({ length: 8 }).map((__, hIdx) => ({
      number: hIdx+1,
      name: `Horse ${hIdx+1}`,
      jockey: `Jockey ${hIdx+1}`,
      trainer: `Trainer ${hIdx+1}`,
      oddsWin: +( (1.8 + Math.random()*8).toFixed(2) ),
      oddsPlace: +( (1.3 + Math.random()*4).toFixed(2) ),
    }))
  }))
};

let racingOddsTimer = null;

function initRacingPage() {
  const raceSelect = document.getElementById('race-select');
  const raceTableBody = document.getElementById('race-tbody');
  const slip = document.getElementById('race-slip');
  const amountInput = document.getElementById('race-amount');
  const betTypeSelect = document.getElementById('race-bet-type');
  const placeBtn = document.getElementById('race-place');
  const estReturnEl = document.getElementById('race-estimate');

  // Populate race selector
  RACING_DATA.races.forEach(r => {
    const opt = document.createElement('option');
    opt.value = String(r.raceNumber);
    opt.textContent = `Race ${r.raceNumber}`;
    raceSelect.appendChild(opt);
  });

  const selection = { raceNumber: 1, horseNumber: null };

  function renderTable() {
    const r = RACING_DATA.races.find(x => x.raceNumber === selection.raceNumber);
    raceTableBody.innerHTML = r.horses.map(h => (
      `<tr class="border-b">
        <td class="py-2 px-2">${h.number}</td>
        <td class="py-2 px-2">${h.name}</td>
        <td class="py-2 px-2 text-sm text-gray-600">${h.jockey}</td>
        <td class="py-2 px-2 text-sm text-gray-600">${h.trainer}</td>
        <td class="py-2 px-2">${h.oddsWin.toFixed(2)} / ${h.oddsPlace.toFixed(2)}</td>
        <td class="py-2 px-2 text-right">
          <button data-horse="${h.number}" class="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">Bet</button>
        </td>
      </tr>`
    )).join('');
  }

  function updateSlip() {
    const r = RACING_DATA.races.find(x => x.raceNumber === selection.raceNumber);
    const h = r.horses.find(x => x.number === selection.horseNumber);
    if (!h) {
      slip.innerHTML = '<div class="text-sm text-gray-500">No selection</div>';
      estReturnEl.textContent = formatCurrency(0);
      return;
    }
    slip.innerHTML = `
      <div class="text-sm">${RACING_DATA.meeting.name} - ${RACING_DATA.meeting.date}</div>
      <div class="font-medium">Race ${selection.raceNumber} - ${h.name} (#${h.number})</div>
      <div class="text-sm text-gray-600">Odds: Win ${h.oddsWin.toFixed(2)} / Place ${h.oddsPlace.toFixed(2)}</div>
    `;
    computeEstimate();
  }

  function computeEstimate() {
    const amount = Number(amountInput.value || 0);
    const type = betTypeSelect.value;
    const r = RACING_DATA.races.find(x => x.raceNumber === selection.raceNumber);
    const h = r && r.horses.find(x => x.number === selection.horseNumber);
    const odds = !h ? 0 : (type === 'Win' ? h.oddsWin : h.oddsPlace);
    const est = amount * odds;
    estReturnEl.textContent = formatCurrency(est);
  }

  function bindTableEvents() {
    raceTableBody.querySelectorAll('button[data-horse]').forEach(btn => {
      btn.addEventListener('click', () => {
        selection.horseNumber = Number(btn.dataset.horse);
        updateSlip();
      });
    });
  }

  function startOddsFluctuation() {
    stopOddsFluctuation();
    racingOddsTimer = setInterval(() => {
      RACING_DATA.races.forEach(r => r.horses.forEach(h => {
        const deltaW = (Math.random() - 0.5) * 0.2; // small changes
        const deltaP = (Math.random() - 0.5) * 0.1;
        h.oddsWin = Math.max(1.2, +(h.oddsWin + deltaW).toFixed(2));
        h.oddsPlace = Math.max(1.1, +(h.oddsPlace + deltaP).toFixed(2));
      }));
      renderTable();
      bindTableEvents();
      updateSlip();
    }, 3000);
  }

  function stopOddsFluctuation() {
    if (racingOddsTimer) clearInterval(racingOddsTimer);
    racingOddsTimer = null;
  }

  raceSelect.addEventListener('change', () => {
    selection.raceNumber = Number(raceSelect.value);
    selection.horseNumber = null;
    renderTable();
    bindTableEvents();
    updateSlip();
  });

  amountInput.addEventListener('input', computeEstimate);
  betTypeSelect.addEventListener('change', computeEstimate);

  placeBtn.addEventListener('click', () => {
    if (!ensureLoggedIn('place a Racing bet')) return;
    const r = RACING_DATA.races.find(x => x.raceNumber === selection.raceNumber);
    const h = r && r.horses.find(x => x.number === selection.horseNumber);
    if (!h) { showToast('Please select a horse.', 'error'); return; }
    const amount = Number(amountInput.value || 0);
    if (!(amount > 0)) { showToast('Please enter a valid amount.', 'error'); return; }
    const balance = getUserBalance();
    if (amount > balance) { showToast('Insufficient balance.', 'error'); return; }
    const type = betTypeSelect.value;
    const odds = type === 'Win' ? h.oddsWin : h.oddsPlace;
    adjustUserBalance(-amount);
    addTransaction('Bet - Racing', -amount);
    const status = ['Pending','Won','Lost'][Math.floor(Math.random()*3)];
    const payout = status === 'Won' ? +(amount * odds).toFixed(2) : 0;
    if (payout > 0) {
      adjustUserBalance(payout);
      addTransaction('Winnings - Racing', payout);
    }
    addBetToHistory({
      type: 'Racing',
      meeting: RACING_DATA.meeting.name,
      race: selection.raceNumber,
      horse: `#${h.number} ${h.name}`,
      betType: type,
      odds,
      stake: amount,
      estReturn: +(amount * odds).toFixed(2),
      payout,
      settled: payout > 0,
      date: new Date().toISOString(),
      status,
    });
    showToast('Racing bet placed!');
    selection.horseNumber = null;
    amountInput.value = '';
    updateSlip();
  });

  renderTable();
  bindTableEvents();
  updateSlip();
  startOddsFluctuation();

  window.addEventListener('beforeunload', stopOddsFluctuation);
}

// ---------------------- Page: Football ----------------------
const FOOTBALL_DATA = {
  leagues: ['English Premier League', 'La Liga'],
  matches: [
    { id: 1, league: 'English Premier League', home: 'Manchester United', away: 'Liverpool', time: '19:30', odds: { home: 2.5, draw: 3.1, away: 2.8 } },
    { id: 2, league: 'English Premier League', home: 'Arsenal', away: 'Chelsea', time: '21:00', odds: { home: 2.1, draw: 3.4, away: 3.3 } },
    { id: 3, league: 'La Liga', home: 'Real Madrid', away: 'Barcelona', time: '20:00', odds: { home: 2.6, draw: 3.2, away: 2.7 } },
  ]
};

let footballOddsTimer = null;

function initFootballPage() {
  const leagueFilter = document.getElementById('fb-league');
  const list = document.getElementById('fb-list');
  const slip = document.getElementById('fb-slip');
  const stakeInput = document.getElementById('fb-stake');
  const placeBtn = document.getElementById('fb-place');
  const accToggle = document.getElementById('fb-acc');
  const estEl = document.getElementById('fb-est');

  // Populate leagues
  FOOTBALL_DATA.leagues.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l; opt.textContent = l; leagueFilter.appendChild(opt);
  });

  const selections = []; // {matchId, pick: 'home'|'draw'|'away', odds, label}

  function filteredMatches() {
    const val = leagueFilter.value;
    return FOOTBALL_DATA.matches.filter(m => !val || m.league === val);
  }

  function renderList() {
    list.innerHTML = filteredMatches().map(m => `
      <div class="border rounded-md p-3 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="font-medium">${m.home} vs ${m.away}</div>
          <div class="text-sm text-gray-600">${m.league} · ${m.time}</div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button data-match="${m.id}" data-pick="home" class="odd-btn px-3 py-2 border rounded hover:bg-gray-50">1 ${m.odds.home.toFixed(2)}</button>
          <button data-match="${m.id}" data-pick="draw" class="odd-btn px-3 py-2 border rounded hover:bg-gray-50">X ${m.odds.draw.toFixed(2)}</button>
          <button data-match="${m.id}" data-pick="away" class="odd-btn px-3 py-2 border rounded hover:bg-gray-50">2 ${m.odds.away.toFixed(2)}</button>
        </div>
        <div class="text-xs text-gray-500">+50 more bets</div>
      </div>
    `).join('');
  }

  function bindListEvents() {
    list.querySelectorAll('.odd-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const matchId = Number(btn.dataset.match);
        const pick = btn.dataset.pick;
        const m = FOOTBALL_DATA.matches.find(x => x.id === matchId);
        const odds = m.odds[pick];
        const label = pick === 'home' ? `${m.home}` : pick === 'away' ? `${m.away}` : 'Draw';
        selections.push({ matchId, pick, odds, label, fixture: `${m.home} vs ${m.away}` });
        renderSlip();
        showToast('Selection added');
      });
    });
  }

  function renderSlip() {
    if (selections.length === 0) {
      slip.innerHTML = '<div class="text-sm text-gray-500">No selections</div>';
      estEl.textContent = formatCurrency(0);
      return;
    }
    slip.innerHTML = selections.map((s, idx) => `
      <div class="flex items-center justify-between py-1">
        <div>
          <div class="text-sm">${s.fixture}</div>
          <div class="text-xs text-gray-600">${s.label} @ ${s.odds.toFixed(2)}</div>
        </div>
        <button data-remove="${idx}" class="text-xs text-red-600 hover:underline">Remove</button>
      </div>
    `).join('');
    slip.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.remove);
        selections.splice(i, 1);
        renderSlip();
        computeEstimate();
      });
    });
    computeEstimate();
  }

  function computeEstimate() {
    const stake = Number(stakeInput.value || 0);
    const accumulator = accToggle.checked;
    if (selections.length === 0 || !(stake > 0)) { estEl.textContent = formatCurrency(0); return; }
    if (accumulator) {
      const combined = selections.reduce((acc, s) => acc * s.odds, 1);
      estEl.textContent = formatCurrency(stake * combined);
    } else {
      const total = selections.reduce((sum, s) => sum + stake * s.odds, 0);
      estEl.textContent = formatCurrency(total);
    }
  }

  function placeBet() {
    if (!ensureLoggedIn('place a Football bet')) return;
    if (selections.length === 0) { showToast('Add selections first.', 'error'); return; }
    const stake = Number(stakeInput.value || 0);
    if (!(stake > 0)) { showToast('Enter a valid stake.', 'error'); return; }
    const accumulator = accToggle.checked;
    const balance = getUserBalance();
    let totalStake = 0;
    if (accumulator) {
      totalStake = stake; // one combined stake
    } else {
      totalStake = stake * selections.length;
    }
    if (totalStake > balance) { showToast('Insufficient balance.', 'error'); return; }
    adjustUserBalance(-totalStake);
    addTransaction('Bet - Football', -totalStake);
    const status = ['Pending','Won','Lost'][Math.floor(Math.random()*3)];
    // Compute demo payout
    let payout = 0;
    if (status === 'Won') {
      if (accumulator) {
        const combined = selections.reduce((acc, s) => acc * s.odds, 1);
        payout = +(stake * combined).toFixed(2);
      } else {
        const sumOdds = selections.reduce((acc, s) => acc + s.odds, 0);
        payout = +(stake * sumOdds).toFixed(2);
      }
      if (payout > 0) {
        adjustUserBalance(payout);
        addTransaction('Winnings - Football', payout);
      }
    }
    const betRecord = {
      type: 'Football',
      accumulator,
      selections: selections.map(s => ({ fixture: s.fixture, pick: s.label, odds: s.odds })),
      stake: stake,
      totalStake,
      payout,
      settled: payout > 0,
      date: new Date().toISOString(),
      status,
    };
    addBetToHistory(betRecord);
    showToast('Football bet placed!');
    selections.length = 0;
    renderSlip();
    stakeInput.value = '';
    computeEstimate();
  }

  function startOddsFluctuation() {
    stopFootballOddsFluctuation();
    footballOddsTimer = setInterval(() => {
      FOOTBALL_DATA.matches.forEach(m => {
        const jitter = () => (Math.random()-0.5) * 0.15;
        m.odds.home = Math.max(1.2, +(m.odds.home + jitter()).toFixed(2));
        m.odds.draw = Math.max(1.2, +(m.odds.draw + jitter()).toFixed(2));
        m.odds.away = Math.max(1.2, +(m.odds.away + jitter()).toFixed(2));
      });
      renderList();
      bindListEvents();
    }, 3500);
  }

  function stopFootballOddsFluctuation() {
    if (footballOddsTimer) clearInterval(footballOddsTimer);
    footballOddsTimer = null;
  }

  leagueFilter.addEventListener('change', () => { renderList(); bindListEvents(); });
  stakeInput.addEventListener('input', computeEstimate);
  accToggle.addEventListener('change', computeEstimate);
  placeBtn.addEventListener('click', placeBet);

  renderList();
  bindListEvents();
  renderSlip();
  startOddsFluctuation();
  window.addEventListener('beforeunload', stopFootballOddsFluctuation);
}

// ---------------------- Page: Login/Register ----------------------
function initLoginPage() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = form.username.value.trim() || 'guest';
    const balance = 5000;
    setCurrentUser({ username, balance });
    showToast('Logged in');
    setTimeout(()=> navigateTo('/Users/eugene/fake-gambling/index.html'), 500);
  });
}

function initRegisterPage() {
  const form = document.getElementById('register-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = form.username.value.trim() || 'user';
    const email = form.email.value.trim();
    const balance = 5000;
    setCurrentUser({ username, email, balance });
    showToast('Registered and logged in');
    setTimeout(()=> navigateTo('/Users/eugene/fake-gambling/index.html'), 500);
  });
}

// ---------------------- Page: Account ----------------------
function initAccountPage() {
  const user = getCurrentUser();
  const welcome = document.getElementById('acc-welcome');
  const balance = document.getElementById('acc-balance');
  if (!user) {
    welcome.textContent = 'Please login to view your account.';
    return;
  }
  welcome.textContent = `Welcome, ${user.username}!`;
  balance.textContent = formatCurrency(user.balance || 0);
}

// ---------------------- Page: History ----------------------
function initHistoryPage() {
  const tbody = document.getElementById('hist-tbody');
  const history = getBetHistory();
  tbody.innerHTML = history.map(b => `
    <tr class="border-b">
      <td class="py-2 px-2">${b.type}</td>
      <td class="py-2 px-2 text-sm">${renderBetDetails(b)}</td>
      <td class="py-2 px-2">${formatCurrency(b.stake || b.totalStake || 0)}</td>
      <td class="py-2 px-2 text-sm">${new Date(b.date).toLocaleString()}</td>
      <td class="py-2 px-2 text-sm">${b.status || 'Pending'}</td>
    </tr>
  `).join('');
}

function renderBetDetails(b) {
  if (b.type === 'Mark Six') {
    return `Numbers: ${b.selections.join(', ')}`;
  }
  if (b.type === 'Racing') {
    return `${b.meeting} · Race ${b.race} · ${b.horse} · ${b.betType} @ ${b.odds}`;
  }
  if (b.type === 'Football') {
    if (b.accumulator) {
      return `ACC (${b.selections.length}): ` + b.selections.map(s => `${s.fixture} - ${s.pick} @ ${s.odds}`).join(' | ');
    }
    return b.selections.map(s => `${s.fixture} - ${s.pick} @ ${s.odds}`).join(' | ');
  }
  return '';
}

// ---------------------- Page: Transactions ----------------------
function initTransactionsPage() {
  const depForm = document.getElementById('dep-form');
  const wdForm = document.getElementById('wd-form');

  depForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amt = Number(depForm.amount.value || 0);
    if (!(amt > 0)) { showToast('Enter a valid amount.', 'error'); return; }
    adjustUserBalance(amt);
    addTransaction('Deposit', amt);
    showToast('Deposit successful');
    depForm.reset();
  });

  wdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amt = Number(wdForm.amount.value || 0);
    if (!(amt > 0)) { showToast('Enter a valid amount.', 'error'); return; }
    const bal = getUserBalance();
    if (amt > bal) { showToast('Insufficient balance.', 'error'); return; }
    adjustUserBalance(-amt);
    addTransaction('Withdraw', -amt);
    showToast('Withdrawal successful');
    wdForm.reset();
  });
}

// ---------------------- Router ----------------------
function initPage() {
  renderHeader();
  renderFooter();
  const page = document.body.dataset.page;
  switch (page) {
    case 'home':
      initHomePage(); break;
    case 'mark-six':
      initMarkSixPage(); break;
    case 'racing':
      initRacingPage(); break;
    case 'football':
      initFootballPage(); break;
    case 'login':
      initLoginPage(); break;
    case 'register':
      initRegisterPage(); break;
    case 'account':
      initAccountPage(); break;
    case 'history':
      initHistoryPage(); break;
    case 'transactions':
      initTransactionsPage(); break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', initPage);


