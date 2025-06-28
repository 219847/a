console.log("JavaScript loaded!");

// DOM elements (declare first)
const spinBtn = document.getElementById('spin-btn');
const creditsEl = document.getElementById('credits');
const betDisplayEl = document.getElementById('bet-display');
const freeSpinsEl = document.getElementById('free-spins-count');
const winAmountEl = document.getElementById('win-amount');
const levelBarEl = document.getElementById('level-bar');
const increaseBetBtn = document.getElementById('increase-bet');
const decreaseBetBtn = document.getElementById('decrease-bet');

const canvas = document.getElementById('slot-canvas');
const ctx = canvas.getContext('2d');
//xp system
function grantXP(winAmount) {
  let xpGain = Math.floor(winAmount); // 1 XP per credit won (can tweak this)
  xp += xpGain;
  checkLevelUp();
}
//lvl req calc
function getXPNeeded(level) {
  return 500 + Math.floor(500 * Math.pow(1.2, level - 1));
}
//level up check 
function checkLevelUp() {
  let xpNeeded = getXPNeeded(level);

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    alert(`🎉 Level up! You reached level ${level}`);
    xpNeeded = getXPNeeded(level);
  }

  updateLevelUI();
}
//update xp bar
function updateLevelUI() {
  const xpNeeded = getXPNeeded(level);
  levelBarEl.style.width = `${(xp / xpNeeded) * 100}%`;
  document.getElementById('level-display').textContent = `Level: ${level}`;
}
// local storage
function saveProgress() {
  localStorage.setItem('slot-xp', xp);
  localStorage.setItem('slot-level', level);
}
function loadProgress() {
  xp = parseInt(localStorage.getItem('slot-xp')) || 0;
  level = parseInt(localStorage.getItem('slot-level')) || 1;
}
// add credits
function addCredits() {
  credits += 25000;
  updateUI();
}
// Images
const symbolImageURLs = {
  a: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_451.png',
  b: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_King\'s_Highway_2.svg.png',
  c: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_King\'s_Highway_401.svg.png',
  d: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_King\'s_Highway_11A.svg.png',
  e: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_King\'s_Highway_92.svg.png',
  f: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_King\'s_Highway_83.svg.png',
  g: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/800px-Ontario_King\'s_Highway_22.svg.png',
  h: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_King\'s_Highway_3.svg.png',
  i: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_10.svg.png',
  j: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_27.svg.png',
  k: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_7.svg.png',
  wild: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/Ontario_QEW.svg.png',
  freespin: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/image-removebg-preview.png'
};

const symbolImages = {};

// Game variables
let credits = 1000000;
let bet = 29160;
let freeSpins = 0;
let currentWin = 0;
let xp = 0;
let level = 1;

// Your existing functions here:
// - updateUI()
// - generateSpinGrid()
// - calculateTotalPayout()
// - drawGrid(grid)

// For example:

function updateUI() {
  creditsEl.textContent = `Credits: ${credits}`;
  betDisplayEl.textContent = `Bet: ${bet}`;
  freeSpinsEl.textContent = `Free Spins: ${freeSpins}`;
  // Just update the text directly here, do not call animation function in updateUI
  winAmountEl.textContent = `Win: ${currentWin}`;
  levelBarEl.style.width = `${(xp / 10000) * 100}%`;
}

function preloadImages(callback) {
  let loadedCount = 0;
  const total = Object.keys(symbolImageURLs).length;

  for (const symbol in symbolImageURLs) {
    const img = new Image();
    img.src = symbolImageURLs[symbol];
    img.onload = () => {
      loadedCount++;
      if (loadedCount === total) callback();
    };
    img.onerror = () => {
      console.error(`Failed to load image for symbol ${symbol}`);
      loadedCount++;
      if (loadedCount === total) callback();
    };
    symbolImages[symbol] = img;
  }
}

function drawGrid(grid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const symbolSize = 100;

  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const symbol = grid[col][row];
      const img = symbolImages[symbol];
      if (img) {
        ctx.drawImage(img, col * symbolSize, row * symbolSize, symbolSize, symbolSize);
      }
    }
  }
}
increaseBetBtn.addEventListener('click', () => changeBet('up'));
decreaseBetBtn.addEventListener('click', () => changeBet('down'));

