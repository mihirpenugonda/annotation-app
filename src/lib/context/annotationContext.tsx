import React, { createContext, useContext, ReactNode, useState } from "react";
import { AnnotationMode } from "../types";

interface AnnotationContextType {
  image: HTMLImageElement | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  annotationMode: AnnotationMode;
  setAnnotationMode: (mode: AnnotationMode) => void;

  rectangles: Rectangle[];
  setRectangles: (rectangles: Rectangle[]) => void | Rectangle[];
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

  const [annotationMode, setAnnotationMode] = useState(AnnotationMode.None);

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
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};
