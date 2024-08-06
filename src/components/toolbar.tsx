import { Image, MousePointer2, Square } from "lucide-react";
import { useAnnotation } from "../lib/context/annotationContext";
import { AnnotationMode } from "../lib/types";
import { ToolButton } from "./toolbarButton";

export const Toolbar = () => {
  const annotationContext = useAnnotation();

  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 z-10">
      <div className="bg-white rounded-md p-1.5 flex gap-1 flex-col items-center shadow-md">
        <ToolButton
          label="Select"
          icon={MousePointer2}
          onClick={() =>
            annotationContext.setAnnotationMode(AnnotationMode.None)
          }
          isActive={annotationContext.annotationMode === AnnotationMode.None}
        />
        <ToolButton
          label="Rectangle"
          icon={Square}
          onClick={() => {
            annotationContext.setAnnotationMode(AnnotationMode.Rectangle);
          }}
          isActive={
            annotationContext.annotationMode === AnnotationMode.Rectangle
          }
        />
        <ToolButton
          label="Image"
          icon={Image}
          onClick={() => {
            annotationContext.setAnnotationMode(AnnotationMode.Image);

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = (event) => {
              annotationContext.handleImageChange(
                event as unknown as React.ChangeEvent<HTMLInputElement>
              );
            };
            fileInput.click();
          }}
          isActive={annotationContext.annotationMode === AnnotationMode.Image}
        />
      </div>
    </div>
  );
};

export function ToolbarSkeleton() {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md" />
  );
}
