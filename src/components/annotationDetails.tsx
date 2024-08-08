import React, { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  AlertCircle,
  Image,
} from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { useAnnotation } from "../lib/context/annotationContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

const AnnotationDetails: React.FC = () => {
  const {
    rectangles,
    setRectangles,
    selectedRect,
    setSelectedRect,
    imageTransform,
    setImageTransform,
    templates,
    unsavedChanges,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    image,
  } = useAnnotation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleTransformChange =
    (property: "rotation" | "tilt") => (value: number[]) => {
      setImageTransform((prev) => ({
        ...prev,
        [property]: value[0],
      }));
    };

  const handleSaveTemplate = useCallback(async () => {
    if (newTemplateName.trim()) {
      await saveTemplate(newTemplateName.trim());
      setNewTemplateName("");
      setIsSaveDialogOpen(false);
    }
  }, [newTemplateName, saveTemplate]);

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (newTemplateName.trim()) {
          handleSaveTemplate();
        } else {
          setIsSaveDialogOpen(true);
        }
      }
    },
    [newTemplateName, handleSaveTemplate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const renderSlider = (
    label: string,
    value: number,
    onChange: (value: number[]) => void,
    min: number,
    max: number
  ) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{label}</h4>
        <span className="text-sm font-medium">{value}°</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
    </div>
  );

  const renderRectangleCard = (rect: any, index: number) => (
    <div
      key={index}
      className={`mb-2 p-2 border rounded ${
        selectedRect === index ? "bg-blue-100" : ""
      }`}
      onClick={() => setSelectedRect(index)}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {rect.name || `Rectangle ${index + 1}`}
        </span>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setRectangles(rectangles.filter((_, i) => i !== index));
              if (selectedRect === index) setSelectedRect(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {rect.width.toFixed(0)}x{rect.height.toFixed(0)}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`fixed right-0 top-0 bottom-0 z-10 flex items-center transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-72"
        }`}
      >
        <div
          className={`absolute right-0 top-0 bottom-0 bg-white shadow-lg transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-16" : "w-72"
          }`}
        >
          {isCollapsed ? (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -translate-y-1/2 left-2 rounded-full h-12 w-12"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Annotations</h3>
                <div className="flex items-center">
                  {unsavedChanges && (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsCollapsed(true)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {image && (
                <div className="p-4 border-b">
                  {renderSlider(
                    "Rotation",
                    imageTransform.rotation,
                    handleTransformChange("rotation"),
                    0,
                    360
                  )}
                  {renderSlider(
                    "Tilt",
                    imageTransform.tilt,
                    handleTransformChange("tilt"),
                    -30,
                    30
                  )}
                </div>
              )}

              {rectangles.length > 0 && (
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium mb-2">Save Template</h4>
                  <div className="flex items-center">
                    <Input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Template name"
                      className="flex-grow mr-2"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveTemplate}
                      disabled={!newTemplateName.trim()}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <ScrollArea className="flex-grow">
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium mb-2">Saved Templates</h4>
                  {templates.map((template) => (
                    <div key={template.id} className="mb-2 p-2 border rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{template.name}</span>
                        <div className="flex flex-row justify-center items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTemplate(template.id)}
                            className="mr-1"
                          >
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <Image className="inline-block mr-1" size={12} />
                        {template.originalImageSize.width} x{" "}
                        {template.originalImageSize.height}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-medium mb-2">Rectangles</h4>
                  {rectangles.map(renderRectangleCard)}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <Input
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
          <DialogFooter>
            <Button
              onClick={() => setIsSaveDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!newTemplateName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnotationDetails;
