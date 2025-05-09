let items = [];
let scores = {};
let currentPair = [];
let allPairs = new Set();
let shownPairs = new Set();
let seenItems = new Set();



function updateElo(rA, rB, winner, k = 32) {
  const eA = 1 / (1 + Math.pow(10, (rB - rA) / 400));
  const sA = winner === 0 ? 1 : 0;
  const sB = 1 - sA;
  return [
    rA + k * (sA - eA),
    rB + k * (sB - eA - sB + sB) // same as: rB + k * (sB - eB)
  ];
}

async function loadItems() {
    const res = await fetch('list.txt');
    const text = await res.text();
    items = text.trim().split('\n');
    items.forEach(item => scores[item] = 1000);
  
    // all unique unordered pairs
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        allPairs.add(JSON.stringify([items[i], items[j]]));
      }
    }
  
    nextMatchup();
  }
  

  function nextMatchup() {
    if (shownPairs.size === allPairs.size) {
      showResults();
      return;
    }
  
    let pair;
    do {
      const arr = Array.from(allPairs);
      pair = JSON.parse(arr[Math.floor(Math.random() * arr.length)]);
    } while (shownPairs.has(JSON.stringify(pair)));
  
    shownPairs.add(JSON.stringify(pair));
    currentPair = pair;
  
    // Track what has been seen
    seenItems.add(pair[0]);
    seenItems.add(pair[1]);
  
    // Update interface
    document.getElementById('boxA').textContent = pair[0];
    document.getElementById('boxB').textContent = pair[1];
    document.getElementById('counter').textContent =
      `Matchup ${shownPairs.size} of ${allPairs.size}`;
    document.getElementById('unseen').textContent =
      `Unseen items: ${items.length - seenItems.size}`;
  }
  
  

function handleVote(winnerIndex) {
  const [a, b] = currentPair;
  const [newA, newB] = updateElo(scores[a], scores[b], winnerIndex);
  scores[a] = newA;
  scores[b] = newB;
  nextMatchup();
}

function showResults() {
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

