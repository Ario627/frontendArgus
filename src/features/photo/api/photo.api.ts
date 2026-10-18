import { apiGet, apiUpload } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { PhotoLinkDto, PhotoRefType, PhotoUploadDto } from "@/shared/types/photo.types";

const EXTENSION_OF: Readonly<Record<string, string>> = Object.freeze({
  "image/webp": "webp",
  "image/jpeg": "jpg"
});

export interface UploadPhotoInput {
  readonly blob: Blob;
  readonly sha256: string;
  readonly refType: PhotoRefType;
  readonly refId?: string;
}

export function uploadPhoto(input: UploadPhotoInput): Promise<PhotoUploadDto> {
  const form = new FormData();
  const extension = EXTENSION_OF[input.blob.type] ?? "bin";
  form.append("file", input.blob, `${input.sha256.slice(0, 12)}.${extension}`);
  form.append("sha256", input.sha256);
  form.append("refType", input.refType);
  if (input.refId !== undefined) form.append("refId", input.refId);
  return apiUpload<PhotoUploadDto>(endpoints.photos.upload, form);
}

export function fetchPhotoLink(sha256: string): Promise<PhotoLinkDto> {
  return apiGet<PhotoLinkDto>(endpoints.photos.byHash(sha256));
}
