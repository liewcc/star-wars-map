import { GalaxyScene } from './galaxyScene.js?v=3.0.0';
import { InteractionHandler } from './interaction.js?v=3.0.0';

class StarWarsGalaxyApp {
  constructor() {
    this.galaxyScene = null;
    this.interaction = null;
    this.planetsData = [];
    this.hyperlanesData = [];
    this.currentRegion = 'ALL';
    this.hyperlanesVisible = true;
    this.audioContext = null;
    this.isAudioPlaying = false;

    this.init();
  }

  async init() {
    this.galaxyScene = new GalaxyScene('canvas-container');

    // Handle hover and click callbacks
    this.interaction = new InteractionHandler(
      this.galaxyScene,
      (selectedPlanetData) => this.showPlanetSidebar(selectedPlanetData),
      (hoveredPlanetData, mouseEvent) => this.updateTooltip(hoveredPlanetData, mouseEvent)
    );

    await this.loadData();
    this.setupUIEvents();

    // Start render loop
    this.animate();
  }

  async loadData() {
    try {
      const [planetsRes, hyperlanesRes] = await Promise.all([
        fetch('./data/planets.json'),
        fetch('./data/hyperlanes.json')
      ]);

      this.planetsData = await planetsRes.json();
      this.hyperlanesData = await hyperlanesRes.json();

      this.galaxyScene.loadPlanets(this.planetsData);
      this.galaxyScene.loadHyperlanes(this.hyperlanesData);

      this.updatePlanetCount(this.planetsData.length);
    } catch (err) {
      console.error('Failed to load galactic database:', err);
    }
  }

  setupUIEvents() {
    // 1. Search Bar
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        this.filterPlanets(query, this.currentRegion);
      });
    }

    // 2. Region Filters
    const regionChips = document.querySelectorAll('.chip-filter');
    regionChips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        regionChips.forEach((c) => c.classList.remove('active'));
        e.target.classList.add('active');
        this.currentRegion = e.target.dataset.region;

        const query = document.getElementById('search-input')?.value.trim().toLowerCase() || '';
        this.filterPlanets(query, this.currentRegion);
      });
    });

    // 3. Reset View Button
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.interaction.resetCamera();
        this.hidePlanetSidebar();
      });
    }

    // 4. Hyperlane Toggle
    const btnHyperlane = document.getElementById('btn-hyperlanes');
    if (btnHyperlane) {
      btnHyperlane.addEventListener('click', () => {
        this.hyperlanesVisible = !this.hyperlanesVisible;
        btnHyperlane.classList.toggle('active', this.hyperlanesVisible);
        this.galaxyScene.hyperlaneLines.forEach((line) => {
          line.visible = this.hyperlanesVisible;
        });
      });
    }

    // 5. Close Sidebar Button
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    if (btnCloseSidebar) {
      btnCloseSidebar.addEventListener('click', () => this.hidePlanetSidebar());
    }

    // 6. Ambient Sci-Fi Audio Toggle
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => this.toggleSciFiAudio(btnAudio));
    }
  }

  filterPlanets(searchQuery, regionFilter) {
    this.galaxyScene.planetMeshes.forEach((mesh) => {
      const data = mesh.userData;
      const matchesSearch = data.name.toLowerCase().includes(searchQuery);
      const matchesRegion = regionFilter === 'ALL' || data.region.toUpperCase().replace(/\s+/g, '_') === regionFilter;

      if (matchesSearch && matchesRegion) {
        mesh.visible = true;
      } else {
        mesh.visible = false;
      }
    });
  }

  updateTooltip(planetData, event) {
    const tooltip = document.getElementById('hover-tooltip');
    if (!tooltip) return;

    if (planetData) {
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
      tooltip.querySelector('h3').textContent = planetData.name;
      tooltip.querySelector('p').textContent = `${planetData.region} | Grid ${planetData.grid}`;
    } else {
      tooltip.style.display = 'none';
    }
  }

  showPlanetSidebar(planet) {
    const sidebar = document.getElementById('info-sidebar');
    if (!sidebar) return;

    document.getElementById('planet-name').textContent = planet.name;
    document.getElementById('planet-region').textContent = planet.region;
    document.getElementById('planet-sector').textContent = planet.sector;
    document.getElementById('planet-grid').textContent = planet.grid;
    document.getElementById('planet-climate').textContent = planet.climate;
    document.getElementById('planet-terrain').textContent = planet.terrain;
    document.getElementById('planet-population').textContent = planet.population;
    document.getElementById('planet-description').textContent = planet.description;

    const tagList = document.getElementById('planet-hyperlanes');
    tagList.innerHTML = '';
    planet.hyperlanes.forEach((lane) => {
      const span = document.createElement('span');
      span.className = 'tag-lane';
      span.textContent = lane;
      tagList.appendChild(span);
    });

    sidebar.classList.add('open');
  }

  hidePlanetSidebar() {
    const sidebar = document.getElementById('info-sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  updatePlanetCount(count) {
    const el = document.getElementById('status-planet-count');
    if (el) el.textContent = `${count} STAR SYSTEMS ONLINE`;
  }

  toggleSciFiAudio(btn) {
    if (!this.audioContext) {
      // Create Web Audio API ambient hum synth
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();

      this.osc1 = this.audioContext.createOscillator();
      this.osc2 = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A hum
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(110, this.audioContext.currentTime);

      this.gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);

      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.osc1.start();
      this.osc2.start();
      this.isAudioPlaying = true;
      btn.classList.add('active');
    } else {
      if (this.isAudioPlaying) {
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.isAudioPlaying = false;
        btn.classList.remove('active');
      } else {
        this.gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
        this.isAudioPlaying = true;
        btn.classList.add('active');
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.galaxyScene.animate();
    this.interaction.update();
  }
}

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new StarWarsGalaxyApp();
});
