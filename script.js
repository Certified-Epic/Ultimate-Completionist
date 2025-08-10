/* script.js
   - Dynamically draws a star-chart SVG with nodes and connection paths from data.
   - Manages node states (locked, unlocked, completed).
   - Handles hover tooltips, audio, and click-to-complete logic that unlocks connected nodes.
*/

/* ---------- Configuration & Data ---------- */

/* SVG canvas reference */
const svg = document.getElementById('star-chart');
const tooltip = document.getElementById('tooltip');
const bgAudio = document.getElementById('bg-audio');
const hoverAudio = document.getElementById('hover-audio');
const unlockAudio = document.getElementById('unlock-audio');
const audioToggle = document.getElementById('audio-toggle');

/* Viewbox size (matches the SVG viewBox in HTML) */
const VIEW_W = 1200;
const VIEW_H = 700;

/* Achievement dataset:
   - categories: Creative, Physical, Social, Intellectual, Mastery (etc)
   - each node: id, name, description, x (0-1), y (0-1), status, connections: [ids]
*/
const nodesData = [
  // Creative planet cluster
  { id: 'C1', name: 'Sketch Daily', description: 'Draw something small each day for 30 days.', x:0.15, y:0.22, status:'unlocked', connections:['C2','C3'] },
  { id: 'C2', name: 'Finish Comic', description: 'Complete a short 8-page comic.', x:0.22, y:0.18, status:'locked', connections:['C4'] },
  { id: 'C3', name: 'Design Poster', description: 'Create a poster for an event.', x:0.12, y:0.12, status:'locked', connections:['C4'] },
  { id: 'C4', name: 'Portfolio Entry', description: 'Make a polished portfolio piece.', x:0.18, y:0.08, status:'locked', connections:['M1'] },

  // Physical planet cluster
  { id: 'P1', name: 'Run 5K', description: 'Complete a continuous 5km run.', x:0.45, y:0.58, status:'unlocked', connections:['P2','P3'] },
  { id: 'P2', name: '30 Pushups', description: 'Do 30 pushups in one set.', x:0.40, y:0.65, status:'locked', connections:['P4'] },
  { id: 'P3', name: 'Flexibility', description: 'Hold a full split with good form.', x:0.50, y:0.68, status:'locked', connections:['P4'] },
  { id: 'P4', name: 'Endurance Test', description: '60-minute continuous workout.', x:0.46, y:0.76, status:'locked', connections:['M1'] },

  // Social planet cluster
  { id: 'S1', name: 'Host Hangout', description: 'Host a small social event.', x:0.80, y:0.30, status:'locked', connections:['S2'] },
  { id: 'S2', name: 'Public Talk', description: 'Give a short talk to a group.', x:0.78, y:0.22, status:'locked', connections:['M2'] },

  // Intellectual planet cluster
  { id: 'I1', name: 'Read 3 Books', description: 'Finish reading 3 non-fiction books.', x:0.60, y:0.18, status:'unlocked', connections:['I2','I3'] },
  { id: 'I2', name: 'Mini Research', description: 'Write a 1500-word research summary.', x:0.66, y:0.12, status:'locked', connections:['M2'] },
  { id: 'I3', name: 'Language Basics', description: 'Reach A1 in a new language.', x:0.52, y:0.10, status:'locked', connections:['M2'] },

  // Misc / Mastery core
  { id: 'M1', name: 'Skill Showcase', description: 'Create a project showcasing multiple skills.', x:0.34, y:0.34, status:'locked', connections:['M2'] },
  { id: 'M2', name: 'Public Portfolio', description: 'Publish a public portfolio of your work.', x:0.52, y:0.40, status:'locked', connections:['G1'] },

  // Global core / endgame
  { id: 'G1', name: 'Ultimate Completionist', description: 'Reach the ultimate completion of core goals.', x:0.52, y:0.52, status:'locked', connections:[] },

  // Extra nodes to make 20+ achievements (spreading across map)
  { id:'C5', name:'Daily Thumbnail', description:'Make a thumbnail each day for a week.', x:0.08, y:0.28, status:'locked', connections:['C1'] },
  { id:'P5', name:'Sprint PR', description:'Set a new personal record in sprints.', x:0.56, y:0.50, status:'locked', connections:['P1'] },
  { id:'I4', name:'Puzzle Streak', description:'Solve a daily logic puzzle for 14 days.', x:0.72, y:0.12, status:'locked', connections:['I1'] },
  { id:'S3', name:'Volunteer', description:'Volunteer at a local event.', x:0.88, y:0.36, status:'locked', connections:['S1'] },
  { id:'X1', name:'Random Challenge', description:'Complete a surprise weekly challenge.', x:0.28, y:0.60, status:'locked', connections:['P1','C1'] }
];

