import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generatePlanetTexture, generateRingTexture } from './textureGenerator.js?v=7.0.0';

export class GalaxyScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.planetsMap = new Map();
    this.planetMeshes = [];
    this.hyperlaneLines = [];
    this.mapOverlayMesh = null;
    
    this.initScene();
    this.initGalaxyBackground();
    this.initGridOverlay();
    this.initRegionRings();
    this.initOverlayMap();
    this.initLighting();
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x010308, 0.001);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.set(0, 250, 310);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.0;
    this.controls.maxDistance = 800;
    this.controls.minDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0xffedd5, 3.0, 400);
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    dirLight.position.set(100, 250, 100);
    this.scene.add(dirLight);
  }

  initGalaxyBackground() {
    const particleCount = 40000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCore = new THREE.Color(0xfffbeb);
    const colorInner = new THREE.Color(0xfbbf24);
    const colorMid = new THREE.Color(0xa855f7);
    const colorOuter = new THREE.Color(0x38bdf8);

    const arms = 4;
    const radius = 260;

    for (let i = 0; i < particleCount; i++) {
      const r = Math.pow(Math.random(), 1.8) * radius;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spinAngle = r * 0.015;
      const angle = armAngle + spinAngle;

      const randomX = (Math.random() - 0.5) * (r * 0.25 + 6);
      const randomY = (Math.random() - 0.5) * (Math.exp(-r * 0.008) * 16 + 2);
      const randomZ = (Math.random() - 0.5) * (r * 0.25 + 6);

      const px = Math.cos(angle) * r + randomX;
      const pz = Math.sin(angle) * r + randomZ;

      positions[i * 3] = px;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = pz;

      const mixedColor = colorCore.clone();
      if (r < 30) {
        mixedColor.lerp(colorInner, r / 30);
      } else if (r < 110) {
        mixedColor.lerp(colorMid, (r - 30) / 80);
      } else {
        mixedColor.lerp(colorOuter, (r - 110) / 150);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });

    this.galaxyPoints = new THREE.Points(geometry, particleMaterial);
    this.scene.add(this.galaxyPoints);

    const starCount = 4000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 900 + Math.random() * 200;

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.08
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  initGridOverlay() {
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08
    });

    for (let x = -180; x <= 180; x += 20) {
      const points = [
        new THREE.Vector3(x, -0.5, -200),
        new THREE.Vector3(x, -0.5, 200)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, gridMaterial);
      gridGroup.add(line);
    }

    for (let z = -200; z <= 200; z += 20) {
      const points = [
        new THREE.Vector3(-180, -0.5, z),
        new THREE.Vector3(180, -0.5, z)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, gridMaterial);
      gridGroup.add(line);
    }

    this.scene.add(gridGroup);
  }

  initRegionRings() {
    const regions = [
      { radius: 25, color: 0xef4444 },
      { radius: 55, color: 0xf59e0b },
      { radius: 85, color: 0x10b981 },
      { radius: 125, color: 0x8b5cf6 },
      { radius: 200, color: 0x38bdf8 }
    ];

    regions.forEach((reg) => {
      const curve = new THREE.EllipseCurve(0, 0, reg.radius, reg.radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(128).map(p => new THREE.Vector3(p.x, -0.2, p.y));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineDashedMaterial({
        color: reg.color,
        transparent: true,
        opacity: 0.20,
        dashSize: 4,
        gapSize: 4
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      this.scene.add(line);
    });
  }

  initOverlayMap() {
    const loader = new THREE.TextureLoader();
    loader.load('./data/star_wars_galaxy_map_4000x4000_20251009_3c4d0e08.jpeg', (texture) => {
      const geo = new THREE.PlaneGeometry(400, 400);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      this.mapOverlayMesh = new THREE.Mesh(geo, mat);
      this.mapOverlayMesh.rotation.x = -Math.PI / 2;
      this.mapOverlayMesh.position.set(0, -0.8, 0);
      this.mapOverlayMesh.visible = false; // Hidden by default

      this.scene.add(this.mapOverlayMesh);
    });
  }

  toggleMapOverlay(visible, opacity = 0.65) {
    if (this.mapOverlayMesh) {
      this.mapOverlayMesh.visible = visible;
      this.mapOverlayMesh.material.opacity = opacity;
    }
  }

  parseGridToCoords(gridStr) {
    if (!gridStr || typeof gridStr !== 'string') return { x: 0, y: 0, z: 0 };
    const match = gridStr.trim().toUpperCase().match(/^([A-Z]+)-?(\d+)$/);
    if (!match) return { x: 0, y: 0, z: 0 };

    const colStr = match[1];
    const rowNum = parseInt(match[2], 10);

    const colCode = colStr.charCodeAt(0) - 64; // A=1, C=3, L=12, U=21
    const x = (colCode - 12) * 20;
    const z = (rowNum - 11) * 20;
    const y = (Math.random() - 0.5) * 6;

    return { x, y, z };
  }

  loadPlanets(planetsData) {
    const sphereGeo = new THREE.SphereGeometry(3.2, 32, 32);

    planetsData.forEach((planet) => {
      if (!planet.coords || typeof planet.coords.x !== 'number') {
        planet.coords = this.parseGridToCoords(planet.grid);
      }

      const canvasTexture = generatePlanetTexture(planet.type, planet.id, planet.color);
      const texture = new THREE.CanvasTexture(canvasTexture);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0.2,
        emissive: planet.color ? new THREE.Color(planet.color).multiplyScalar(0.3) : new THREE.Color(0x222222)
      });

      const mesh = new THREE.Mesh(sphereGeo, material);
      mesh.position.set(planet.coords.x, planet.coords.y || 0, planet.coords.z);
      mesh.userData = planet;

      const glowSprite = this.createAtmosphereGlow(planet.type, planet.color);
      mesh.add(glowSprite);

      if (planet.type === 'ringed') {
        const ringGeo = new THREE.RingGeometry(4.5, 8.0, 32);
        const ringCanvas = generateRingTexture();
        const ringTex = new THREE.CanvasTexture(ringCanvas);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        mesh.add(ringMesh);
      }

      this.scene.add(mesh);
      this.planetMeshes.push(mesh);
      this.planetsMap.set(planet.id, mesh);
    });
  }

  createAtmosphereGlow(type, customColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    let glowColor = 'rgba(56, 189, 248, 0.6)';
    if (customColor) {
      glowColor = customColor;
    } else {
      if (type === 'desert') glowColor = 'rgba(234, 179, 8, 0.6)';
      if (type === 'lava') glowColor = 'rgba(239, 68, 68, 0.7)';
      if (type === 'ice') glowColor = 'rgba(224, 242, 254, 0.6)';
      if (type === 'city') glowColor = 'rgba(251, 191, 36, 0.6)';
      if (type === 'forest') glowColor = 'rgba(74, 222, 128, 0.6)';
    }

    const grad = ctx.createRadialGradient(32, 32, 12, 32, 32, 32);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(10.0, 10.0, 1.0);
    return sprite;
  }

  loadHyperlanes(hyperlanesData) {
    hyperlanesData.forEach((lane) => {
      const waypoints = [];
      lane.waypoints.forEach((planetId) => {
        const planet = this.planetsMap.get(planetId);
        if (planet) {
          waypoints.push(planet.position.clone());
        }
      });

      if (waypoints.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5);
        const curvePoints = curve.getPoints(100);

        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(lane.color),
          transparent: true,
          opacity: 0.85,
          linewidth: 3
        });

        const line = new THREE.Line(geometry, material);
        line.userData = lane;
        this.scene.add(line);
        this.hyperlaneLines.push(line);
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
