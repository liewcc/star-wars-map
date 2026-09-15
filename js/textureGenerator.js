// Procedural Planet Texture Generator using HTML5 Canvas
// Generates HD textures locally without external image asset dependencies

export function generatePlanetTexture(type, id, customColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Simple pseudo-random helper seeded by planet ID string
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  if (customColor) {
    ctx.fillStyle = customColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(random() * w, random() * h, random() * 40 + 10, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  }

  switch (type) {
    case 'city': // Coruscant style ecumenopolis
      ctx.fillStyle = '#1a1f2c';
      ctx.fillRect(0, 0, w, h);
      // City grid patterns
      for (let i = 0; i < 4000; i++) {
        const x = Math.floor(random() * w);
        const y = Math.floor(random() * h);
        const size = Math.floor(random() * 3) + 1;
        ctx.fillStyle = random() > 0.3 ? '#ffe082' : '#64ffda';
        ctx.fillRect(x, y, size, size);
      }
      // Glowing megalopolis highways
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        const y = random() * h;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (random() - 0.5) * 40);
        ctx.stroke();
      }
      break;

    case 'desert': // Tatooine / Jakku style
      const desertGrad = ctx.createLinearGradient(0, 0, 0, h);
      desertGrad.addColorStop(0, '#d4a373');
      desertGrad.addColorStop(0.5, '#e9c46a');
      desertGrad.addColorStop(1, '#cd853f');
      ctx.fillStyle = desertGrad;
      ctx.fillRect(0, 0, w, h);
      // Dune wave patterns
      ctx.fillStyle = 'rgba(139, 69, 19, 0.15)';
      for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        const y = random() * h;
        ctx.arc(random() * w, y, random() * 40 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'ice': // Hoth style
      const iceGrad = ctx.createLinearGradient(0, 0, 0, h);
      iceGrad.addColorStop(0, '#e0f7fa');
      iceGrad.addColorStop(0.5, '#ffffff');
      iceGrad.addColorStop(1, '#b2ebf2');
      ctx.fillStyle = iceGrad;
      ctx.fillRect(0, 0, w, h);
      // Glacial ridges
      ctx.fillStyle = 'rgba(0, 150, 180, 0.2)';
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.ellipse(random() * w, random() * h, random() * 60 + 20, random() * 10 + 2, random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'gas_giant': // Bespin style pink/violet cloud bands
      const gasGrad = ctx.createLinearGradient(0, 0, 0, h);
      gasGrad.addColorStop(0, '#ff9a9e');
      gasGrad.addColorStop(0.2, '#fecfef');
      gasGrad.addColorStop(0.4, '#a1c4fd');
      gasGrad.addColorStop(0.7, '#c2e9fb');
      gasGrad.addColorStop(1, '#fbc2eb');
      ctx.fillStyle = gasGrad;
      ctx.fillRect(0, 0, w, h);
      // Swirling gas bands
      for (let y = 0; y < h; y += 4) {
        ctx.fillStyle = `rgba(255, 255, 255, ${random() * 0.25})`;
        ctx.fillRect(0, y, w, Math.sin(y * 0.05) * 8 + 4);
      }
      break;

    case 'lava': // Mustafar style obsidian & glowing magma rivers
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#ff3d00';
      ctx.shadowColor = '#ff6d00';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        let x = random() * w;
        let y = random() * h;
        ctx.moveTo(x, y);
        for (let step = 0; step < 8; step++) {
          x += (random() - 0.5) * 60;
          y += (random() - 0.5) * 40;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      break;

    case 'ocean': // Kamino / Mon Cala style blue water and storm swirls
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      oceanGrad.addColorStop(0, '#002147');
      oceanGrad.addColorStop(0.5, '#003366');
      oceanGrad.addColorStop(1, '#001a33');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);
      // White foam storm swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(random() * w, random() * h, random() * 30 + 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'forest': // Kashyyyk / Endor green landmasses
      ctx.fillStyle = '#0a3617';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2e7d32';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(random() * w, random() * h, random() * 50 + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#1b5e20';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(random() * w, random() * h, random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'swamp': // Dagobah murky green & brown bog
      ctx.fillStyle = '#1c2813';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3a4a28';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.ellipse(random() * w, random() * h, random() * 40 + 10, random() * 20 + 5, random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'ringed': // Geonosis red rock
      const geoGrad = ctx.createLinearGradient(0, 0, 0, h);
      geoGrad.addColorStop(0, '#8d2b0e');
      geoGrad.addColorStop(0.5, '#b7410e');
      geoGrad.addColorStop(1, '#5c1d07');
      ctx.fillStyle = geoGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(random() * w, random() * h, random() * 25 + 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'fungal': // Felucia colorful bioluminescent terrain
      ctx.fillStyle = '#2c003e';
      ctx.fillRect(0, 0, w, h);
      const colors = ['#00e5ff', '#ff007f', '#76ff03', '#e040fb'];
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle = colors[Math.floor(random() * colors.length)];
        ctx.beginPath();
        ctx.arc(random() * w, random() * h, random() * 15 + 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'terrestrial': // Earth-like Earth/Naboo oceans & continents
    default:
      ctx.fillStyle = '#0f4c81';
      ctx.fillRect(0, 0, w, h);
      // Continents
      ctx.fillStyle = '#2e7d32';
      for (let i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.arc(random() * w, random() * h, random() * 55 + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.ellipse(random() * w, random() * h, random() * 60 + 20, random() * 10 + 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
  }

  return canvas;
}

// Generate Ring Texture for planets like Geonosis
export function generateRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  for (let x = 0; x < 256; x++) {
    const alpha = (Math.sin(x * 0.1) * 0.5 + 0.5) * (x > 50 && x < 240 ? 0.8 : 0);
    ctx.fillStyle = `rgba(183, 65, 14, ${alpha})`;
    ctx.fillRect(x, 0, 1, 1);
  }
  return canvas;
}
