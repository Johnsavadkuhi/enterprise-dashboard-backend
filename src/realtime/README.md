# Realtime Folder

This folder contains realtime infrastructure for Socket.IO.

## Subfolders

- `socket`: Socket.IO server setup and global instance accessor.
- `events`: Reserved for future event-specific realtime handlers.

## Runtime Flow

```txt
server.ts
  -> setupSocket(server)
  -> Socket.IO middleware authenticates connection
  -> socket joins user/role/project rooms
  -> services call getIO() to emit events
```

## Why This Folder Exists

HTTP handles request/response APIs. Realtime handles live events such as new notifications.

