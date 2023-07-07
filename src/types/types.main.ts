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

export type {
  RGB,
  ImageSettings,
  ImgSettings,
}