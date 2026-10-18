import { sha256HexOfBlob } from "@/shared/lib/hash";

const DIMENSION_FACTORS = Object.freeze([1, 0.85, 0.72, 0.6, 0.5]);
const QUALITY_STEPS = Object.freeze([0.82, 0.72, 0.62, 0.52, 0.42]);
const MIME_LADDER = Object.freeze(["image/webp", "image/jpeg"] as const);
const MIN_DIMENSION = 640;
const DEFAULT_MAX_BYTES = 780_000;
const DEFAULT_MAX_DIMENSION = 1600;

export interface CompressedPhoto {
  readonly blob: Blob;
  readonly sha256: string;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly mime: "image/webp" | "image/jpeg";
}

export type CompressErrorCode = "PHOTO_UNREADABLE" | "PHOTO_TOO_LARGE";

export type CompressResult =
  | { readonly ok: true; readonly photo: CompressedPhoto }
  | { readonly ok: false; readonly code: CompressErrorCode };

export interface CompressOptions {
  readonly maxBytes?: number;
  readonly maxDimension?: number;
}

interface DecodedSource {
  readonly draw: CanvasImageSource;
  readonly width: number;
  readonly height: number;
  readonly release: () => void;
}

const decodeViaBitmap = async (file: File): Promise<DecodedSource | null> => {
  if (typeof createImageBitmap !== "function") return null;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    if (bitmap.width === 0 || bitmap.height === 0) {
      bitmap.close();
      return null;
    }
    return {
      draw: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => {
        bitmap.close();
      }
    };
  } catch {
    return null;
  }
};

const decodeViaElement = (file: File): Promise<DecodedSource | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      resolve({
        draw: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        release: () => {
          URL.revokeObjectURL(url);
        }
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });

const decodeSource = async (file: File): Promise<DecodedSource | null> => {
  const bitmap = await decodeViaBitmap(file);
  if (bitmap !== null) return bitmap;
  return decodeViaElement(file);
};

const encodeAt = (
  source: CanvasImageSource,
  width: number,
  height: number,
  type: "image/webp" | "image/jpeg",
  quality: number
): Promise<Blob | null> => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context === null) return Promise.resolve(null);
  context.drawImage(source, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
};

export async function compressPhoto(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;

  const source = await decodeSource(file);
  if (source === null) return { ok: false, code: "PHOTO_UNREADABLE" };

  try {
    const longest = Math.max(source.width, source.height);
    const base = Math.min(longest, maxDimension);
    const dimensionLadder: number[] = [];
    for (const factor of DIMENSION_FACTORS) {
      const target = Math.max(MIN_DIMENSION, Math.round(base * factor));
      if (!dimensionLadder.includes(target)) dimensionLadder.push(target);
    }

    let webpUnsupported = false;

    for (const type of MIME_LADDER) {
      if (type === "image/webp" && webpUnsupported) continue;
      for (const target of dimensionLadder) {
        const scale = target / longest;
        const width = Math.max(1, Math.round(source.width * scale));
        const height = Math.max(1, Math.round(source.height * scale));
        for (const quality of QUALITY_STEPS) {
          const blob = await encodeAt(source.draw, width, height, type, quality);
          if (blob === null || blob.type !== type) {
            if (type === "image/webp") webpUnsupported = true;
            break;
          }
          if (blob.size <= maxBytes) {
            const sha256 = await sha256HexOfBlob(blob);
            return {
              ok: true,
              photo: Object.freeze({
                blob,
                sha256,
                width,
                height,
                bytes: blob.size,
                mime: type
              })
            };
          }
        }
        if (type === "image/webp" && webpUnsupported) break;
      }
    }

    return { ok: false, code: "PHOTO_TOO_LARGE" };
  } finally {
    source.release();
  }
}
