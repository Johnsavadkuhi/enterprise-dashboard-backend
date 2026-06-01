export const UPLOADS = {
  AVATAR_FIELD: "file",
  MAX_IMAGE_SIZE_BYTES: 2 * 1024 * 1024,
  IMAGE_MIME_PREFIX: "image/",
  PUBLIC_PATH: (filename: string) => `/uploads/${filename}`,
} as const;
