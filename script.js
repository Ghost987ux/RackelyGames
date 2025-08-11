const puzzleEl = document.getElementById('puzzle');
const movesEl = document.getElementById('moves');
const statusEl = document.getElementById('status');
const customPanel = document.getElementById('customization');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

const size = 3;
const total = size * size;

// Usando emojis ❤️ para as peças (1 a 8)
const emoji = '❤️';

let tiles = [];
let moves = 0;
let emptyIndex = total -1;
let puzzleSolved = false;

function createTiles() {
  tiles = [];
  for(let i=1; i < total; i++) tiles.push(i);
  tiles.push(0);
  emptyIndex = total -1;
  moves = 0;
  puzzleSolved = false;
}

function render() {
  puzzleEl.innerHTML = '';
  for(let i=0; i < total; i++) {
    const tileValue = tiles[i];
    const tile = document.createElement('div');
    tile.classList.add('tile');
    if(tileValue === 0) {
      tile.classList.add('empty');
      tile.textContent = '';
      tile.style.cursor = 'default';
    } else {
      tile.textContent = emoji;
      tile.title = `Peça ${tileValue}`;
    }
    tile.style.width = tile.style.height = `calc((300px - 16px)/${size})`;
    tile.setAttribute('data-index', i);
    puzzleEl.appendChild(tile);
  }
  movesEl.textContent = `Movimentos: ${moves}`;
}

function neighbors(i) {
  const r = Math.floor(i/size);
  const c = i % size;
  const nbrs = [];
  if(r>0) nbrs.push(i - size);
  if(r<size-1) nbrs.push(i + size);
  if(c>0) nbrs.push(i -1);
  if(c<size-1) nbrs.push(i +1);
  return nbrs;
}

function checkSolved() {
  for(let i=0; i < total -1; i++) {
    if(tiles[i] !== i +1) return false;
  }
  return tiles[total-1] === 0;
}

puzzleEl.addEventListener('click', e => {
  if(puzzleSolved) return;
  const tile = e.target.closest('.tile');
  if(!tile) return;
  const idx = Number(tile.getAttribute('data-index'));
  if(neighbors(idx).includes(emptyIndex)) {
    [tiles[idx], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[idx]];
    emptyIndex = idx;
    moves++;
    render();
    if(checkSolved()) {
      puzzleSolved = true;
      statusEl.textContent = '🎉 Parabéns! Quebra-cabeça resolvido. Liberando personalização...';
      showCustomization();
    } else {
      statusEl.textContent = '';
    }
  }
});

document.getElementById('btnShuffle').addEventListener('click', () => {
  shufflePuzzle();
});
document.getElementById('btnReset').addEventListener('click', () => {
  createTiles();
  render();
  statusEl.textContent = '';
});
document.getElementById('btnSolve').addEventListener('click', () => {
  createTiles();
  render();
  statusEl.textContent = 'Quebra-cabeça resolvido automaticamente.';
  puzzleSolved = true;
  showCustomization();
});

function shufflePuzzle() {
  createTiles();
  let movesToShuffle = 20;
  for(let i=0; i<movesToShuffle; i++) {
    const nbrs = neighbors(emptyIndex);
    const moveTo = nbrs[Math.floor(Math.random() * nbrs.length)];
    [tiles[emptyIndex], tiles[moveTo]] = [tiles[moveTo], tiles[emptyIndex]];
    emptyIndex = moveTo;
  }
  moves = 0;
  puzzleSolved = false;
  statusEl.textContent = '';
  render();
}

function showCustomization() {
  customPanel.style.display = 'flex';
}

// Personalização
let playerColor = '#ff4c60';
let playerAccessory = 'none';

const colorChoices = document.querySelectorAll('.color-choice');
colorChoices.forEach(el => {
  el.addEventListener('click', () => {
    colorChoices.forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    playerColor = el.getAttribute('data-color');
  });
  el.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});

