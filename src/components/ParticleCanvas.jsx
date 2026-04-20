import { useEffect, useRef } from 'react';

const COUNT = 48;
const MAX_DIST = 120;

function hex2rgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpRgb(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function makeParticle(W, H) {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    r: Math.random() * 1.5 + 0.8,
    phase: Math.random() * Math.PI * 2,
  };
}

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0;
    let H = 0;
    let particles = [];
    let frameId;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function init() {
      particles = Array.from({ length: COUNT }, () => makeParticle(W, H));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const isDark = document.body.classList.contains('dark');
      const styles = getComputedStyle(document.documentElement);
      const pHex = styles.getPropertyValue('--primary').trim() || '#6366f1';
      const aHex = styles.getPropertyValue('--accent').trim() || '#a855f7';
      const pRgb = hex2rgb(pHex);
      const aRgb = hex2rgb(aHex);
      const baseAlpha = isDark ? 1 : 0.5;

      for (const pt of particles) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.phase += 0.018;
        if (pt.x < 0) pt.x = W;
        if (pt.x > W) pt.x = 0;
        if (pt.y < 0) pt.y = H;
        if (pt.y > H) pt.y = 0;
        const r = pt.r * (1 + 0.25 * Math.sin(pt.phase));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pRgb[0]},${pRgb[1]},${pRgb[2]},${baseAlpha * 0.7})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            const t = dist / MAX_DIST;
            const rgb = lerpRgb(pRgb, aRgb, t);
            const a = (1 - t) * (isDark ? 0.22 : 0.1);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      frameId = requestAnimationFrame(draw);
    }

    function onResize() {
      resize();
      init();
    }

    resize();
    init();
    draw();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}
