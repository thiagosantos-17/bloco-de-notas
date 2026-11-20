import fs from 'fs';
import { createCanvas } from 'canvas';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function drawIcon(ctx, size) {
  const radius = size * 0.16;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0ea5e9');
  gradient.addColorStop(1, '#0369a1');

  // Background
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fill();

  // Lines
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';

  const padding = size * 0.25;
  const lineWidth = size * 0.5;
  const lineHeight = size * 0.08;
  const gap = size * 0.08;

  // Line 1 (full)
  ctx.beginPath();
  ctx.moveTo(padding, padding + lineHeight * 0.5);
  ctx.lineTo(padding + lineWidth, padding + lineHeight * 0.5);
  ctx.stroke();

  // Line 2 (full)
  ctx.beginPath();
  ctx.moveTo(padding, padding + lineHeight * 1.5 + gap);
  ctx.lineTo(padding + lineWidth, padding + lineHeight * 1.5 + gap);
  ctx.stroke();

  // Line 3 (70%)
  ctx.beginPath();
  ctx.moveTo(padding, padding + lineHeight * 2.5 + gap * 2);
  ctx.lineTo(padding + lineWidth * 0.7, padding + lineHeight * 2.5 + gap * 2);
  ctx.stroke();

  // Line 4 (40%)
  ctx.beginPath();
  ctx.moveTo(padding, padding + lineHeight * 3.5 + gap * 3);
  ctx.lineTo(padding + lineWidth * 0.4, padding + lineHeight * 3.5 + gap * 3);
  ctx.stroke();

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = size * 0.03;
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.stroke();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawIcon(ctx, size);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icon-${size}.png`, buffer);
  console.log(`Generated icon-${size}.png`);
}

console.log('All icons generated!');
