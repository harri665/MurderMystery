# Kill Notification Implementation Summary

## ✅ What Was Implemented

I've successfully added push notification functionality when players are killed via URL scanning (QR codes/NFC tags). This allows instant notification to victims even when their browser is closed.

## 🎯 Main Features

### 1. Kill via URL with Notification
**Frontend Route:** `/kill?victim=firstname`
**Backend API:** `GET /kill?victim=firstname`

**How it works:**
- Access URL: `http://localhost:5173/kill?victim=zarin`
- Frontend page loads and reads `victim` query parameter
- Calls backend API: `http://localhost:3001/kill?victim=zarin`
- Server finds player by first name (case-insensitive)
- Player is marked as "down" for configured time (default: 5 minutes)
- **Push notification sent instantly to victim's device** 📱
- Socket.io event emitted for real-time UI updates
- Frontend displays success/error screen to killer

**Notification Content:**
- **Title:** "💀 You've Been Eliminated!"
- **Body:** "You've been killed! You're down for X minutes. Head to the medbay: [location]"
- **Click:** Opens player profile page
- **Works:** Even when browser tab is closed!

### 2. Updated Existing Kill Endpoint
**Endpoint:** `POST /api/kill`

Now also sends push notifications to victims when killed via the original API method.

### 3. Helper Function Added
**Function:** `sendPushNotification()`

Reusable helper function for sending push notifications throughout the game system.

## 📋 Use Cases

### QR Code System
1. Generate QR codes for each player:
   ```
   Zarin's QR: http://localhost:5173/kill?victim=zarin
   Maya's QR:  http://localhost:5173/kill?victim=maya
   ```
2. Print and attach QR codes to player badges
3. Killer scans victim's QR code with phone
4. **Victim instantly receives notification** (even if phone is locked) 🔔

### NFC Tag System
1. Program NFC tags with kill URLs
2. Killer taps victim's NFC tag
3. Victim receives instant notification

### Direct Link
Share kill links through game system or external means

## 🔧 Technical Implementation

### Files Modified
1. **`server/index.mjs`**
   - Added `sendPushNotification()` helper function
   - Added `GET /kill` API route for URL-based kills
   - Updated `POST /api/kill` to send notifications
   - Includes duplicate kill prevention
   - Automatic invalid subscription cleanup

2. **`src/pages/Kill.jsx`**
   - Replaced old kill form with query-based kill page
   - Reads `victim` query parameter from URL
   - Calls backend API to execute kill
   - Shows loading, success, and error states
   - Displays kill details and notification status

### Response Format

**Success Response:**
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

**Error Responses:**
```json
// Not found
{"error": "Player with first name \"zarin\" not found"}

// Already down
{"error": "Zarin Niles is already down for 3 more minute(s)", "downUntil": 1696435500000}

// Missing parameter
{"error": "Victim first name required in query parameter: /kill?victim=firstname"}
```

## 🧪 Testing

### Test Tool
Open `kill-test.html` in your browser for a user-friendly testing interface.

**Features:**
- Switch between development/production APIs
- Enter victim name and kill with one click
- Generate URLs for QR code creation
- Copy URLs to clipboard
- View detailed response data

### Browser Testing (Recommended)
Simply visit in your browser:
```
http://localhost:5173/kill?victim=zarin
http://localhost:5173/kill?victim=harrison
http://localhost:5173/kill?victim=maya
```

### Command Line Testing (Backend API Direct)
```bash
curl "http://localhost:3001/kill?victim=zarin"
```
Note: This returns JSON but doesn't show the nice UI

## 📱 Notification Flow

```
Killer scans QR code
    ↓
GET /kill?victim=zarin
    ↓
Server finds player "Zarin"
    ↓
Mark player as down
    ↓
Send push notification to Zarin's subscribed devices
    ↓
Zarin's phone receives notification (even if browser closed)
    ↓
Zarin clicks notification
    ↓
App opens to profile page
```

## 🎮 Game Integration

### For Game Masters:
1. Generate QR codes for all players using the victim URLs
2. Print QR codes and attach to player badges/cards
3. Hand out badges to players at game start
4. Monitor kills via admin dashboard

