(() => {
  'use strict';
  const svg = document.getElementById('cmri-network');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('graph-motion');
  const nodes = [...svg.querySelectorAll('.cmri-node')].map(element => ({
    element, x: Number(element.dataset.x), y: Number(element.dataset.y)
  }));
  const connections = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],
    [0,2],[2,5],[1,5],[1,7],[7,4],[2,4],[2,6],[0,6],[3,5],[7,5],[1,4]];
  const edges = svg.querySelector('.cmri-edges');
  edges.replaceChildren();
  const links = connections.map(([from, to], index) => {
    const line = document.createElementNS(ns, 'line');
    edges.append(line);
    const signal = document.createElementNS(ns, 'circle');
    signal.setAttribute('r', index % 3 === 0 ? '2.5' : '1.7');
    svg.querySelector('.cmri-signals').append(signal);
    return {from, to, line, signal};
  });
  let paused = false;
  let visible = false;
  let frame = 0;
  let previousTime = null;
  let elapsed = 0;
  function draw(time) {
    const positions = nodes.map((node, index) => {
      const phase = index * 1.7;
      const x = node.x + Math.sin(time * 0.36 + phase) * 9;
      const y = node.y + Math.cos(time * 0.3 + phase) * 8;
      node.element.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      return {x, y};
    });
    links.forEach(({from, to, line, signal}, index) => {
      const a = positions[from];
      const b = positions[to];
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.style.opacity = (0.35 + 0.35 * (1 + Math.sin(time * 0.7 + index)) / 2).toFixed(2);
      const progress = (time * 0.14 + index * 0.137) % 1;
      signal.setAttribute('cx', a.x + (b.x - a.x) * progress);
      signal.setAttribute('cy', a.y + (b.y - a.y) * progress);
      signal.style.opacity = (Math.sin(progress * Math.PI) * 0.75).toFixed(2);
    });
  }
  function tick(now) {
    if (previousTime !== null) elapsed += Math.min(now - previousTime, 50) / 1000;
    previousTime = now;
    draw(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = null;
    const running = visible && !paused && !motion.matches && !document.hidden;
    svg.dataset.running = String(running);
    button.hidden = motion.matches;
    button.textContent = paused ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-pressed', String(paused));
    if (running) frame = requestAnimationFrame(tick);
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  draw(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); },
      {threshold: 0.05}).observe(svg);
  } else { visible = true; }
  sync();
})();
