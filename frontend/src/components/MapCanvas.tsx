import React, { useRef, useEffect } from "react";
import { drawMap } from "../utils/drawMap";
import { useGeoState } from "../state/geoState";

const MapCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    zoom,
    offset,
    setOffset,
    selectedCountry,
    setSelectedCountry,
    countryPaths,
    setCountryPaths,
    setZoom
  } = useGeoState();

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

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
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = zoom * zoomFactor;

    const newOffsetX = mouseX - ((mouseX - offset.x) * newZoom) / zoom;
    const newOffsetY = mouseY - ((mouseY - offset.y) * newZoom) / zoom;

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setOffset({ x: offset.x + dx, y: offset.y + dy });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawMap(ctx, canvas.width, canvas.height, zoom, offset, selectedCountry, setCountryPaths);
  }, [zoom, offset, selectedCountry]);

  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (canvasRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", handleGlobalWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleGlobalWheel);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={450}
      onClick={handleClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: "grab", border: "1px solid #aaa" }}
    />
  );
};

export default MapCanvas;