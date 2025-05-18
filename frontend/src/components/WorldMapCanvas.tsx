import React, { useEffect, useRef, useState } from "react";
import worldGeoJson from "../data/custom.geo.json";

interface GeoFeature {
  type: string;
  properties: {
    name: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

function mercatorProjection(
  [lon, lat]: [number, number],
  width: number,
  height: number,
  scale: number,
  offsetX: number,
  offsetY: number
): [number, number] {
  const x = (lon + 180) * (width / 360) * scale + offsetX;
  const y =
    height / 2 -
    (width * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2))) /
    (2 * Math.PI) *
    scale +
    offsetY;
  return [x, y];
}

function getCountryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 60%)`;
}

const WorldMapCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryPaths, setCountryPaths] = useState<
    { name: string; path: Path2D }[]
  >([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const drawMap = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
    offsetX: number,
    offsetY: number
  ) => {
    const features = (worldGeoJson as any).features as GeoFeature[];
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    const paths: { name: string; path: Path2D }[] = [];

    features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const countryName = feature.properties.name;
      const color = getCountryColor(countryName);
      const path = new Path2D();

      if (feature.geometry.type === "Polygon") {
        coords[0].forEach((coord, index) => {
          if (Array.isArray(coord) && coord.length === 2) {
            const [x, y] = mercatorProjection(
              coord as [number, number],
              width,
              height,
              scale,
              offsetX,
              offsetY
            );
            if (index === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          }
        });
        path.closePath();
      } else if (feature.geometry.type === "MultiPolygon") {
        coords.forEach((polygon) => {
          polygon[0].forEach((coord, index) => {
            if (Array.isArray(coord) && coord.length === 2) {
              const [x, y] = mercatorProjection(
                coord as [number, number],
                width,
                height,
                scale,
                offsetX,
                offsetY
              );
              if (index === 0) path.moveTo(x, y);
              else path.lineTo(x, y);
            }
          });
        });
        path.closePath();
      }

      ctx.fillStyle = selectedCountry === countryName ? "#ffcc00" : color;
      ctx.fill(path);
      ctx.strokeStyle = "#444";
      ctx.stroke(path);

      paths.push({ name: countryName, path });
    });

    setCountryPaths(paths);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawMap(ctx, canvas.width, canvas.height, zoom, offset.x, offset.y);
  }, [zoom, offset, selectedCountry]);

  useEffect(() => {
    // Prevent default zoom behavior on page
    const handleGlobalWheel = (e: WheelEvent) => {
      if (canvasRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", handleGlobalWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleGlobalWheel);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const { name, path } of countryPaths) {
      if (ctx.isPointInPath(path, x, y)) {
        setSelectedCountry(name);
        return;
      }
    }

    setSelectedCountry(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomDirection = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = zoom * zoomDirection;

    const newOffsetX = mouseX - ((mouseX - offset.x) * newZoom) / zoom;
    const newOffsetY = mouseY - ((mouseY - offset.y) * newZoom) / zoom;

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={1200}
        height={450}
        onClick={handleClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: "grab", border: "1px solid #aaa" }}
      />
      {selectedCountry && (
        <div style={{ marginTop: "10px" }}>
          <strong>Selected Country:</strong> {selectedCountry}
        </div>
      )}
    </div>
  );
};

export default WorldMapCanvas;
