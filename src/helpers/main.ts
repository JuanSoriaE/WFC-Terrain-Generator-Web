import { RGB } from "../types/types.main";

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function hexToRGB(hex: string) {
  hex = hex.slice(1);
  const rgb: RGB = {r: 0, g: 0, b: 0};

  rgb.r = parseInt(hex.substring(0, 2), 16);
  rgb.g = parseInt(hex.substring(2, 4), 16);
  rgb.b = parseInt(hex.substring(4, 6), 16);

  return rgb;
}

function RGBToHex(rgb: RGB) {
  let r_hex: string = rgb.r.toString(16);
  let g_hex: string = rgb.g.toString(16);
  let b_hex: string = rgb.b.toString(16);

  r_hex = r_hex.length == 1 ? "0" + r_hex : r_hex;
  g_hex = g_hex.length == 1 ? "0" + g_hex : g_hex;
  b_hex = b_hex.length == 1 ? "0" + b_hex : b_hex;

  return "#" + r_hex + g_hex + b_hex;
}

function getAutoColors(n: number, color_inps: NodeListOf<HTMLInputElement>) {
  const len: number = 255 * 4;
  const step: number = Math.round(len / (n - 1));
  const color: Array<number> = [255, 0, 0];
  const res: Array<RGB> = [{r: 255, g: 0, b: 0}];

  // 1: green, 2: blue
  let color_ptr: number = 1;
  for (let i: number = 0; i < n - 1; i++) {
    color[color_ptr] += step;

    if (color[color_ptr] > 255) {
      color[color_ptr - 1] -= ((color[color_ptr] - 1) % 255) + 1;
      color[color_ptr] = 255;

      if (color[color_ptr - 1] <= 0) {
        color_ptr++;
        color[color_ptr] += -color[0];
        color[0] = 0;
      }
    }

    color[0] = clamp(color[0], 0, 255);
    color[1] = clamp(color[1], 0, 255);
    color[2] = clamp(color[2], 0, 255);
    res.push({
      r: color[0],
      g: color[1],
      b: color[2]
    });
  }

  for (let i: number = 0; i < color_inps.length; i++) {
    const color_inp: HTMLInputElement = color_inps[i];

    color_inp.value = RGBToHex(res[i]);
    color_inp.dispatchEvent(new Event("change"));
  }

  return res;
}

function getHTMLColors(color_inps: NodeListOf<HTMLInputElement>): Array<RGB> {
  const colors: Array<RGB> = new Array<RGB>();

  for (let i: number = 0; i < color_inps.length; i++) {
    const color_inp: HTMLInputElement = color_inps[i];
    
    colors[i] = hexToRGB(color_inp.value);
  }

  return colors;
}

function getAutoGrayColors(n: number) {
  const step: number = 255 / (n - 1);
  const color: Array<number> = [255, 255, 255];
  const res: Array<RGB> = [{r: 255, g: 255, b: 255}];

  for (let i: number = 0; i < n - 1; i++) {
    color[0] -= step;
    color[1] -= step;
    color[2] -= step;

    res.push({
      r: color[0],
      g: color[1],
      b: color[2]
    });
  }

  return res;
}

export {
  getAutoColors,
  getHTMLColors,
  RGBToHex,
  hexToRGB,
  getAutoGrayColors,
}