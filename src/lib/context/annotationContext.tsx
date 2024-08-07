import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { AnnotationMode, Rectangle, RelativeRectangle, Template } from "../types";
import {
  deleteTemplateFromStorage,
  fetchTemplates,
  saveTemplateToStorage,
} from "../../services/templateService";

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

  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  saveTemplate: (name: string) => Promise<void>;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => Promise<void>;

  unsavedChanges: boolean;
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ImageTransform {
  rotation: number;
  tilt: number;
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

  const [templates, setTemplates] = useState<Template[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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

  useEffect(() => {
    const loadTemplates = async () => {
      const loadedTemplates = await fetchTemplates();
      setTemplates(loadedTemplates);
    };
    loadTemplates();
  }, []);

  const saveTemplate = async (name: string) => {
    if (!image) return;

    const relativeRectangles: RelativeRectangle[] = rectangles.map((rect) => ({
      xPercent: rect.x / image.width,
      yPercent: rect.y / image.height,
      widthPercent: rect.width / image.width,
      heightPercent: rect.height / image.height,
      color: rect.color,
      rotation: rect.rotation,
    }));

    const newTemplate: Template = {
      id: Date.now().toString(),
      name,
      rectangles: relativeRectangles,
      originalImageSize: { width: image.width, height: image.height },
    };

    await saveTemplateToStorage(newTemplate);
    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    setUnsavedChanges(false);
  };

  const loadTemplate = (id: string) => {
    if (!image) return;

    const template = templates.find((t) => t.id === id);
    if (template) {
      const scaledRectangles: Rectangle[] = template.rectangles.map((rect) => ({
        x: rect.xPercent * image.width,
        y: rect.yPercent * image.height,
        width: rect.widthPercent * image.width,
        height: rect.heightPercent * image.height,
        color: rect.color,
        rotation: rect.rotation,
      }));

      setRectangles(scaledRectangles);
      setUnsavedChanges(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    await deleteTemplateFromStorage(id);
    setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== id));
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
        templates,
        setTemplates,
        saveTemplate,
        loadTemplate,
        deleteTemplate,
        unsavedChanges,
        setUnsavedChanges,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};
