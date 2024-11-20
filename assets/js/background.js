const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');

// Configurable variables
const config = {
  enableDotsAnimation: true,
  numDots: Math.round(canvas.width * canvas.height / 500), // Number of dots
  dotMinRadius: 1, // Minimum dot radius
  dotMaxRadius: 2, // Maximum dot radius
  dotMaxSpeed: 1, // Maximum dot speed
  mouseRepellRadius: 100, // Mouse repel radius in pixels
  mouseRepellForce: .05, // Mouse repel force
  minTransparency: 0.7, // Minimum transparency for flickering effect
  maxTransparency: 1, // Maximum transparency for flickering effect
  transparencyChange: 0.05, // Amount of change in transparency for flickering effect
  dampingFactor: 0.99, // Damping factor for slowing down the dots
  dotInterval: 5000, // Interval for creating new dots in ms
};

let dots = [];
let mouse = { x: 0, y: 0, moved: false };

// Get all the elements on the page
const elements = document.body.getElementsByTagName('*');

function addDot() {
  if (dots.length < config.numDots) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0, // Set initial x velocity to 0
      vy: 0, // Set initial y velocity to 0
      radius: Math.random() * (config.dotMaxRadius - config.dotMinRadius) + config.dotMinRadius,
      transparency: 0 // Add transparency property
    });
  }
}

// Create an array to store the bounding rectangles of all visible elements
let rects = Array.from(elements, el => {
  // Check if the element is visible and contains text
  if (el.offsetWidth !== 0 && el.offsetHeight !== 0 && el.innerText.trim() !== '') {
    return el.getBoundingClientRect();
  }
}).filter(Boolean); // filter out undefined values

window.onload = () => {
  canvas.width = document.body.scrollWidth; // Set canvas width to the entire document's width
  canvas.height = document.body.scrollHeight; // Set canvas height to the entire document's height

  if (config.enableDotsAnimation) {
    // Add the first dot immediately
    addDot();

    // Schedule a new dot to be added every second
    setInterval(addDot, config.dotInterval);
  }

  // Add event listener for window resize
  window.addEventListener('resize', () => {
    canvas.width = document.body.scrollWidth; // Update canvas width to the entire document's width
    canvas.height = document.body.scrollHeight; // Update canvas height to the entire document's height
  });

  animate();
};

window.onmousemove = (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.moved = true; // Set the moved flag to true
};

function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mouseRepellRadiusSq = config.mouseRepellRadius * config.mouseRepellRadius;

  dots = dots.filter(dot => { // Filter out dots that are not visible
    if (mouse.moved) {
      const dx = dot.x - mouse.x;
      const dy = dot.y - mouse.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < mouseRepellRadiusSq) {
        const dist = Math.sqrt(distSq);
        const repellForce = config.mouseRepellForce * (1 - dist / config.mouseRepellRadius);

        dot.vx += dx / dist * repellForce;
        dot.vy += dy / dist * repellForce;

        const speedSq = dot.vx * dot.vx + dot.vy * dot.vy;
        if (speedSq > config.dotMaxSpeed * config.dotMaxSpeed) {
          const speed = Math.sqrt(speedSq);
          dot.vx = (dot.vx / speed) * config.dotMaxSpeed;
          dot.vy = (dot.vy / speed) * config.dotMaxSpeed;
        }
      }
    }

    // Apply damping to slow down the dots
    dot.vx *= config.dampingFactor;
    dot.vy *= config.dampingFactor;

    dot.x += dot.vx;
    dot.y += dot.vy;
    if (dot.x < 0) dot.x = canvas.width;
    if (dot.x > canvas.width) dot.x = 0;
    if (dot.y < 0) dot.y = canvas.height;
    if (dot.y > canvas.height) dot.y = 0;

    let inRect = rects.some(rect =>
      dot.x > rect.left && dot.x < rect.right && dot.y > rect.top && dot.y < rect.bottom
    );

    if (!inRect) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = `rgba(255, 255, 255, ${dot.transparency})`; // Use dot's transparency
      ctx.fill();
    }

    // Update transparency for fade-in effect
    if (dot.transparency < config.minTransparency) {
      dot.transparency += 0.01;
    }
    else {
      // Update transparency for flickering effect
      dot.transparency += Math.random() * 2 * config.transparencyChange - config.transparencyChange; // Random value between -transparencyChange and transparencyChange
      dot.transparency = Math.min(Math.max(dot.transparency, config.minTransparency), config.maxTransparency); // Clamp between minTransparency and maxTransparency
    }

    // Return true if dot is not in a rectangle and within the canvas area, false otherwise
    return !inRect && dot.x >= 0 && dot.x <= canvas.width && dot.y >= 0 && dot.y <= canvas.height;
  });

  mouse.moved = false; // Reset the moved flag
}