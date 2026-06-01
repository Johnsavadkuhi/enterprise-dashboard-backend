# Notification Services

This folder contains notification business logic.

## Files

### `notification.service.ts`

Exports `createNotification`.

When it runs:

- Called by project assignment and vulnerability creation logic.

What it does:

1. Creates a notification document.
2. Builds a payload for API/realtime use.
3. Emits `notification:new` to the target user room.
4. Emits `notification:new` to the project room if `projectId` exists.
5. Returns the payload.

Why it exists:

- Persistent storage and realtime delivery should stay synchronized.

