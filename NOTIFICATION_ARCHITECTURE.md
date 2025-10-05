# Web Push Notification System Flow

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       MURDER MYSTERY GAME                        │
│                    Push Notification System                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌──────────────────────┐
│   Player Browser    │         │    GM Dashboard      │
│                     │         │     (/gm page)       │
│  ┌───────────────┐  │         │                      │
│  │  Sign In      │  │         │  ┌────────────────┐  │
│  │  ↓            │  │         │  │ Notification   │  │
│  │  Auto Request │  │         │  │ Composer       │  │
│  │  Permission   │  │         │  │                │  │
│  └───────┬───────┘  │         │  │ • Title        │  │
│          │          │         │  │ • Body         │  │
│          ↓          │         │  │ • Target       │  │
│  ┌───────────────┐  │         │  │ • URL          │  │
│  │ Subscribe to  │  │         │  └────────┬───────┘  │
│  │ Push Service  │  │         │           │          │
│  └───────┬───────┘  │         │           ↓          │
│          │          │         │  ┌────────────────┐  │
│          │          │         │  │ Send to Server │  │
│          │          │         │  └────────┬───────┘  │
└──────────┼──────────┘         └───────────┼──────────┘
           │                                │
           │ POST /api/push/subscribe       │ POST /api/gm/notify
           │ {subscription, playerId}       │ {title, body, targets}
           │                                │
           ↓                                ↓
    ┌──────────────────────────────────────────────┐
    │          Backend Server (Express)             │
    │                                               │
    │  ┌────────────────┐    ┌──────────────────┐  │
    │  │ Store Sub in   │    │  Retrieve Subs   │  │
    │  │ push_sub.json  │    │  Filter Targets  │  │
    │  └────────────────┘    └─────────┬────────┘  │
    │                                  │           │
    │                                  ↓           │
    │                       ┌──────────────────┐   │
    │                       │   Web Push       │   │
    │                       │   Library        │   │
    │                       │ (send to browser)│   │
    │                       └─────────┬────────┘   │
    └─────────────────────────────────┼────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │         Push to each              │
                    │      subscribed endpoint          │
                    └─────────────────┬─────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ↓                         ↓                         ↓
    ┌────────────────┐        ┌────────────────┐      ┌────────────────┐
    │ Player 1       │        │ Player 2       │      │ Player N       │
    │ Browser        │        │ Browser        │      │ Browser        │
    │                │        │                │      │                │
    │ ┌────────────┐ │        │ ┌────────────┐ │      │ ┌────────────┐ │
    │ │  Service   │ │        │ │  Service   │ │      │ │  Service   │ │
    │ │  Worker    │ │        │ │  Worker    │ │      │ │  Worker    │ │
    │ │  (sw.js)   │ │        │ │  (sw.js)   │ │      │ │  (sw.js)   │ │
    │ └──────┬─────┘ │        │ └──────┬─────┘ │      │ └──────┬─────┘ │
    │        │       │        │        │       │      │        │       │
    │        ↓       │        │        ↓       │      │        ↓       │
    │ ┌────────────┐ │        │ ┌────────────┐ │      │ ┌────────────┐ │
    │ │ Show       │ │        │ │ Show       │ │      │ │ Show       │ │
    │ │ Notif      │ │        │ │ Notif      │ │      │ │ Notif      │ │
    │ │ 🔔         │ │        │ │ 🔔         │ │      │ │ 🔔         │ │
    │ └────────────┘ │        │ └────────────┘ │      │ └────────────┘ │
    │                │        │                │      │                │
    │ ✅ Even when   │        │ ✅ Even when   │      │ ✅ Even when   │
    │    tab closed  │        │    tab closed  │      │    tab closed  │
    └────────────────┘        └────────────────┘      └────────────────┘
```

## Component Interactions

### 1. Player Sign-In Flow
```
Player Signs In
    ↓
AuthWrapper.jsx detects sign-in
    ↓
Call registerPushNotifications()
    ↓
NotificationManager.subscribe()
    ↓
Request browser permission
    ↓
Register Service Worker (sw.js)
    ↓
Subscribe to Push Manager
    ↓
Send subscription to server
    ↓
