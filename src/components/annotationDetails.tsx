import React, { useState } from "react";
import { Trash2, Edit2, Check } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useAnnotation } from "../lib/context/annotationContext";

const AnnotationDetails: React.FC = () => {
  const { rectangles, setRectangles, setSelectedRect } = useAnnotation();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleDeleteRectangle = (index: number) => {
    setRectangles(rectangles.filter((_, i) => i !== index));
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

  return (
    <div className="h-full absolute right-0 p-4 z-10">
      <Card className="w-64 h-full">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Rectangles</h3>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {rectangles.map((rect, index) => (
              <Card
                key={index}
                className="mb-3 p-3"
                onClick={() => setSelectedRect(index)}
              >
                <div className="flex justify-between items-center mb-1">
                  {editingIndex === index ? (
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
                  ) : (
                    <span className="font-medium">
                      {rect.name || `Rectangle ${index + 1}`}
                    </span>
                  )}
                  <div className="flex space-x-1">
                    {editingIndex === index ? (
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
                        onClick={() => handleEditName(index)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRectangle(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {rect.width.toFixed(0)}x{rect.height.toFixed(0)}
                </div>
              </Card>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotationDetails;
