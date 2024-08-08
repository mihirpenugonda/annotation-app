import { Minus, Plus } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useAnnotation } from "../lib/context/annotationContext";

export const ViewportScaleContainer = () => {
  const { viewport, setViewport } = useAnnotation();

  return (
    <div className="absolute bottom-5 left-5 z-10">
      <Card>
        <CardContent className="p-2">
          <div className="flex flex-row items-center gap-2">
            <div>
              <Minus
                onClick={() => {
                  setViewport((prev) => ({
                    ...prev,
                    scale: prev.scale - 0.01,
                  }));
                }}
                className="w-4 h-4 text-muted-foreground cursor-pointer"
              />
            </div>
            <div>
              <span className="">{`${Math.round(viewport.scale * 100)}%`}</span>
            </div>
            <div>
              <Plus
                onClick={() => {
                  setViewport((prev) => ({
                    ...prev,
                    scale: prev.scale + 0.01,
                  }));
                }}
                className="w-4 h-4 text-muted-foreground cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
