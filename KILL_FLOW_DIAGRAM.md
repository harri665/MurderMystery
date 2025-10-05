# Kill Notification System - Visual Flow

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  KILL NOTIFICATION SYSTEM                         │
│                    Murder Mystery Game                            │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Killer's       │         │  Backend Server  │         │  Victim's       │
│  Device         │────────▶│  (Express API)   │────────▶│  Device         │
│                 │  Scan   │                  │  Push   │                 │
│  [QR Scanner]   │  Code   │  /kill?victim=X  │  Notif  │  🔔 Notification│
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Detailed Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          KILL PROCESS FLOW                              │
└────────────────────────────────────────────────────────────────────────┘

    KILLER                    SERVER                      VICTIM
      │                         │                           │
      │  1. Scan QR Code        │                           │
      │    /kill?victim=zarin   │                           │
      ├────────────────────────▶│                           │
      │                         │                           │
      │                         │  2. Find Player "Zarin"   │
      │                         │     by First Name         │
      │                         │                           │
      │                         │  3. Check if Already Down │
      │                         │     ❌ If down: Error     │
      │                         │     ✅ If up: Continue    │
      │                         │                           │
      │                         │  4. Mark as Down          │
      │                         │     downUntil = now+5min  │
      │                         │                           │
      │                         │  5. Save to players.json  │
      │                         │                           │
      │                         │  6. Emit Socket.io Event  │
      │                         │     'player:down'         │
      │                         │                           │
      │                         │  7. Get Push Subscription │
      │                         │     for Zarin             │
      │                         │                           │
      │                         │  8. Send Push Notification│
      │                         ├──────────────────────────▶│
      │                         │                           │  9. Browser/Service
      │                         │                           │     Worker Receives
      │                         │                           │     Push Event
      │                         │                           │
      │                         │                           │  10. Show Notification
      │                         │                           │      "💀 You've Been
      │                         │                           │       Eliminated!"
      │                         │                           │
      │  11. Response:          │                           │
      │      {ok: true,         │                           │
      │       message: "...",   │                           │
      │       notificationSent: │                           │
      │       true}             │                           │
      │◀────────────────────────┤                           │
      │                         │                           │
      │                         │                           │  12. User Clicks
      │                         │                           │      Notification
      │                         │                           │
      │                         │                           │  13. App Opens to
      │                         │                           │      /profile
      │                         │                           │
```

## QR Code Kill System

```
┌─────────────────────────────────────────────────────────────────────┐
│                      QR CODE KILL WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────┘

SETUP PHASE:
┌──────────────┐
│   GM/Admin   │
└──────┬───────┘
       │
       │  Generate QR Codes for Each Player
       │
       ├──▶ Zarin's QR:  http://...kill?victim=zarin
       ├──▶ Maya's QR:   http://...kill?victim=maya
       ├──▶ Isla's QR:   http://...kill?victim=isla
       │
       └──▶ Print QR Codes & Attach to Player Badges

GAME PHASE:
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   KILLER     │         │  ZARIN'S QR  │         │  BACKEND     │
│              │         │              │         │              │
│  [Camera/    │         │  ┌────────┐  │         │              │
│   Scanner]   │────────▶│  │ ▓▓▓▓▓▓ │  │────────▶│  Process     │
│              │  Scans  │  │ ▓▓▓▓▓▓ │  │  URL    │  Kill        │
│              │         │  │ ▓▓▓▓▓▓ │  │         │              │
└──────────────┘         │  └────────┘  │         └──────┬───────┘
                         │   /kill?     │                │
                         │   victim=    │                │
                         │   zarin      │                │ Send Push
                         └──────────────┘                │ Notification
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │  ZARIN'S     │
                                                  │  DEVICE      │
                                                  │              │
                                                  │  🔔          │
                                                  │  "You've     │
                                                  │  Been        │
                                                  │  Killed!"    │
                                                  └──────────────┘
```

## NFC Tag System

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NFC TAG KILL WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────┘

SETUP:
┌──────────────┐
│  NFC Tags    │
│              │
│  [Tag 1] ───▶ Programmed with: http://...kill?victim=zarin
│  [Tag 2] ───▶ Programmed with: http://...kill?victim=maya
│  [Tag 3] ───▶ Programmed with: http://...kill?victim=isla
│              │
│  Attached to player badges or worn by players
└──────────────┘

GAME:
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  KILLER'S    │         │  VICTIM'S    │         │  VICTIM'S    │
│  PHONE       │   Tap   │  NFC TAG     │  URL    │  DEVICE      │
│              │         │              │ Opened  │              │
│     📱       │────────▶│   [NFC]      │────────▶│    🔔        │
│              │         │  /kill?      │         │  Notification│
│              │         │  victim=X    │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
     ↓                          ↓                         ↓
  Confirms                  Executes                  Receives
   Kill                      Kill                    Notification
```

## Notification Delivery Path

