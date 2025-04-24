const canvas = document.getElementById('goBoard');
const ctx = canvas.getContext('2d');
const size = 9;  // 9x9 board
const cellSize = canvas.width / (size + 1);
const boardOffset = cellSize;
const stones = Array.from({ length: size }, () => Array(size).fill(null));
let currentPlayer = 'black';
let hoverCoord = null;

// Draw board and the stones
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  for (let i = 0; i < size; i++) {
    const pos = boardOffset + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(boardOffset, pos);
    ctx.lineTo(boardOffset + (size - 1) * cellSize, pos);
    ctx.moveTo(pos, boardOffset);
    ctx.lineTo(pos, boardOffset + (size - 1) * cellSize);
    ctx.stroke();
  }

  drawStones();
  drawHover();
}

// Draw the stones
function drawStones() {
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const stone = stones[x][y];
      if (stone) {
        ctx.beginPath();
        ctx.arc(boardOffset + x * cellSize, boardOffset + y * cellSize, cellSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = stone;
        ctx.fill();
      }
    }
  }
}

// Draw hover preview
function drawHover() {
  if (!hoverCoord) return;
  const { x, y } = hoverCoord;
  if (x < 0 || y < 0 || x >= size || y >= size || stones[x][y]) return;
  ctx.beginPath();
  ctx.arc(boardOffset + x * cellSize, boardOffset + y * cellSize, cellSize * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = currentPlayer === 'black' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  ctx.fill();
}

// Get liberties of a given stone group
function getLiberties(x, y, visited) {
  const liberties = [];
  const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
  ];

  const stack = [{ x, y }];
  const group = [];

  while (stack.length > 0) {
    const { x: cx, y: cy } = stack.pop();
    if (visited[cx][cy]) continue;

    visited[cx][cy] = true;
    group.push({ x: cx, y: cy });

    directions.forEach(({ x: dx, y: dy }) => {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (stones[nx][ny] === null) {
          liberties.push({ x: nx, y: ny });
        } else if (stones[nx][ny] === stones[cx][cy] && !visited[nx][ny]) {
          stack.push({ x: nx, y: ny });
        }
      }
    });
  }

  return { group, liberties };
}

// Capture stones if surrounded (no liberties)
function captureStones() {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const capturedStones = [];

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      if (stones[x][y] !== null && !visited[x][y]) {
        const color = stones[x][y];
        const { group, liberties } = getLiberties(x, y, visited);
        
        // If no liberties, this group is captured
        if (liberties.length === 0) {
          group.forEach(({ x, y }) => {
            stones[x][y] = null;
            capturedStones.push({ x, y });
          });
        }
      }
    }
  }

  return capturedStones;
}

// Handle hover and click events
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left - boardOffset) / cellSize);
  const y = Math.round((e.clientY - rect.top - boardOffset) / cellSize);
  hoverCoord = { x, y };
  drawBoard();
});

canvas.addEventListener('click', () => {
  if (hoverCoord && !stones[hoverCoord.x][hoverCoord.y]) {
    // Place stone
    stones[hoverCoord.x][hoverCoord.y] = currentPlayer;

    // Capture stones after placing the new stone
    captureStones();

    // Switch to the next player
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';

    // Redraw the board
    drawBoard();
  }
});

// Reset game function
function resetGame() {
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      stones[x][y] = null;
    }
  }
  currentPlayer = 'black';
  drawBoard();
}

drawBoard();
