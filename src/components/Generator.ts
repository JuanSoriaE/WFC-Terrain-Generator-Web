import { RGBToHex, getAutoColors, getAutoGrayColors, getHTMLColors } from "../helpers/main";
import { ImageSettings, RGB } from "../types/types.main";
import { setColorValues } from "../helpers/ux.main";
import Heightmap3dVisualization from "../three/Heightmap3dVisualization";
import HeightmapImage from "./HeightmapImage";
import WFC from "../WFC/wfc.main";

const IMGS_SETTINGS: Array<ImageSettings> = [
  {
    id: "color-grid",
    title: "Color Heightmap Grid",
    description: "Created using the colors of STATES SETTINGS: ",
    src: "",
    colors: new Map<string, RGB>(),
    smooth: false,
  },
  {
    id: "color-smooth",
    title: "Color Heightmap Smooth",
    description: "Created by averaging the colors of every cell and its adjacents: ",
    src: "",
    colors: new Map<string, RGB>(),
    smooth: true,
  },
  {
    id: "gray-grid",
    title: "Gray Heightmap Grid",
    description: "Created using the gray scale colors: ",
    src: "",
    colors: new Map<string, RGB>(),
    smooth: false,
  },
  {
    id: "gray-smooth",
    title: "Gray Heightmap Smooth",
    description: "Created by averaging the colors of every cell and its adjacents: ",
    src: "",
    colors: new Map<string, RGB>(),
    smooth: true,
  },
];

export default class Generator {
  _states: Array<string>;
  _rows: number;
  _cols: number;
  _ini_cell: Array<number>;
  _ini_state: string;
  
  _mat: Array<Array<string>>;

  _map_visualization: Heightmap3dVisualization;
  _imgs: Map<string, HeightmapImage>;

  // HTML ELEMENTS
  ini_states_inp: HTMLInputElement = document.getElementById("ini-states") as HTMLInputElement;
  auto_ini_states: HTMLInputElement = document.getElementById("auto-ini-states") as HTMLInputElement;
  states_settings_table_body: HTMLDivElement = document.getElementById("settings-table-body") as HTMLDivElement;
  rows_inp: HTMLInputElement = document.getElementById("wfc-rows") as HTMLInputElement;
  cols_inp: HTMLInputElement = document.getElementById("wfc-cols") as HTMLInputElement;
  ini_cell_inp: HTMLInputElement = document.getElementById("ini-cell") as HTMLInputElement;
  ini_state_inp: HTMLInputElement = document.getElementById("ini-state") as HTMLInputElement;
  neighbors_based_inp: HTMLInputElement = document.getElementById("neighbors-based") as HTMLInputElement;
  auto_states_color: HTMLInputElement = document.getElementById("auto-states-colors") as HTMLInputElement;
  color_inps: NodeListOf<HTMLInputElement> = document.querySelectorAll(`input[type="color"]`);
  imgs_table_body: HTMLElement = document.querySelector("#imgs-save-table tbody") as HTMLElement;

  reload_states_button: HTMLButtonElement = document.getElementById("reload-states-button") as HTMLButtonElement;

  generate_button: HTMLButtonElement = document.getElementById("generate-button") as HTMLButtonElement;

  map_texture_select: HTMLSelectElement = document.getElementById("d3-map-texture") as HTMLSelectElement;
  height_scale_inp: HTMLInputElement = document.getElementById("height-scale") as HTMLInputElement;
  height_scale_right_bound: HTMLInputElement = document.getElementById("height-scale-right-bound") as HTMLInputElement;
  
  modal_ele: HTMLDivElement = document.getElementById("img-modal-container") as HTMLDivElement;
  modal_title: HTMLHeadingElement = document.getElementById("img-modal-title") as HTMLHeadingElement;
  modal_desc: HTMLSpanElement = document.getElementById("img-modal-description") as HTMLSpanElement;
  modal_img: HTMLImageElement = document.getElementById("img-modal-img") as HTMLImageElement;
  save_imgs_button: HTMLButtonElement = document.getElementById("save-images-button") as HTMLButtonElement;

  rendering_cnv: HTMLCanvasElement;

  _visualization_hold_click: boolean = false;
  _visualization_click_x: number = 0;
  _visualization_click_y: number = 0;

