# Upload Controllers

This folder contains upload response handlers.

## Files

### `upload.controller.ts`

Exports `uploadAvatar`.

When it runs:

- Runs after Multer has accepted and stored the uploaded file.

What it does:

1. Builds the public upload URL.
2. Includes the stored filename.
3. Writes `upload.avatar` audit log.
4. Returns data with HTTP 201.

Why it exists:

- Multer handles file storage; this controller handles API response and audit behavior.

