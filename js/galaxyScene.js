import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generatePlanetTexture, generateRingTexture } from './textureGenerator.js?v=1.0.2';

export class GalaxyScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.planetsMap = new Map();
    this.planetMeshes = [];
    this.hyperlaneLines = [];
    
    this.initScene();
    this.initGalaxyBackground();
    this.initGridOverlay();
    this.initRegionRings();
    this.initLighting();
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.0012);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.set(0, 260, 320);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    // Deep Core intense gold point light
    const coreLight = new THREE.PointLight(0xffedd5, 4.0, 500);
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    dirLight.position.set(100, 250, 100);
    this.scene.add(dirLight);
  }

  initGalaxyBackground() {
    // Star Wars Official Map Colors & Particle Distribution
    const particleCount = 55000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCore = new THREE.Color(0xfffbeb); // Deep Core bright white/gold
    const colorInner = new THREE.Color(0xfbbf24); // Core/Colonies amber
    const colorMid = new THREE.Color(0xa855f7); // Mid Rim purple
    const colorOuter = new THREE.Color(0x38bdf8); // Outer Rim blue
    const colorUnknown = new THREE.Color(0x06b6d4); // Unknown Regions cyan

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

      // Determine color based on position (matching DK Official Map)
      const mixedColor = colorCore.clone();
      if (px < -40 && Math.abs(pz) < 140) {
        // Unknown Regions sector (West)
        mixedColor.lerp(colorUnknown, Math.min(1, Math.abs(px) / 180));
      } else if (r < 30) {
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
      size: 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.galaxyPoints = new THREE.Points(geometry, particleMaterial);
    this.scene.add(this.galaxyPoints);

    // Deep space background stars
    const starCount = 8000;
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
      size: 1.0,
      transparent: true,
      opacity: 0.5
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  initGridOverlay() {
    // Official C-1 to U-21 Grid Overlay Lines
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12
    });

    // 19 Columns (C to U: -180 to 180, step 20)
    for (let x = -180; x <= 180; x += 20) {
      const points = [
        new THREE.Vector3(x, -0.5, -200),
        new THREE.Vector3(x, -0.5, 200)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, gridMaterial);
      gridGroup.add(line);
    }

    // 21 Rows (1 to 21: -200 to 200, step 20)
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
    // Official Concentric Region Boundary Rings (Deep Core -> Outer Rim)
    const regions = [
      { radius: 25, color: 0xef4444, label: 'DEEP CORE' },
      { radius: 55, color: 0xf59e0b, label: 'CORE WORLDS' },
      { radius: 85, color: 0x10b981, label: 'INNER RIM' },
      { radius: 125, color: 0x8b5cf6, label: 'MID RIM' },
      { radius: 200, color: 0x38bdf8, label: 'OUTER RIM' }
    ];

    regions.forEach((reg) => {
      const curve = new THREE.EllipseCurve(0, 0, reg.radius, reg.radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(128).map(p => new THREE.Vector3(p.x, -0.2, p.y));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineDashedMaterial({
        color: reg.color,
        transparent: true,
        opacity: 0.35,
        dashSize: 4,
        gapSize: 4
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      this.scene.add(line);
    });
  }

  loadPlanets(planetsData) {
    const sphereGeo = new THREE.SphereGeometry(2.8, 32, 32);

    planetsData.forEach((planet) => {
      const canvasTexture = generatePlanetTexture(planet.type, planet.id);
      const texture = new THREE.CanvasTexture(canvasTexture);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(sphereGeo, material);
      mesh.position.set(planet.coords.x, planet.coords.y, planet.coords.z);
      mesh.userData = planet;

      const glowSprite = this.createAtmosphereGlow(planet.type);
      mesh.add(glowSprite);

      if (planet.type === 'ringed') {
        const ringGeo = new THREE.RingGeometry(4.0, 7.0, 32);
        const ringCanvas = generateRingTexture();
        const ringTex = new THREE.CanvasTexture(ringCanvas);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
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

    let glowColor = 'rgba(56, 189, 248, 0.45)';
    if (type === 'desert') glowColor = 'rgba(234, 179, 8, 0.4)';
    if (type === 'lava') glowColor = 'rgba(239, 68, 68, 0.6)';
    if (type === 'ice') glowColor = 'rgba(224, 242, 254, 0.45)';
    if (type === 'city') glowColor = 'rgba(251, 191, 36, 0.45)';
    if (type === 'forest') glowColor = 'rgba(74, 222, 128, 0.45)';

    const grad = ctx.createRadialGradient(32, 32, 14, 32, 32, 32);
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
    sprite.scale.set(8.5, 8.5, 1.0);
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
          opacity: 0.8,
          linewidth: 3
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

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