/* Create a map for quick lookup */
const nodesById = {};
nodesData.forEach(n=> nodesById[n.id] = n);

/* ---------- Helper functions for SVG drawing ---------- */

/* Convert normalized coordinates (0..1) to SVG coords */
function toSVGCoords(n) {
  return { x: Math.round(n.x * VIEW_W), y: Math.round(n.y * VIEW_H) };
}

/* Create defs (gradients, glow) in SVG */
function createDefs() {
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');

  // glow gradient for active paths
  defs.innerHTML = `
    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7ae1ff" stop-opacity="0.9"></stop>
      <stop offset="50%" stop-color="#cfeeff" stop-opacity="0.95"></stop>
      <stop offset="100%" stop-color="#7ae1ff" stop-opacity="0.9"></stop>
    </linearGradient>
  `;
  svg.appendChild(defs);
}

/* Draw connection path between two node coordinates */
function drawConnection(n1, n2, id) {
  const p1 = toSVGCoords(n1);
  const p2 = toSVGCoords(n2);

  // Use a smooth quadratic curve for nicer visuals
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const qx = p1.x + dx * 0.5;
  const qy = p1.y + dy * 0.5 - 30; // slight arch

  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d', `M ${p1.x} ${p1.y} Q ${qx} ${qy} ${p2.x} ${p2.y}`);
  path.setAttribute('class','connection');
  path.setAttribute('data-from', n1.id);
  path.setAttribute('data-to', n2.id);
  path.setAttribute('id', 'conn-' + id);

  svg.appendChild(path);
  return path;
}

