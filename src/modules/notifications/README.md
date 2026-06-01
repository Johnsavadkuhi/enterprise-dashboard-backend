# Notifications Module

The notifications module stores notifications in MongoDB and sends realtime updates through Socket.IO.

## Runtime Flow

```txt
Business action
  -> createNotification(...)
  -> NotificationModel.create(...)
  -> getIO().to(...).emit(...)

/api/notifications
  -> requireAuth
  -> notification controller
  -> NotificationModel
  -> optional audit log
  -> sendSuccess
```

## Subfolders

- `models`: Notification MongoDB schema.
- `services`: Notification creation and Socket.IO emission.
- `controllers`: HTTP handlers for reading/updating notifications.
- `routes`: Authenticated notification API routes.

## Why This Module Exists

Users need persistent notifications for later reading and realtime events for immediate updates.