Server saves to push_subscriptions.json
```

### 2. GM Send Notification Flow
```
GM opens /gm page
    ↓
Enters notification details
    ↓
Selects target players (or all)
    ↓
Click "Send Notification"
    ↓
POST /api/gm/notify
    ↓
Server retrieves subscriptions
    ↓
Filters by target players
    ↓
For each subscription:
    ↓
    web-push.sendNotification()
    ↓
    Push to browser endpoint
    ↓
    Service Worker receives push event
    ↓
    Show notification
```

### 3. Notification Click Flow
```
User clicks notification
    ↓
Service Worker receives 'notificationclick' event
    ↓
Close notification
    ↓
Check for existing app window
    ↓
If found: Focus existing window
If not found: Open new window
    ↓
Navigate to notification URL
```

## Data Flow

### Subscription Object Structure
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BKx...",
    "auth": "G3k..."
  }
}
```

### Stored Subscription Format
```json
{
  "subscriptions": [
    {
      "playerId": "uuid-123",
      "playerName": "Harrison",
      "subscription": {
        "endpoint": "https://...",
        "keys": {...}
      },
      "subscribedAt": 1696435200000
    }
  ]
}
```

### Notification Payload
```json
{
  "title": "New Clue Found!",
  "body": "A mysterious letter has been discovered...",
  "icon": "/images/seal.png",
  "badge": "/images/seal.png",
  "data": {
    "url": "/nfc/blue4",
    "timestamp": 1696435200000,
    "type": "gm-notification"
  }
}
```

## API Endpoints

### GET /api/vapid-public-key
Returns the public VAPID key for client-side subscription

**Response:**
```json
{
  "publicKey": "BBdvZpojnEEPWl2T..."
}
```

### POST /api/push/subscribe
Saves a player's push notification subscription

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {...}
  },
  "playerId": "uuid-123",
  "playerName": "Harrison"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Subscription saved successfully"
}
```

### POST /api/push/unsubscribe
Removes a player's push notification subscription

**Request:**
```json
{
  "playerId": "uuid-123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Subscription removed"
}
```

### POST /api/gm/notify
Sends push notifications to players (GM only)

**Request:**
```json
{
  "title": "Game Update",
  "body": "Important message here",
  "targetPlayers": ["uuid-1", "uuid-2"],
  "url": "/nfc/blue4",
  "icon": "/images/seal.png",
  "badge": "/images/seal.png"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Notification sent to 5 player(s)",
  "successful": 5,
  "failed": 0,
  "total": 5,
  "results": [...]
}
```

## File Structure

```
MurderMystery/
│
├── server/
│   ├── index.mjs                    ← Push notification endpoints
│   └── data/
│       └── push_subscriptions.json  ← Stored subscriptions
│
├── public/
│   └── sw.js                        ← Service Worker for push events
│
├── src/
│   ├── components/
│   │   └── AuthWrapper.jsx          ← Auto-subscribe on sign-in
│   │
│   ├── pages/
│   │   ├── Admin.jsx                ← GM notification UI
│   │   └── Notifications.jsx        ← Player management UI
│   │
│   └── utils/
│       └── notificationManager.js   ← Notification helper class
│
└── NOTIFICATIONS.md                 ← Full documentation
```

## Security Considerations

1. **VAPID Keys**: Authenticate the server with push services
2. **User Permission**: Required before sending notifications
3. **Subscription Storage**: Server-side validation
4. **Auto-cleanup**: Invalid subscriptions removed automatically
5. **No Sensitive Data**: Keep notification content generic

## Browser Compatibility Matrix

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome  | 50+     | ✅      | Full support |
| Firefox | 44+     | ✅      | Full support |
| Safari  | 16+     | ✅      | macOS 13+, iOS 16.4+ |
| Edge    | 50+     | ✅      | Full support |
| Opera   | 39+     | ✅      | Full support |
| IE      | Any     | ❌      | Not supported |

## Performance Notes

- Service Worker runs in background (low impact)
- Subscriptions stored in JSON (consider DB for scale)
- Push delivery typically < 1 second
- Auto-cleanup prevents stale subscriptions
- Supports thousands of concurrent subscriptions
