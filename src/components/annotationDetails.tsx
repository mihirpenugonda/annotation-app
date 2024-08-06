import React from "react";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useAnnotation } from "../lib/context/annotationContext";

const AnnotationDetails: React.FC = () => {
  const { rectangles, setRectangles } = useAnnotation();

  const handleDeleteRectangle = (index: number) => {
    setRectangles(rectangles.filter((_, i) => i !== index));
  };

  const handleSelectRectangle = (index: number) => {};

  return (
    <div className="h-full absolute right-0 p-4 z-10">
      <Card className="w-64 h-full">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Rectangles</h3>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {rectangles.map((rect, index) => (
              <Card
                key={index}
                className="mb-2 p-2 cursor-pointer hover:bg-gray-100 relative group"
                onClick={() => handleSelectRectangle(index)}
              >
                <div className="flex justify-between items-center">
                  <span>Rectangle {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRectangle(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