const accessoryChoices = document.querySelectorAll('.accessory-choice');
accessoryChoices.forEach(el => {
  el.addEventListener('click', () => {
    accessoryChoices.forEach(a => {
      a.classList.remove('selected');
      a.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');
    playerAccessory = el.getAttribute('data-acc');
  });
  el.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});

const btnStartGame = document.getElementById('btnStartGame');
btnStartGame.addEventListener('click', () => {
  if(!puzzleSolved) {
    alert('Resolva o quebra-cabeça primeiro!');
    return;
  }
  customPanel.style.display = 'none';
  gameCanvas.style.display = 'block';
  startGame();
});

// Jogo simples
let gameOn = false;
let lastTime = 0;
let spawnTimer = 0;
let score = 0;
let alive = true;
let bullets = [];
let enemies = [];
const player = { x: gameCanvas.width / 2, y: gameCanvas.height - 40, w: 30, h: 18, speed: 250, vx: 0 };

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') shoot(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });

function shoot() {
  if (!gameOn || !alive) return;
  bullets.push({ x: player.x, y: player.y - 12, r: 5, vy: -450 });
}

function spawnEnemy() {
  const x = Math.random() * (gameCanvas.width - 30) + 15;
  const r = 14 + Math.random() * 10;
  const vy = 70 + Math.random() * 90 + Math.min(score, 300) * 0.2;
  enemies.push({ x, y: -20, r, vy });
}

function update(dt) {
  if (!gameOn) return;

  if (keys['ArrowLeft']) player.x -= player.speed * dt;
  if (keys['ArrowRight']) player.x += player.speed * dt;
  player.x = Math.max(player.w / 2, Math.min(gameCanvas.width - player.w / 2, player.x));

  bullets.forEach((b, i) => {
    b.y += b.vy * dt;
    if (b.y < -10) bullets.splice(i, 1);
  });

  enemies.forEach((en, i) => {
    en.y += en.vy * dt;
    if (en.y > gameCanvas.height + 50) enemies.splice(i, 1);
  });

  for (let i = enemies.length -1; i >= 0; i--) {
    const en = enemies[i];
    for (let j = bullets.length -1; j >= 0; j--) {
      const b = bullets[j];
      const dx = en.x - b.x;
      const dy = en.y - b.y;
      if (dx*dx + dy*dy < (en.r + b.r)*(en.r + b.r)) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        break;
      }
    }
  }

  for (const en of enemies) {
    const dx = Math.abs(en.x - player.x);
    const dy = Math.abs(en.y - player.y);
    if (dx < en.r + player.w / 2 && dy < en.r + player.h / 2) {
      alive = false;
      gameOn = false;
      alert(`💥 Você foi atingido! Pontuação: ${score}. Recarregue a página para jogar novamente.`);
    }
  }

  spawnTimer += dt;
  if (spawnTimer > Math.max(0.45, 1.2 - Math.min(score / 300, 0.7))) {
    spawnEnemy();
    spawnTimer = 0;
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = playerColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, player.w / 2, player.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#222';
  if (playerAccessory === 'hat') {
    ctx.fillRect(-player.w / 2, -player.h / 2 - 10, player.w, 8);
    ctx.fillRect(-player.w / 6, -player.h / 2 - 18, player.w / 3, 10);
  }
  if (playerAccessory === 'glasses') {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(-player.w / 3, -player.h / 6, player.w / 5, player.h / 3);
    ctx.rect(player.w / 10, -player.h / 6, player.w / 5, player.h / 3);
    ctx.stroke();
  }
  if (playerAccessory === 'mask') {
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(0, 0, player.w / 2, player.h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Fundo pontilhado suave
  for (let i = 0; i < 50; i++) {
    const x = (i * 29 + (Date.now() / 6)) % gameCanvas.width;
    const y = (i * 37) % gameCanvas.height;
    ctx.fillStyle = 'rgba(255,76,96,0.05)';
    ctx.fillRect(x, y, 1, 1);
  }

  drawPlayer();

  ctx.fillStyle = '#ff4c60';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach(en => {
    ctx.fillStyle = '#ff1e40';
    ctx.beginPath();
    ctx.ellipse(en.x, en.y, en.r, en.r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(en.x, en.y, en.r * 0.4, en.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'var(--text, #e4e4e7)';
  ctx.font = '18px Segoe UI, Arial';
  ctx.fillText(`Pontuação: ${score}`, 12, 28);

  if (!gameOn && alive) {
    ctx.fillStyle = 'rgba(255,76,96,0.12)';
    ctx.fillRect(gameCanvas.width / 2 - 170, gameCanvas.height / 2 - 24, 340, 48);
    ctx.fillStyle = '#ff4c60';
    ctx.textAlign = 'center';
    ctx.font = '16px Segoe UI';
    ctx.fillText('← → para mover, Espaço para atirar', gameCanvas.width / 2, gameCanvas.height / 2 + 6);
    ctx.textAlign = 'left';
  } else if (!alive) {
    ctx.fillStyle = 'rgba(255,76,96,0.16)';
    ctx.fillRect(gameCanvas.width / 2 - 110, gameCanvas.height / 2 - 30, 220, 60);
    ctx.fillStyle = '#ff858e';
    ctx.textAlign = 'center';
    ctx.font = '20px Segoe UI';
    ctx.fillText('Game Over', gameCanvas.width / 2, gameCanvas.height / 2);
    ctx.fillStyle = 'var(--text-muted, #a8a8b3)';
    ctx.font = '14px Segoe UI';
    ctx.fillText(`Pontuação: ${score}`, gameCanvas.width / 2, gameCanvas.height / 2 + 24);
    ctx.textAlign = 'left';
  }
}

function loop(ts) {
  if (!lastTime) lastTime = ts;
  const dt = Math.min(0.05, (ts - lastTime) / 1000);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  player.x = gameCanvas.width / 2;
  bullets = [];
  enemies = [];
  score = 0;
  alive = true;
  gameOn = true;
  spawnTimer = 0;
  lastTime = 0;
}

createTiles();
render();
requestAnimationFrame(loop);