preloadImages(() => {
  console.log('All images loaded');
  updateUI();
  
  const initialGrid = generateSpinGrid();
  drawGrid(initialGrid); // ✅ SAFE to draw now
  spinBtn.disabled = false;
});

// Symbol set (letters only, wild and freespin are separate)
const symbolSet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
//paylines
const letterPositions = {
  A: [0,0], B: [1,0], C: [2,0], D: [3,0], E: [4,0],
  F: [0,1], G: [1,1], H: [2,1], I: [3,1], J: [4,1],
  K: [0,2], L: [1,2], M: [2,2], N: [3,2], O: [4,2],
  P: [0,3], Q: [1,3], R: [2,3], S: [3,3], T: [4,3]
};
// Paylines list (50 paylines)
const paylines = [
  ['A','B','C','D','E'], ['F','G','H','I','J'], ['K','L','M','N','O'], ['P','Q','R','S','T'],
  ['A','G','M','S','T'], ['P','L','H','D','E'], ['A','G','H','I','J'], ['F','G','M','S','T'],
  ['F','L','M','N','J'], ['K','G','H','I','O'], ['A','B','H','I','J'], ['P','Q','M','N','O'],
  ['A','L','M','N','O'], ['P','L','M','N','E'], ['F','G','M','N','O'], ['K','G','H','I','J'],
  ['F','G','H','I','O'], ['K','L','H','I','J'], ['K','L','M','N','E'], ['F','L','M','N','T'],
  ['A','G','M','I','O'], ['P','L','M','I','E'], ['F','L','H','N','J'], ['K','G','M','S','O'],
  ['F','L','M','I','J'], ['F','G','M','N','J'], ['K','G','M','N','O'],  ['F','L','H','I','J'],
  ['F','G','H','N','O'], ['K','L','H','I','J'], ['A','L','M','N','O'], ['P','L','M','N','E'],
  ['A','G','M','I','O'], ['P','L','M','I','E'], ['A','G','H','I','O'], ['P','L','H','I','E'],
  ['F','L','H','I','J'], ['F','G','M','N','J'], ['K','G','M','N','O'], ['F','G','H','I','O'],
  ['K','G','H','I','J'], ['F','G','H','I','J'], ['A','G','M','N','O'], ['P','L','M','N','O'],
  ['A','L','M','I','J'], ['P','L','M','I','J'], ['F','L','M','I','J'], ['F','G','M','I','J'],
  ['F','L','H','N','J'], ['K','L','H','I','J']
];
// Paytable for symbols
const paytable = {
  a: {2: 2, 3: 20, 4: 50, 5: 150},
  b: {3: 15, 4: 50, 5: 150},
  c: {3: 15, 4: 50, 5: 150},
  d: {3: 15, 4: 50, 5: 150},
  e: {3: 10, 4: 50, 5: 150},
  f: {3: 10, 4: 40, 5: 150},
  g: {3: 10, 4: 40, 5: 150},
  h: {3: 10, 4: 40, 5: 150},
  i: {3: 5, 4: 25, 5: 100},
  j: {3: 5, 4: 25, 5: 100},
  k: {3: 5, 4: 25, 5: 100}
  // wild and freespin payouts handled separately or ignored
};

