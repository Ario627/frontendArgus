export type PhotoMimeType = "image/jpeg" | "image/webp";

export type PhotoRefType = "batch" | "ledger_event" | "tiket" | "lainnya";

export interface PhotoDto {
  readonly sha256: string;
  readonly mime: PhotoMimeType;
  readonly bytes: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly refType: PhotoRefType;
  readonly refId: string | null;
  readonly createdAt: string;
}

export interface PhotoUploadDto extends PhotoDto {
  readonly receivedSha256: string;
  readonly url: string;
}

export interface PhotoLinkDto extends PhotoDto {
  readonly url: string;
}
