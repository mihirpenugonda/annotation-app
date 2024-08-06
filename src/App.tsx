import React from "react";
import ImageAnnotationTool from "./components/imageAnnotation";
import { Toolbar } from "./components/toolbar";
import { AnnotationProvider } from "./lib/context/annotationContext";
import AnnotationDetails from "./components/annotationDetails";

const App: React.FC = () => {
  return (
    <AnnotationProvider>
      <div className="h-screen w-screen relative bg-neutral-100 touch-none overflow-hidden">
        <Toolbar />

        <AnnotationDetails />

        <ImageAnnotationTool onExport={(_data) => {}} />
      </div>
    </AnnotationProvider>
  );
};

export default App;