// Check payout for a single payline
function checkPayline(grid, payline) {
  const positions = payline.map(letter => letterPositions[letter]);
  let firstSymbol = null;
  let matchCount = 0;

  for (let i = 0; i < positions.length; i++) {
    const [col, row] = positions[i];
    const symbol = grid[col][row];

    if (symbol === 'freespin') break; // freespin blocks line

    if (i === 0) {
      if (symbol === 'wild') {
        // Wait until we find the first non-wild
        continue;
      } else {
        firstSymbol = symbol;
        matchCount = 1;
      }
    } else {
      if (firstSymbol === null) {
        if (symbol !== 'wild') {
          firstSymbol = symbol;
        }
        matchCount++;
      } else if (symbol === firstSymbol || symbol === 'wild') {
        matchCount++;
      } else {
        break;
      }
    }
  }

  if (!firstSymbol || !paytable[firstSymbol]) return 0;
  return paytable[firstSymbol][matchCount] || 0;
}
// Calculate total payout for a spin grid
function calculateTotalPayout(grid) {
  let total = 0;

  for (const payline of paylines) {
    total += checkPayline(grid, payline);
  }

  // Count total number of freespin symbols across the grid
  let freespinCount = 0;
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      if (grid[col][row] === 'freespin') {
        freespinCount++;
      }
    }
  }

  // Only pay 10× bet **once** if at least 3 freespins appear
  if (freespinCount >= 3) {
    total += 10 * bet;
  }

  return total;
}
// Weighted symbol distribution (higher weight = more common)
const symbolWeights = {
  a: 15,   // special stacked symbol
  b: 8,
  c: 8,
  d: 8,
  e: 10,
  f: 10,
  g: 10,
  h: 10,
  i: 12,
  j: 12,
  k: 12,
  wild: 12,       // appears only on reels 2, 3, 4, 5
  freespin: 0    // appears only on reels 1, 2, 3
  //freespin's 8 distribution moved to wild
};
function getRandomSymbol(reelIndex) {
  const pool = [];

  for (const symbol in symbolWeights) {
    if (symbol === 'wild' && reelIndex === 0) continue;       // skip wild on reel 0
    if (symbol === 'freespin' && reelIndex > 2) continue;     // freespin only on reels 0,1,2

    for (let i = 0; i < symbolWeights[symbol]; i++) {
      pool.push(symbol);
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// 5 reels × 4 rows
function generateSpinGrid() {
  const grid = [];

  for (let col = 0; col < 5; col++) {
    const reel = [];

    // 25% chance to apply stacked a
    const useStackedA = Math.random() < 0.25;
    if (useStackedA) {
      // offset: how many symbols of the 4-stack are above the visible window
      const offset = Math.floor(Math.random() * 4); // 0 (fully visible) to 3 (only 1 visible)
      for (let row = 0; row < 4; row++) {
        if (row >= offset) {
          reel.push('a');
        } else {
          // hidden part above visible area
          reel.push(getRandomSymbol(col));
        }
      }
    } else {
      // Normal symbols
      for (let row = 0; row < 4; row++) {
        const symbol = getRandomSymbol(col);
        reel.push(symbol);
      }
    }

    grid.push(reel);
  }

  return grid;
}
//animation
function animateWinCount(finalAmount, duration, callback) {
  if (duration === undefined) {
    duration = (finalAmount / (bet / 3)) * 1000;
  }

  const winSound = document.getElementById('win-sound');
  const startTime = performance.now();
  spinBtn.disabled = true;
  winSound.currentTime = 0;
  winSound.loop = true;
  winSound.play().catch(e => console.warn("Sound play blocked:", e));

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentWin = Math.floor(finalAmount * progress);
    winAmountEl.textContent = `Win: ${currentWin}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      currentWin = finalAmount;
      winAmountEl.textContent = `Win: ${currentWin}`;
      winSound.pause();
      winSound.currentTime = 0;
      spinBtn.disabled = false;
      if (callback) callback(); // ✅ Call it here
    }
  }

  requestAnimationFrame(step);
}
// Only attach once
if (!window.spinHandlerAttached) {
  window.spinHandlerAttached = true;

spinBtn.addEventListener('click', () => {
  if (credits < bet) {
    alert('Not enough credits to spin!');
    return;
  }

  credits -= bet;
  currentWin = 0; // ✅ Important: reset win amount
  updateUI();     // Make sure this doesn't touch winAmountEl

      // SPINNING visual
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '36px Arial';
  ctx.fillText('SPINNING...', 300, 200);

  const grid = generateSpinGrid();

  setTimeout(() => {
    const payout = calculateTotalPayout(grid);
    const scaledPayout = payout * (bet / 40);

    credits += scaledPayout;
    drawGrid(grid);
    animateWinCount(scaledPayout, undefined, () => {
      grantXP(scaledPayout);
      updateLevelUI();
    });
  }, 3000);
});
}
//count up

// Allowed bet values
const betLevels = [120, 130, 360, 370, 1080, 1090, 3240, 3250, 9720, 9730, 29160, 29170, 87480, 87490, 262440, 262550, 787320];

function changeBet(direction) {
  const currentIndex = betLevels.indexOf(bet);
  if (direction === 'up' && currentIndex < betLevels.length - 1) {
    bet = betLevels[currentIndex + 1];
  } else if (direction === 'down' && currentIndex > 0) {
    bet = betLevels[currentIndex - 1];
  }
  updateUI();
}

increaseBetBtn.addEventListener('click', () => changeBet('up'));
decreaseBetBtn.addEventListener('click', () => changeBet('down'));
