import * as THREE from 'three';

export class InteractionHandler {
  constructor(galaxyScene, onPlanetSelect, onHover) {
    this.scene = galaxyScene.scene;
    this.camera = galaxyScene.camera;
    this.renderer = galaxyScene.renderer;
    this.controls = galaxyScene.controls;
    this.planetMeshes = galaxyScene.planetMeshes;
    this.hyperlaneLines = galaxyScene.hyperlaneLines;

    this.onPlanetSelect = onPlanetSelect;
    this.onHover = onHover;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line.threshold = 4.0; // Increased threshold for easy hyperlane hover detection

    this.mouse = new THREE.Vector2();
    this.hoveredPlanet = null;
    this.hoveredLane = null;
    this.selectedPlanet = null;

    this.isAnimatingCamera = false;
    this.targetCameraPos = null;
    this.targetControlsTarget = null;

    this.initEvents();
  }

  initEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointermove', (e) => this.onPointerMove(e));
    dom.addEventListener('click', (e) => this.onClick(e));
  }

  onPointerMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Raycast Planets first
    const planetIntersects = this.raycaster.intersectObjects(this.planetMeshes);

    if (planetIntersects.length > 0) {
      const mesh = planetIntersects[0].object;
      if (this.hoveredPlanet !== mesh) {
        if (this.hoveredPlanet) this.resetPlanetScale(this.hoveredPlanet);
        if (this.hoveredLane) this.resetHyperlaneHighlight(this.hoveredLane);

        this.hoveredPlanet = mesh;
        this.hoveredLane = null;
        this.highlightPlanet(mesh);
        document.body.style.cursor = 'pointer';

        if (this.onHover) this.onHover(mesh.userData, e);
      }
      return;
    }

    // 2. Raycast Hyperlanes if no planet is hit
    const visibleLanes = this.hyperlaneLines.filter(l => l.visible);
    const laneIntersects = this.raycaster.intersectObjects(visibleLanes);

    if (laneIntersects.length > 0) {
      const laneLine = laneIntersects[0].object;
      if (this.hoveredLane !== laneLine) {
        if (this.hoveredPlanet) this.resetPlanetScale(this.hoveredPlanet);
        if (this.hoveredLane) this.resetHyperlaneHighlight(this.hoveredLane);

        this.hoveredPlanet = null;
        this.hoveredLane = laneLine;
        this.highlightHyperlane(laneLine);
        document.body.style.cursor = 'pointer';

        const laneData = { ...laneLine.userData, isHyperlane: true };
        if (this.onHover) this.onHover(laneData, e);
      }
      return;
    }

    // 3. Clear hover states if neither planet nor hyperlane hit
    if (this.hoveredPlanet || this.hoveredLane) {
      if (this.hoveredPlanet) this.resetPlanetScale(this.hoveredPlanet);
      if (this.hoveredLane) this.resetHyperlaneHighlight(this.hoveredLane);

      this.hoveredPlanet = null;
      this.hoveredLane = null;
      document.body.style.cursor = 'default';

      if (this.onHover) this.onHover(null, e);
    }
  }

  onClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planetMeshes);

    if (intersects.length > 0) {
      const planetMesh = intersects[0].object;
      this.selectPlanet(planetMesh);
    }
  }

  highlightPlanet(mesh) {
    mesh.scale.set(1.4, 1.4, 1.4);
  }

  resetPlanetScale(mesh) {
    mesh.scale.set(1.0, 1.0, 1.0);
  }

  highlightHyperlane(line) {
    if (line.material) {
      line.material.opacity = 1.0;
    }
  }

  resetHyperlaneHighlight(line) {
    if (line.material) {
      line.material.opacity = 0.85;
    }
  }

  selectPlanet(planetMesh) {
    this.selectedPlanet = planetMesh;
    const data = planetMesh.userData;

    const planetPos = planetMesh.position.clone();
    const offset = new THREE.Vector3(0, 8, 20);
    const targetCam = planetPos.clone().add(offset);

    this.focusCamera(targetCam, planetPos);

    if (this.onPlanetSelect) {
      this.onPlanetSelect(data);
    }
  }

  focusCamera(targetPos, targetControlsPos) {
    this.targetCameraPos = targetPos;
    this.targetControlsTarget = targetControlsPos;
    this.isAnimatingCamera = true;
  }

  resetCamera() {
    this.focusCamera(new THREE.Vector3(0, 180, 240), new THREE.Vector3(0, 0, 0));
  }

  update() {
    if (this.isAnimatingCamera && this.targetCameraPos && this.targetControlsTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.08);
      this.controls.target.lerp(this.targetControlsTarget, 0.08);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.5) {
        this.isAnimatingCamera = false;
      }
    }
  }
}
