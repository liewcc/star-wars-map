# 🌌 Star Wars 3D Galaxy Map

An interactive 3D WebGL Star Wars Galaxy Map built with **Three.js**, procedural canvas textures, and a custom interstellar database.

![Star Wars 3D Galaxy Map](https://img.shields.io/badge/Three.js-r160-blue?style=for-the-badge&logo=three.js)
![Deployment](https://img.shields.io/badge/GitHub%20Pages-Deploy-success?style=for-the-badge&logo=github)

---

## ✨ Features

- **3D Particle Galaxy Disk**: ~45,000 colored particles forming a 4-arm spiral galaxy with a bright Deep Core and surrounding deep space starfield.
- **Interstellar Planetary Database**: Includes 33+ canonical Star Wars planets (Coruscant, Tatooine, Naboo, Alderaan, Hoth, Endor, Dagobah, Mustafar, Kamino, Bespin, Exegol, etc.) mapped according to the official Star Wars Galactic Grid (A-1 to S-21).
- **Procedural Canvas Planet Textures**: Planet surface maps (ice caps, desert dunes, ecumenopolis city lights, gas giant swirls, volcanic magma rivers) are generated procedurally on HTML5 Canvas—requiring zero external image assets or cross-origin network requests.
- **Hyperlane Visualization**: Glowing 3D trade routes tracing galactic super-highways (Perlemian Trade Route, Corellian Run, Hydian Way, Rimma Route, Sith Wayfinder Path).
- **Interactive Sci-Fi HUD**:
  - **OrbitControls**: Mouse drag to rotate, pan, and scroll wheel to zoom.
  - **Raycaster Hover & Click**: Hover for planet tooltips; click for smooth camera focus and detailed sidebar card with planet lore, population, climate, and connected hyperlanes.
  - **Search & Region Filters**: Search systems by name or filter by Deep Core, Core Worlds, Inner Rim, Mid Rim, Outer Rim, and Unknown Regions.
  - **Ambient Audio Synthesizer**: Web Audio API ambient hum synth inspired by Star Wars starship acoustics.

---

## 🛠️ Project Structure

```
d:/AI/Star Wars Map/
├── index.html              # Main HTML entry point & ES import map
├── css/
│   └── style.css           # Sci-Fi glassmorphism UI styling
├── js/
│   ├── app.js              # Application entry, UI binding & audio synth
│   ├── galaxyScene.js      # Three.js 3D scene, galaxy particles & lighting
│   ├── interaction.js      # Raycaster pointer detection & smooth camera focus
│   └── textureGenerator.js # Procedural HD planet surface texture generator
├── data/
│   ├── planets.json        # 33+ Star Wars planet coordinates, regions & lore
│   └── hyperlanes.json      # Hyperlane route waypoints & colors
└── .github/
    └── workflows/
        └── deploy.yml      # Automatic GitHub Pages CI/CD workflow
```

---

## 🚀 Local Development & Preview

Because this project uses standard browser ES Modules and Three.js import maps, no Node/NPM build step is required!

### Option 1: Live Server (VS Code Extension)
Right click `index.html` in VS Code -> **Open with Live Server**.

### Option 2: Python HTTP Server
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

---

## 🌐 Deploy to GitHub Pages (Zero Cost)

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of Star Wars 3D Galaxy Map"
   ```

2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<your-username>/star-wars-map.git
   git branch -M main
   git push -u origin main
   ```

3. In your GitHub repository settings:
   - Go to **Settings** -> **Pages**.
   - Set **Source** to **GitHub Actions**.
   - Your site will automatically build and publish to:
     `https://<your-username>.github.io/star-wars-map/`