```
┌────────────────────────────────────────────────────────────────────┐
│            PUSH NOTIFICATION DELIVERY SYSTEM                        │
└────────────────────────────────────────────────────────────────────┘

Server (Node.js)                    Push Service           Device
      │                                   │                   │
      │  1. Create Payload                │                   │
      │     {title, body, icon, url}      │                   │
      │                                   │                   │
      │  2. Get Subscription              │                   │
      │     from push_subscriptions.json  │                   │
      │                                   │                   │
      │  3. webPush.sendNotification()    │                   │
      ├──────────────────────────────────▶│                   │
      │     VAPID authenticated            │                   │
      │     Encrypted payload              │                   │
      │                                   │                   │
      │                                   │  4. Push to Device│
      │                                   ├──────────────────▶│
      │                                   │                   │
      │                                   │                   │  5. Service Worker
      │                                   │                   │     Wakes Up
      │                                   │                   │     (sw.js)
      │                                   │                   │
      │                                   │                   │  6. showNotification()
      │                                   │                   │     💀 You've Been
      │                                   │                   │        Eliminated!
      │                                   │                   │
      │                                   │                   │  7. User Sees/Hears
      │                                   │                   │     📱 🔔 Vibrate
      │                                   │                   │
      │                                   │  8. Click Event   │
      │                                   │◀──────────────────┤
      │                                   │                   │
      │                                   │                   │  9. Open/Focus App
      │                                   │                   │     Navigate to URL
      │                                   │                   │
```

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING SCENARIOS                         │
└────────────────────────────────────────────────────────────────────┘

SCENARIO 1: Player Not Found
/kill?victim=unknown
    ↓
Find player by first name
    ↓
Not found ❌
    ↓
Return 404: "Player with first name 'unknown' not found"


SCENARIO 2: Player Already Down
/kill?victim=zarin
    ↓
Find player: Zarin ✅
    ↓
Check downUntil: 1696435500000 (future timestamp)
    ↓
Already down ❌
    ↓
Return 400: "Zarin is already down for 3 more minute(s)"


SCENARIO 3: Player Not Subscribed
/kill?victim=maya
    ↓
Find player: Maya ✅
    ↓
Mark as down ✅
    ↓
Try to send notification
    ↓
No subscription found ⚠️
    ↓
Return 200: {ok: true, notificationSent: false}
Log: "⚠️ No subscriptions found for target players"


SCENARIO 4: Invalid Subscription (Expired)
/kill?victim=isla
    ↓
Find player: Isla ✅
    ↓
Mark as down ✅
    ↓
Send notification
    ↓
Push service returns 410 Gone ❌
    ↓
Remove subscription from database 🗑️
    ↓
Return 200: {ok: true, notificationSent: false}
Log: "🗑️ Removed invalid subscription for Isla"


SCENARIO 5: Success Path
/kill?victim=zarin
    ↓
Find player: Zarin ✅
    ↓
Not already down ✅
    ↓
Mark as down ✅
    ↓
Send notification ✅
    ↓
Push delivered successfully ✅
    ↓
Return 200: {ok: true, notificationSent: true}
Log: "✅ Notification sent to Zarin"
```

## Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE                             │
└────────────────────────────────────────────────────────────────────┘

INPUT: /kill?victim=zarin

  ┌─────────────────┐
  │  Read           │
  │  players.json   │──▶ Find "Zarin Niles" by first name "zarin"
  └─────────────────┘


  ┌─────────────────┐
  │  Modify         │──▶ victim.downUntil = Date.now() + 300000
  │  Player Object  │    (5 minutes from now)
  └─────────────────┘


  ┌─────────────────┐
  │  Write          │──▶ Save updated player data
  │  players.json   │
  └─────────────────┘


  ┌─────────────────┐
  │  Read           │──▶ Find subscription for Zarin's playerId
  │  push_sub.json  │
  └─────────────────┘


  ┌─────────────────┐
  │  Send Push      │──▶ webPush.sendNotification(subscription, payload)
  │  Notification   │
  └─────────────────┘


  ┌─────────────────┐
  │  Emit Socket.io │──▶ io.emit('player:down', {targetId: zarin.id})
  │  Event          │    (Real-time UI update)
  └─────────────────┘


OUTPUT: {ok: true, message: "Zarin Niles has been eliminated!"}
```

## Timeline View

```
┌────────────────────────────────────────────────────────────────────┐
│                 KILL EVENT TIMELINE (5 minutes)                     │
└────────────────────────────────────────────────────────────────────┘

T+0s    🎯 QR Code Scanned
        ↓
T+0.1s  📝 Server processes kill request
        ↓
T+0.2s  💾 Player marked as down in database
        ↓
T+0.3s  📡 Socket.io event emitted (real-time UI update)
        ↓
T+0.5s  🔔 Push notification sent to push service
        ↓
T+1s    📱 Notification arrives on victim's device
        ↓
T+2s    🔊 Device vibrates/makes sound
        ↓
T+5s    👁️ Victim sees notification
        ↓
T+10s   👆 Victim clicks notification
        ↓
T+11s   🌐 App opens to profile page
        ↓
T+5m    ⏰ downUntil expires
        ↓
T+5m    ✅ Player can return to game
```

## Multi-Device Scenario

```
┌────────────────────────────────────────────────────────────────────┐
│        VICTIM WITH MULTIPLE SUBSCRIBED DEVICES                      │
└────────────────────────────────────────────────────────────────────┘

        Killer Scans QR Code
                 ↓
        Server sends notification
                 ↓
        ┌────────┴────────┬────────────┐
        ↓                 ↓            ↓
   📱 Phone          💻 Laptop    ⌚ Watch
   (Subscribed)      (Subscribed) (Browser)
        │                 │            │
        ↓                 ↓            ↓
   🔔 Notified      🔔 Notified   ❌ Not supported
   ✅ Sound         ✅ Banner     (Watch browser
   ✅ Vibrate       ✅ Sound       doesn't support
   ✅ Lock screen                  push yet)
```
