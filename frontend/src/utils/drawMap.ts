import worldGeoJson from "../data/custom.geo.json";
import { mercatorProjection, getCountryColor } from "./mapHelpers";

export function drawMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  offset: { x: number; y: number },
  selectedCountry: string | null,
  setCountryPaths: (paths: { name: string; path: Path2D }[]) => void
) {
  const features = (worldGeoJson as any).features;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  const paths: { name: string; path: Path2D }[] = [];

  features.forEach((feature: any) => {
    const coords = feature.geometry.coordinates;
    const countryName = feature.properties.name;
    const path = new Path2D();

    if (feature.geometry.type === "Polygon") {
      coords[0].forEach((coord: number[], index: number) => {
        if (Array.isArray(coord) && coord.length === 2) {
          const [x, y] = mercatorProjection(
            coord as [number, number],
            width,
            height,
            scale,
            offset.x,
            offset.y
          );
          if (index === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
      });
      path.closePath();
    } else if (feature.geometry.type === "MultiPolygon") {
      coords.forEach((polygon: number[][][]) => {
        polygon[0].forEach((coord: number[], index: number) => {
          if (Array.isArray(coord) && coord.length === 2) {
            const [x, y] = mercatorProjection(
              coord as [number, number],
              width,
              height,
              scale,
              offset.x,
              offset.y
            );
            if (index === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          }
        });
      });
      path.closePath();
    }


    ctx.fillStyle = selectedCountry === countryName ? "#ffcc00" : getCountryColor(countryName);
    ctx.fill(path);
    ctx.strokeStyle = "#444";
    ctx.stroke(path);

    paths.push({ name: countryName, path });
  });

  setCountryPaths(paths);
}