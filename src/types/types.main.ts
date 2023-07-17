type RGB = {
  r: number;
  g: number;
  b: number;
}

type ImageSettings = {
  id: string;
  title: string;
  description: string;
  src: string;
  colors: Map<string, RGB>;
  smooth: boolean;
};

type ImgSettings = {
  title: string;
  description: string;
  src: string;
};

type WFCInput = {
  ini_states: Array<string>;
  rows: number;
  cols: number;
  adj_list: Map<string, Set<string>>;
  ini_cell: Array<number>;
  ini_state: string;
  neighbors_based: boolean;
  adj_offs: Array<Array<number>>;
};

export type {
  RGB,
  ImageSettings,
  ImgSettings,
  WFCInput,
}