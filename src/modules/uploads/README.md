# Uploads Module

The uploads module handles avatar file uploads and public upload URLs.

## Runtime Flow

```txt
/api/upload/avatar
  -> multer.single("file")
  -> uploadAvatar controller
  -> writeAuditLog
  -> sendSuccess
```

## Subfolders

- `routes`: Multer storage and route definition.
- `controllers`: Upload response and audit logging.
- `services`: Reserved for future upload business logic.

## Why This Module Exists

File upload behavior needs storage configuration, file validation, URL generation, and auditing.

