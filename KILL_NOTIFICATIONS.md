# Kill Notification Feature

## Overview

When a player is killed (either via the API or by scanning a URL), they automatically receive a push notification informing them they've been eliminated, even if their browser is closed.

## How It Works

### Method 1: Via URL (QR Code or Direct Link)

**URL Format:**
```
http://localhost:5173/kill?victim=firstname
```

**Examples:**
```
http://localhost:5173/kill?victim=zarin
http://localhost:5173/kill?victim=harrison
https://murdermystery.harrison-martin.com/kill?victim=maya
```

**What Happens:**
1. URL is accessed (via QR code scan, NFC tag, or direct link)
2. Frontend Kill page loads and reads `victim` query parameter
3. Frontend calls backend API: `GET /kill?victim=firstname`
4. Server finds player by first name (case-insensitive)
5. Player is marked as "down" for the configured time (default: 5 minutes)
6. Push notification is sent to the victim's device
7. Socket.io event `player:down` is emitted for real-time updates
8. Frontend displays success screen with kill details

**Notification Content:**
- **Title:** "💀 You've Been Eliminated!"
- **Body:** "You've been killed! You're down for X minutes. Head to the medbay: [location]"
- **Click Action:** Opens player's profile page

### Method 2: Via API (Original Method)

**Endpoint:**
```
POST /api/kill
```

**Request Body:**
```json
{
  "killerId": "killer-player-id",
  "targetId": "target-player-id"
}
```

This method also now sends push notifications to the victim.

## Use Cases

### QR Code Kill System
1. Generate QR codes for each player:
   - QR code for Zarin: `https://murdermystery.harrison-martin.com/kill?victim=zarin`
   - QR code for Maya: `https://murdermystery.harrison-martin.com/kill?victim=maya`
2. Killer scans victim's QR code
3. Frontend page opens and executes kill
4. Victim instantly receives notification (even if phone is locked)

### NFC Tag Kill System
1. Create NFC tags with URLs:
   - Tag 1: `https://murdermystery.harrison-martin.com/kill?victim=harrison`
   - Tag 2: `https://murdermystery.harrison-martin.com/kill?victim=isla`
2. Killer taps victim's NFC tag with their phone
3. Frontend page opens and executes kill
4. Victim receives instant notification

### Direct Link
1. Share kill links via the game system
2. Killer clicks the link
3. Victim is notified immediately

## Testing

### Test via Browser
```
http://localhost:5173/kill?victim=harrison
```

### Test via curl (Backend API directly)
```bash
curl "http://localhost:3001/kill?victim=zarin"
```
Note: Direct API access returns JSON but doesn't show the frontend UI

### Expected Response (Success)
```json
{
  "ok": true,
  "message": "Zarin Niles has been eliminated!",
  "victim": {
    "id": "uuid-123",
    "name": "Zarin Niles",
    "downUntil": 1696435500000
  },
  "notificationSent": true
}
```

### Expected Response (Already Down)
```json
{
  "error": "Zarin Niles is already down for 3 more minute(s)",
  "downUntil": 1696435500000
}
```

### Expected Response (Not Found)
```json
{
  "error": "Player with first name \"zarin\" not found"
}
```

## Notification Preview

When a player is killed, they see:

**On Phone Lock Screen:**
```
🔔 Murder Mystery
💀 You've Been Eliminated!
You've been killed! You're down for 5 minutes. 
Head to the medbay: Park with 4 orange benches
```

**On Notification Tap:**
- Opens the game to `/profile` page
- Shows their current status and countdown

## Features

✅ **Case-Insensitive**: Works with `zarin`, `Zarin`, or `ZARIN`
✅ **First Name Only**: Uses first name for simplicity
✅ **Push Notification**: Sends notification even if browser closed
✅ **Duplicate Prevention**: Won't kill if player already down
✅ **Real-Time Updates**: Socket.io event for live UI updates
✅ **Detailed Feedback**: Shows victim info and notification status
✅ **Error Handling**: Graceful handling of missing players
✅ **Medbay Info**: Notification includes medbay location

## Configuration

Edit in `server/index.mjs` or environment variables:

```javascript
downMinutes: Number(process.env.DOWN_MINUTES || 5)
```