### For Players:
1. Sign in to game (auto-subscribes to notifications)
2. Receive badge with unique QR code
3. When killed, receive instant notification
4. Head to medbay location shown in notification

### For Killers:
1. Use phone camera or QR scanner app
2. Scan victim's QR code
3. Victim is instantly notified
4. Cooldown applies (default: 8 minutes)

## ✨ Features

✅ **Instant Notifications** - Even when browser is closed
✅ **Case-Insensitive** - Works with any capitalization
✅ **First Name Only** - Simple and easy to use
✅ **Duplicate Prevention** - Won't kill if already down
✅ **Real-Time Updates** - Socket.io integration
✅ **Medbay Info** - Notification includes location
✅ **Error Handling** - Graceful failure messages
✅ **Auto-Cleanup** - Removes invalid subscriptions
✅ **Testing Tool** - Easy-to-use test interface

## 📂 New Files Created

1. **`KILL_NOTIFICATIONS.md`** - Complete feature documentation
2. **`kill-test.html`** - Interactive testing tool

## 🔐 Security Notes

⚠️ **Current Status:** The `/kill?victim=firstname` endpoint is public (no authentication).

**Considerations:**
- Easy to use for game mechanics (QR codes, NFC tags)
- Could be abused if URL is shared maliciously
- No rate limiting currently implemented

**Optional Security Enhancements:**
```javascript
// Add rate limiting per victim
const killCooldowns = {};
const KILL_COOLDOWN = 30000; // 30 seconds

if (killCooldowns[victimFirstName] && 
    now() - killCooldowns[victimFirstName] < KILL_COOLDOWN) {
  return res.status(429).json({ error: 'Too many kill attempts' });
}
```

## 🎯 Example Usage

### Generate QR Codes

Using online tool:
1. Go to https://www.qr-code-generator.com/
2. Enter URL: `http://localhost:3001/kill?victim=zarin`
3. Download QR code image
4. Print and attach to Zarin's badge

Using Node.js:
```javascript
import QRCode from 'qrcode';

const players = ['zarin', 'harrison', 'maya', 'isla'];
for (const player of players) {
  const url = `http://localhost:3001/kill?victim=${player}`;
  await QRCode.toFile(`qr-kill-${player}.png`, url);
}
```

### Test Notification

1. **Sign in as a player** (e.g., Zarin)
   - Go to `http://localhost:5173/zarin`
   - Allow notifications when prompted

2. **Open test tool**
   - Open `kill-test.html` in browser
   - Enter "zarin" as victim name
   - Click "Kill Player & Send Notification"

3. **Verify notification received**
   - Check Zarin's device for notification
   - Works even if browser tab is closed!

## 🚀 Quick Start

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Sign in as a player to subscribe:**
   ```bash
   # Open in browser:
   http://localhost:5173/zarin
   ```

3. **Test the kill notification:**
   ```bash
   # Option 1: Browser (Recommended - shows UI)
   open http://localhost:5173/kill?victim=zarin
   
   # Option 2: Use test tool
   open kill-test.html
   
   # Option 3: Backend API directly (JSON response only)
   curl "http://localhost:3001/kill?victim=zarin"
   ```

4. **Check notification:**
   - Zarin should receive notification instantly
   - Works even if browser tab is closed!

## 📊 Monitoring

Check server logs for notification status:
```
🎯 Zarin Niles has been killed via URL!
📢 Sending push notification to 1 player(s)...
  ✅ Notification sent to Zarin Niles
```

View active subscriptions:
```bash
cat server/data/push_subscriptions.json
```

## 🔄 Integration with Existing Features

The kill notification system integrates seamlessly with:
- ✅ Existing `/api/kill` POST endpoint
- ✅ Socket.io real-time events
- ✅ Player down/revive system
- ✅ Cooldown timers
- ✅ Medbay locations
- ✅ Detective revive abilities

Both old and new kill methods now send notifications!

## 🎉 Ready to Use!

The kill notification system is fully implemented and ready for your Murder Mystery game. Players will receive instant notifications when eliminated, enhancing the game experience and ensuring no one misses critical game events!

---

**Need Help?**
- Full documentation: `KILL_NOTIFICATIONS.md`
- Test tool: `kill-test.html`
- Push notification docs: `NOTIFICATIONS.md`