  constructor() {
    this._states = new Array<string>();
      this._initStates();

    this._imgs = new Map<string, HeightmapImage>();
      this._initImages();
    
    this._map_visualization = new Heightmap3dVisualization();
      this.rendering_cnv = document.getElementById("rendering-cnvs") as HTMLCanvasElement;

    this._rows = 50;
    this._cols = 50;
    this._ini_cell = [0, 0];
    this._ini_state = this._states[0];

    this._mat = new Array<Array<string>>();

    this._initStatesInputs();
    this._initImagesHTMLElements();

    this._initEventListeners();
  }

  async generate() {
    this._rows = this.rows_inp.value !== "" ? Number(this.rows_inp.value) : this._rows;
    this._cols = this.cols_inp.value !== "" ? Number(this.cols_inp.value) : this._cols;
    const adj_list: Map<string, Set<string>> = new Map<string, Set<string>>();
    this._ini_cell = this.ini_cell_inp.value !== "" 
      ? this.ini_cell_inp
        .value
        .split(",")
        .map(cell => Number(cell.trim()))
      : this._ini_cell;

    this._ini_state = this.ini_state_inp.value;
    
    for (const state of this._states) {
      const state_adj_list: Array<string> = 
      
        (document.getElementById(`state-${state}-adj`) as HTMLInputElement)
        .value
        
        .split(",")
        .map(adj_state => adj_state.trim());
      
      adj_list.set(state, new Set(state_adj_list));
    }
    
    const res: Array<Array<Set<string>>> = await WFC(
      this._states,
      this._rows,
      this._cols,
      adj_list,
      this._ini_cell,
      this._ini_state,
    );

    console.log({states: this._states, ini_state: this._ini_state, res});
    

    this._mat = new Array<Array<string>>(this._rows);
    
    for (let r: number = 0; r < this._rows; r++) {
      this._mat[r] = new Array<string>(this._cols);
      for (let c: number = 0; c < this._cols; c++) {
        this._mat[r][c] = Array.from(res[r][c])[0];
      }
    }

    
    this._imgs.forEach((img, img_id) => {
      img.setMat = this._mat;
      if (!img_id.includes("gray")) {
        const colors_arr: Array<RGB> = getHTMLColors(
          document.querySelectorAll(`input[type="color"]`)
        );

        const colors: Map<string, RGB> = new Map<string, RGB>();
        for (let i: number = 0; i < this._states.length; i++)
          colors.set(this._states[i], colors_arr[i]);
        
        img.setColors = colors;
      }
      img.createImage(this._cols, this._rows);
    });

    this._map_visualization.clearScene();
    this._map_visualization.setWireframeTexture = this.map_texture_select.value === "wireframe";
    
    await this._map_visualization.createGround(
      (this._imgs.get("gray-smooth") as HeightmapImage).getSrc(),
      (this._imgs.get(this.map_texture_select.value) as HeightmapImage)?.getSrc() || "",
    );
    this._map_visualization.reRender();
  }

  reloadStates(): void {
    this._initStates();
    this.updateImagesColors();
    this._initStatesInputs();
  }

  updateImagesColors(): void {
    this._imgs.forEach((img, key) => {
      let colors_arr: Array<RGB> = new Array<RGB>(this._states.length);

      if (key.includes("gray")) colors_arr = getAutoGrayColors(this._states.length);
      else if (this.auto_states_color.checked) 
        colors_arr = getAutoColors(this._states.length, this.color_inps);
      else colors_arr.fill({r: 0, g: 0, b: 0});
      const colors: Map<string, RGB> = new Map<string, RGB>();
      
      for (let i: number = 0; i < this._states.length; i++) {
        colors.set(this._states[i], colors_arr[i]);
      }

      img.setColors = colors;
    });
  }

  _initStates(): void {
    this._states = new Array<string>();

    for (
      let i: number = 1;
      this.auto_ini_states.checked && i <= Number(this.ini_states_inp.value);
      i++
    ) {
      this._states.push(i.toString());
    }

    
    if (!this.auto_ini_states.checked) {
      this._states = this.ini_states_inp.value.split(",").map(state => state.trim());
    }
  }

