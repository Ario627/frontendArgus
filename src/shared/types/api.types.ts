export interface ApiErrorDetail {
  readonly code: string;
  readonly field?: string;
}

export interface ApiSuccessEnvelope<T> {
  readonly data: T;
  readonly timestamp: string;
  readonly success: true;
}

export interface ApiErrorEnvelope {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly ApiErrorDetail[];
  };
  readonly timestamp: string;
  readonly path: string;
}

export interface PaginatedItems<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly total: number;
}
