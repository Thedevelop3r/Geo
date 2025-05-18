export function mercatorProjection(
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

export function getCountryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 60%)`;
}