// Manual rendering for devices without WebGL. Precompute the visible hemisphere
// once; sample the map only when the user changes the viewing angle.
export function softwareRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
) {
  const size = 256;
  const map = document.createElement("canvas");
  map.width = 1024;
  map.height = 512;
  const source = map.getContext("2d");
  if (!source) throw new Error("Canvas 2D unavailable");
  source.drawImage(image, 0, 0, map.width, map.height);
  const pixels = source.getImageData(0, 0, map.width, map.height).data;
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D unavailable");
  const frame = context.createImageData(size, size);
  const surface: [number, number, number, number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const east = (2 * x + 1) / size - 1,
        north = 1 - (2 * y + 1) / size;
      const depth = 1 - east * east - north * north;
      if (depth < 0) continue;
      const z = Math.sqrt(depth);
      const light = Math.min(
        1,
        Math.max(0, (-0.87 * east + 0.53 * north + 0.3 * z + 0.23) / 1.08),
      );
      const offset = 4 * (y * size + x);
      surface.push([
        offset,
        east,
        north,
        z,
        0.09 + 1.12 * light * light * (3 - 2 * light),
      ]);
      frame.data[offset + 3] = 255;
    }
  }
  return (longitude: number, latitude: number) => {
    const sin = Math.sin(latitude),
      cos = Math.cos(latitude);
    for (const [offset, x, y, z, light] of surface) {
      const lat = Math.asin(Math.max(-1, Math.min(1, y * cos + z * sin)));
      const lon = longitude + Math.atan2(x, z * cos - y * sin);
      const u = Math.floor((lon / (2 * Math.PI) + 0.5) * map.width) & 1023;
      const v = Math.min(511, Math.floor((0.5 - lat / Math.PI) * map.height));
      const i = 4 * (v * map.width + u);
      for (let c = 0; c < 3; c++)
        frame.data[offset + c] = pixels[i + c] * light;
    }
    context.putImageData(frame, 0, 0);
  };
}
