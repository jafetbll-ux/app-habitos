const sharp = require('sharp');

const svg = Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#000000"/>
  <polygon points="300,60 180,280 260,280 210,450 340,220 255,220" fill="white"/>
</svg>`);

sharp(svg).resize(192).png().toFile('public/icon-192.png', () => console.log('✅ icon-192 creado'));
sharp(svg).resize(512).png().toFile('public/icon-512.png', () => console.log('✅ icon-512 creado'));