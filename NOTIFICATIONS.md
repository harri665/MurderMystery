# Web Push Notifications

This document explains the web push notification system implemented for the Murder Mystery game.

## Overview

The notification system allows Game Masters (GMs) to send push notifications to players even when the game page is closed. This is implemented using the Web Push API and Service Workers.

## Features

- **Browser Notifications**: Players receive notifications even when the browser tab is closed or in the background
- **Automatic Subscription**: Players are automatically prompted to enable notifications on sign-in
- **Selective Targeting**: GMs can send notifications to all players or specific players
- **Persistent Subscriptions**: Subscriptions are stored server-side and persist across sessions
- **Graceful Degradation**: System works on browsers that support push notifications and gracefully handles unsupported browsers

## Architecture

### Server-Side Components

1. **Backend Server** (`server/index.mjs`)
   - Uses `web-push` npm package for sending notifications
   - VAPID keys for secure authentication
   - Stores push subscriptions in `server/data/push_subscriptions.json`
   - API endpoints:
     - `GET /api/vapid-public-key` - Returns public VAPID key
     - `POST /api/push/subscribe` - Saves player push subscription
     - `POST /api/push/unsubscribe` - Removes player subscription
     - `POST /api/gm/notify` - Sends notifications to players (GM only)

2. **Environment Variables** (optional)
   ```env
   VAPID_PUBLIC_KEY=<your-public-key>
   VAPID_PRIVATE_KEY=<your-private-key>
   VAPID_EMAIL=mailto:admin@murdermystery.game
   ```

### Frontend Components

1. **Service Worker** (`public/sw.js`)
   - Handles incoming push notifications
   - Shows notification to user
   - Handles notification clicks (opens/focuses app)

2. **Notification Manager** (`src/utils/notificationManager.js`)
   - Utility class for managing push subscriptions
   - Handles permission requests
   - Registers service worker
   - Subscribes/unsubscribes users

3. **AuthWrapper** (`src/components/AuthWrapper.jsx`)
   - Automatically subscribes users on sign-in
   - Unsubscribes users on sign-out

4. **Admin Page** (`src/pages/Admin.jsx`)
   - UI for GMs to send notifications
   - Target all players or specific players
   - Customize notification title, body, and URL

5. **Notifications Page** (`src/pages/Notifications.jsx`)
   - User-facing notification management
   - Shows permission and subscription status
   - Test notifications
   - Enable/disable notifications

## Usage

### For Players

1. **Sign In**: When you sign in, you'll be automatically prompted to allow notifications (if supported by your browser)
2. **Manage Notifications**: Visit `/notifications` to:
   - Check notification status
   - Enable/disable notifications
   - Send test notifications
3. **Receive Notifications**: When the GM sends a notification, you'll receive it even if the browser is closed

### For Game Masters

1. **Navigate to Admin Page**: Go to `/gm`
2. **Find the Notification Section**: Scroll to the "📢 Send Push Notifications" card
3. **Compose Notification**:
   - Enter a title (e.g., "New Clue Discovered!")
   - Enter a body message
   - Optionally set a URL to open when clicked
   - Select specific players or leave empty for all players
4. **Send**: Click "📢 Send Notification"
5. **Review Results**: The system will show how many notifications were successfully sent

### API Example

**Send Notification to All Players**:
```bash
curl -X POST http://localhost:3001/api/gm/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Game Update",
    "body": "A new clue has been discovered!",
    "url": "/nfc/blue4",
    "icon": "/images/seal.png"
  }'
```

**Send Notification to Specific Players**:
```bash
curl -X POST http://localhost:3001/api/gm/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Private Message",
    "body": "Check your profile for updates",
    "targetPlayers": ["player-id-1", "player-id-2"],
    "url": "/profile"
  }'
```

## Browser Support

Web Push Notifications are supported in:
- ✅ Chrome/Edge 50+
- ✅ Firefox 44+
- ✅ Safari 16+ (macOS 13+, iOS 16.4+)
- ✅ Opera 39+
- ❌ IE (not supported)

## Security

- **VAPID Keys**: Uses Voluntary Application Server Identification (VAPID) for authentication
- **User Consent**: Requires explicit user permission before sending notifications
- **Subscription Validation**: Invalid/expired subscriptions are automatically removed
- **No Sensitive Data**: Notifications should not contain sensitive game information

## Troubleshooting

### Notifications Not Working

1. **Check Browser Support**: Visit `/notifications` to see if notifications are supported
2. **Check Permissions**: Ensure notification permission is granted (not blocked)
3. **Check Subscription**: Verify user is subscribed in `/notifications`
4. **Check Server**: Ensure backend server is running and VAPID keys are configured
5. **Check Service Worker**: Open DevTools → Application → Service Workers

### Permission Denied

If a user has blocked notifications:
1. Click the lock icon in the browser address bar
2. Find "Notifications" in permissions
3. Change from "Block" to "Allow"
4. Refresh the page and re-subscribe

### No Subscriptions Found

If GM can't send notifications:
1. Ensure at least one player has signed in after notification system was implemented
2. Check `server/data/push_subscriptions.json` for subscriptions
3. Players need to sign in to be auto-subscribed

## Data Storage

**Push Subscriptions** (`server/data/push_subscriptions.json`):
```json
{
  "subscriptions": [
    {
      "playerId": "uuid-1234",
      "playerName": "Harrison",
      "subscription": {
        "endpoint": "https://fcm.googleapis.com/...",
        "keys": {
          "p256dh": "...",
          "auth": "..."
        }
      },
      "subscribedAt": 1696435200000
    }
  ]
}
```

## Future Enhancements

- [ ] Rich notifications with actions (Accept/Decline)
- [ ] Notification templates for common game events
- [ ] Scheduled notifications
- [ ] Notification history for players
- [ ] Badge counts for unread notifications
- [ ] Sound/vibration customization
- [ ] Notification categories (Game Events, Chat, Alerts)
- [ ] Analytics for notification engagement

## References

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push npm package](https://www.npmjs.com/package/web-push)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid)
