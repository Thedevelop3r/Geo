import React, { useEffect, useRef, useState } from "react";
import worldGeoJson from "../data/custom.geo.json"; // path to your GeoJSON

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
  height: number
): [number, number] {
  const x = (lon + 180) * (width / 360);
  const y =
    height / 2 -
    (width *
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2))) /
      (2 * Math.PI);
  return [x, y];
}

// Generate color from country name
function getCountryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 60%)`;
  return color;
}

const WorldMapCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryPaths, setCountryPaths] = useState<
    { name: string; path: Path2D }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const features = (worldGeoJson as any).features as GeoFeature[];

    const paths: { name: string; path: Path2D }[] = [];

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const countryName = feature.properties.name;
      const color = getCountryColor(countryName);

      if (feature.geometry.type === "Polygon") {
        const path = new Path2D();
        coords[0].forEach((coord, index) => {
          if (
            Array.isArray(coord) &&
            coord.length === 2 &&
            typeof coord[0] === "number" &&
            typeof coord[1] === "number"
          ) {
            const [x, y] = mercatorProjection(
              [coord[0], coord[1]],
              width,
              height
            );
            if (index === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          }
        });
        path.closePath();
        ctx.fillStyle =
          selectedCountry === countryName ? "#ffcc00" : color;
        ctx.fill(path);
        ctx.strokeStyle = "#444";
        ctx.stroke(path);
        paths.push({ name: countryName, path });
      } else if (feature.geometry.type === "MultiPolygon") {
        const path = new Path2D();
        coords.forEach((polygon) => {
          polygon[0].forEach((coord, index) => {
            if (
              Array.isArray(coord) &&
              coord.length === 2 &&
              typeof coord[0] === "number" &&
              typeof coord[1] === "number"
            ) {
              const [x, y] = mercatorProjection(
                [coord[0], coord[1]],
                width,
                height
              );
              if (index === 0) path.moveTo(x, y);
              else path.lineTo(x, y);
            }
          });
          path.closePath();
        });
        ctx.fillStyle =
          selectedCountry === countryName ? "#ffcc00" : color;
        ctx.fill(path);
        ctx.strokeStyle = "#444";
        ctx.stroke(path);
        paths.push({ name: countryName, path });
      }
    });

    setCountryPaths(paths);
  }, [selectedCountry]);

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
        console.log("Clicked:", name);
        return;
      }
    }

    setSelectedCountry(null); // clicked outside
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        onClick={handleClick}
        style={{ cursor: "pointer", border: "1px solid #aaa" }}
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
