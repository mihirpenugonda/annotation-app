import React, { useState } from "react";
import { Trash2, Edit2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useAnnotation } from "../lib/context/annotationContext";

const AnnotationDetails: React.FC = () => {
  const { rectangles, setRectangles, selectedRect, setSelectedRect } =
    useAnnotation();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDeleteRectangle = (index: number) => {
    setRectangles(rectangles.filter((_, i) => i !== index));
    if (selectedRect === index) setSelectedRect(null);
  };

  const handleEditName = (index: number) => {
    setEditingIndex(index);
    setEditingName(rectangles[index].name || `Rectangle ${index + 1}`);
  };

  const handleSaveName = () => {
    if (editingIndex !== null) {
      setRectangles(
        rectangles.map((rect, index) =>
          index === editingIndex ? { ...rect, name: editingName } : rect
        )
      );
      setEditingIndex(null);
    }
  };

  const renderRectangleCard = (rect: any, index: number) => {
    const isSelected = selectedRect === index;
    const isEditing = editingIndex === index;

    return (
      <Card
        key={index}
        className={`mb-3 p-3 ${
          isSelected ? "bg-blue-100" : ""
        } hover:bg-gray-50 transition-colors`}
        onClick={() => setSelectedRect(index)}
      >
        <div className="flex justify-between items-center mb-1">
          {isEditing ? renderEditInput() : renderRectangleName(rect, index)}
          {renderActionButtons(index, isEditing)}
        </div>
        <div className="text-sm text-gray-500">
          {rect.width.toFixed(0)}x{rect.height.toFixed(0)}
        </div>
      </Card>
    );
  };

  const renderEditInput = () => (
    <Input
      value={editingName}
      onChange={(e) => setEditingName(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleSaveName();
      }}
      onClick={(e) => e.stopPropagation()}
      className="flex-grow mr-2"
      autoFocus
    />
  );

  const renderRectangleName = (rect: any, index: number) => (
    <span className="font-medium">{rect.name || `Rectangle ${index + 1}`}</span>
  );

  const renderActionButtons = (index: number, isEditing: boolean) => (
    <div className="flex space-x-1">
      {isEditing ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveName}
          className="h-8 w-8"
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEditName(index);
          }}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteRectangle(index);
        }}
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-10 flex items-center transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      <div
        className={`absolute right-0 top-0 bottom-0 bg-white transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-72"
        }`}
      >
        {isCollapsed ? (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 left-2 rounded-full h-12 w-12"
            onClick={toggleCollapse}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        ) : (
          <Card className="h-full rounded-none">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Rectangles</h3>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleCollapse}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-grow">
                {rectangles.map(renderRectangleCard)}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnotationDetails;
