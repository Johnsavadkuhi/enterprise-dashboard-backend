# Upload Services

This folder is currently reserved for future upload service logic.

## Current State

There are no upload service files yet. Current upload behavior is handled by `routes/upload.routes.ts` and `controllers/upload.controller.ts`.

## When To Add Files Here

Add services here when upload behavior becomes reusable or more complex, for example:

- deleting old avatars
- virus scanning
- image resizing
- cloud storage integration
- signed file URLs

## Expected Execution

Future upload services should be called by upload controllers or background jobs, not directly by route definitions.

