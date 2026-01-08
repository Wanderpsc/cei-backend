const fs = require('fs');
const path = require('path');

// Criar ícone simples base64 para favicon
const createFavicon = () => {
  // Um ícone 32x32 simples com gradiente e texto CEI
  const canvas = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea"/>
          <stop offset="100%" style="stop-color:#764ba2"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="url(#g)" rx="6"/>
      <text x="16" y="22" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="white">C</text>
    </svg>
  `;
  
  const base64 = Buffer.from(canvas).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

console.log('Favicon data URL:', createFavicon());
