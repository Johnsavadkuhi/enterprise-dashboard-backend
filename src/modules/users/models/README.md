# User Models

This folder defines user persistence and auth-safe user serialization.

## Files

### `user.model.ts`

Defines `UserModel`.

When it runs:

- Schema is registered when imported by auth, users, session, seed, or project logic.

Fields:

- `name`
- `email`
- `passwordHash`
- `avatarUrl`
- `roles`
- `customPermissions`
- `projectIds`
- `sessionVersion`
- `isActive`

Important behavior:

- `passwordHash` uses `select: false`, so it is not returned unless explicitly selected.
- `roles` default to pentester.
- `toAuthJSON()` computes effective permissions from roles plus custom permissions.
- `sessionVersion` is included in auth context so tokens can be invalidated after role changes.

Why it exists:

- This is the central identity model of the backend.

