import React, { createContext, useContext, ReactNode, useState } from "react";
import { AnnotationMode } from "../types";

interface AnnotationContextType {
  image: HTMLImageElement | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  annotationMode: AnnotationMode;
  setAnnotationMode: React.Dispatch<React.SetStateAction<AnnotationMode>>;

  rectangles: Rectangle[];
  setRectangles: React.Dispatch<React.SetStateAction<Rectangle[]>>;

  selectedRect: number | null;
  setSelectedRect: React.Dispatch<React.SetStateAction<number | null>>;

  imageTransform: ImageTransform;
  setImageTransform: React.Dispatch<React.SetStateAction<ImageTransform>>;
}

interface ImageTransform {
  rotation: number;
  tilt: number;
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

const AnnotationContext = createContext<AnnotationContextType | undefined>(
  undefined
);

export const useAnnotation = () => {
  const context = useContext(AnnotationContext);

  if (context === undefined) {
    throw new Error("useAnnotation must be used within an AnnotationProvider");
  }
  return context;
};

interface AnnotationProviderProps {
  children: ReactNode;
}

export const AnnotationProvider: React.FC<AnnotationProviderProps> = ({
  children,
}) => {
  // No state or data as per the instructions
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const [rectangles, setRectangles] = useState<Rectangle[]>([]);

  const [selectedRect, setSelectedRect] = useState<number | null>(null);

  const [annotationMode, setAnnotationMode] = useState(AnnotationMode.None);

  const [imageTransform, setImageTransform] = useState<ImageTransform>({
    rotation: 0,
    tilt: 0,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnnotationContext.Provider
      value={{
        image,
        handleImageChange,
        annotationMode,
        setAnnotationMode,
        rectangles,
        setRectangles,
        selectedRect,
        setSelectedRect,
        imageTransform,
        setImageTransform,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};
