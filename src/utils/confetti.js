// High-Performance GPU-Accelerated Canvas Micro-Confetti & Particle Burst (0 external dependencies)

let canvas = null;
let ctx = null;
let particles = [];
let animationId = null;

function initCanvas() {
  if (typeof window === "undefined") return;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999999";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();
  }
}

class Particle {
  constructor(x, y, color, isHeart = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isHeart = isHeart;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (isHeart ? 4 : 2);
    this.gravity = isHeart ? 0.05 : 0.28;
    this.drag = 0.96;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.015;
    this.size = Math.random() * 6 + 4;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.vx *= this.drag;
    this.vy = this.vy * this.drag + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    this.rotation += this.rotationSpeed;
  }

  draw(context) {
    if (this.alpha <= 0) return;
    context.save();
    context.globalAlpha = Math.max(0, this.alpha);
    context.translate(this.x, this.y);
    context.rotate(this.rotation);

    if (this.isHeart) {
      // Draw smooth SVG-like heart
      context.fillStyle = this.color;
      context.beginPath();
      const s = this.size;
      context.moveTo(0, 0);
      context.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
      context.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
      context.fill();
    } else {
      // Draw confetti rectangle
      context.fillStyle = this.color;
      context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    }

    context.restore();
  }
}

function loop() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
      canvas = null;
      ctx = null;
    }
  }
}

export function triggerConfetti(options = {}) {
  if (typeof window === "undefined") return;
  initCanvas();

  const x = options.x !== undefined ? options.x : window.innerWidth / 2;
  const y = options.y !== undefined ? options.y : window.innerHeight / 2;
  const count = options.count || 45;
  const colors = options.colors || ["#1A73E8", "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, color, false));
  }

  if (!animationId) {
    animationId = requestAnimationFrame(loop);
  }
}

export function triggerHeartBurst(x, y) {
  if (typeof window === "undefined") return;
  initCanvas();

  const posX = x !== undefined ? x : window.innerWidth / 2;
  const posY = y !== undefined ? y : window.innerHeight / 2;
  const colors = ["#ef4444", "#f43f5e", "#ec4899", "#fb7185"];

  for (let i = 0; i < 18; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(posX, posY, color, true));
  }

  if (!animationId) {
    animationId = requestAnimationFrame(loop);
  }
}
