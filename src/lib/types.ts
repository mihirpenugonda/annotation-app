export enum AnnotationMode {
  None = "None",
  Rectangle = "Rectangle",
  Image = "Image",
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  name?: string;
}
export interface RelativeRectangle {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  color: string;
  rotation: number;
}

export interface Template {
  id: string;
  name: string;
  rectangles: RelativeRectangle[];
  originalImageSize: { width: number; height: number };
}

export enum InteractionState {
  None,
  Drawing,
  Resizing,
  Dragging,
  Rotating,
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}
