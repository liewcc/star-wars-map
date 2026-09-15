import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generatePlanetTexture, generateRingTexture } from './textureGenerator.js';

export class GalaxyScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.planetsMap = new Map();
    this.planetMeshes = [];
    this.hyperlaneLines = [];
    
    this.initScene();
    this.initGalaxyBackground();
    this.initLighting();
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0015);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 180, 240);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 600;
    this.controls.minDistance = 5;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Allow slightly below horizon
  }

  initLighting() {
    // Galactic Core ambient glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Deep Core bright point light
    const coreLight = new THREE.PointLight(0xffedd5, 3.5, 400);
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    // Directional rim light
    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    dirLight.position.set(100, 200, 100);
    this.scene.add(dirLight);
  }

  initGalaxyBackground() {
    // 1. Spiral Galaxy Disk Particles
    const particleCount = 45000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorInside = new THREE.Color(0xfff7ed); // Bright core yellow/white
    const colorMiddle = new THREE.Color(0x38bdf8); // Sky blue arms
    const colorOutside = new THREE.Color(0xc084fc); // Purple edge

    const arms = 4;
    const radius = 280;

    for (let i = 0; i < particleCount; i++) {
      const r = Math.pow(Math.random(), 2) * radius;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const spinAngle = r * 0.02;
      const angle = armAngle + spinAngle;

      const randomX = (Math.random() - 0.5) * (r * 0.2 + 5);
      const randomY = (Math.random() - 0.5) * (Math.exp(-r * 0.01) * 20 + 2);
      const randomZ = (Math.random() - 0.5) * (r * 0.2 + 5);

      positions[i * 3] = Math.cos(angle) * r + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle) * r + randomZ;

      // Color interpolation based on distance from core
      const mixedColor = colorInside.clone();
      if (r < radius * 0.4) {
        mixedColor.lerp(colorMiddle, r / (radius * 0.4));
      } else {
        mixedColor.lerp(colorOutside, (r - radius * 0.4) / (radius * 0.6));
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.galaxyPoints = new THREE.Points(geometry, particleMaterial);
    this.scene.add(this.galaxyPoints);

    // 2. Background Starfield Skybox Particles
    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 800 + Math.random() * 200;

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.0,
      transparent: true,
      opacity: 0.6
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  loadPlanets(planetsData) {
    const sphereGeo = new THREE.SphereGeometry(2.5, 32, 32);

    planetsData.forEach((planet) => {
      const canvasTexture = generatePlanetTexture(planet.type, planet.id);
      const texture = new THREE.CanvasTexture(canvasTexture);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(sphereGeo, material);
      mesh.position.set(planet.coords.x, planet.coords.y, planet.coords.z);
      mesh.userData = planet;

      // Glow Atmosphere Sprite
      const glowSprite = this.createAtmosphereGlow(planet.type);
      mesh.add(glowSprite);

      // Special Ring System (e.g. Geonosis)
      if (planet.type === 'ringed') {
        const ringGeo = new THREE.RingGeometry(3.5, 6.0, 32);
        const ringCanvas = generateRingTexture();
        const ringTex = new THREE.CanvasTexture(ringCanvas);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
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

  createAtmosphereGlow(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    let glowColor = 'rgba(56, 189, 248, 0.4)'; // Default cyan
    if (type === 'desert') glowColor = 'rgba(234, 179, 8, 0.3)';
    if (type === 'lava') glowColor = 'rgba(239, 68, 68, 0.5)';
    if (type === 'ice') glowColor = 'rgba(224, 242, 254, 0.4)';
    if (type === 'city') glowColor = 'rgba(251, 191, 36, 0.4)';
    if (type === 'forest') glowColor = 'rgba(74, 222, 128, 0.4)';

    const grad = ctx.createRadialGradient(32, 32, 16, 32, 32, 32);
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
    sprite.scale.set(7.5, 7.5, 1.0);
    return sprite;
  }

  loadHyperlanes(hyperlanesData) {
    hyperlanesData.forEach((lane) => {
      const points = [];
      for (let i = 0; i < lane.waypoints.length - 1; i++) {
        const planetA = this.planetsMap.get(lane.waypoints[i]);
        const planetB = this.planetsMap.get(lane.waypoints[i + 1]);

        if (planetA && planetB) {
          points.push(planetA.position.clone());
          points.push(planetB.position.clone());
        }
      }

      if (points.length > 0) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(lane.color),
          transparent: true,
          opacity: 0.65,
          linewidth: 2
        });

        const lineSegments = new THREE.LineSegments(geometry, material);
        lineSegments.userData = lane;
        this.scene.add(lineSegments);
        this.hyperlaneLines.push(lineSegments);
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

    // Galaxy points & planet meshes remain static by default to avoid visual motion sickness / dizziness

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
