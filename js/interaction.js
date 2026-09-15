import * as THREE from 'three';

export class InteractionHandler {
  constructor(galaxyScene, onPlanetSelect, onPlanetHover) {
    this.scene = galaxyScene.scene;
    this.camera = galaxyScene.camera;
    this.renderer = galaxyScene.renderer;
    this.controls = galaxyScene.controls;
    this.planetMeshes = galaxyScene.planetMeshes;

    this.onPlanetSelect = onPlanetSelect;
    this.onPlanetHover = onPlanetHover;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredPlanet = null;
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
    const intersects = this.raycaster.intersectObjects(this.planetMeshes);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      if (this.hoveredPlanet !== mesh) {
        if (this.hoveredPlanet) this.resetPlanetScale(this.hoveredPlanet);
        this.hoveredPlanet = mesh;
        this.highlightPlanet(mesh);
        document.body.style.cursor = 'pointer';
        if (this.onPlanetHover) this.onPlanetHover(mesh.userData, e);
      }
    } else {
      if (this.hoveredPlanet) {
        this.resetPlanetScale(this.hoveredPlanet);
        this.hoveredPlanet = null;
        document.body.style.cursor = 'default';
        if (this.onPlanetHover) this.onPlanetHover(null, e);
      }
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

  selectPlanet(planetMesh) {
    this.selectedPlanet = planetMesh;
    const data = planetMesh.userData;

    // Smooth focus animation target
    const planetPos = planetMesh.position.clone();
    
    // Offset camera slightly backwards and upwards
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
