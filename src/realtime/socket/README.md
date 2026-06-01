# Socket Folder

This folder contains Socket.IO server setup.

## Files

### `server.ts`

Exports:

- `setupSocket`
- `getIO`

When it runs:

- `setupSocket(server)` runs once during startup from `src/server.ts`.
- Socket middleware runs whenever a browser opens a Socket.IO connection.
- `getIO()` runs when services need to emit events.

What `setupSocket` does:

1. Creates a Socket.IO server attached to the HTTP server.
2. Configures CORS with frontend origin and credentials.
3. Adds socket authentication middleware.
4. Reads the cookie header.
5. Extracts access token.
6. Verifies access token and reloads live user.
7. Stores user in `socket.data.user`.
8. Joins user, role, and project rooms on connection.
9. Emits `socket:connected`.
10. Stores global `ioInstance`.

What `getIO` does:

- Returns the initialized Socket.IO instance.
- Throws if Socket.IO has not been initialized.

Why it exists:

- Notification services need a safe way to emit realtime events without creating their own Socket.IO server.