Change notification message:
```javascript
await sendPushNotification({
  title: '💀 You\'ve Been Eliminated!',
  body: `Custom message here...`,
  targetPlayerIds: [victim.id],
  url: '/profile'
});
```

## QR Code Generation

You can generate QR codes using:

**Online Tools:**
- https://www.qr-code-generator.com/
- https://qr.io/

**Enter URL:**
```
http://localhost:5173/kill?victim=zarin
```
or for production:
```
https://murdermystery.harrison-martin.com/kill?victim=zarin
```

**Node.js:**
```bash
npm install qrcode
```

```javascript
import QRCode from 'qrcode';

// Generate QR code for each player
const players = ['zarin', 'harrison', 'maya', 'isla'];
for (const player of players) {
  const url = `https://murdermystery.harrison-martin.com/kill?victim=${player}`;
  await QRCode.toFile(`qr-${player}.png`, url);
}
```

## Security Considerations

⚠️ **Important:** The frontend `/kill` route and backend API endpoint are currently public (no authentication required for the API). Consider adding:

1. **Rate Limiting**: Prevent spam kills
2. **Authentication**: Require killer to be authenticated  
3. **Game Phase Check**: Only allow kills during active game
4. **Killer Verification**: Verify caller is an actual killer

The backend API (`GET /kill?victim=firstname`) performs the actual kill logic and could be protected with authentication if needed.

Example rate limiting (if needed):
```javascript
// Add cooldown to prevent abuse
const lastKillTime = {};
const KILL_COOLDOWN = 30000; // 30 seconds

if (lastKillTime[victimFirstName] && 
    now() - lastKillTime[victimFirstName] < KILL_COOLDOWN) {
  return res.status(429).json({ error: 'Too many kill attempts, please wait' });
}
lastKillTime[victimFirstName] = now();
```

## Integration with Existing System

The `/kill?victim=firstname` route:
- ✅ Works alongside existing `/api/kill` POST endpoint
- ✅ Uses same down time configuration
- ✅ Emits same Socket.io events
- ✅ Updates same player data
- ✅ Adds push notification functionality

Both methods now send push notifications to victims!

## Troubleshooting

### Notification Not Received
1. Check victim is subscribed: View `/notifications` page
2. Check server logs for notification send status
3. Verify victim's push subscription in `push_subscriptions.json`
4. Test victim's notifications at `/notifications` page

### Wrong Player Killed
- Ensure first names are unique in your player list
- If multiple players have same first name, use `/api/kill` with IDs instead

### QR Code Doesn't Work
- Verify URL is correctly formatted
- Check server is accessible from mobile device
- Test URL in browser first

## Example Game Flow

1. **Setup Phase:**
   - Generate QR codes for all players
   - Print and attach to player badges/cards

2. **Game Starts:**
   - Players enable push notifications (automatic on sign-in)
   - Killers receive their QR code scanner access

3. **Kill Event:**
   - Killer finds victim
   - Killer scans victim's QR code
   - **Victim's phone vibrates/rings instantly** 📱
   - Victim sees notification: "You've been eliminated!"
   - Victim heads to medbay

4. **Victim Recovery:**
   - After 5 minutes, victim can return to game
   - Or detective can revive them early

## Advanced: Custom Kill Messages

You can customize the notification per kill reason:

```javascript
// In server/index.mjs, modify the sendPushNotification call:
await sendPushNotification({
  title: '💀 Poisoned!',
  body: `You've been poisoned by a mysterious substance! Down for ${game.downMinutes} minutes.`,
  targetPlayerIds: [victim.id],
  url: '/profile'
});

// Or for different kill methods:
await sendPushNotification({
  title: '🔪 Assassinated!',
  body: 'You were caught off guard! Seek medical attention immediately.',
  targetPlayerIds: [victim.id],
  url: '/profile'
});
```

## Future Enhancements

- [ ] Add killer name to notification (optional)
- [ ] Different notification styles per kill method
- [ ] Photo/evidence attachment with kill
- [ ] Kill location tracking
- [ ] Kill statistics and leaderboard
- [ ] Custom notification sounds per kill type
- [ ] Notification actions (Accept Fate / Call for Help)