  _initStatesInputs(): void {
    this.states_settings_table_body.innerHTML = "";
    

    for (let i: number = 0; i < this._states.length; i++) {
      const state: string = this._states[i];
      const adj_vals_arr: Array<string> = [];
      
      for (let j: number = -1; j < 2; j++) {
        if (i + j >= 0 && i + j < this._states.length) adj_vals_arr.push(this._states[i + j]);
      }

      const color_val: string = RGBToHex(this._imgs.get("color-grid")?._colors.get(state) as RGB);
      const new_ele_str: string = `
        <div class="table-row">
          <div class="table-cell state">${state}</div>
          <div class="table-cell adj inp table-cell-state-${state}-adj">
            <input type="text" id="state-${state}-adj" value="${adj_vals_arr.join()}">
          </div>
          <div class="table-cell color inp table-cell-state-${state}-color table-cell-state-${state}-color-hex">
            <input type="text" id="state-${state}-color-hex">
            <div class="cell-color-div">
              <div class="color-inp-container">
                <input type="color" id="state-${state}-color" value="${color_val}">
              </div>
            </div>
          </div>
        </div>
      `;
      

      const temp_ele: HTMLDivElement = document.createElement("div");
      temp_ele.innerHTML = new_ele_str;

      const new_ele: HTMLDivElement = temp_ele.querySelector(".table-row") as HTMLDivElement;
      const color_ele: HTMLInputElement = new_ele.querySelector(`#state-${state}-color`) as HTMLInputElement;
      const hex_ele: HTMLInputElement = new_ele.querySelector(`#state-${state}-color-hex`) as HTMLInputElement;

      color_ele.addEventListener("change", setColorValues);
      hex_ele.addEventListener("change", setColorValues);
      hex_ele.value = color_ele.value.slice(1);
      
      this.states_settings_table_body.appendChild(new_ele);
      
      const adj_inp: HTMLInputElement = new_ele.querySelector(`#state-${state}-adj`) as HTMLInputElement;
      const color_inp: HTMLInputElement = new_ele.querySelector(`#state-${state}-color`) as HTMLInputElement;
      const color_inp_hex: HTMLInputElement = new_ele.querySelector(`#state-${state}-color-hex`) as HTMLInputElement;

      [adj_inp, color_inp, color_inp_hex].forEach(ele => {
        ele.addEventListener("focus", this.handleInputFocusTable);
        ele.addEventListener("keydown", e => this.handleMoveDown(e, i, this._states));
      });

      [adj_inp, color_inp, color_inp_hex].forEach(ele => {
        ele.addEventListener("focusout", this.handleInputFocusoutTable);
      });
    }
  }

  _initImages(): void {
    for (const img_settings of IMGS_SETTINGS) {
      let colors_arr: Array<RGB> = new Array<RGB>();

      if (img_settings.id.includes("gray")) colors_arr = getAutoGrayColors(this._states.length);
      else if (this.auto_states_color.checked) 
        colors_arr = getAutoColors(this._states.length, this.color_inps);
      else colors_arr = getHTMLColors(this.color_inps);

      const colors: Map<string, RGB> = new Map<string, RGB>();
      
      for (let i: number = 0; i < this._states.length; i++) {
        colors.set(this._states[i], colors_arr[i]);
      }

      const img: HeightmapImage = new HeightmapImage(
        img_settings.id,
        img_settings.title,
        img_settings.description,
        img_settings.src,
        colors,
        img_settings.smooth,
      );

      this._imgs.set(img_settings.id, img);
    }
  }

  _initImagesHTMLElements(): void {
    this.imgs_table_body.innerHTML = "";

    for (const img_settings of IMGS_SETTINGS) {
      const row_content_str: string = `
      <th>${img_settings.title}</th>
      <th class="view-img-cell" data-img-id="${img_settings.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        </svg>
      </th>
      <th>
        <input type="checkbox" id="${img_settings.id}-img-check">
      </th>
      `;

      const row_ele: HTMLDivElement = document.createElement("tr");
      row_ele.innerHTML = row_content_str;

      const view_button_cell: HTMLElement = row_ele.querySelector("th.view-img-cell") as HTMLElement;
        view_button_cell.addEventListener("click", e => this.handleViewImageClick(e, img_settings.id));
      
      this.imgs_table_body.appendChild(row_ele);
    }
  }

  handleInputFocusTable(e: Event) {
    const ele: HTMLInputElement = e.target as HTMLInputElement;
    const parent_table_cell: HTMLDivElement = document.getElementsByClassName(`table-cell-${ele.id}`)[0] as HTMLDivElement;
  
    parent_table_cell.style.boxShadow = "0 0 0 4px rgba(95, 122, 219, 0.3)";
  }
  
  handleInputFocusoutTable(e: Event) {
    const ele: HTMLInputElement = e.target as HTMLInputElement;
    const parent_table_cell: HTMLDivElement = document.getElementsByClassName(`table-cell-${ele.id}`)[0] as HTMLDivElement;
  
    parent_table_cell.style.boxShadow = "";
  }
  
