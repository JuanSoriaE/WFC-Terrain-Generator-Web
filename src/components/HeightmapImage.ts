import { RGB } from "../types/types.main";

export default class HeightmapImage {
  _mat: Array<Array<string>>;
  N: number;
  M: number;
  _colors: Map<string, RGB>;
  _id: string;
  _title: string;
  _description: string;
  _src: string;
  _smooth: boolean;

  auto_states_color: HTMLInputElement = document.getElementById("auto-states-colors") as HTMLInputElement;

  OFFS: Array<Array<number>> = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [0, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  constructor(
    id: string,
    title: string, 
    description: string, 
    src: string, 
    colors: Map<string, RGB>,
    smooth: boolean) {
    this._mat = new Array<Array<string>>();
    this.N = 0;
    this.M = 0;

    this._id = id;
    this._title = title;
    this._description = description;
    this._src = src;
    this._smooth = smooth;

    this._colors = colors;
  }

  getSrc(): string {
    return this._src;
  }

  getTitle(): string {
    return this._title;
  }

  getDescripcion(): string {
    return this._description;
  }
  
  set setMat(mat: Array<Array<string>>) {
    this._mat = mat;
    this.N = this._mat.length;
    this.M = this._mat[0].length;
  }

  set setColors(colors: Map<string, RGB>) {
    this._colors = colors;
  }

  createImage(w: number, h: number): void {
    const ALPHA: number = 255;
    const buffer_len: number = w * h * 4;
    const buffer: Uint8ClampedArray = new Uint8ClampedArray(buffer_len);
    const scale_ratio: number = h / this.N;
    
    for (let row: number = 0; row < this.N; row++) {
      for (let col: number = 0; col < this.M; col++) {
        const buffer_pos: number = scale_ratio * (row * w + col) * 4;

        const color: RGB = this._smooth
          ? this.getAvgColor(row, col)
          : this._colors.get(this._mat[row][col]) as RGB;
        
        for (let y: number = 0; y < scale_ratio; y++) {
          for (let x: number = 0; x < scale_ratio; x++) {
            const offset: number = (y * w + x) * 4;
            
            buffer[buffer_pos + offset] = color.r;
            buffer[buffer_pos + offset + 1] = color.g;
            buffer[buffer_pos + offset + 2] = color.b;
            buffer[buffer_pos + offset + 3] = ALPHA;
          }
        }
      }
    }

    const cnv: HTMLCanvasElement = document.createElement("canvas");
      cnv.width = w;
      cnv.height = h;
    
    const ctx: CanvasRenderingContext2D | null = cnv.getContext("2d");

    const img_data: ImageData = ctx?.createImageData(w, h) as ImageData;
    img_data?.data.set(buffer);
    ctx?.putImageData(img_data, 0, 0);

    this._src = cnv.toDataURL();
  }

  getAvgColor(row: number, col: number) {
    let r: number = 0, g: number = 0, b: number = 0;
    let valids: number = 0;

    for (const off of this.OFFS) {
      const new_row: number = row + off[0], new_col: number = col + off[1];

      if (Math.min(new_row, new_col) < 0 || new_row >= this.N || new_col >= this.M) continue;

      const color: RGB = this._colors.get(this._mat[new_row][new_col]) as RGB;
      r += color.r;
      g += color.g;
      b += color.b;

      valids++;
    }

    return {
      r: r / valids,
      g: g / valids,
      b: b / valids
    };
  }

  saveImage(filename: string): void {
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = this._src;
    link.download = `${filename}-${this._id}.jpg`;

    const click_event: MouseEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(click_event);
  }
}