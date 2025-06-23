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
// add credits
function addCredits() {
  credits += 25000;
  updateUI();
}
// Images
const symbolImageURLs = {
  a: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/latest.png',
  b: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536.png',
  c: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/latest%20(2).png',
  d: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(2).png',
  e: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(3).png',
  f: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(1).png',
  g: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(2)%20(1).png',
  h: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(3)%20(1).png',
  i: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(4).png',
  j: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(5).png',
  k: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/536%20(6).png',
  wild: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/150.png',
  freespin: 'https://raw.githubusercontent.com/219847/a/refs/heads/main/150%20(2).png'
};

const symbolImages = {};

// Game variables
let credits = 10000;
let bet = 40;
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
  e: {3: 10, 4: 40, 5: 150},
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
        firstSymbol = null; // wait for a real symbol
      } else {
        firstSymbol = symbol;
      }
      matchCount = 1;
    } else {
      if (symbol === firstSymbol || symbol === 'wild' || firstSymbol === null) {
        if (firstSymbol === null && symbol !== 'wild') firstSymbol = symbol;
        matchCount++;
      } else {
        break; // streak ends
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
  return total;
}
// Weighted symbol distribution (higher weight = more common)
const symbolWeights = {
  a: 5,   // special stacked symbol
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
  wild: 4,       // appears only on reels 2, 3, 4, 5
  freespin: 3    // appears only on reels 1, 2, 3
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

// Update UI
function updateUI() {
  creditsEl.textContent = `Credits: ${credits}`;
  betDisplayEl.textContent = `Bet: ${bet}`;
  freeSpinsEl.textContent = `Free Spins: ${freeSpins}`;
  winAmountEl.textContent = `Win: ${currentWin}`;
  levelBarEl.style.width = `${(xp / 10000) * 100}%`;
}

// Only attach once
if (!window.spinHandlerAttached) {
  window.spinHandlerAttached = true;

  spinBtn.addEventListener('click', () => {
    console.log('Spin clicked');

    if (credits < bet) {
      alert('Not enough credits to spin!');
      return;
    }

    credits -= bet;
    updateUI();

    // Show "SPINNING..." placeholder
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
      currentWin = scaledPayout;

      updateUI();
      drawGrid(grid);
    }, 3000);
  });
}
// Allowed bet values
const betLevels = [40, 80, 120, 240, 480, 720, 1440, 5760];

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
