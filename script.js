let items = [];
let scores = {};
let currentPair = [];
let seenItems = new Set();
let roundCount = 0;
const MAX_ROUNDS = 40;

function updateElo(rA, rB, winner, k = 32) {
  const eA = 1 / (1 + Math.pow(10, (rB - rA) / 400));
  const sA = winner === 0 ? 1 : 0;
  const sB = 1 - sA;
  return [
    rA + k * (sA - eA),
    rB + k * (sB - (1 - eA)) // equivalent to rB + k*(sB - eB)
  ];
}

async function loadItems() {
  const res = await fetch('list.txt');
  const text = await res.text();
  items = text.trim().split('\n');
  items.forEach(item => scores[item] = 1000);
  nextMatchup();
}

function nextMatchup() {
  if (roundCount >= MAX_ROUNDS) {
    showResults();
    return;
  }

  let a = items[Math.floor(Math.random() * items.length)];
  let b;
  do {
    b = items[Math.floor(Math.random() * items.length)];
  } while (a === b);

  currentPair = [a, b];
  seenItems.add(a);
  seenItems.add(b);
  roundCount++;

  document.getElementById('boxA').textContent = a;
  document.getElementById('boxB').textContent = b;

    document.getElementById('counterSmall').textContent = `${roundCount}/${MAX_ROUNDS}`;
    document.getElementById('unseenSmall').textContent = `unseen: ${items.length - seenItems.size}`;

}

function handleVote(winnerIndex) {
  const [a, b] = currentPair;
  const [newA, newB] = updateElo(scores[a], scores[b], winnerIndex);
  scores[a] = newA;
  scores[b] = newB;
  nextMatchup();
}

function showResults() {
    if (roundCount < MAX_ROUNDS) {
        console.log(`User ended early at round ${roundCount}`);
      }      
  document.getElementById('matchScreen').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  const list = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const ol = document.getElementById('rankingList');
  list.forEach(([item, score]) => {
    const li = document.createElement('li');
    li.textContent = `${item} (${Math.round(score)})`;
    ol.appendChild(li);
  });
}

document.getElementById('startButton').onclick = () => {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('matchScreen').style.display = 'block';
  loadItems();
};

document.getElementById('boxA').onclick = () => handleVote(0);
document.getElementById('boxB').onclick = () => handleVote(1);
document.getElementById('endButton').onclick = showResults;
document.getElementById('contextToggle').onclick = function () {
  const box = document.getElementById("contextBox");
  const isVisible = box.style.display === "block";
  box.style.display = isVisible ? "none" : "block";
  this.textContent = isVisible ? "context ▸" : "context ▾";
};

document.getElementById('restartButton').onclick = () => {
    location.reload();
  };
  

