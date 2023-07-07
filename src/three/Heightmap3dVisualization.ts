import * as THREE from 'three';

export default class Heightmap3dVisualization {
  _mid_panel: HTMLDivElement;
  width: number;
  height: number;
  _camera: THREE.PerspectiveCamera;
  _scene: THREE.Scene;
  _renderer: THREE.WebGLRenderer;

  _wireframe_texture: boolean;
  _max_dis_scale: number = 10;
  _displacement_scale: number = 1;
  
  static FOV: number = 65;
  static NEAR: number = 1.0;
  static FAR: number = 1000.0;

  constructor() {
    this._mid_panel = document.getElementById("mid-panel") as HTMLDivElement;
    this.width = this._mid_panel.offsetWidth;
    this.height = this._mid_panel.offsetHeight;

    this._camera = new THREE.PerspectiveCamera(
      Heightmap3dVisualization.FOV,
      this.width / this.height,
      Heightmap3dVisualization.NEAR,
      Heightmap3dVisualization.FAR
    );
      this._camera.position.set(0, 50, 80);
      this._camera.rotation.x = -Math.PI / 5;
    
    this._scene = new THREE.Scene();
      this._scene.background = new THREE.Color(0xccceca);

    this._renderer = new THREE.WebGLRenderer();
      this._renderer.setSize(this.width, this.height);
    
    this._wireframe_texture = false;
    
    this._renderer.domElement.id = "rendering-cnvs";
    this._mid_panel.appendChild(this._renderer.domElement);
  }

  set setWireframeTexture(v: boolean) {
    this._wireframe_texture = v;
  }

  set setMaxDisScale(v: number) {
    this._max_dis_scale = v;
  }

  set setDisplacementScale(v: number) {
    this._displacement_scale = v;
  }

  async createGround(
    hm_url: string, 
    texture_url: string,
    w: number = 100, 
    h: number = 100, 
    w_segments: number = 100, 
    h_segments: number = 100): Promise<void> {
    const ground_geo: THREE.PlaneGeometry = new THREE.PlaneGeometry(
      w, h,
      w_segments, h_segments
    );
    console.log({hm_url, texture_url});
    
    
    const dis_map = await new THREE.TextureLoader()
      .loadAsync(hm_url);

      dis_map.wrapS = dis_map.wrapT = THREE.RepeatWrapping;
      dis_map.repeat.set(1, 1);
    
    let color_map = undefined;
    if (this._wireframe_texture == false)
      color_map = await new THREE.TextureLoader()
        .loadAsync(texture_url);

    const ground_mat: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: this._wireframe_texture ? 0x000000 : undefined,
      wireframe: this._wireframe_texture,
      displacementMap: dis_map,
      displacementScale: this._displacement_scale * this._max_dis_scale,
      lightMap: color_map,
      lightMapIntensity: 0.7,
    });

    const ground_mesh: THREE.Mesh = new THREE.Mesh(ground_geo, ground_mat);

    this._scene.add(ground_mesh);

    ground_mesh.rotation.x = -Math.PI / 2;
    ground_mesh.position.y = -10;
  }

  render(): void {
    const animate = () => {
      requestAnimationFrame(animate);

      this._renderer.render(this._scene, this._camera);
    };

    animate();
  }

  clearScene(): void {
    while (this._scene.children.length > 0) {
      this._scene.remove(this._scene.children[0]);
    }
  }

  reRender(): void {
    let id = window.requestAnimationFrame(function(){});
    while(id--){
      window.cancelAnimationFrame(id);
    }

    this.render();
  }

  rotate(angle: number): void {
    const ratio: number = 1.5;

    this._scene.rotateY(angle * ratio);
  }

  zoom(v: number): void {
    const y_ratio: number = 0.5;
    const ratio: number = 3;

    this._camera.position.z += v * ratio;
    this._camera.position.y += v * y_ratio * ratio;
  }

  resize(): void {
    this._renderer.setSize(this._mid_panel.offsetWidth, this._mid_panel.offsetHeight);

    this._camera.aspect = this._mid_panel.offsetWidth / this._mid_panel.offsetHeight;
      this._camera.updateProjectionMatrix();
  }
}
