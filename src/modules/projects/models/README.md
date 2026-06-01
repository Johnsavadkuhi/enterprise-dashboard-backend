# Project Models

This folder defines project persistence.

## Files

### `project.model.ts`

Defines `ProjectModel`.

When it runs:

- Schema is registered when imported.
- Queries run when controllers or project-access middleware use the model.

Fields:

- `name`: project name.
- `type`: project category from `PROJECT_TYPE_VALUES`.
- `description`: optional description.
- `status`: project lifecycle status.
- `ownerId`: user who owns the project.
- `assignedUserIds`: users assigned to the project.

Why it exists:

- Projects define ownership and assignment boundaries for multiple modules.

