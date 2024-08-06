import { Rectangle } from "./context/annotationContext";

export const resizeHandleStyle = (position: string): React.CSSProperties => {
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

export const rotateHandleStyle = (): React.CSSProperties => ({
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

export const isPointInRect = (x: number, y: number, rect: Rectangle): boolean => {
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
