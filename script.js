const stage = document.getElementById("stage");

// 1. Split big lines into letters so they can animate one by one
document.querySelectorAll(".line").forEach((line) => {
  const text = line.textContent;
  line.textContent = "";
  [...text].forEach((c, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.style.setProperty("--i", i);
    s.textContent = c;
    line.appendChild(s);
  });
});

// 2. Stretch both lines to the same width (like the poster)
function fitLines() {
  const fit = parseFloat(getComputedStyle(stage).getPropertyValue("--fit")) || 0.554;
  const target = stage.clientWidth * fit;
  document.querySelectorAll(".line").forEach((el) => {
    el.style.transform = "none";
    const natural = el.getBoundingClientRect().width;
    el.style.transform = `scaleX(${target / natural})`;
  });
  stage.classList.add("fitted");
}
document.fonts.ready.then(fitLines);
window.addEventListener("resize", fitLines);

// 3. Pointer parallax (smoothed)
let tx = 0, ty = 0, cx = 0, cy = 0;
window.addEventListener("pointermove", (e) => {
  tx = (e.clientX / innerWidth - 0.5) * 2;
  ty = (e.clientY / innerHeight - 0.5) * 2;
});
window.addEventListener("pointerup", () => { tx = 0; ty = 0; });
window.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
window.addEventListener("orientationchange", () => setTimeout(fitLines, 250));
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// 4. Floating glow particles
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let W, H, dots = [];
function resizeCanvas() {
  const r = devicePixelRatio || 1;
  W = canvas.width = innerWidth * r;
  H = canvas.height = innerHeight * r;
  dots = Array.from({ length: Math.round(innerWidth / 18) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: (Math.random() * 2 + .8) * r,
    v: (Math.random() * .4 + .15) * r,
    a: Math.random() * .5 + .15,
    p: Math.random() * 6.28,
  }));
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function frame(t) {
  cx += (tx - cx) * 0.06;
  cy += (ty - cy) * 0.06;
  stage.style.setProperty("--mx", cx.toFixed(3));
  stage.style.setProperty("--my", cy.toFixed(3));

  ctx.clearRect(0, 0, W, H);
  for (const d of dots) {
    d.y -= d.v;
    if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
    const tw = d.a * (0.6 + 0.4 * Math.sin(t / 700 + d.p));
    ctx.beginPath();
    ctx.arc(d.x + Math.sin(t / 2000 + d.p) * 12, d.y, d.r, 0, 6.28);
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.fill();
  }
  requestAnimationFrame(frame);
}
if (!still) requestAnimationFrame(frame);
