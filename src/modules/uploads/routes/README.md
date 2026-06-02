# Upload Routes

This folder defines upload routes and Multer storage behavior.

## Files

### `upload.routes.ts`

Mounted by `app.ts` at:

```txt
/api/upload
```

What runs at import/startup time:

1. Resolves the upload directory from `env.uploadDir`.
2. Creates the upload directory if it does not exist.
3. Configures Multer disk storage.
4. Configures filename generation.
5. Configures file size and image MIME filtering.

Route chain:

```txt
POST /avatar -> upload.single(UPLOADS.AVATAR_FIELD) -> uploadAvatar
```

Why it exists:

- Upload route setup needs storage middleware before the controller can run.