  handleMoveDown(e: KeyboardEvent, i: number, states: Array<string>) {
    if ((e.code !== "ArrowUp" && e.code !== "ArrowDown") 
      || (i === states.length - 1  && e.code === "ArrowDown") 
      || (i === 0 && e.code === "ArrowUp")) return;
    e.preventDefault();
  
    const add_up: number = e.code === "ArrowUp" ? -1 : 1;
    const second_idx: number = (e.target as HTMLInputElement).id.indexOf("-", 6);
    const inp_type: string = (e.target as HTMLIFrameElement).id.substring(second_idx + 1);
    
    (document.getElementById(`state-${states[i + add_up]}-${inp_type}`))?.focus();
  }

  handleViewImageClick(e: Event, img_id: string) {
    const img: HeightmapImage = this._imgs.get(img_id) as HeightmapImage;
    this.modal_title.textContent = img.getTitle();
    this.modal_desc.textContent = img.getDescripcion();
    this.modal_img.src = img.getSrc();

    this.modal_ele.style.display = "flex";
  }

  handleCloseModal(e: Event) {
    this.modal_ele.style.display = "none";
  }

  async handleChangeMapTexture(e: Event) {
    this._map_visualization.clearScene();
    this._map_visualization.setWireframeTexture =
      this.map_texture_select.value === "wireframe";
    
    await this._map_visualization.createGround(
      (this._imgs.get("gray-smooth") as HeightmapImage).getSrc(),
      (this._imgs.get(this.map_texture_select.value) as HeightmapImage)?.getSrc() || "",
    );
    this._map_visualization.reRender();
  }

  async handleHeightScaleChange(e: Event) {
    if (e.type === "keypress" && (e as KeyboardEvent).code !== "Enter") return;

    if (this.height_scale_right_bound.value !== "") 
      this._map_visualization.setMaxDisScale= Number(this.height_scale_right_bound.value);

    this._map_visualization._displacement_scale = Number(this.height_scale_inp.value);

    this._map_visualization.updateScale();
  }

  storeClickPos(e: MouseEvent) {
    this._visualization_hold_click = true;
    this._visualization_click_x = e.clientX;
    this._visualization_click_y = e.clientY;
  }

  handleMouseMove(e: MouseEvent) {
    if (!this._visualization_hold_click) return;

    const delta_x: number = e.clientX - this._visualization_click_x;
    const delta_y: number = e.clientY - this._visualization_click_y;
    this._visualization_click_x = e.clientX;
    this._visualization_click_y = e.clientY;
    
    if (e.which === 1) {
      // Rotate PI/2 (90 deg) every 500px
      this._map_visualization.rotate((Math.PI / 2) * (delta_x / 500));
  
      // Move around vertically PI/2 (90 deg) every 500px
      this._map_visualization.moveAroundVertical((Math.PI / 2) * (delta_y / 500));
    } else {
      this._map_visualization.zoom(delta_y / 2);
    }
  }

  handleMouseUp(e: MouseEvent) {
    this._visualization_hold_click = false;
  }

  saveImages(e: MouseEvent): void {
    const filename: string = (document.getElementById("imgs-name") as HTMLInputElement).value;
    if (!filename) {
      alert("Provide a filename...");
      (document.getElementById("imgs-name") as HTMLInputElement).focus();
      return;
    }

    this._imgs.forEach((img, key) => {
      const checkbox: HTMLInputElement = document.getElementById(`${key}-img-check`) as HTMLInputElement;
      if (!checkbox.checked) return;

      img.saveImage(filename);
    });
  }

  _initEventListeners() {
    this.generate_button.addEventListener("click", e => this.generate());
    this.reload_states_button.addEventListener("click", e => this.reloadStates());

    document.getElementById("img-modal-close-btn-container")?.addEventListener("click", e => this.handleCloseModal(e));
    document.getElementById("img-modal-cancel-btn")?.addEventListener("click", e => this.handleCloseModal(e));
    
    this.map_texture_select.addEventListener("change", e => this.handleChangeMapTexture(e));
    this.height_scale_inp.addEventListener("input", e => this.handleHeightScaleChange(e));
    this.height_scale_right_bound.addEventListener("keypress", e => this.handleHeightScaleChange(e));

    this.rendering_cnv.addEventListener("mousedown", e => this.storeClickPos(e));
    this.rendering_cnv.addEventListener("mousemove", e => this.handleMouseMove(e));
    this.rendering_cnv.addEventListener("mouseup", e => this.handleMouseUp(e));

    this.rendering_cnv.addEventListener("contextmenu", e => e.preventDefault());

    this.save_imgs_button.addEventListener("click", e => this.saveImages(e));
  }
}