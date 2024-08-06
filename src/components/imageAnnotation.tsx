import React, { useState, useRef, useCallback } from "react";
import { Rectangle, useAnnotation } from "../lib/context/annotationContext";
import { AnnotationMode } from "../lib/types";
import { isPointInRect, resizeHandleStyle, rotateHandleStyle } from "../lib/ui";

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

enum InteractionState {
  None,
  Drawing,
  Resizing,
  Dragging,
  Rotating,
}

const ImageAnnotationTool: React.FC<ImageAnnotationToolProps> = ({
  onExport,
}) => {
  const {
    rectangles,
    setRectangles,
    image,
    annotationMode,
    selectedRect,
    setSelectedRect,
  } = useAnnotation();
  const [interactionState, setInteractionState] = useState<InteractionState>(
    InteractionState.None
  );
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

      if (selectedRect !== null) {
        const arrowKeys = {
          ArrowRight: { x: 1, y: 0 },
          ArrowLeft: { x: -1, y: 0 },
          ArrowUp: { x: 0, y: -1 },
          ArrowDown: { x: 0, y: 1 },
        };

        if (e.key in arrowKeys) {
          const { x, y } = arrowKeys[e.key as keyof typeof arrowKeys];
          setRectangles((prevRectangles) =>
            prevRectangles.map((rect, index) =>
              index === selectedRect
                ? { ...rect, x: rect.x + x, y: rect.y + y }
                : rect
            )
          );
        }
      }

      if (e.key === "Enter" && selectedRect !== null) {
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
      setInteractionState(InteractionState.Drawing);
    } else {
      const clickedRect = rectangles.findIndex((r) => isPointInRect(x, y, r));
      if (clickedRect !== -1) {
        setSelectedRect(clickedRect);
        setInteractionState(InteractionState.Dragging);
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

      const handleDrawing = (r: Rectangle, x: number, y: number) => {
        if (startPoint) {
          const newX = Math.min(x, startPoint.x);
          const newY = Math.min(y, startPoint.y);
          const newWidth = Math.abs(x - startPoint.x);
          const newHeight = Math.abs(y - startPoint.y);
          return { ...r, x: newX, y: newY, width: newWidth, height: newHeight };
        }
        return r;
      };

      const handleResizing = (r: Rectangle, x: number, y: number) => {
        if (startPoint && resizeHandle) {
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

          if (newWidth < 0) {
            newX += newWidth;
            newWidth = Math.abs(newWidth);
          }
          if (newHeight < 0) {
            newY += newHeight;
            newHeight = Math.abs(newHeight);
          }

          return { ...r, x: newX, y: newY, width: newWidth, height: newHeight };
        }
        return r;
      };

      const handleDragging = (r: Rectangle, x: number, y: number) => {
        if (startPoint) {
          const dx = x - startPoint.x;
          const dy = y - startPoint.y;
          return { ...r, x: r.x + dx, y: r.y + dy };
        }
        return r;
      };

      const handleRotating = (r: Rectangle, x: number, y: number) => {
        if (startPoint) {
          const centerX = r.x + r.width / 2;
          const centerY = r.y + r.height / 2;
          const startAngle = Math.atan2(
            startPoint.y - centerY,
            startPoint.x - centerX
          );
          const currentAngle = Math.atan2(y - centerY, x - centerX);
          const angleDiff = currentAngle - startAngle;
          const rotationDiff = angleDiff * (180 / Math.PI);
          const dampingFactor = 0.91;
          const newRotation = r.rotation + rotationDiff * dampingFactor;
          return { ...r, rotation: newRotation };
        }
        return r;
      };

      setRectangles(
        rectangles.map((r, i) => {
          if (i === selectedRect) {
            switch (interactionState) {
              case InteractionState.Drawing:
                return handleDrawing(r, x, y);
              case InteractionState.Resizing:
                return handleResizing(r, x, y);
              case InteractionState.Dragging:
                return handleDragging(r, x, y);
              case InteractionState.Rotating:
                return handleRotating(r, x, y);
              default:
                return r;
            }
          }
          return r;
        })
      );

      if (
        interactionState !== InteractionState.None &&
        interactionState !== InteractionState.Drawing
      ) {
        setStartPoint({ x, y });
      }
    },
    [
      rectangles,
      selectedRect,
      interactionState,
      startPoint,
      resizeHandle,
      image,
    ]
  );

  const handleMouseUp = () => {
    setInteractionState(InteractionState.None);
    setResizeHandle(null);
    setStartPoint(null);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setInteractionState(InteractionState.Resizing);
    setResizeHandle(handle);
    setStartPoint({ x: e.clientX, y: e.clientY });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInteractionState(InteractionState.Rotating);
    setStartPoint({ x: e.clientX, y: e.clientY });
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
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
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
            zIndex: index === selectedRect ? 5 : "auto",
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

export default ImageAnnotationTool;
