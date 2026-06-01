# Auth Validators

This folder contains Zod schemas for auth request validation.

## Files

### `auth.validators.ts`

Exports:

- `loginSchema`
- `registerSchema`

When it runs:

- Imported by `auth.routes.ts`.
- Used by `validate(...)` middleware before auth controllers.

Validation rules:

- Login requires valid email and password with minimum length.
- Register requires name, valid email, password, and optional avatar URL.

Why it exists:

- Auth controllers should only receive valid request bodies.

