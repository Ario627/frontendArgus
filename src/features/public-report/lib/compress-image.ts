const MAX_DIMENSION = 1600;
const MAX_BYTES = 1_048_576;
const QUALITIES: readonly number[] = Object.freeze([0.82, 0.65]);

interface LoadedBitmap {
  readonly source: CanvasImageSource;
  readonly width: number;
  readonly height: number;
  readonly revoke?: () => void;
}

function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  if (width <= max && height <= max) return { width, height };
  const scale = max / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

async function loadBitmap(file: File): Promise<LoadedBitmap | null> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    return loadViaImageElement(file);
  }
}

function loadViaImageElement(file: File): Promise<LoadedBitmap | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        revoke: () => URL.revokeObjectURL(objectUrl)
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    image.src = objectUrl;
  });
}

function toJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

export async function compressImageToJpeg(file: File): Promise<Blob | null> {
  const bitmap = await loadBitmap(file);
  if (bitmap === null) return null;
  try {
    const target = fitWithin(bitmap.width, bitmap.height, MAX_DIMENSION);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext("2d");
    if (context === null) return null;
    context.drawImage(bitmap.source, 0, 0, target.width, target.height);
    for (const quality of QUALITIES) {
      const blob = await toJpegBlob(canvas, quality);
      if (blob === null) return null;
      if (blob.size <= MAX_BYTES || quality === QUALITIES[QUALITIES.length - 1]) {
        return blob.size <= MAX_BYTES ? blob : null;
      }
    }
    return null;
  } finally {
    bitmap.revoke?.();
    if (bitmap.source instanceof ImageBitmap) bitmap.source.close();
  }
}