/* Draw a node (SVG group with rotated rect diamond + check icon) */
function drawNode(node) {
  const pos = toSVGCoords(node);
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.classList.add('g-node');
  g.setAttribute('data-id', node.id);
  g.setAttribute('data-status', node.status);
  g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
  g.setAttribute('tabindex','0');

  // Diamond (rotated rect)
  const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rect.classList.add('diamond');
  rect.setAttribute('x', -9);
  rect.setAttribute('y', -9);

  // small halo circle for unlocked state
  const halo = document.createElementNS('http://www.w3.org/2000/svg','circle');
  halo.setAttribute('r','28');
  halo.setAttribute('fill','none');
  halo.setAttribute('class','halo');
  halo.setAttribute('stroke','none');

  // checkmark for completed
  const check = document.createElementNS('http://www.w3.org/2000/svg','g');
  check.classList.add('check');
  check.innerHTML = `<path d="M -6 0 L -1 5 L 7 -6" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;

  g.appendChild(halo);
  g.appendChild(rect);
  g.appendChild(check);

  // hover & click events for unlocked / completed
  g.addEventListener('mouseenter', (ev) => {
    if (node.status === 'locked') return;
    showTooltip(node, ev);
    playHoverSound();
  });
  g.addEventListener('mousemove', (ev) => {
    if (node.status === 'locked') return;
    moveTooltip(ev);
  });
  g.addEventListener('mouseleave', () => {
    hideTooltip();
  });

  g.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (node.status === 'unlocked') {
      completeNode(node.id);
    } else if (node.status === 'completed') {
      // maybe open details or do nothing
      // small pulse to acknowledge click
      pulseNode(node.id);
    }
  });

  svg.appendChild(g);
  return g;
}

/* ---------- Render the chart ---------- */
function renderChart() {
  svg.innerHTML = ''; // clear
  createDefs();

  // First draw connections (so nodes are on top)
  // We'll draw each connection only once (from lower id to higher id)
  let connCount = 0;
  nodesData.forEach(n=>{
    n.connections.forEach(targetId=>{
      const t = nodesById[targetId];
      if (!t) return;
      // draw connection
      drawConnection(n, t, connCount++);
    });
  });

  // Draw nodes
  nodesData.forEach(n=>{
    const g = drawNode(n);
    // update visual state classes and attributes
    updateNodeVisual(n.id);
  });

  // After drawing, apply dynamic styles to connections based on node states
  refreshConnections();
}

/* ---------- State management (complete -> unlock propagation) ---------- */

/* Complete a node by id */
function completeNode(id) {
  const node = nodesById[id];
  if (!node) return;
  if (node.status !== 'unlocked') return;

  // set to completed
  node.status = 'completed';
  updateNodeVisual(id);
  playUnlockSound();

  // find connections outgoing from this node, unlock them
  node.connections.forEach(targetId=>{
    const t = nodesById[targetId];
    if (!t) return;
    if (t.status === 'locked') {
      t.status = 'unlocked';
      updateNodeVisual(t.id);
    }
  });

  // also check any nodes that have connection FROM other completed nodes to unlock ripple
  // (iterate through nodes to find those where all pre-reqs are completed — simple rule: if any predecessor completed unlocks)
  propagateUnlocks();

  // refresh connection visuals
  refreshConnections();
}

/* propagate unlocks (can be customized to require multiple prereqs) */
function propagateUnlocks() {
  nodesData.forEach(n=>{
    if (n.status !== 'locked') return;
    // if any incoming connection from completed node, unlock
    const incoming = nodesData.filter(m=> m.connections.includes(n.id));
    const anyCompleted = incoming.some(p=> nodesById[p.id].status === 'completed');
    if (anyCompleted) {
      n.status = 'unlocked';
      updateNodeVisual(n.id);
    }
  });
}

/* simple pulse animation when clicking completed nodes */
function pulseNode(id) {
  const el = svg.querySelector(`g.g-node[data-id="${id}"]`);
  if (!el) return;
  el.style.transition = 'transform 70ms ease';
  el.style.transform += ' scale(1.04)';
  setTimeout(()=> el.style.transform = el.style.transform.replace(' scale(1.04)',''),120);
}

/* Update visual appearance of a node group based on its data-status */
function updateNodeVisual(id) {
  const node = nodesById[id];
  const g = svg.querySelector(`g.g-node[data-id="${id}"]`);
  if (!g) return;
  g.setAttribute('data-status', node.status);

  // update check opacity (handled by CSS) and halo / stroke
  const rect = g.querySelector('rect.diamond');
  const halo = g.querySelector('circle.halo');

  if (node.status === 'locked') {
    rect.setAttribute('fill','#3d4046');
    rect.setAttribute('stroke','rgba(255,255,255,0.03)');
    halo.setAttribute('stroke','none');
    g.style.cursor = 'default';
  } else if (node.status === 'unlocked') {
    rect.setAttribute('fill','#eaf6ff');
    rect.setAttribute('stroke','rgba(120,200,255,0.9)');
    halo.setAttribute('stroke','rgba(120,200,255,0.06)');
    halo.setAttribute('stroke-width','2');
    g.style.cursor = 'pointer';
  } else if (node.status === 'completed') {
    rect.setAttribute('fill','#ffd57a');
    rect.setAttribute('stroke','rgba(255,200,110,0.95)');
    halo.setAttribute('stroke','rgba(255,200,110,0.06)');
    halo.setAttribute('stroke-width','3');
    g.style.cursor = 'pointer';
  }
}

/* refresh connections styles: make path.active if from completed -> to unlocked */
function refreshConnections() {
  const paths = svg.querySelectorAll('path.connection');
  paths.forEach(p=>{
    const from = p.getAttribute('data-from');
    const to = p.getAttribute('data-to');
    const fromNode = nodesById[from];
    const toNode = nodesById[to];
    if (!fromNode || !toNode) return;

    // active when from completed and to unlocked (guiding the user)
    if (fromNode.status === 'completed' && toNode.status === 'unlocked') {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

/* ---------- Tooltip & audio ---------- */

function showTooltip(node, ev) {
  tooltip.classList.remove('hidden');
  tooltip.innerHTML = `<strong>${escapeHtml(node.name)}</strong><div style="margin-top:6px;font-size:13px;color:#cfefff;opacity:0.95">${escapeHtml(node.description)}</div><div style="margin-top:8px;font-size:12px;opacity:0.6">Status: ${node.status}</div>`;
  moveTooltip(ev);
}

function moveTooltip(ev) {
  const padding = 16;
  const x = ev.clientX + padding;
  const y = Math.max(12, ev.clientY - 48);
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

function hideTooltip() {
  tooltip.classList.add('hidden');
}

/* audio controls */
audioToggle.addEventListener('click', () => {
  if (bgAudio.paused) {
    bgAudio.muted = false;
    bgAudio.play().catch(()=>{ /* autoplay may be blocked */ });
    audioToggle.textContent = '🔊 Music On';
  } else {
    bgAudio.pause();
    audioToggle.textContent = '🔈 Music Off';
  }
});

/* play hover sound (small debouncing to avoid spam) */
let lastHoverAt = 0;
function playHoverSound() {
  const now = Date.now();
  if (now - lastHoverAt < 220) return;
  lastHoverAt = now;
  try { hoverAudio.currentTime = 0; hoverAudio.play(); } catch(e){}
}

/* play unlock sound */
function playUnlockSound() {
  try { unlockAudio.currentTime = 0; unlockAudio.play(); } catch(e){}
}

/* utility to escape html */
function escapeHtml(s='') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

/* ---------- Initialization ---------- */

/* clicking empty space hides tooltip */
svg.addEventListener('click', () => hideTooltip());

/* render once */
renderChart();

/* Expose functions for debugging in console */
window._AT = {
  nodesData, nodesById, renderChart, completeNode, propagateUnlocks
};
