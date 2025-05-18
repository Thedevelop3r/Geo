import React, { useEffect, useRef } from "react";
import worldGeoJson from "../data/world.geo.json";

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

function mercatorProjection([lon, lat]: [number, number], width: number, height: number): [number, number] {
  const x = (lon + 180) * (width / 360);
  const y = height / 2 - (width * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) / (2 * Math.PI));
  return [x, y];
}

const WorldMapCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.5;

    const features = (worldGeoJson as any).features as GeoFeature[];

    features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      if (feature.geometry.type === "Polygon") {
        ctx.beginPath();
        coords[0].forEach(([lon, lat], index) => {
          const [x, y] = mercatorProjection([lon, lat], width, height);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      } else if (feature.geometry.type === "MultiPolygon") {
        coords.forEach((polygon) => {
          ctx.beginPath();
          polygon[0].forEach(([lon, lat], index) => {
            const [x, y] = mercatorProjection([lon, lat], width, height);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.stroke();
        });
      }
    });
  }, []);

  return <canvas ref={canvasRef} width={800} height={450} />;
};

export default WorldMapCanvas;
