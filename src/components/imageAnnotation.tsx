import React, { useState, useRef, useCallback } from "react";
import { Rectangle, useAnnotation } from "../lib/context/annotationContext";
import { AnnotationMode } from "../lib/types";

interface ImageAnnotationToolProps {
  onExport: (data: ExportedRectangle[]) => void;
}

interface ExportedRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

const ImageAnnotationTool: React.FC<ImageAnnotationToolProps> = ({
  onExport,
}) => {
  const { rectangles, setRectangles, image, annotationMode } = useAnnotation();
  const [selectedRect, setSelectedRect] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Backspace" && selectedRect !== null) {
        setRectangles(rectangles.filter((_, index) => index !== selectedRect));
        setSelectedRect(null);
      }
    },
    [selectedRect]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !image) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (annotationMode === AnnotationMode.Rectangle) {
      setStartPoint({ x, y });
      const newRect: Rectangle = {
        x,
        y,
        width: 0,
        height: 0,
        color: "#ff0000",
        rotation: 0,
      };
      setRectangles([...rectangles, newRect]);
      setSelectedRect(rectangles.length);
      setIsDrawing(true);
    } else {
      const clickedRect = rectangles.findIndex((r) => isPointInRect(x, y, r));
      if (clickedRect !== -1) {
        setSelectedRect(clickedRect);
        setIsDragging(true);
        setStartPoint({ x, y });
      } else {
        setSelectedRect(null);
      }
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !image) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setRectangles(
        rectangles.map((r, i) => {
          if (i === selectedRect) {
            if (isDrawing && startPoint) {
              const newX = Math.min(x, startPoint.x);
              const newY = Math.min(y, startPoint.y);
              const newWidth = Math.abs(x - startPoint.x);
              const newHeight = Math.abs(y - startPoint.y);
              return {
                ...r,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              };
            } else if (isResizing && startPoint && resizeHandle) {
              let newX = r.x,
                newY = r.y,
                newWidth = r.width,
                newHeight = r.height;
              const dx = x - startPoint.x;
              const dy = y - startPoint.y;

              switch (resizeHandle) {
                case "n":
                  newY = r.y + dy;
                  newHeight = r.height - dy;
                  break;
                case "s":
                  newHeight = r.height + dy;
                  break;
                case "w":
                  newX = r.x + dx;
                  newWidth = r.width - dx;
                  break;
                case "e":
                  newWidth = r.width + dx;
                  break;
                case "nw":
                  newX = r.x + dx;
                  newY = r.y + dy;
                  newWidth = r.width - dx;
                  newHeight = r.height - dy;
                  break;
                case "ne":
                  newY = r.y + dy;
                  newWidth = r.width + dx;
                  newHeight = r.height - dy;
                  break;
                case "sw":
                  newX = r.x + dx;
                  newWidth = r.width - dx;
                  newHeight = r.height + dy;
                  break;
                case "se":
                  newWidth = r.width + dx;
                  newHeight = r.height + dy;
                  break;
              }

              // Ensure width and height are not negative
              if (newWidth < 0) {
                newX += newWidth;
                newWidth = Math.abs(newWidth);
              }
              if (newHeight < 0) {
                newY += newHeight;
                newHeight = Math.abs(newHeight);
              }

              return {
                ...r,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              };
            } else if (isDragging && startPoint) {
              const dx = x - startPoint.x;
              const dy = y - startPoint.y;
              return { ...r, x: r.x + dx, y: r.y + dy };
            } else if (isRotating && startPoint) {
              const centerX = r.x + r.width / 2;
              const centerY = r.y + r.height / 2;
              const startAngle = Math.atan2(
                startPoint.y - centerY,
                startPoint.x - centerX
              );
              const currentAngle = Math.atan2(y - centerY, x - centerX);
              const angleDiff = currentAngle - startAngle;
              const rotationDiff = angleDiff * (180 / Math.PI);
              const dampingFactor = 0.91; // Reduced damping by 90% (from 0.1 to 0.91)
              const newRotation = r.rotation + rotationDiff * dampingFactor;
              return { ...r, rotation: newRotation };
            }
          }
          return r;
        })
      );

      if (isDragging || isResizing || isRotating) {
        setStartPoint({ x, y });
      }
    },
    [
      rectangles,
      selectedRect,
      isDrawing,
      isResizing,
      isDragging,
      isRotating,
      startPoint,
      resizeHandle,
      image,
    ]
  );

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsResizing(false);
    setIsDragging(false);
    setIsRotating(false);
    setResizeHandle(null);
    setStartPoint(null);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPoint({ x: e.clientX, y: e.clientY });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
  };

  const isPointInRect = (x: number, y: number, rect: Rectangle): boolean => {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const rotatedX =
      (x - centerX) * Math.cos((-rect.rotation * Math.PI) / 180) -
      (y - centerY) * Math.sin((-rect.rotation * Math.PI) / 180) +
      centerX;
    const rotatedY =
      (x - centerX) * Math.sin((-rect.rotation * Math.PI) / 180) +
      (y - centerY) * Math.cos((-rect.rotation * Math.PI) / 180) +
      centerY;
    return (
      rotatedX >= rect.x &&
      rotatedX <= rect.x + rect.width &&
      rotatedY >= rect.y &&
      rotatedY <= rect.y + rect.height
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {image && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={image.src}
            alt="Annotation"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
      {rectangles.map((rect, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            border: `2px solid ${rect.color}`,
            transform: `rotate(${rect.rotation}deg)`,
            transformOrigin: "center",
            backgroundColor:
              index === selectedRect
                ? "rgba(255, 255, 255, 0.3)"
                : "transparent",
          }}
        >
          {index === selectedRect && (
            <>
              <div
                className="resize-handle n"
                style={resizeHandleStyle("n")}
                onMouseDown={(e) => handleResizeStart(e, "n")}
              />
              <div
                className="resize-handle s"
                style={resizeHandleStyle("s")}
                onMouseDown={(e) => handleResizeStart(e, "s")}
              />
              <div
                className="resize-handle e"
                style={resizeHandleStyle("e")}
                onMouseDown={(e) => handleResizeStart(e, "e")}
              />
              <div
                className="resize-handle w"
                style={resizeHandleStyle("w")}
                onMouseDown={(e) => handleResizeStart(e, "w")}
              />
              <div
                className="resize-handle ne"
                style={resizeHandleStyle("ne")}
                onMouseDown={(e) => handleResizeStart(e, "ne")}
              />
              <div
                className="resize-handle nw"
                style={resizeHandleStyle("nw")}
                onMouseDown={(e) => handleResizeStart(e, "nw")}
              />
              <div
                className="resize-handle se"
                style={resizeHandleStyle("se")}
                onMouseDown={(e) => handleResizeStart(e, "se")}
              />
              <div
                className="resize-handle sw"
                style={resizeHandleStyle("sw")}
                onMouseDown={(e) => handleResizeStart(e, "sw")}
              />
              <div
                className="rotate-handle"
                style={rotateHandleStyle()}
                onMouseDown={handleRotateStart}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const resizeHandleStyle = (position: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "50%",
  };

  switch (position) {
    case "n":
      return {
        ...base,
        top: "-5px",
        left: "calc(50% - 5px)",
        cursor: "ns-resize",
      };
    case "s":
      return {
        ...base,
        bottom: "-5px",
        left: "calc(50% - 5px)",
        cursor: "ns-resize",
      };
    case "e":
      return {
        ...base,
        right: "-5px",
        top: "calc(50% - 5px)",
        cursor: "ew-resize",
      };
    case "w":
      return {
        ...base,
        left: "-5px",
        top: "calc(50% - 5px)",
        cursor: "ew-resize",
      };
    case "ne":
      return { ...base, top: "-5px", right: "-5px", cursor: "nesw-resize" };
    case "nw":
      return { ...base, top: "-5px", left: "-5px", cursor: "nwse-resize" };
    case "se":
      return { ...base, bottom: "-5px", right: "-5px", cursor: "nwse-resize" };
    case "sw":
      return { ...base, bottom: "-5px", left: "-5px", cursor: "nesw-resize" };
    default:
      return base;
  }
};

const rotateHandleStyle = (): React.CSSProperties => ({
  position: "absolute",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  top: "-30px",
  left: "calc(50% - 5px)",
  cursor: "grab",
  backgroundColor: "white",
  border: "1px solid black",
});

export default ImageAnnotationTool;
